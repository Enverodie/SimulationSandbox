// cursor control class names
const canGrab = "canGrab";
const isGrabbing = "isGrabbing";
const canPlace = "canPlace";
const squareInfo = "squareInfo";

// active controls
/*  Active controls describes which button is currently being held,
    particularly in the case that some other event may be triggered with a combination of button presses
    */
const ac = { 
    mousePosition : {x: 0, y: 0}, // current mouse position, updated with move listeners
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
                canvas.classList.add(canGrab);
                break;
            case 'Control':
                canvas.classList.add(canPlace);
                break;
            default:
                break;
        }
    }
    else { // keyup

        switch(press.key) {
            case ' ':
                ac.spaceDown = false;
                canvas.classList.remove(canGrab);
                break;
            case 'Control':
                canvas.classList.remove(canPlace);
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
            canvas.classList.add(isGrabbing);
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
            canvas.classList.remove(isGrabbing);
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
    ac.mousePosition = {x: e.x, y: e.y};
    if (as.dragging) {
        cameraOffset.x = getEventLocation(e).x/cameraZoom - dragStart.x; 
        cameraOffset.y = getEventLocation(e).y/cameraZoom - dragStart.y;
    }
    if (as.placeMode) {
        placeSquare(e);
    }
    if (as.deleteMode) {
        deleteSquare(e);
    }
    if (!(as.dragging || as.placeMode || as.deleteMode)) {
        addHTMLInfoPanel();
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

// returns the square within any given viewport coordinate, or undefined if it isn't alive
function findLiveSquare(x, y) {
    let d = originDistanceFromDrawOrigin();
    let dx = d.x - x, dy = d.y - y;
    let bx = calcBoxDistance(dx);
    let by = calcBoxDistance(dy);
    return g.living.get(`${bx},${by}`);
}

function placeSquare(e) {
    let x = e.x, y = e.y;
    let d = originDistanceFromDrawOrigin();
    let dx = d.x - x, dy = d.y - y;
    let bx = calcBoxDistance(dx);
    let by = calcBoxDistance(dy);
    createSquareOfType('conway', bx, by, as.placeColor);
}

function deleteSquare(e) {
    let x = e.x, y = e.y;
    let sq = findLiveSquare(x, y);
    if (sq !== undefined) sq.kill();
}

function originDistanceFromDrawOrigin() {
    let sOrigX = canvas.width/2, sOrigY = canvas.height/2;
    let pxDistX = ((cameraOffset.x*cameraZoom)-(sOrigX)*cameraZoom+sOrigX);
    let pxDistY = ((cameraOffset.y*cameraZoom)-(sOrigY)*cameraZoom+sOrigY);
    let bxDistX = calcBoxDistance(pxDistX);
    let bxDistY = calcBoxDistance(pxDistY);
    return {x : pxDistX, y: pxDistY, xb: bxDistX, yb: bxDistY};
}

function calcBoxDistance(pixelDistance) {
    return -Math.ceil(pixelDistance / (scale * cameraZoom));
}

function addHTMLInfoPanel() {
    const maxOpacity = .8;
    const remSpacing = .6;
    let sq = findLiveSquare(ac.mousePosition.x, ac.mousePosition.y);
    let element = document.getElementById('squareInfo');
    let needsAppended = false;
    if (element == null) { // no element has been created yet to show the info
        element = document.createElement('div');
        element.setAttribute('id', squareInfo);
        needsAppended = true;
    }
    if (sq === undefined) { // no square is alive in this case
        element.style.opacity = "0";
        // if (needsAppended) document.getElementById('canvasContainer').appendChild(element);
        return;
    }
    element.innerHTML = `
        <ul>
            <li>Type: ${sq.type}</li>
            <li>Color: ${sq.color}</li>
            <li>Health-Attack: ${sq.HA}/${sq.originalHA}</li>
        </ul>`;
    element.style.left = `calc(${ac.mousePosition.x}px + ${remSpacing}rem)`;
    element.style.top = `calc(${ac.mousePosition.y}px - ${remSpacing}rem - ${element.getBoundingClientRect().height}px)`;
    if (sq !== undefined) element.style.opacity = maxOpacity + "";
    if (needsAppended) document.getElementById('canvasContainer').appendChild(element);
}