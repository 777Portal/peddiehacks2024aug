var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d", { alpha: false });
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.textBaseline = 'middle';

const dpr = window.devicePixelRatio;
const rect = canvas.getBoundingClientRect();

canvas.width = rect.width * dpr;
canvas.height = rect.height * dpr;

ctx.scale(dpr, dpr);

canvas.style.width = `${rect.width}px`;
canvas.style.height = `${rect.height}px`;

let offsetY = 0;
let offsetX = 0;

const socket = io();

socket.on("connect", () => {
    drawMap();

    ctx.fillStyle = "#a1ddca";
    ctx.font = '50px sans-serif';

    let textString = "Click anywhere to load blips",
        textWidth = ctx.measureText(textString ).width;

    ctx.fillText(textString , (canvas.width/2) - (textWidth / 2), 100);
});

// getting mouse's x & y by subtracting client x and rectangles hight,
function getMousePosition(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    return { x, y }
}

var isClicking = false; // simple bool to see if we have to add for the offset
var lastCords; // we use this to store the last cords to subtract to get the offset between the new mouse pos

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
    x = cords.x + offsetX
    y = cords.y + offsetY
    
    document.getElementById('debug').innerText = `x: ${x}, y:${y}`

    socket.emit('MOVE', {x, y})
});

document.addEventListener("pointerlockchange", function () {
    if (document.pointerLockElement === canvas) {
        // console.log("Pointer is locked");
    } else {
        // console.log("Pointer is unlocked");
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

    let x = lastCords.x + movementX
    let y = lastCords.Y + movementY

    lastCords = { x, y };
    // socket.emit('MOVE', {x, y})

    render(blipsJson, cursorsJson);
});

var blipsJson = {}
var cursorsJson = {}


// getting blip data fr
socket.on('UPD', (info) => {
    console.log('Update')
    blipsJson = info.blips
    cursorsJson = info.cursors
    render(blipsJson, cursorsJson);
})

var body = document.querySelector('body');

function drawMap(){
    let img = document.getElementById('source'); // get grass texture from the hidden img
    let imgWidth = 100;  // setting texture size
    let imgHeight = 100;
    
    // get the starting tiles considering offset
    let startX = Math.floor(offsetX / imgWidth);
    let startY = Math.floor(offsetY / imgHeight);
    
    let rows = Math.ceil(canvas.height / imgHeight) + 2; // +2 to ensure it covers places that aren't completely in the "camera"
    let cols = Math.ceil(canvas.width / imgWidth) + 2;
    
    for (let row = -1; row < rows; row++) { // again start at -1 to account for tiles that might not be in range
        for (let col = -1; col < cols; col++) { // rendering both rows and columns
            let x = (col + startX) * imgWidth - offsetX; // calculate the corner x & y
            let y = (row + startY) * imgHeight - offsetY;
            
            ctx.drawImage(img, x, y, imgWidth, imgHeight); // draw our "tile"
        }
    }  
}

function drawBlips(blipJson){
    // rendering individual things returned from the funny json
    for (let blip in blipJson) {
        let blipObject = blipJson[blip] // we make our blip object so we can add the info, and init the rev object
        
        let x = blipObject.x - offsetX
        let y = blipObject.y - offsetY

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

function drawCursors(cursors){
    let img = document.getElementById('cursor');
    for (let cursorIndex in cursors){
        let cursor = cursors[cursorIndex]
        console.log(cursor.x, cursor.y)

        let x = parseInt(cursor.x - offsetX)
        let y = parseInt(cursor.y - offsetY)

        ctx.drawImage(img, x, y, 25, 25);
    }
}


async function render(blips, cursors){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap();
    drawCursors(cursors)
    drawBlips(blips)
}