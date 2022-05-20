function createR30() {
    let name = 'rule 30';
    function sphereOfInfluence(x, y) {
        return [ 
            `${x-1},${y+1}`,
            `${x},${y+1}`,
            `${x+1},${y+1}`,
        ];
    }
    function surviveCondition(AoI) {
        // the cell will never survive in a 2d projection of a 1d automata in order to move up one position
        return false;
    }
    function reproduceRule(AoI, coord) {
        let c = dissectCoord(coord);
        let x = c.x, y = c.y;
        let numberString = "";
        // next generation moves up, so y-1 = this location
        let lastGenNeighbors = AoI(x, y-2);
        for (let i = 0; i < lastGenNeighbors.length; i++) { 
            if (g.living.has(lastGenNeighbors[i])) numberString = numberString + '1';
            else numberString = numberString + '0';
        }
        switch(numberString) {
            case '111':
                return false;
            case '110':
                return false;
            case '101':
                return false;
            case '100':
                return true;
            case '011':
                return true;
            case '010':
                return true;
            case '001':
                return true;
            case '000':
                return false;
            default:
                console.error("Something went wrong in rule30 reproduce rule: " + numberString + " isn't an option.");
                return false;
        }
    }
    addNewLifeform(name, sphereOfInfluence, surviveCondition, reproduceRule, .1);
}

function createR110() {
    let name = 'rule 110';
    function sphereOfInfluence(x, y) {
        return [ 
            `${x-1},${y+1}`,
            `${x},${y+1}`,
            `${x+1},${y+1}`,
        ];
    }
    function surviveCondition(AoI) {
        return false;
    }
    function reproduceRule(AoI, coord) {
        let c = dissectCoord(coord);
        let x = c.x, y = c.y;
        let numberString = "";
        let lastGenNeighbors = AoI(x, y-2);
        for (let i = 0; i < lastGenNeighbors.length; i++) { 
            if (g.living.has(lastGenNeighbors[i])) numberString = numberString + '1';
            else numberString = numberString + '0';
        }
        switch(numberString) {
            case '111':
                return false;
            case '110':
                return true;
            case '101':
                return true;
            case '100':
                return false;
            case '011':
                return true;
            case '010':
                return true;
            case '001':
                return true;
            case '000':
                return false;
            default:
                console.error("Something went wrong in rule30 reproduce rule: " + numberString + " isn't an option.");
                return false;
        }
    }
    addNewLifeform(name, sphereOfInfluence, surviveCondition, reproduceRule, .1);
}

createR30();
createR110();