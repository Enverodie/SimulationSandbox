// import colorToObj, { CSS_COLORS } from "./cssColors";

function Square(x, y, color, type, sphereOfInfluence, surviveCondition, extraSurviveConditions, reproduceRule, starterHealthAttack) {

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
    this.extraSurviveConditions = extraSurviveConditions || [];
    this.reproduceRule = reproduceRule || ((AoI, coord) => {
        // this coord -
        // can spawn: return true
        // cannot spawn: return false;
        if (g.living.has(coord)) return false;
        let count = 0;
        let c = dissectCoord(coord);
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

    this.draw = function() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, 1, 1);
    };
    this.canSurvive = function() {
        if (!this.surviveCondition(this.sphereOfInfluence)) return false;
        for (rule of this.extraSurviveConditions) {
            if (!rule(this.sphereOfInfluence)) return false;
        }
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
                let c = dissectCoord(cstring);
                let x1 = c.x, y1 = c.y;
                let sq = new Square(x1, y1, this.color, this.type, this.sphereOfInfluence, this.surviveCondition, this.extraSurviveConditions, this.reproduceRule, this.originalHA);
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
    let coord = `${square.x},${square.y}`; 
    let deadSquare = new DeadSquare(square.x, square.y, square.color);
    g.dead.set(coord, deadSquare);
}

function removeFromDeaths(square) {
    g.dead.delete(`${square.x},${square.y}`);
}

function DeadSquare(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color; // the same as the color of the living cell
    this.deathStage = g.stage; // when this object is created, keep track of the stage it died in to keep track of how long ago it died
    this.draw = function() {
        const cS = 25; // color subtraction value
        const minOpacity = .075;
        const deathPenalty = .5;
        
        let cObj = colorToObj(this.color);
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

        ctx.fillStyle = `rgba(${dC.r},${dC.g},${dC.b},${dC.a})`;
        ctx.fillRect(this.x, this.y, 1, 1);
    }
}

// pass a coordinate string, get an object with the numbers
function dissectCoord(coord) {
    let x = Number.parseInt(coord.slice(0,coord.indexOf(',')));
    let y = Number.parseInt(coord.slice(coord.indexOf(',') + 1, coord.length));
    return {x: x, y: y};
}