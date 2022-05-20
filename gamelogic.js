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
    g.dead?.clear(); // optional chaining operator because we want to be able to disable dead rendering and are not sure if it will exist at this point
}

function addNewLifeform(type, sphereOfInfluence, surviveCondition, reproduceRule, starterHealthAttack) {
    // right here would be a good place to check if the lifeform already exists
    let lf = new Square(null, null, null, type, sphereOfInfluence, surviveCondition, reproduceRule, starterHealthAttack);
    g.createdLifeforms.push(lf);
    let newButton = document.createElement('button');
    newButton.setAttribute("onclick", "setActiveLifeform(this)");
    newButton.innerText = type;
    document.getElementById("lifeformChoice").append(newButton);
}

function extractUseful(square) {
    return {
        type: square.type, 
        sphereOfInfluence: square.sphereOfInfluence, 
        surviveCondition: square.surviveCondition, 
        reproduceRule: square.reproduceRule,
        starterHealthAttack: square.starterHealthAttack,
    };
}

function selectLifeform(type) {
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
    let ns = new Square(x, y, color, type, stats.sphereOfInfluence, stats.surviveCondition, stats.reproduceRule, stats.starterHealthAttack);
    g.living.set(`${x},${y}`, ns);
}

// function conflictResolve() {}