var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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
    isClicking = true
    cords = getMousePosition(canvas, e);
    lastCords = cords
    console.log(cords, cords.x)
    ctx.beginPath();
    ctx.stroke();
    ctx.arc(cords.x, cords.y, 40, 0, 2 * Math.PI);
    ctx.stroke();
});

canvas.addEventListener("mouseup", function (e) {
    isClicking = false
}); 

// andddd we do mouseover to live update the map. if this gets enough things, it will take a while; so uh yeah;; lets hope not. i should add authentication so people can't just spam the notes.
canvas.addEventListener("mousemove", (e) => {
    if (!isClicking) return;

    cords = getMousePosition(canvas, e);
    offsetX += cords.x - lastCords.x; 
    offsetY += cords.y - lastCords.y;
    lastCords = cords;

    console.log('offsets: ', offsetX, offsetY);

    document.getElementById('debug').innerText = `${offsetX}, ${offsetY}`
    drawInRange(json);
});

// eventually we will get this from the server, but this is an example for a circle to test our offset thing
var json = {x: 0, y: 0, type:'circle_placeholder', color:'hello', text:'test'}

function drawInRange(json){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // why oh why must i do this to myself

    // at this point, its better to just do this later cuz its a lot of math and my brain hurts

    // let img = document.getElementById('source')

    // let imgWidth = 100; // setting how big the background texture will be
    // let imgHeight = 100;
    
    // let rows = Math.ceil(canvas.height / imgHeight); // how many rows in the background grid
    // let cols = Math.ceil(canvas.width / imgWidth); // setting how many collums will be in the grid
    
    // for (let row = 0; row < rows; row++) {
    //     // handle rows
    //     for (let col = 0; col < cols; col++) {
    //         // handle collums
    //         ctx.drawImage(
    //             img, 
    //             col * imgWidth + offsetX, // i think, for some reason, its keeping the offsets the same even after they change or something. idk why. its wierd
    //             row * imgHeight + offsetY, 
    //             imgWidth, 
    //             imgHeight
    //         );
    //     }
    // }
    
    ctx.beginPath();
    ctx.stroke();
    ctx.arc( ( json.x - offsetX), (json.y - offsetY), 40, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "blue";
    ctx.stroke();
}