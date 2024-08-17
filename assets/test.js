var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.textBaseline = 'middle';

var offsetY = 0;
var offsetX = 0;

const socket = io();

// getting mouse's x & y by subtracting client x and rectangles hight,
function getMousePosition(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    return { x, y }
}

var isClicking = false; // simple bool to see if we have to add for the offset
var lastCords; // we use this to store the last cords to subtract to get the offset between the new yeah

// get pointer lock, and set is clicking
canvas.addEventListener("mousedown", function (e) {
    if (e.button !== 0) return;
    canvas.requestPointerLock()
    document.getElementById('submit').style.display = 'none'
    isClicking = true
    cords = getMousePosition(canvas, e);
    lastCords = cords
});


// update cordnates
canvas.addEventListener("mousemove", (e) => {
    cords = getMousePosition(canvas, e);
    document.getElementById('debug').innerText = `x: ${cords.x + offsetX}, y:${cords.y + offsetY}`
});

document.addEventListener("pointerlockchange", function () {
    if (document.pointerLockElement === canvas) {
        console.log("Pointer is locked");
    } else {
        console.log("Pointer is unlocked");
        isClicking = false;
    }
});

// so the blips don't get in the way, we can use the pointer api.
canvas.addEventListener("mousemove", (e) => {
    if (!isClicking) return;

    let movementX = e.movementX || 0;
    let movementY = e.movementY || 0;

    offsetX += movementX;
    offsetY += movementY;

    lastCords = { x: lastCords.x + movementX, y: lastCords.y + movementY };

    socket.emit('MOVE', lastCords)

    drawInRange(json);
});

var json = {}


// eventually we will get this from the server, but this is an example for a circle to test our offset thing
socket.on('BLIPS', (blipsJson) => {
    console.log(blipsJson)
    json = blipsJson
})

var body = document.querySelector('body');

function drawMap(){
    let img = document.getElementById('source');
    let imgWidth = 100; 
    let imgHeight = 100;
    
    // get the visable area considering offset
    let startX = Math.floor(offsetX / imgWidth);
    let startY = Math.floor(offsetY / imgHeight);
    
    let rows = Math.ceil(canvas.height / imgHeight) + 2; // +2 to ensure it covers partially visible areas
    let cols = Math.ceil(canvas.width / imgWidth) + 2;
    
    for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
            let x = (col + startX) * imgWidth - offsetX;
            let y = (row + startY) * imgHeight - offsetY;
            
            ctx.drawImage(img, x, y, imgWidth, imgHeight);
        }
    }  
}


async function drawInRange(json){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap();

    console.log(json)

    // rendering individual things returned from the funny json
    for (let blip in json) {
        let blipObject = json[blip] // we make our blip object so we can add the info, and init the rev object
        
        let x = blipObject.x - offsetX
        let y = blipObject.y - offsetY

        ctx.beginPath();
        ctx.stroke();
        ctx.arc( x, y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.strokeStyle = "blue";
        ctx.stroke();


        let blipDiv = document.getElementById(blipObject.id)

        if (blipDiv){ // return early so we don't accidently make one bajillion objects
            blipDiv.style.left = x+'px'
            blipDiv.style.top = y+'px'
            continue
        }

        let id = blipObject.id
        
        let div = document.createElement('div')
        div.id = id
        div.classList.add('blip')
        div.style.left = x
        div.style.top = y    
        
        let canvas = document.createElement('canvas')
        canvas.id = `${id}Canvas`
        canvas.style.width = "100px"
        canvas.style.height = "100px"

        const r = new rive.Rive({
            src: `./assets/${blipObject.type}.riv`,
            canvas: canvas,
            autoplay: true,
            stateMachines: "State Machine 1",
            onLoad: () => {
              r.resizeDrawingSurfaceToCanvas();
            },
        });

        let spotifyEmbed = document.createElement('div')
        spotifyEmbed.innerHTML = blipObject.html
    
        let text = document.createElement('p')
        text.innerText = blipObject.text

        div.appendChild(document.createElement('br'))
        div.appendChild(canvas)
        div.appendChild(document.createElement('br'))
        div.appendChild(text)
        div.appendChild(document.createElement('br'))
        div.appendChild(spotifyEmbed)

        body.appendChild(div)
    } 

}