const g = {
    stage : 0,
    dead : new Map(),
    living : new Map(),
    nextGen : new Map(),
    createdLifeforms : [new Square(null, null, null)], // start with one available lifeform: conway
    calcNextGen : function() {
        for (square of g.living.values()) {
            square.testAll();
        }
    },
    runLoop : function() {
        const loopTime = 100;
        let id = setInterval(() => {
            if (as.playing) {
                this.calcNextGen();
                g.living = new Map(g.nextGen);
                g.nextGen.clear();
                g.stage++;            } 
            else clearInterval(id);
        }, loopTime);
    },
    reset : function() {
        g.living.clear();
        g.nextGen.clear();
        g.dead.clear();
    },
    addNewLifeform: function(type, sphereOfInfluence, surviveCondition, extraSurviveConditions, reproduceRule, starterHealthAttack) {
        // right here would be a good place to check if the lifeform already exists
        let lf = new Square(null, null, null, type, sphereOfInfluence, surviveCondition, extraSurviveConditions, reproduceRule, starterHealthAttack);
        this.createdLifeforms.push(lf);
    },
    selectLifeform: function(type) {
        function extractUseful(square) {
            return {
                type: square.type, 
                sphereOfInfluence: square.sphereOfInfluence, 
                surviveCondition: square.surviveCondition, 
                extraSurviveConditions: square.extraSurviveConditions, 
                reproduceRule: square.reproduceRule,
                starterHealthAttack: square.starterHealthAttack,
            };
        }
        let arr = this.createdLifeforms.filter(function(e) {return e.type === type})
        let lf = arr[0];
        if (arr.length > 0) {
            return extractUseful(lf);
        }
        else {
            console.warn("Lifeform of type " + type + " not found!");
            return null; // could also return the first lifeform created
        } 
    },
    createSquareOfType: function(type, x, y, color) {
        let stats = this.selectLifeform(type);
        let ns = new Square(x, y, color, type, stats.sphereOfInfluence, stats.surviveCondition, stats.extraSurviveConditions, stats.reproduceRule, stats.starterHealthAttack);
        this.living.set(`${x},${y}`, ns);
    }
    // conflictResolve: function()
}

