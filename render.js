const canvasContainer = document.getElementById('canvasContainer');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const coolColors = ['darkblue', 'blue', 'lightblue', 'darkcyan', 'cyan', 'lightcyan'];
const warmColors = ['darkred', 'red', 'lightred', 'darkorange', 'orange', 'lightorange'];

const squares = [];
const boxes = 35;
const scale = 20;

let previousCoord = {x: 0, y: 0}; // current mouse position, updated with move listeners (in controls.js)

let cameraOffset = { x: 0, y: 0 }
let cameraZoom = .5
let MAX_ZOOM = 5
let MIN_ZOOM = 0.05
let SCROLL_SENSITIVITY = 0.001

// TODO: make this infinite
function drawGrid(opacity = .2) {
    const thickness = .035;
    ctx.save();

    ctx.fillStyle = `rgba(125, 125, 125, ${opacity})`;
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
    for (s of g.dead.values()) {
        s.draw();
    }
    for (s of g.living.values()) {
        s.draw();
    }
    ctx.restore();
}

function drawAll() {
    sizeCanvas();
    setBackgroundColor("black");
    
    // Makes the zoom work
    setScrollEffect(true);
    

    ctx.translate(cameraOffset.x, cameraOffset.y); // translates to the current camera offset
    
    ctx.save();


    drawSquares();
    drawGrid(.15);

    addHTMLInfoPanel(); // adds an HTML element describing the square currently hovered on


    ctx.translate(-cameraOffset.x, -cameraOffset.y);
    // everything drawn here will be immune to moving (but not scrolling)
    setScrollEffect(false);
    // everything drawn here will be static on the screen

    // ctx.fillRect(0, 0, 100, 100);

    requestAnimationFrame(drawAll);
}
drawAll();

function setBackgroundColor(color) {
    if (!color) return;
    ctx.save();
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
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
    let cDim = canvasContainer.getBoundingClientRect();
    canvas.width = cDim.width;
    canvas.height = cDim.height;
}

window.addEventListener('resize', sizeCanvas);


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
    console.log("Fucking test" ,previousCoord);
    const maxOpacity = .8;
    const remSpacing = .6;
    let sq = findLiveSquare(previousCoord.x, previousCoord.y); // why is this fucker undefined
    let element = document.getElementById('squareInfo');
    let needsAppended = false;
    if (element == null) { // no element has been created yet to show the info
        element = document.createElement('div');
        element.setAttribute('id', 'squareInfo');
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
    element.style.left = `calc(${previousCoord.x}px + ${remSpacing}rem)`;
    element.style.top = `calc(${previousCoord.y}px - ${remSpacing}rem - ${element.getBoundingClientRect().height}px)`;
    if (sq !== undefined) element.style.opacity = maxOpacity + "";
    if (needsAppended) document.getElementById('canvasContainer').appendChild(element);
}

