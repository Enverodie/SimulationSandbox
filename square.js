function Square(x, y, color, type, sphereOfInfluence, surviveCondition, extraSurviveConditions, reproduceRule) {

    // optional properties (and defaults)

    this.type = type || "Conway";
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

    // general properties

    this.x = x;
    this.y = y;
    this.color = color;

    // derived properties

    this.draw = function() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, 1, 1);
    };
    this.canSurvive = function() {
        if (this.surviveCondition(this.sphereOfInfluence)) {} else return false;
        for (rule of this.extraSurviveConditions) {
            if (!rule(this.sphereOfInfluence)) return false;
        }
        return true;
    };

    // manipulate next generation in "g" object

    this.testSurvival = function() {
        if (this.canSurvive()) g.nextGen.set(`${this.x},${this.y}`, this);
    }
    this.testReproduction = function () {
        for (cstring of this.sphereOfInfluence(this.x, this.y)) {
            if (this.reproduceRule(this.sphereOfInfluence, cstring)) {
                let c = dissectCoord(cstring);
                let x1 = c.x, y1 = c.y;
                let sq = new Square(x1, y1, this.color, this.type, this.sphereOfInfluence, this.surviveCondition, this.extraSurviveConditions, this.reproduceRule);
                g.nextGen.set(cstring, sq);
            };
        }
    }
    this.testAll = function() {
        this.testSurvival();
        this.testReproduction();
    }

}

// pass a coordinate string, get an object with the numbers
function dissectCoord(coord) {
    let x = Number.parseInt(coord.slice(0,coord.indexOf(',')));
    let y = Number.parseInt(coord.slice(coord.indexOf(',') + 1, coord.length));
    return {x: x, y: y};
}