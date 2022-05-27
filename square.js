// import colorToObj, { CSS_COLORS } from "./cssColors";

function Square(x, y, color, type, sphereOfInfluence, surviveCondition, reproduceRule, starterHealthAttack) {

    // optional properties (and defaults)

    this.type = type || "conway";
    this.sphereOfInfluence = sphereOfInfluence || ((x1, y1) => {
        return [
            `${x1-1},${y1+1}`,
            `${x1},${y1+1}`,
            `${x1+1},${y1+1}`,
            `${x1-1},${y1}`,
            `${x1+1},${y1}`,
            `${x1-1},${y1-1}`,
            `${x1},${y1-1}`,
            `${x1+1},${y1-1}`
        ]
    }); // we store sphere of influence as a function for each square because each square needs to individually store how it handles as a member of that "species". Note that the sphere of influence is not unique to each instance, but a template that each individual carries, like DNA.
    this.surviveCondition = surviveCondition || (function(AoI) {
        // survive = true
        // die = false
        let count = 0;
        for (neighbor of AoI(this.x, this.y)) {
            if (g.living.has(neighbor)) count++;
        }
        if (count === 2 || count === 3) return true;
        else return false;
    });
    this.reproduceRule = reproduceRule || ((AoI, coord) => {
        // this coord -
        // can spawn: return true
        // cannot spawn: return false;
        if (g.living.has(coord)) return false;
        let count = 0;
        let c = grf.dissectCoord(coord);
        let x1 = c.x, y1 = c.y;
        for (neighbor of AoI(x1, y1)) {
            if (g.living.has(neighbor)) count++;
        }
        if (count === 3) return true;
        else return false;
    });
    this.originalHA = starterHealthAttack || 1; // this variable is just passed down the generations - it is not modified.
    
    // general properties
    
    this.x = x;
    this.y = y;
    this.color = color;
    
    // derived properties
    
    this.HA = this.originalHA; // this variable IS modified whenever a cell takes a "hit".

    this.draw = function(context = ctx) {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, 1, 1);
    };
    this.canSurvive = function() {
        if (!this.surviveCondition(this.sphereOfInfluence)) return false;
        return true;
    };

    // manipulate next generation in "g" object

    this.testSurvival = function() {
        if (this.canSurvive()) g.nextGen.set(`${this.x},${this.y}`, this);
        else this.kill(false);
    }
    this.testReproduction = function () { 
        // checks every cell in the sphere of influence -
        // executes the lifeform's reproduceRule on that string
        for (cstring of this.sphereOfInfluence(this.x, this.y)) {
            if (this.reproduceRule(this.sphereOfInfluence, cstring)) {
                let c = grf.dissectCoord(cstring);
                let x1 = c.x, y1 = c.y;
                let sq = new Square(x1, y1, this.color, this.type, this.sphereOfInfluence, this.surviveCondition, this.reproduceRule, this.originalHA);
                removeFromDeaths(sq); // just in case this coordinate had died previously
                g.nextGen.set(cstring, sq);
            };
        }
    }
    this.testAll = function() {
        this.testSurvival();
        this.testReproduction();
    }

    this.kill = function(hardkill = true) {
        addToDeaths(this);
        if (hardkill) g.living.delete(`${this.x},${this.y}`);
    }

}

function addToDeaths(square) {
    if (!g.dead) return;
    let coord = `${square.x},${square.y}`; 
    let deadSquare = new DeadSquare(square.x, square.y, square.color);
    g.dead.set(coord, deadSquare);
}

function removeFromDeaths(square) {
    if (!g.dead) return;
    g.dead.delete(`${square.x},${square.y}`);
}

function addToPermaDeathQueue(square) {
    square.calcFade = function() {}; // overwrite previous function so it doesn't get added multiple times
    MUStates.permaDeathQueue.push(square);
}

const cS = 25; // color subtraction value
const minOpacity = .075;
const deathPenalty = .5;

function DeadSquare(x, y, color) {
    this.x = x;
    this.y = y;
    this.maincolor = color; // the same as the color of the living cell
    this.deathStage = g.stage; // when this object is created, keep track of the stage it died in to keep track of how long ago it died
    this.rendercolor;
    this.calcFade = function() {
        let cObj = colorToObj(this.maincolor);
        let deathTime = g.stage - this.deathStage; // how many ticks have passed since this has died
        if (deathTime < 1) deathTime = 1;

        let opacityDelta = 1/Math.pow(deathTime, 1/(2 * (1 + cObj.a)));
        opacityDelta -= deathPenalty;

        let dC = { 
            r: Math.max( (cObj.r - cS), 0), 
            g: Math.max( (cObj.g - cS), 0), 
            b: Math.max( (cObj.b - cS), 0), 
            a: Math.max( opacityDelta, minOpacity, 0),
        }; // darkened colors

        this.rendercolor = `rgba(${dC.r},${dC.g},${dC.b},${dC.a})`;
        if (opacityDelta <= minOpacity) addToPermaDeathQueue(this);
    }
    this.calcFade();

    this.draw = function(context = ctx) {
        context.fillStyle = this.rendercolor;
        context.fillRect(this.x, this.y, 1, 1);
    }

}