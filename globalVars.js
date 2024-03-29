const scale = 20; // multiplier for square size
const gridThickness = .035;
const MAX_ZOOM = 5;
const MIN_ZOOM = 0.01;
const SCROLL_SENSITIVITY = 0.001;
const MAX_DELETE_RADIUS = 100;
const MIN_DELETE_RADIUS = .5;

// manually updated states
const MUStates = {
    previousCoord : {x: 0, y: 0, target: null}, // current mouse position, updated with move listeners (in controls.js)
    cameraOffset : { x: 0, y: 0 },
    cameraZoom : .5,
    gridIsUpToDate : false,
    cssInTransition : false,
    permaDeathQueue : [],
    deleteDiameter : 1,
}
    
// active state
/*  Active controls describes which "states" are currently active,
    particularly when multiple buttons are being held at once and/or separate
    event listeners need to keep track of the same thing happening. 
    */
const as = {
    playing     : false,
    placeColor  : document.getElementById('currentPlaceColor').value,
    placeType   : 'conway',
}

// grid related functions
const grf = {

    // pass a coordinate string, get an object with the numbers
    dissectCoord: function(coord) {
        let x = Number.parseInt(coord.slice(0,coord.indexOf(',')));
        let y = Number.parseInt(coord.slice(coord.indexOf(',') + 1, coord.length));
        return {x: x, y: y};
    },

    // calculates the number of boxes within a distance, accounting for zoom & scale but not offset (one dimensional)
    calcBoxDistance: function(pixelDistance) {
        return -Math.ceil(pixelDistance / (scale * MUStates.cameraZoom));
    },
    
    // calculates the distance (in pixels & in boxes) between the screen's top left corner and ctx's origin 0,0
    originDistanceFromDrawOrigin: function() {
        let cDim = canvasContainer.getBoundingClientRect();
        let sOrigX = cDim.width/2, sOrigY = cDim.height/2;
        let pxDistX = ((MUStates.cameraOffset.x*MUStates.cameraZoom)-(sOrigX)*MUStates.cameraZoom+sOrigX);
        let pxDistY = ((MUStates.cameraOffset.y*MUStates.cameraZoom)-(sOrigY)*MUStates.cameraZoom+sOrigY);
        let bxDistX = this.calcBoxDistance(pxDistX);
        let bxDistY = this.calcBoxDistance(pxDistY);
        return {x : pxDistX, y: pxDistY, xb: bxDistX, yb: bxDistY};
    },

    // returns the context coordinate of a viewport x and y position (accounts for zoom, scale, and offset)
    pointToGridCoord: function(x, y) {
        let d = this.originDistanceFromDrawOrigin();
        let dx = d.x - x, dy = d.y - y;
        let bx = this.calcBoxDistance(dx);
        let by = this.calcBoxDistance(dy);
        return {x: bx, y: by};
    },
    
    // returns the square within any given viewport coordinate, or undefined if it isn't alive
    findLiveSquare: function(x, y) {
        let c = this.pointToGridCoord(x,y);
        return g.living.get(`${c.x},${c.y}`);
    },

    extractUseful: function(square) {
        return {
            type: square.type, 
            sphereOfInfluence: square.sphereOfInfluence, 
            surviveCondition: square.surviveCondition, 
            reproduceRule: square.reproduceRule,
            starterHealthAttack: square.starterHealthAttack,
        };
    },

    setDeleteDiameter: function(addend) {
        let scrollModifier = 10;
        let addendfull = Math.ceil(addend * scrollModifier);
        let dR = Math.min(MUStates.deleteDiameter + addendfull, MAX_DELETE_RADIUS);
        dR = Math.ceil(dR);
        dR = Math.max(dR, MIN_DELETE_RADIUS);
        MUStates.deleteDiameter = dR;
    }
}

const onCanvasButtons = [...document.querySelectorAll('#canvasControls button'), document.getElementById('hideMain')] // useful to prevent square info display when hovering over these elements

// Simulation controls
/*  Useful in that some other event may be triggered with a combination of button presses
*/
const simControls = new (function() {

    this.coordIsInButton = function(mouseEvent) {
        // console.log("Testing coord");
        // console.log(mouseEvent);
        for (ele of onCanvasButtons) {
            if (mouseEvent.target === ele || mouseEvent.target?.tagName === "IMG") return true; // If the pointer was previously on a button or an image (usually in the button)
        }
        return false;
    }

    this.spaceDown = false;
    this.shiftDown = false;
    this.ctrlDown = false;
    this.holdLclick = false;

    let primedToDrag = false;
    this.dragging = false;

    let dragStart = { x: 0, y: 0 };
    this.getDrag = function() {return dragStart}
    this.setDragCoords = function(x, y) { dragStart.x = x, dragStart.y = y}
    this.canDrag = function() {return !(this.ctrlDown || this.shiftDown)}
    this.isReadyToDrag = function() {return primedToDrag}

    this.playPause = function() {
        let canvasButton = document.getElementById('playpause');
        as.playing = !as.playing;
        if (as.playing) {
            runLoop(); // needs to be restarted
            canvasButton.classList.add('active');
        }
        else {
            canvasButton.classList.remove('active');
        }
    }

    this.pressSpace = function(isPressedDown) {
        if (isPressedDown) {
            this.spaceDown = true;
            if (this.canDrag()) this.setReadyToDrag(true);
        }
        else {
            this.spaceDown = false;
            this.setReadyToDrag(false);
        }
    }

    this.pressControl = function(isPressedDown) {
        if (isPressedDown) {
            this.ctrlDown = true;
            if (this.canPlace()) this.setReadyToPlace(true);
        }
        else {
            this.ctrlDown = false;
            this.setReadyToPlace(false);
        }
    }

    this.pressShift = function(isPressedDown) {
        if (isPressedDown) {
            this.shiftDown = true;
            if (this.canDelete()) this.setReadyToDelete(true);
        }
        else {
            this.shiftDown = false;
            this.setReadyToDelete(false);
        }
    }

    this.setReadyToDrag = function(value) { // public function because we need this for our button
        let canvasButton = document.getElementById('drag');
        unprimeAll(value);
        primedToDrag = value;
        if (value) {
            canvasContainer.classList.add("canGrab");
            canvasButton.classList.add('active');
        } 
        else {
            canvasContainer.classList.remove("canGrab");
            canvasButton.classList.remove('active');
            this.initialPinchDistance = null;
            this.lastZoom = MUStates.cameraZoom;
        } 
    }

    this.setDragging = function(value) {
        if (value && primedToDrag) {
            this.dragging = true;
            canvasContainer.classList.add("isGrabbing");
        }
        else {
            this.dragging = false;
            canvasContainer.classList.remove("isGrabbing");
        }
    }

    let primedToPlace = false;
    this.placing = false;

    this.canPlace = function() {return (!simControls.spaceDown && simControls.ctrlDown)}
    this.isReadyToPlace = function() {return primedToPlace}

    this.setReadyToPlace = function(value) {
        let canvasButton = document.getElementById('place');
        unprimeAll(value);
        primedToPlace = value;
        if (value) {
            canvasContainer.classList.add("canPlace");
            canvasButton.classList.add('active');
        }
        else {
            canvasContainer.classList.remove("canPlace");
            canvasButton.classList.remove('active');
        }
    }

    this.setPlacing = function(value) {
        if (value && primedToPlace) {
            this.placing = true;
        }
        else {
            this.placing = false;
        }
    }

    let primedToDelete = false;
    this.deleting = false;

    this.canDelete = function() {return (!this.spaceDown && this.shiftDown)}
    this.isReadyToDelete = function() {return primedToDelete}

    this.setReadyToDelete = function(value) {
        let canvasButton = document.getElementById('delete');
        unprimeAll(value);
        primedToDelete = value;
        if (value) {
            canvasContainer.classList.add("canDelete");            
            canvasButton.classList.add('active');
        }
        else {
            canvasContainer.classList.remove("canDelete");
            canvasButton.classList.remove('active');
        }
    }

    this.setDeleting = function(value) {
        if (value && primedToDelete) {
            this.deleting = true;
        }
        else {
            this.deleting = false;
        }
    }

    function unprimeAll(value) { // resets everything if a button has been activated
        if (!value) return;
        simControls.setReadyToDrag(false);
        simControls.setReadyToPlace(false);
        simControls.setReadyToDelete(false);
    }

    this.reset = function() {
        g.living.clear();
        g.nextGen.clear();
        g.dead?.clear(); // optional chaining operator because we want to be able to disable dead rendering and are not sure if it will exist at this point
        MUStates.permaDeathQueue.length = 0;
        g.permadead?.clear();
        MUStates.gridIsUpToDate = false;
    }

    this.initialPinchDistance = null;
    this.lastZoom = MUStates.cameraZoom;

});

// square placement/targetting functions
const spf = {

    getCoordsInCircle: function(originPoint, diameter) { // origin point is relative to the viewport, not the ctx
        let returnArr = [];
        let b = grf.pointToGridCoord(originPoint.x, originPoint.y);
        let radius = Math.floor(diameter / 2);
        if (radius === 0) radius = 1;
        let yi;
        for (let i = -radius + 1; i < radius; i++) {
            yi = Math.sqrt( -Math.pow(i,2) + Math.pow(radius, 2))
            yi = Math.ceil(yi);
            for (let j = -yi + 1; j < yi; j++) {
                returnArr.push(`${b.x + i},${b.y + j}`);
            }
        }
        return returnArr;
    },

    // returns coordinates of the circle's outer edges ordered clockwise
    // HASN'T BEEN TESTED OR USED
    getCoordsOfCircle: function(originPoint, diameter) { 
        let returnPos = [], returnNeg = [];
        let b = grf.pointToGridCoord(originPoint.x, originPoint.y);
        let radius = Math.floor(diameter / 2);
        if (radius === 0) radius = 1;
        for (let i = -radius + 1; i < radius; i++) {
            yi = Math.sqrt( -Math.pow(i,2) + Math.pow(radius, 2))
            yi = Math.ceil(yi);
            returnPos.push(`${b.x + i},${b.y + yi}`);
            returnNeg.unshift(`${b.x + i},${b.y - yi + 1}`) // watch this +1, might cause errors
        }
        return [...returnPos, ...returnNeg];
    },

    placeSquare: function(e) {
        let x = e.x, y = e.y;
        let d = grf.originDistanceFromDrawOrigin();
        let dx = d.x - x, dy = d.y - y;
        let bx = grf.calcBoxDistance(dx);
        let by = grf.calcBoxDistance(dy);
        createSquareOfType(as.placeType, bx, by, as.placeColor);
    },
    
    deleteSquare: function(e) {
        let coords = spf.getCoordsInCircle(e, MUStates.deleteDiameter);
        for (c of coords) {
            let sq = g.living.get(c);
            if (sq !== undefined) sq.kill();
        } 
    },
}

