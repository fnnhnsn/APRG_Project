//Server initialisieren

const express = require('express');
const app = express();

//Initialisierung des Bodyparser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

//Nutzung des public Ordners
app.use(express.static('public'));

//init ejs
app.set('view engine', 'ejs');

//Tingodb setup der Benutzer
const DB_COLLECTION = 'users';
const Db = require('tingodb')().Db;
const db = new Db(__dirname + '/tingodb', {});
const ObjectId = require('tingodb')().ObjectID;

//Tingodb setup der Raumbuchung
const DB_COLLECTION2 = 'rooms';
const Db2 = require('tingodb')().Db;
const db2 = new Db(__dirname + '/tingodb', {});
const ObjectId2 = require('tingodb')().ObjectID;

//Session setup
const session = require('express-session');
app.use(session({
    secret: 'this-is-a-secret',     //necessary for encoding
    resave: false,                  //should be set to false, except store needs it
    saveUninitialized: false        //same reason as above.
}));

//passwordHash, um Passwörter zu Verschlüsseln
const passwordHash = require('password-hash');

//Port
app.listen(3000, () => {
    console.log('Listening to Port 3000');
});

//Entweder Index, wenn Nutzer nicht eingeloggt, oder Startseite, wenn Nutzer eingeloggt
app.get('/', (request, response) => {
    if (request.session.authenticated) {
        response.render('start', {'username': request.session.username});
    } else {
        response.sendFile(__dirname + '/index.html');
    }   
});

//Login
app.get('/login', (request, response) => {
    response.sendFile(__dirname + '/login.html');
});

//Register
app.get('/register', (request, response) => {
    response.sendFile(__dirname + '/register.html');
});

//Testseite 2. Datenbank
app.get('/test', (request, response) => {
    response.sendFile(__dirname + '/test.html');
});

//Weiterleitung auf Impressum
app.get('/impressum', (request, response) => {
    response.sendFile(__dirname + '/impressum.html');
});

//Logik der Registierung; Sofern Benutzer vorhanden, oder Eingabe nicht korrekt, erhält der Nutzer eine Fehlermeldung
app.post('/users/register', (request, response) => {
    const username = request.body.username;
    const password = request.body.password;
    const repPassword = request.body.repPassword;

    let errors = [];
    if (username == "" || username == undefined) {
        errors.push('Bitte einen Username eingeben.');
    } 
    if (password == "" || password == undefined) {
        errors.push('Bitte ein Passwort eingeben.');
    } 
    if (repPassword == "" || repPassword == undefined) {
        errors.push('Bitte ein Passwort zur Bestätigung eingeben.');
    } 
    if (password != repPassword) {
        errors.push('Die Passwörter stimmen nicht überein.');
    }

    db.collection(DB_COLLECTION).findOne({'username': username}, (error, result) => {
        if (result != null) {
            errors.push('User existiert bereits.');
            response.render('errors', {'error': errors});
        } else {
            if (errors.length == 0) {
                const encryptedPassword = passwordHash.generate(password);

                const newUser = {
                    'username': username,
                    'password': encryptedPassword
                }
    
                db.collection(DB_COLLECTION).save(newUser, (error, result) => {
                    if (error) return console.log(error);
                    console.log('user added to database');
                    response.redirect('/');
                });
            } else {
                response.render('errors', {'error': errors});
            }
        } 
    });
});

//Testregistrierung
app.post('/users/test', (request, response) => {
    const testUsername = request.body.testUsername;
    const testPassword = request.body.testPassword;
    const testRepPassword = request.body.testRepPassword;

    const newTestUser = {
        'testUsername': testUsername,
        'TestPassword': testPassword
    }
    
    db2.collection(DB_COLLECTION2).save(newTestUser, (error, result) => {
    if (error) return console.log(error);
        console.log('user added to database');
        response.redirect('/');
    });
});

//Login; Wenn Benutzername oder Passwort falsch, Fehlermeldung
app.post('/users/login', (request, response) => {
   const username = request.body.username;
   const password = request.body.password;

   let errors = [];

   db.collection(DB_COLLECTION).findOne({'username': username}, (error, result) => {
        if (error) return console.log(error);

        if (result == null) {
            errors.push('Der User ' + username + ' existiert nicht.');
            response.render('errors', {'error': errors});
            return;
        } else {
            if (passwordHash.verify(password, result.password)) {
                request.session.authenticated = true;
                request.session.username = username;
                request.session.userID =result._id;
                response.redirect('/');
            } else {
                errors.push('Das Passwort für diesen User stimmt nicht überein.');
                response.render('errors', {'error': errors});
            }
        }
   });
});

//Logout und löschen der Session
app.get('/logout', (request, response) => {
    delete request.session.authenticated;
    delete request.session.username;
    response.redirect('/');
}); 

//Weiterleiten zur Raumbuchungsseite
app.get('/rooms', (request, response) => {
    response.render('roomsOverview', {})
});

//Weiterleiten zur Benutzerübersicht
app.get('/userInformation', (request, response) => {
    
        db.collection(DB_COLLECTION).findOne({'_id': request.session.userID}, (error, result) => {
            if(error) return console.log(error);
    
            response.render('user', {
                'username': request.session.username,
                'errors': []
            });
        });
    });

//Weiterleiten zum Ändern des Passwortes
app.get('/user/password/update/', (request, response) => {
    
        db.collection(DB_COLLECTION).findOne({'_id': request.session.userID}, (error, result) => {
            if(error) return console.log(error);
    
            response.render('update', {
                'username': result.username,
                'password': result.password,
                'email': result.email,
                'errors': []
            });
        });
    });
    
    //Passwort ändern
    app.post('/user/password/update/finished', (request, response) => {
        const newPW = request.body.password;
        const repeatNewPW = request.body.password;
        const newPWencrypted = passwordHash.generate(newPW);
    
        let updateErrors = [];
    
        if(newPW == "" || repeatNewPW == "")
            updateErrors.push('Bitte alles ausfüllen!');
        if(newPW != repeatNewPW)
            updateErrors.push('Die Passwörter stimmen nicht überein.');
        
        if(updateErrors.length > 0)
        {
            response.render('update', {
                'password': newPW,
                'errors': updateErrors
            });
    
            return;
        }
    
        const newUser = {
            'username': request.session.username,
            'password': newPWencrypted,      
        };
    
        db.collection(DB_COLLECTION).update({'_id': request.session.userID}, newUser , (error, result) => {
            response.redirect('/');

        });
    });

    //Weiterleiten zur Raumbuchung Erdgeschoss

    app.get('/ground', (request, response) => {
        response.render('ground', {});
    });