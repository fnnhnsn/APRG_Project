//Server initialisieren

const express = require('express');
const app = express();

//Initialisierung des Bodyparser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
//init ejs
app.set('view engine', 'ejs');

//Tingodb setup der Benutzer
const DB_COLLECTION = 'users';
const Db = require('tingodb')().Db;
const db = new Db(__dirname + '/tingodb', {});
const ObjectId = require('tingodb')().ObjectID;

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
        response.render('content', {'username': request.session.username});
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