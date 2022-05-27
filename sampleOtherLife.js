function create1DRuleset(ruleNumber) {
    if (ruleNumber == '') return;
    let t = parseInt(ruleNumber);
    if (t < 0 || t > 255) return;

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
        let c = grf.dissectCoord(coord);
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
                return (binaryRule[0] === '1') ? true : false;
            case '110':
                return (binaryRule[1] === '1') ? true : false;
            case '101':
                return (binaryRule[2] === '1') ? true : false;
            case '100':
                return (binaryRule[3] === '1') ? true : false;
            case '011':
                return (binaryRule[4] === '1') ? true : false;
            case '010':
                return (binaryRule[5] === '1') ? true : false;
            case '001':
                return (binaryRule[6] === '1') ? true : false;
            case '000':
                return (binaryRule[7] === '1') ? true : false;
            default:
                console.error("Something went wrong in rule " + ruleNumber + " reproduce rule: " + numberString + " isn't an option.");
                return false;
        }
    }
    addNewLifeform(1, name, sphereOfInfluence, surviveCondition, reproduceRule, .1);
}

create1DRuleset(27);
create1DRuleset(30);
create1DRuleset(38);
create1DRuleset(62);
create1DRuleset(110);