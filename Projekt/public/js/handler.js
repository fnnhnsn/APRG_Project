function updateUser() {
    window.location.replace('/user/password/update/');
}

function openWin() {
    let myWindow = window.open('/booking', "booking", "width = 300", "height = 10");
}

function test() {
    var img = document.getElementById("theImg");
    var cnvs = document.getElementById("myCanvas");
    
    var ctx = cnvs.getContext("2d");
    ctx.beginPath();
    ctx.arc(350, 210, 200, 0, 2 * Math.PI, false);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#00ff00';
    ctx.stroke();
}

function test2() {
    var img = document.getElementById("theImg");
    var cnvs = document.getElementById("myCanvas");
    
    cnvs.style.position = "absolute";
    cnvs.style.left = img.offsetLeft + "px";
    cnvs.style.top = img.offsetTop + "px";
    
    var ctx = cnvs.getContext("2d");
    ctx.beginPath();
    ctx.arc(250, 210, 100, 0, 2 * Math.PI, false);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#00ff00';
    ctx.stroke();
}
