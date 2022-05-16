// active controls
const ac = { 
    spaceDown : false,
    holdLclick : false,
}

// gamestate
const gs = {
    dragging    : false,
    playing     : false,
    placeMode   : false,
    deleteMode  : false,
}

// handle keyboard inputs

function handleKeypress(press) {
    switch(press.key) {
        case 'r': // reset
            g.reset();
            break;
        case 's': // start/stop
            playPause();
            break;
        default:
            break;
    }
}

function handleKeydownUp(press) {
    switch(press.key) {
        case ' ':
            spaceDownOnOff(press);
            break;
        default:
            break;
    }
}

// keyboard input helper functions

function playPause() {
    gs.playing = !gs.playing;
    if (gs.playing) {
        g.runLoop(); // needs to be restarted
    }
}

// toggles the ability to drag the canvas
function spaceDownOnOff(e) {
    if (e.type == 'keydown') {
        canvas.style.cursor = "grab";
        ac.spaceDown = true;
    } 
    else if (e.type == 'keyup') {
        canvas.style.cursor = "auto";
        ac.spaceDown = false;
    } 
    else {
        console.error(`event ${e} is not a valid spaceDownOnOff argument.`);
        return;
    } 
}

document.addEventListener('keypress', handleKeypress);
document.addEventListener('keydown', handleKeydownUp);
document.addEventListener('keyup', handleKeydownUp);

let dragStart = { x: 0, y: 0 }

// mouse event handlers

// Gets the relevant location from a mouse or single touch event
function getEventLocation(e) {
    if (e.touches && e.touches.length == 1) {
        return { x:e.touches[0].clientX, y: e.touches[0].clientY }
    }
    else if (e.clientX && e.clientY) {
        return { x: e.clientX, y: e.clientY }        
    }
}

// this function sets game states
function onPointerDown(e) {
    console.log(e);
    if (e.buttons === 1) { // if left click
        ac.holdLclick = true;
        // drag mode
        if (ac.spaceDown) {
            gs.dragging = true;
            dragStart.x = getEventLocation(e).x/cameraZoom - cameraOffset.x;
            dragStart.y = getEventLocation(e).y/cameraZoom - cameraOffset.y;
        }
        // place mode
        if (!ac.spaceDown && e.ctrlKey) { // if not holding space and control clicking
            gs.placeMode = true;
            placeSquare(e);
        }
        // delete mode
        if (!ac.spaceDown && e.shiftKey) { // if not holding space and control clicking
            gs.deleteMode = true;
            deleteSquare(e);
        }
    }
    if (e.buttons === 2) { // right click

    }
}

// this function resets gamestates and active controls
function onPointerUp(e) { 
    console.log(e.buttons, e.isPrimary);
    if (e.buttons === 0) { // if left click
        ac.holdLclick = false;
        if (gs.dragging) {
            gs.dragging = false;
            initialPinchDistance = null;
            lastZoom = cameraZoom;
        }
        if (gs.placeMode) gs.placeMode = !gs.placeMode;
        if (gs.deleteMode) gs.deleteMode = !gs.deleteMode;
    }
}

// this function checks gamestates
function onPointerMove(e) {
    if (gs.dragging) {
        cameraOffset.x = getEventLocation(e).x/cameraZoom - dragStart.x; 
        cameraOffset.y = getEventLocation(e).y/cameraZoom - dragStart.y;
    }
    if (gs.placeMode) {
        placeSquare(e);
    }
    if (gs.deleteMode) {
        deleteSquare(e);
    }
}

function handleTouch(e, singleTouchHandler) {
    if ( e.touches.length == 1 ) {
        singleTouchHandler(e)
    }
    else if (e.type == "touchmove" && e.touches.length == 2) {
        gs.dragging = false
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
    if (!gs.dragging) {
        if (zoomAmount) {
            cameraZoom -= zoomAmount
        }
        else if (zoomFactor) {
            console.log(zoomFactor)
            cameraZoom = zoomFactor*lastZoom
        }
        
        cameraZoom = Math.min( cameraZoom, MAX_ZOOM )
        cameraZoom = Math.max( cameraZoom, MIN_ZOOM )
        
    }
}

canvas.addEventListener('mousedown', onPointerDown)
canvas.addEventListener('touchstart', (e) => handleTouch(e, onPointerDown))
canvas.addEventListener('mouseup', onPointerUp)
canvas.addEventListener('touchend',  (e) => handleTouch(e, onPointerUp))
canvas.addEventListener('mousemove', onPointerMove)
canvas.addEventListener('touchmove', (e) => handleTouch(e, onPointerMove))
canvas.addEventListener('wheel', (e) => adjustZoom(e.deltaY*SCROLL_SENSITIVITY))

// mouse event listener helper functions

function placeSquare(e) {
    let x = e.clientX, y = e.clientY;
    let d = originDistanceFromDrawOrigin();
    let dx = d.x - x, dy = d.y - y;
    let bx = calcBoxDistance(dx);
    let by = calcBoxDistance(dy);
    // console.log("expected coordinates.", bx, by); 
    g.living.set(`${bx},${by}`, new Square(bx, by, 'blue'));
}

function deleteSquare(e) {
    let x = e.clientX, y = e.clientY;
    let d = originDistanceFromDrawOrigin();
    let dx = d.x - x, dy = d.y - y;
    let bx = calcBoxDistance(dx);
    let by = calcBoxDistance(dy);
    // console.log("expected coordinates.", bx, by); 
    g.living.delete(`${bx},${by}`);
}

function originDistanceFromDrawOrigin() {
    let sOrigX = canvas.width/2, sOrigY = canvas.height/2;
    let pxDistX = ((cameraOffset.x*cameraZoom)-(sOrigX)*cameraZoom+sOrigX);
    let pxDistY = ((cameraOffset.y*cameraZoom)-(sOrigY)*cameraZoom+sOrigY);
    let bxDistX = calcBoxDistance(pxDistX);
    let bxDistY = calcBoxDistance(pxDistY);
    console.warn( pxDistX, pxDistY, bxDistX, bxDistY );
    return {x : pxDistX, y: pxDistY, xb: bxDistX, yb: bxDistY};
}

function calcBoxDistance(pixelDistance) {
    return -Math.ceil(pixelDistance / (scale * cameraZoom));
}