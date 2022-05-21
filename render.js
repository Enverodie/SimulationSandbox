const canvasContainer = document.getElementById('canvasContainer');

const canvas = document.getElementById('canvas');
const canvasGrid = document.getElementById('canvasGrid');
const canvasOffscreen1 = document.createElement('canvas');

const ctx = canvas.getContext('2d', {alpha: false});
const gridctx = canvasGrid.getContext('2d');
const scale = 20;
const gridThickness = .035;

let previousCoord = {x: 0, y: 0}; // current mouse position, updated with move listeners (in controls.js)

let gridIsUpToDate = false;
let cssInTransition = false;
let cameraOffset = { x: 0, y: 0 }
let cameraZoom = .5
let MAX_ZOOM = 5
let MIN_ZOOM = 0.05
let SCROLL_SENSITIVITY = 0.001

// TODO: make this infinite
function drawGrid(context, opacity = .2) {
    console.log('rendered grid');
    let cDim = canvasContainer.getBoundingClientRect();
    context.save();

    context.fillStyle = `rgba(125, 125, 125, ${opacity})`;
    context.scale(scale, scale);
    for (let i = -cDim.width; i <= cDim.width; i++) { // draw vertical lines
        context.fillRect(i-(gridThickness/2), -cDim.height, gridThickness, 2*cDim.height);
    }
    for (let i = -cDim.height; i <= cDim.height; i++) { // draw horizontal lines
        context.fillRect(-cDim.width, i-(gridThickness/2), 2*cDim.width, gridThickness);
    }

    context.restore();
    gridIsUpToDate = true;
}

function drawSquares() {
    ctx.save();
    ctx.scale(scale, scale);
    if (g.dead) {
        for (s of g.dead.values()) {
            s.draw();
        }
    }
    for (s of g.living.values()) {
        s.draw();
    }
    ctx.restore();
}

function drawAll() {
    // setBackgroundColor(ctx, "black");
    sizeCanvas(canvas);
    setScrollEffect(ctx, true);
    
    ctx.translate(cameraOffset.x, cameraOffset.y); // translates to the current camera offset
    
    ctx.save();
    
    console.log("rendered");
    if (cssInTransition || !gridIsUpToDate) {
        sizeCanvas(canvasGrid); // makes sure the grid canvas is the same size as the other one

        gridctx.save();
        setScrollEffect(gridctx, true);

        gridctx.translate(cameraOffset.x, cameraOffset.y); // moves to the camera offset
        drawGrid(gridctx, .15);
        gridctx.translate(-cameraOffset.x, -cameraOffset.y); // reverses the camera offset move

        gridctx.restore();
    } 
    drawSquares();
    

    addHTMLInfoPanel(); // adds an HTML element describing the square currently hovered on


    ctx.translate(-cameraOffset.x, -cameraOffset.y);
    // everything drawn here will be immune to moving (but not scrolling)
    setScrollEffect(ctx, false);
    // everything drawn here will be static on the screen

    // ctx.fillRect(0, 0, 100, 100);

    requestAnimationFrame(drawAll);
}

drawAll();


function setBackgroundColor(context, color) {
    if (!color) return;
    context.save();
    context.fillStyle = color;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();
}

function setScrollEffect(context, value) {
    let cDim = canvasContainer.getBoundingClientRect();
    if (value) {
        context.translate(cDim.width/2, cDim.height/2);
        context.scale(cameraZoom, cameraZoom);
        context.translate(-cDim.width/2, -cDim.height/2);
    }
    else {
        context.translate(cDim.width/2, cDim.height/2);
        context.scale(1/cameraZoom, 1/cameraZoom);
        context.translate(-cDim.width/2, -cDim.height/2);
    }
}

function sizeCanvas(c) {
    let cDim = canvasContainer.getBoundingClientRect();
    c.width = cDim.width;
    c.height = cDim.height;
}

function sizeCanvasses() {
    sizeCanvas(canvas);
    sizeCanvas(canvasGrid);
    gridIsUpToDate = false;
}

window.addEventListener('resize', sizeCanvasses);


function calcBoxDistance(pixelDistance) {
    return -Math.ceil(pixelDistance / (scale * cameraZoom));
}

function originDistanceFromDrawOrigin() {
    let sOrigX = canvas.width/2, sOrigY = canvas.height/2;
    let pxDistX = ((cameraOffset.x*cameraZoom)-(sOrigX)*cameraZoom+sOrigX);
    let pxDistY = ((cameraOffset.y*cameraZoom)-(sOrigY)*cameraZoom+sOrigY);
    let bxDistX = calcBoxDistance(pxDistX);
    let bxDistY = calcBoxDistance(pxDistY);
    return {x : pxDistX, y: pxDistY, xb: bxDistX, yb: bxDistY};
}

// returns the square within any given viewport coordinate, or undefined if it isn't alive
function findLiveSquare(x, y) {
    let d = originDistanceFromDrawOrigin();
    let dx = d.x - x, dy = d.y - y;
    let bx = calcBoxDistance(dx);
    let by = calcBoxDistance(dy);
    return g.living.get(`${bx},${by}`);
}
function addHTMLInfoPanel() {
    const maxOpacity = .8;
    const remSpacing = .6;
    let sq = findLiveSquare(previousCoord.x, previousCoord.y);
    let element = document.getElementById('squareInfo');
    let needsAppended = false;
    if (element == null) { // no element has been created yet to show the info
        element = document.createElement('div');
        element.setAttribute('id', 'squareInfo');
        needsAppended = true;
    }
    if (sq === undefined) { // no square is alive in this case
        element.style.opacity = "0";
        element.style.visibility = 'hidden';
        // if (needsAppended) document.getElementById('canvasContainer').appendChild(element);
        return;
    }
    element.innerHTML = `
        <ul>
            <li>Type: ${sq.type}</li>
            <li>Color: ${sq.color}</li>
            <li>Health-Attack: ${sq.HA}/${sq.originalHA}</li>
        </ul>`;
    element.style.left = `calc(${previousCoord.x}px + ${remSpacing}rem)`;
    element.style.top = `calc(${previousCoord.y}px - ${remSpacing}rem - ${element.getBoundingClientRect().height}px)`;
    if (sq !== undefined) {
        element.style.visibility = 'visible';
        element.style.opacity = maxOpacity + "";
    } 
    if (needsAppended) document.getElementById('canvasContainer').appendChild(element);
}

