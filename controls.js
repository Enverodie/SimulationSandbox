// handle keyboard inputs

// this function handles tap inputs
function handleKeypress(press) {
    switch(press.key) {
        case 'r': // reset
            reset();
            break;
        case 's': // start/stop
            simControls.playPause();
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
                simControls.spaceDown = true;
                canvasContainer.classList.add("canGrab");
                break;
            case 'Control':
                canvasContainer.classList.add("canPlace");
                break;
            case 'Shift':
                canvasContainer.classList.add("isDeleteMode");
                simControls.shiftDown = true;
                break;
            default:
                break;
        }
    }
    else { // keyup

        switch(press.key) {
            case ' ':
                simControls.spaceDown = false;
                canvasContainer.classList.remove("canGrab");
                break;
            case 'Control':
                canvasContainer.classList.remove("canPlace");
                break;
            case 'Shift':
                canvasContainer.classList.remove("isDeleteMode");
                simControls.shiftDown = false;
                break;
            default:
                break;
        }
    }
}

document.addEventListener('keypress', handleKeypress);
document.addEventListener('keydown', handleKeydownUp);
document.addEventListener('keyup', handleKeydownUp);

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
        simControls.holdLclick = true;
        // drag mode
        if (simControls.spaceDown) {
            as.dragging = true;
            canvasContainer.classList.add("isGrabbing");
            simControls.setDrag(
                getEventLocation(e).x/MUStates.cameraZoom - MUStates.cameraOffset.x,
                getEventLocation(e).y/MUStates.cameraZoom - MUStates.cameraOffset.y
            );
        }
        // place mode
        if (!simControls.spaceDown && e.ctrlKey) { // if not holding space and control clicking
            as.placeMode = true;
            spf.placeSquare(e);
        }
        // delete mode
        if (!simControls.spaceDown && e.shiftKey) { // if not holding space and control clicking
            as.deleting = true;
            spf.deleteSquare(e);
        }
    }
    if (e.buttons === 2) { // right click

    }
}

// This function resets gamestates and active controls. When the mouse press/hold is done.
function onPointerUp(e) { 
    // console.log(e.buttons, e.isPrimary);
    if (e.buttons === 0) { // if left click
        simControls.holdLclick = false;
        if (as.dragging) {
            as.dragging = false;
            canvasContainer.classList.remove("isGrabbing");
            simControls.initialPinchDistance = null;
            simControls.lastZoom = MUStates.cameraZoom;
        }
        if (as.placeMode) as.placeMode = !as.placeMode;
        if (as.deleting) as.deleting = !as.deleting;
    }
}

// This function checks gamestates. Whenever the mouse is moved, period.
function onPointerMove(e) {
    e = getEventLocation(e);
    MUStates.previousCoord = {x: e.x, y: e.y};
    if (as.dragging) {
        let d = simControls.getDrag();
        MUStates.cameraOffset.x = e.x/MUStates.cameraZoom - d.x; 
        MUStates.cameraOffset.y = e.y/MUStates.cameraZoom - d.y;
        MUStates.gridIsUpToDate = false;
    }
    if (as.placeMode) {
        spf.placeSquare(e);
    }
    if (as.deleting) {
        spf.deleteSquare(e);
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

function handlePinch(e) {
    e.preventDefault()
    
    let touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    let touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY }
    
    // This is distance squared, but no need for an expensive sqrt as it's only used in ratio
    let currentDistance = (touch1.x - touch2.x)**2 + (touch1.y - touch2.y)**2
    
    if (simControls.initialPinchDistance == null) {
        simControls.initialPinchDistance = currentDistance
    }
    else {
        adjustZoom( null, currentDistance/simControls.initialPinchDistance )
    }
}

// function handleWheel(event) {
//     
// }

// controls the zoom
function adjustZoom(zoomAmount, zoomFactor) {
    if (!as.dragging && !simControls.isDeleteMode()) {
        if (zoomAmount) {
            MUStates.cameraZoom -= zoomAmount
        }
        else if (zoomFactor) {
            console.log(zoomFactor)
            MUStates.cameraZoom = zoomFactor*lastZoom
        }
        
        MUStates.cameraZoom = Math.min( MUStates.cameraZoom, MAX_ZOOM )
        MUStates.cameraZoom = Math.max( MUStates.cameraZoom, MIN_ZOOM )
        MUStates.gridIsUpToDate = false;
    }
}

function adjustdeleteDiameter(scrollAmount) {
    if (!simControls.isDeleteMode()) return; // returns if not in "ready to delete" state
    console.log("Scroll amount:", scrollAmount);
    grf.setdeleteDiameter(scrollAmount);
}

canvasContainer.addEventListener('mousedown', onPointerDown)
canvasContainer.addEventListener('touchstart', (e) => handleTouch(e, onPointerDown))
canvasContainer.addEventListener('mouseup', onPointerUp)
canvasContainer.addEventListener('touchend',  (e) => handleTouch(e, onPointerUp))
canvasContainer.addEventListener('mousemove', onPointerMove)
canvasContainer.addEventListener('touchmove', (e) => handleTouch(e, onPointerMove))
canvasContainer.addEventListener('wheel', (e) => {adjustZoom(e.deltaY*SCROLL_SENSITIVITY); adjustdeleteDiameter(e.deltaY*SCROLL_SENSITIVITY)})
