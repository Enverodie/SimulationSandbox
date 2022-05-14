const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const coolColors = ['darkblue', 'blue', 'lightblue', 'darkcyan', 'cyan', 'lightcyan'];
const warmColors = ['darkred', 'red', 'lightred', 'darkorange', 'orange', 'lightorange'];

const squares = [];
const boxes = 35;
const scale = 20;



let cameraOffset = { x: 0, y: 0 }
let cameraZoom = .5
let MAX_ZOOM = 5
let MIN_ZOOM = 0.05
let SCROLL_SENSITIVITY = 0.001

let isDragging = false
let dragStart = { x: 0, y: 0 }

// Gets the relevant location from a mouse or single touch event
function getEventLocation(e) {
    if (e.touches && e.touches.length == 1) {
        return { x:e.touches[0].clientX, y: e.touches[0].clientY }
    }
    else if (e.clientX && e.clientY) {
        return { x: e.clientX, y: e.clientY }        
    }
}

function onPointerDown(e) {
    isDragging = true
    dragStart.x = getEventLocation(e).x/cameraZoom - cameraOffset.x
    dragStart.y = getEventLocation(e).y/cameraZoom - cameraOffset.y
}

function onPointerUp(e) {
    isDragging = false
    initialPinchDistance = null
    lastZoom = cameraZoom
}

function onPointerMove(e) {
    if (isDragging) {
        cameraOffset.x = getEventLocation(e).x/cameraZoom - dragStart.x
        cameraOffset.y = getEventLocation(e).y/cameraZoom - dragStart.y
    }
}

function handleTouch(e, singleTouchHandler) {
    if ( e.touches.length == 1 ) {
        singleTouchHandler(e)
    }
    else if (e.type == "touchmove" && e.touches.length == 2) {
        isDragging = false
        handlePinch(e)
    }
}

let initialPinchDistance = null
let lastZoom = cameraZoom

function handlePinch(e) {
    e.preventDefault()
    
    let touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    let touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY }
    
    // This is distance squared, but no need for an expensive sqrt as it's only used in ratio
    let currentDistance = (touch1.x - touch2.x)**2 + (touch1.y - touch2.y)**2
    
    if (initialPinchDistance == null) {
        initialPinchDistance = currentDistance
    }
    else {
        adjustZoom( null, currentDistance/initialPinchDistance )
    }
}

function adjustZoom(zoomAmount, zoomFactor) {
    if (!isDragging) {
        if (zoomAmount) {
            cameraZoom -= zoomAmount
        }
        else if (zoomFactor) {
            console.log(zoomFactor)
            cameraZoom = zoomFactor*lastZoom
        }
        
        cameraZoom = Math.min( cameraZoom, MAX_ZOOM )
        cameraZoom = Math.max( cameraZoom, MIN_ZOOM )
        
        console.log(zoomAmount, cameraZoom)
    }
}

canvas.addEventListener('mousedown', onPointerDown)
canvas.addEventListener('touchstart', (e) => handleTouch(e, onPointerDown))
canvas.addEventListener('mouseup', onPointerUp)
canvas.addEventListener('touchend',  (e) => handleTouch(e, onPointerUp))
canvas.addEventListener('mousemove', onPointerMove)
canvas.addEventListener('touchmove', (e) => handleTouch(e, onPointerMove))
canvas.addEventListener( 'wheel', (e) => adjustZoom(e.deltaY*SCROLL_SENSITIVITY))

// TODO: make this infinite
function drawGrid() {
    const thickness = .075;
    ctx.save();

    ctx.fillStyle = 'gray';
    ctx.scale(scale, scale);
    for (let i = -canvas.width; i <= canvas.width; i++) { // draw vertical lines
        ctx.fillRect(i-(thickness/2), -canvas.height, thickness, 2*canvas.height);
    }
    for (let i = -canvas.height; i <= canvas.height; i++) { // draw horizontal lines
        ctx.fillRect(-canvas.width, i-(thickness/2), 2*canvas.width, thickness);
    }

    ctx.restore();
}

function drawSquares() {
    ctx.save();
    ctx.scale(scale, scale);
    for (s of g.living.values()) {
        s.draw();
    }
    ctx.restore();
}

function drawAll() {
    sizeCanvas();
    
    // Makes the zoom work
    setScrollEffect(true);
    

    ctx.translate(cameraOffset.x, cameraOffset.y); // translates to the current camera offset
    
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight); // clear the screen
    ctx.save();


    drawSquares();
    drawGrid();


    ctx.translate(-cameraOffset.x, -cameraOffset.y);
    // everything drawn here will be immune to moving (but not scrolling)
    setScrollEffect(false);
    // everything drawn here will be static on the screen

    // ctx.fillRect(0, 0, 100, 100);

    requestAnimationFrame(drawAll);
}

function setScrollEffect(value) {
    if (value) {
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.scale(cameraZoom, cameraZoom);
        ctx.translate(-canvas.width/2, -canvas.height/2);
    }
    else {
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.scale(1/cameraZoom, 1/cameraZoom);
        ctx.translate(-canvas.width/2, -canvas.height/2);
    }
}

function sizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

drawAll();

window.addEventListener('resize', sizeCanvas);
canvas.addEventListener('click', (e) => {
    console.log(e);
})

// creates a bunch of boxes adjacent to one another 
function create() {
    for (let i = 0; i < boxes; i++) {
        for (let j = 0; j < boxes; j++) {
            let color = warmColors[ Math.floor(Math.random() * warmColors.length) ];
            squares.push(new Square(i, j, color));
        }
    }
}
// create();

