function create1DRuleset(ruleNumber) {

    let binaryRule = parseInt(ruleNumber).toString(2); // converts base 10 ruleset number (for example, rule 30), to binary (11110)
    while (binaryRule.length < 8) { // converts the binary number to a binary word
        binaryRule = '0' + binaryRule;
    }

    let name = 'rule ' + ruleNumber;
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
                if (binaryRule[0] === '1') return true;
                else return false;
            case '110':
                if (binaryRule[1] === '1') return true;
                else return false;
            case '101':
                if (binaryRule[2] === '1') return true;
                else return false;
            case '100':
                if (binaryRule[3] === '1') return true;
                else return false;
            case '011':
                if (binaryRule[4] === '1') return true;
                else return false;
            case '010':
                if (binaryRule[5] === '1') return true;
                else return false;
            case '001':
                if (binaryRule[6] === '1') return true;
                else return false;
            case '000':
                if (binaryRule[7] === '1') return true;
                else return false;
            default:
                console.error("Something went wrong in rule " + ruleNumber + " reproduce rule: " + numberString + " isn't an option.");
                return false;
        }
    }
    addNewLifeform(name, sphereOfInfluence, surviveCondition, reproduceRule, .1);
}

create1DRuleset(27);
create1DRuleset(30);
create1DRuleset(38);
create1DRuleset(62);
create1DRuleset(110);