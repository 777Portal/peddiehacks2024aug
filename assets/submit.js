canvas.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    openBlipSubmit(e);
    return false;
}, false);

loggedIn = false

checkStatus();
async function checkStatus(){
    const selfInfo = await fetch('/api/v1/self/info'); // get info from api self

    loggedInInfo = document.getElementById('loggedIn') // setting the logged in info

    if (!selfInfo.ok) { 
        document.getElementById('loggedOnSubmitBlip').style.display = 'none' 
        document.getElementById('loggedOffSubmitBlip').style.display = 'block' // changing the blip submit menu so it shows you aren't logged in.
        console.warn('not logged in') 
        loggedIn = false
        return;
    }

    document.getElementById("submitBlipButton").addEventListener("click", handleBlipSubmit);

    loggedIn = true
    loggedInInfo.innerText = 'logged in'
}

function openBlipSubmit(e)
{

    e.preventDefault();
    cords = getMousePosition(canvas, e); // setting the values that will be submitted to the server
    let submitBlipMenu = document.getElementById('submit')
    submitBlipMenu.style.display = 'block';
    submitBlipMenu.style.left = cords.x+"px";
    submitBlipMenu.style.top = cords.y+"px";
    
    let cordsX = document.getElementById('cordX')
    let cordsY = document.getElementById('cordY')

    cords.x += offsetX
    cords.y += offsetY

    cordsX.innerText = cords.x
    cordsY.innerText = cords.y
    
    return false; 
};

// animation, thought, link, cords
function handleBlipSubmit(){
    let x = document.getElementById('cordX').innerText
    let y = document.getElementById('cordY').innerText

    link = document.getElementById('link').value // spotify link
    thought = document.getElementById('thought').value // text
    animation = document.getElementById('animation').value // type

    socket.emit('CREATEBLIP', {x, y, link, thought, animation})
    console.log(animation, thought, link, cordX, cordY)
}