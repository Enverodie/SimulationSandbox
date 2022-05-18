const canvasContainer = document.getElementById('canvasContainer');
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

    // addHTMLInfoPanel(); // adds an HTML element describing the square currently hovered on


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

