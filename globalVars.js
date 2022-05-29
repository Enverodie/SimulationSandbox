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
    dragging    : false,
    playing     : false,
    placeMode   : false,
    deleting    : false,
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

// Simulation controls
/*  Useful in that some other event may be triggered with a combination of button presses
*/
const simControls = new (function() {
    let dragStart = { x: 0, y: 0 };
    this.getDrag = function() {return dragStart}
    this.setDrag = function(x, y) {dragStart.x = x, dragStart.y = y}

    this.playPause = function() {
        as.playing = !as.playing;
        if (as.playing) {
            runLoop(); // needs to be restarted
        }
    }

    this.spaceDown = false;
    this.shiftDown = false;
    this.holdLclick = false;
    this.initialPinchDistance = null;
    this.lastZoom = MUStates.cameraZoom;

    this.isDeleteMode = function() {
        return (!this.spaceDown && this.shiftDown);
    }
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

