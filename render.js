const canvasContainer = document.getElementById('canvasContainer');

const canvas = document.getElementById('canvas');
const canvasDead = document.getElementById('canvasDead');
const canvasGrid = document.getElementById('canvasGrid');
const deleteGrid = document.getElementById('canvasDeleteHighlight');

const deadctx = canvasDead.getContext('2d', {alpha: false});
const ctx = canvas.getContext('2d');
const gridctx = canvasGrid.getContext('2d');
const deletectx = deleteGrid.getContext('2d');

// render methods
const RMethods = new (function() {
        
    // TODO: make this infinite
    this.drawGrid = (context, opacity = .2) => {
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
        MUStates.gridIsUpToDate = true;
    }
    
    this.drawDead = (deadArray = g.dead.values(), context = ctx) => {
        context.save();
        context.scale(scale, scale);
        if (g.dead) {
            for (s of deadArray) {
                s.draw(context);
            }
        }
        context.restore();
    }
    
    this.utilizePermaDeathQueue = function(context = deadctx) {
        context.save();
        context.scale(scale, scale);
        for (nextUp of MUStates.permaDeathQueue) {
            g.dead.delete(nextUp.x + ',' + nextUp.y);
            if (!g.permadead.has(nextUp.x + ',' + nextUp.y)) nextUp.draw(context); // if the cell hasn't already previously been permakilled
            g.permadead.set(nextUp.x + ',' + nextUp.y, nextUp);
            MUStates.permaDeathQueue = MUStates.permaDeathQueue.filter(item => item !== nextUp);
        }
        context.restore();
    }

    this.drawSquares = (context = ctx) => {
        context.save();
        context.scale(scale, scale);
        
        for (s of g.living.values()) {
            s.draw();
        }
        ctx.restore();
    }
    
    this.setBackgroundColor = (context, color) => {
        if (!color) return;
        context.save();
        context.fillStyle = color;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.restore();
    }
    
    this.setScrollEffect = (context, value) => {
        let cDim = canvasContainer.getBoundingClientRect();
        if (value) {
            context.translate(cDim.width/2, cDim.height/2);
            context.scale(MUStates.cameraZoom, MUStates.cameraZoom);
            context.translate(-cDim.width/2, -cDim.height/2);
        }
        else {
            context.translate(cDim.width/2, cDim.height/2);
            context.scale(1/MUStates.cameraZoom, 1/MUStates.cameraZoom);
            context.translate(-cDim.width/2, -cDim.height/2);
        }
    }
    
    this.sizeCanvas = (c) => {
        let cDim = canvasContainer.getBoundingClientRect();
        c.width = cDim.width;
        c.height = cDim.height;
    }
    
    this.sizeCanvasses = () => {
        console.log(this);
        this.sizeCanvas(canvas);
        this.sizeCanvas(canvasDead);
        this.sizeCanvas(canvasGrid);
        MUStates.gridIsUpToDate = false;
    }
    
    this.addHTMLInfoPanel = () => {
        let maxOpacity = .8;
        let remSpacing = .6;
        let sq = grf.findLiveSquare(MUStates.previousCoord.x, MUStates.previousCoord.y);
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
        element.style.left = `calc(${MUStates.previousCoord.x}px + ${remSpacing}rem)`;
        element.style.top = `calc(${MUStates.previousCoord.y}px - ${remSpacing}rem - ${element.getBoundingClientRect().height}px)`;
        if (sq !== undefined) {
            element.style.visibility = 'visible';
            element.style.opacity = maxOpacity + "";
        } 
        if (needsAppended) document.getElementById('canvasContainer').appendChild(element);
    }
        
    this.advanceFrame = () => {
        this.sizeCanvas(ctx.canvas);
        this.sizeCanvas(deletectx.canvas);
        this.setScrollEffect(ctx, true);
        
        let updateEverything = false;
        if (MUStates.cssInTransition || !MUStates.gridIsUpToDate) updateEverything = true;
        
        ctx.translate(MUStates.cameraOffset.x, MUStates.cameraOffset.y); // translates to the current camera offset
        ctx.save();
        
        if (updateEverything) {
            this.sizeCanvas(deadctx.canvas); // makes sure the grid canvas is the same size as the other one
            this.sizeCanvas(gridctx.canvas);
            
            gridctx.save();
            this.setScrollEffect(gridctx, true); // allows the grid to scroll
            gridctx.translate(MUStates.cameraOffset.x, MUStates.cameraOffset.y); // moves to the camera offset
            this.drawGrid(gridctx, .15);
            gridctx.restore();

            deadctx.save();
            this.setScrollEffect(deadctx, true); // allows the grid to scroll
            deadctx.translate(MUStates.cameraOffset.x, MUStates.cameraOffset.y); // moves to the camera offset
            this.drawDead(g.permadead.values(), deadctx);
            deadctx.restore();
            
        }
        else {

        }

        if (simControls.isDeleteMode()) {
            let finalRadius = MUStates.deleteDiameter * scale * MUStates.cameraZoom / 2;
            deletectx.save();
            deletectx.fillStyle = '#ffffff22';
            deletectx.beginPath();
            deletectx.arc(MUStates.previousCoord.x, MUStates.previousCoord.y, finalRadius, 0, 2*Math.PI);
            deletectx.fill();
            deletectx.restore();
        } 

        if (MUStates.permaDeathQueue.length > 0) { // if there are cells queued for render in permadeath layer (there usually are)
            deadctx.save();
            this.setScrollEffect(deadctx, true);
            deadctx.translate(MUStates.cameraOffset.x, MUStates.cameraOffset.y);
            this.utilizePermaDeathQueue();
            deadctx.restore();
        }
        this.drawDead();
        this.drawSquares();
        
        
        this.addHTMLInfoPanel(); // adds an HTML element describing the square currently hovered on
        
        
        ctx.translate(-MUStates.cameraOffset.x, -MUStates.cameraOffset.y);
        // everything drawn here will be immune to moving (but not scrolling)
        this.setScrollEffect(ctx, false);
        // everything drawn here will be static on the screen
        
        // ctx.fillRect(0, 0, 100, 100);

        requestAnimationFrame( this.advanceFrame );
    }
        
});
    
RMethods.advanceFrame();

window.addEventListener('resize', RMethods.sizeCanvasses);
    