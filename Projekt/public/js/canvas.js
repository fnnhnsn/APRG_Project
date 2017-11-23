
var xSpan = document.getElementById('x');
var ySpan = document.getElementById('y');

    //Store all "rooms" here --> rects []
var rects = [
    {x:169, y:336, w:15, h:11, roomname:'e27', status: 'free', interactable: false},
    {x:169, y:360, w:15, h:15, roomname:'e28', status: 'free', interactable: false},
    {x:163, y:393, w:9,  h:31, roomname:'e29', status: 'free', interactable: false},
    {x:173, y:393, w:41, h:42, roomname:'e30', status: 'free', interactable: false},
    {x:307, y:385, w:57, h:38, roomname:'e39', status: 'free', interactable: false}, 
    {x:393, y:385, w:56, h:38, roomname:'e48', status: 'free', interactable: false},

];

var background_canvas;
var bg_ctx;

init();

function init() {
    background_canvas = document.getElementById('canvas');
    bg_ctx = background_canvas.getContext('2d');
    bg_ctx.globalAlpha = 0.4;
    
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

    // bg_ctx.fillRect(307, 386, 57, 37);
    // bg_ctx.fillRect(393, 386, 57, 37);
    // bg_ctx.fillRect(173, 394, 41, 42);
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
