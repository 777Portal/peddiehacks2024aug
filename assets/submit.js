canvas.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    openBlipSubmit(e);
    alert('hi');
    return false;
}, false);

loggedIn = false

checkStatus();
async function checkStatus(){
    const selfInfo = await fetch('/api/v1/self/info');

    console.log(selfInfo)
    loggedInInfo = document.getElementById('loggedIn')

    if (!selfInfo.ok) { 
        document.getElementById('loggedOnSubmitBlip').style.display = 'none' 
        document.getElementById('loggedOffSubmitBlip').style.display = 'block'
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
    cords = getMousePosition(canvas, e);
    console.log(cords)
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
    console.log('hello')

    let x = document.getElementById('cordX').innerText
    let y = document.getElementById('cordY').innerText

    link = document.getElementById('link').value
    thought = document.getElementById('thought').value
    animation = document.getElementById('animation').value

    socket.emit('CREATEBLIP', {x, y, link, thought, animation})
    console.log(animation, thought, link, cordX, cordY)
}