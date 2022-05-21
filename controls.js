// cursor control class names
const canGrab = "canGrab";
const isGrabbing = "isGrabbing";
const canPlace = "canPlace";

// active controls
/*  Active controls describes which button is currently being held,
    particularly in the case that some other event may be triggered with a combination of button presses
    */
const ac = { 
    spaceDown : false,
    holdLclick : false,
}

// active state
/*  Active controls describes which "states" are currently active,
    particularly when multiple buttons are being held at once and/or separate
    event listeners need to keep track of the same thing happening. 
    */
const as = {
    dragging    : false,
    playing     : false,
    placeMode   : false,
    deleteMode  : false,
    placeColor  : document.getElementById('currentPlaceColor').value,
    placeType   : 'conway',
}

// handle keyboard inputs

// this function handles tap inputs
function handleKeypress(press) {
    switch(press.key) {
        case 'r': // reset
            reset();
            break;
        case 's': // start/stop
            playPause();
            break;
        default:
            break;
    }
}

// this function handles whenever a key is pushed and held (down) or (up)
function handleKeydownUp(press) {
    if (press.type == "keydown") {

        switch(press.key) {
            case ' ':
                ac.spaceDown = true;
                canvasContainer.classList.add(canGrab);
                break;
            case 'Control':
                canvasContainer.classList.add(canPlace);
                break;
            default:
                break;
        }
    }
    else { // keyup

        switch(press.key) {
            case ' ':
                ac.spaceDown = false;
                canvasContainer.classList.remove(canGrab);
                break;
            case 'Control':
                canvasContainer.classList.remove(canPlace);
                break;
            default:
                break;
        }
    }
}

// keyboard input helper functions

function playPause() {
    as.playing = !as.playing;
    if (as.playing) {
        runLoop(); // needs to be restarted
    }
}

document.addEventListener('keypress', handleKeypress);
document.addEventListener('keydown', handleKeydownUp);
document.addEventListener('keyup', handleKeydownUp);

let dragStart = { x: 0, y: 0 }

// mouse event handlers & helpers

// Gets the relevant location from a mouse or single touch event
function getEventLocation(e) {
    if (e.touches && e.touches.length == 1) {
        return { x:e.touches[0].clientX, y: e.touches[0].clientY }
    }
    else if (e.clientX && e.clientY) {
        return { x: e.clientX, y: e.clientY }        
    }
}

// this function sets game states. When the pointer is pressed down.
function onPointerDown(e) {
    if (e.buttons === 1) { // if left click
        ac.holdLclick = true;
        // drag mode
        if (ac.spaceDown) {
            as.dragging = true;
            canvasContainer.classList.add(isGrabbing);
            dragStart.x = getEventLocation(e).x/cameraZoom - cameraOffset.x;
            dragStart.y = getEventLocation(e).y/cameraZoom - cameraOffset.y;
        }
        // place mode
        if (!ac.spaceDown && e.ctrlKey) { // if not holding space and control clicking
            as.placeMode = true;
            placeSquare(e);
        }
        // delete mode
        if (!ac.spaceDown && e.shiftKey) { // if not holding space and control clicking
            as.deleteMode = true;
            deleteSquare(e);
        }
    }
    if (e.buttons === 2) { // right click

    }
}

// This function resets gamestates and active controls. When the mouse press/hold is done.
function onPointerUp(e) { 
    // console.log(e.buttons, e.isPrimary);
    if (e.buttons === 0) { // if left click
        ac.holdLclick = false;
        if (as.dragging) {
            as.dragging = false;
            canvasContainer.classList.remove(isGrabbing);
            initialPinchDistance = null;
            lastZoom = cameraZoom;
        }
        if (as.placeMode) as.placeMode = !as.placeMode;
        if (as.deleteMode) as.deleteMode = !as.deleteMode;
    }
}

// This function checks gamestates. Whenever the mouse is moved, period.
function onPointerMove(e) {
    e = getEventLocation(e);
    previousCoord = {x: e.x, y: e.y};
    if (as.dragging) {
        cameraOffset.x = e.x/cameraZoom - dragStart.x; 
        cameraOffset.y = e.y/cameraZoom - dragStart.y;
        gridIsUpToDate = false;
    }
    if (as.placeMode) {
        placeSquare(e);
    }
    if (as.deleteMode) {
        deleteSquare(e);
    }
}

// touchscreen compatability functions

function handleTouch(e, singleTouchHandler) {
    if ( e.touches.length == 1 ) {
        singleTouchHandler(e)
    }
    else if (e.type == "touchmove" && e.touches.length == 2) {
        as.dragging = false
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

// controls the zoom
function adjustZoom(zoomAmount, zoomFactor) {
    if (!as.dragging) {
        if (zoomAmount) {
            cameraZoom -= zoomAmount
        }
        else if (zoomFactor) {
            console.log(zoomFactor)
            cameraZoom = zoomFactor*lastZoom
        }
        
        cameraZoom = Math.min( cameraZoom, MAX_ZOOM )
        cameraZoom = Math.max( cameraZoom, MIN_ZOOM )
        gridIsUpToDate = false;
    }
}

canvasContainer.addEventListener('mousedown', onPointerDown)
canvasContainer.addEventListener('touchstart', (e) => handleTouch(e, onPointerDown))
canvasContainer.addEventListener('mouseup', onPointerUp)
canvasContainer.addEventListener('touchend',  (e) => handleTouch(e, onPointerUp))
canvasContainer.addEventListener('mousemove', onPointerMove)
canvasContainer.addEventListener('touchmove', (e) => handleTouch(e, onPointerMove))
canvasContainer.addEventListener('wheel', (e) => adjustZoom(e.deltaY*SCROLL_SENSITIVITY))

// mouse event listener helper functions

function placeSquare(e) {
    let x = e.x, y = e.y;
    let d = originDistanceFromDrawOrigin();
    let dx = d.x - x, dy = d.y - y;
    let bx = calcBoxDistance(dx);
    let by = calcBoxDistance(dy);
    createSquareOfType(as.placeType, bx, by, as.placeColor);
}

function deleteSquare(e) {
    let x = e.x, y = e.y;
    let sq = findLiveSquare(x, y);
    if (sq !== undefined) sq.kill();
}