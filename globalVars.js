const scale = 20; // multiplier for square size
const gridThickness = .035;
const MAX_ZOOM = 5
const MIN_ZOOM = 0.05
const SCROLL_SENSITIVITY = 0.001

// manually updated states
const MUStates = {
    previousCoord : {x: 0, y: 0}, // current mouse position, updated with move listeners (in controls.js)
    cameraOffset : { x: 0, y: 0 },
    cameraZoom : .5,
    gridIsUpToDate : false,
    cssInTransition : false,
    permaDeathQueue : [],
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

// grid related functions
const grf = {
    calcBoxDistance: function(pixelDistance) {
        return -Math.ceil(pixelDistance / (scale * MUStates.cameraZoom));
    },
    
    originDistanceFromDrawOrigin: function() {
        let cDim = canvasContainer.getBoundingClientRect();
        let sOrigX = cDim.width/2, sOrigY = cDim.height/2;
        let pxDistX = ((MUStates.cameraOffset.x*MUStates.cameraZoom)-(sOrigX)*MUStates.cameraZoom+sOrigX);
        let pxDistY = ((MUStates.cameraOffset.y*MUStates.cameraZoom)-(sOrigY)*MUStates.cameraZoom+sOrigY);
        let bxDistX = this.calcBoxDistance(pxDistX);
        let bxDistY = this.calcBoxDistance(pxDistY);
        return {x : pxDistX, y: pxDistY, xb: bxDistX, yb: bxDistY};
    },
    
    // returns the square within any given viewport coordinate, or undefined if it isn't alive
    findLiveSquare: function(x, y) {
        let d = this.originDistanceFromDrawOrigin();
        let dx = d.x - x, dy = d.y - y;
        let bx = this.calcBoxDistance(dx);
        let by = this.calcBoxDistance(dy);
        return g.living.get(`${bx},${by}`);
    },

    extractUseful: function(square) {
        return {
            type: square.type, 
            sphereOfInfluence: square.sphereOfInfluence, 
            surviveCondition: square.surviveCondition, 
            reproduceRule: square.reproduceRule,
            starterHealthAttack: square.starterHealthAttack,
        };
    }
}


