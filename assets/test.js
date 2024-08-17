var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.textBaseline = 'middle';

var offsetY = 0;
var offsetX = 0;

// getting mouse's x & y by subtracting client x and rectangles hight,
function getMousePosition(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    return { x, y }
}

var isClicking = false; // simple bool to see if we have to add for the offset

var lastCords; // we use this to store the last cords to subtract to get the offset between the new yeah

// debug, and also so i know where the heck i am
canvas.addEventListener("mousedown", function (e) {
    canvas.requestPointerLock()
    isClicking = true
    cords = getMousePosition(canvas, e);
    lastCords = cords
    console.log(cords, cords.x)
    ctx.beginPath();
    ctx.stroke();
    ctx.arc(cords.x, cords.y, 40, 0, 4 * Math.PI);
    ctx.stroke();
});

// update debug
canvas.addEventListener("mousemove", (e) => {
    cords = getMousePosition(canvas, e);
    document.getElementById('debug').innerText = `x: ${cords.x + offsetX}, y:${cords.y + offsetY} | cords: ${JSON.stringify(cords)}`
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

    console.log('offsets: ', offsetX, offsetY);

    drawInRange(json);
});


// eventually we will get this from the server, but this is an example for a circle to test our offset thing
var json = 
{
    randomId: {
        x: 10, 
        y: 10, 
        type:'circle_placeholder', 
        color:'hello',
        text:'test',
        id: 'test'
    },

    otherRandomId: {
        x: 100, 
        y: 100, 
        type:'circle_placeholder', 
        color:'hello',
        text:'test',
        id: 'test2'
    },

    ermmmwhathesigma: {
        x: 999, 
        y: 999, 
        type:'circle_placeholder', 
        color:'hello',
        text:'test',
        id: 'test3'
    }
}

var body = document.querySelector('body');

function drawInRange(json){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // why oh why must i do this to myself

    // at this point, its better to just do this later cuz its a lot of math and my brain hurts

    let img = document.getElementById('source')

    let imgWidth = 100; // setting how big the background texture will be
    let imgHeight = 100;
    
    let rows =  Math.ceil(canvas.height / imgHeight); // how many rows in the background grid
    let cols =  Math.ceil(canvas.width / imgWidth); // setting how many collums will be in the grid
    
    for (let row = 0; row < rows; row++) {
        // handle rows
        for (let col = 0; col < cols; col++) {
            // handle collums
            ctx.drawImage(
                img, 
                col * imgWidth - offsetX, // i think, for some reason, its keeping the offsets the same even after they change or something. idk why. its wierd
                row * imgHeight - offsetY, 
                imgWidth, 
                imgHeight
            );
        }
    }

    console.log(json)

    // rendering individual things returned from the funny json
    for (let blip in json) {
        let blipObject = json[blip] // we make our blip object so we can add the info, and init the rev object
        
        let x = blipObject.x - offsetX
        let y = blipObject.y - offsetY

        ctx.beginPath();
        ctx.stroke();
        ctx.arc( x, y, 40, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.strokeStyle = "blue";
        ctx.stroke();


        let blipDiv = document.getElementById(blipObject.id)

        if (blipDiv){ // return early so we don't accidently make one bijaillion objects
            blipDiv.style.left = x+'px'
            blipDiv.style.top = y+'px'
            continue
        }

        let id = blipObject.id

        let div = document.createElement('div')
        div.innerText = blipObject.text
        div.id = id
        div.classList.add('blip')
        div.style.left = x
        div.style.top = y    
        
        let canvas = document.createElement('canvas')
        canvas.id = `${id}Canvas`
        canvas.style.width = "100px"
        canvas.style.height = "100px"

        const r = new rive.Rive({
            src: "https://cdn.rive.app/animations/vehicles.riv",
            canvas: canvas,
            autoplay: true,
            stateMachines: "bumpy",
            onLoad: () => {
              r.resizeDrawingSurfaceToCanvas();
            },
        });
    
        div.appendChild(document.createElement('br'))
        div.appendChild(canvas)
        body.appendChild(div)
    } 
}