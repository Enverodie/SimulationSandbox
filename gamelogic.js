function calcNextGen() {
    for (square of g.living.values()) {
        square.testAll();
    }
}

function runLoop() {
    const loopTime = 100;
    let id = setInterval(() => {
        if (as.playing) {
            calcNextGen();
            g.living = new Map(g.nextGen);
            g.nextGen.clear();
            g.stage++;            
        } 
        else clearInterval(id);
    }, loopTime);
}

function reset() {
    g.living.clear();
    g.nextGen.clear();
    g.dead.clear();
}

function addNewLifeform(type, sphereOfInfluence, surviveCondition, extraSurviveConditions, reproduceRule, starterHealthAttack) {
    // right here would be a good place to check if the lifeform already exists
    let lf = new Square(null, null, null, type, sphereOfInfluence, surviveCondition, extraSurviveConditions, reproduceRule, starterHealthAttack);
    g.createdLifeforms.push(lf);
}

function selectLifeform(type) {
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
    let arr = g.createdLifeforms.filter(function(e) {return e.type === type})
    let lf = arr[0];
    if (arr.length > 0) {
        return extractUseful(lf);
    }
    else {
        console.warn("Lifeform of type " + type + " not found!");
        return null; // could also return the first lifeform created
    } 
}

function createSquareOfType(type, x, y, color) {
    let stats = selectLifeform(type);
    let ns = new Square(x, y, color, type, stats.sphereOfInfluence, stats.surviveCondition, stats.extraSurviveConditions, stats.reproduceRule, stats.starterHealthAttack);
    g.living.set(`${x},${y}`, ns);
}

// function conflictResolve() {}