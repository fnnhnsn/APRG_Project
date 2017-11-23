var xSpan = document.getElementById('x');
var ySpan = document.getElementById('y');
var rects = null;

var background_canvas;
var bg_ctx;

init();

function init() {
    background_canvas = document.getElementById('canvas');
    bg_ctx = background_canvas.getContext('2d');
    bg_ctx.globalAlpha = 0.4;

    $.get('/getRooms', function(res) {
        console.log(res);
        rects = res;
    
        // eine Menge Dinge, die erst gemacht werden soll nachdem alle Räume durch den getRooms Request geladen worden sind
        var i = 0;
        var r;

        while(r = rects[i++]) bg_ctx.rect(r.x, r.y, r.w, r.h);
        bg_ctx.fillStyle = "green";
        bg_ctx.fill();

        //Animationsruckler für Browser beheben (könnte unerheblich sein)
        
        requestaframe = (function() {
            return window.requestAnimationFrame		||
                window.webkitRequestAnimationFrame	||
                window.mozRequestAnimationFrame		||
                window.oRequestAnimationFrame		||
                window.msRequestAnimationFrame		||
                function (callback) {
                    window.setTimeout(callback, 1000 / 60)
                };
        })();

        rects.forEach(function(rect, index) {
            rect.onclick = function() {
                console.log('test');
            }
        });

        //quelle https://stackoverflow.com/questions/29300280/update-html5-canvas-rectangle-on-hover    
        var x,y;
        background_canvas.onmousemove = function(e) {
            var rect = this.getBoundingClientRect();
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
            
            xSpan.innerHTML = x;
            ySpan.innerHTML = y;
            
            bg_ctx.clearRect(0,0,background_canvas.width, background_canvas.height);

            repaint(x,y);
        };

        background_canvas.onclick = function() {
            if(hoveredRect.status == 'free' && hoveredRect.interactable) {
                console.log("clicking: " + hoveredRect.roomname);
                hoveredRect.status = 'booked';
                repaint(x,y);
            }
        }

    });
}
var hoveredRect;
var allowClick = false;
function repaint(x,y) {
    var i = 0;
    var r;

    while(r = rects[i++]) {
        bg_ctx.beginPath();
        bg_ctx.rect(r.x, r.y, r.w, r.h);
            
        if(r.status == 'free')
        {
            if(bg_ctx.isPointInPath(x,y)) 
            {
                bg_ctx.fillStyle = "green";
                hoveredRect = r;
                r.interactable = true;
            }
            else 
            {
                bg_ctx.fillStyle = "green";
                r.interactable = false;
            }
        }
        else
        {
            bg_ctx.fillStyle = 'red';
        }
        // bg_ctx.fillStyle = bg_ctx.isPointInPath(x,y) ? "blue" : "green";
        bg_ctx.fill();
    }
}