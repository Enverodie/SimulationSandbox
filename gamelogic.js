function calcNextGen() {
    for (square of g.dead.values()) {
        square.calcFade();
    }
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

// handling lifeforms

function addNewLifeform(dimensions, type, sphereOfInfluence, surviveCondition, reproduceRule, starterHealthAttack) {
    // right here would be a good place to check if the lifeform already exists
    let lf = new Square(null, null, null, type, sphereOfInfluence, surviveCondition, reproduceRule, starterHealthAttack);
    g.createdLifeforms.push(lf);
    let newButton = document.createElement('button');
    newButton.setAttribute("onclick", "setActiveLifeform(this)");
    newButton.innerText = type;
    (dimensions == 2) ? document.getElementById("lifeformChoice").append(newButton) : document.getElementById("lifeformChoice1D").append(newButton);
}

function selectLifeform(type) {
    let arr = g.createdLifeforms.filter(function(e) {return e.type === type})
    let lf = arr[0];
    if (arr.length > 0) {
        return grf.extractUseful(lf);
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