/*
const g = {
    living : [], // lowest living X at front, highest living X at end
    place : function(square) {
        if (this.living.length === 0) {
            this.living.push(new Column(square.x).contents.push(square));
            return;
        }
        for (let i = 0; i < this.living.length; i++) {
            let col = this.living[i];
            if (col.x === square.x) {
                for (let j = 0; j < col.contents.length; j++) {
                    let squ = col[j];
                    if (squ.y < square.y) continue;
                    if (squ.y >= square.y) { // this is where later on lifeform clashes can be resolved
                        // if (compareKeys(squ, square)) square.conflictResolve(squ);
                        let h1 = col.contents.slice(0, j);
                        let h2 = col.contents.slice(j, col.contents.length);
                        col.contents = [...h1, square, ...h2];
                        return;
                    };
                }
            }
            else if (col.x > square.x) {
                let h1 = this.living.slice(0, i);
                let h2 = this.living.slice(i, col.contents.length);
                col.contents = [...h1, new Column(square.x).contents.push(square), ...h2];
                return;
            }
            else if (i === this.living.length - 1) {

            }
        }
    },
}
*/

const g = {
    living : new Map(),
    nextGen : new Map(),
    calcNextGen : function() {
        for (square of g.living.values()) {
            square.testAll();
            // if (square.canSurvive()) g.nextGen.set(`${square.x},${square.y}`, square);
            // square.produceToInfluenced();
        }
        // console.error(this.living, this.nextGen);
        g.living = new Map(g.nextGen);
        // console.error("BF", g.living, g.nextGen);
        g.nextGen.clear();
        // console.error("AF", g.living, g.nextGen);
    },
    runLoop : function() {
        const loopTime = 100;
        setTimeout(() => {
            this.calcNextGen();
            g.runLoop();
        }, loopTime);
    },
    placeMode : true,
}

// lazy initialization
function lazyInitGoL() {

    for (let i = 0; i < 200; i++) {
        const spawnRange = 100;
        let coordinate1 = Math.floor(Math.random() * spawnRange);
        let coordinate2 = Math.floor(Math.random() * spawnRange);
        g.living.set(`${coordinate1},${coordinate2}`, new Square(coordinate1, coordinate2, 'blue'))
    }
    /*
    */
   lazyBlinker(10, 10);
   lazyBeacon(16, 10);
   lazyPentaDecathlon(32, 10);
    g.runLoop();
}
lazyInitGoL();

function lazyBlinker(xcenter, ycenter) {
    g.living.set(`${xcenter - 1},${ycenter}`, new Square(xcenter - 1, ycenter, 'blue'));
    g.living.set(`${xcenter    },${ycenter}`, new Square(xcenter    , ycenter, 'blue'));
    g.living.set(`${xcenter + 1},${ycenter}`, new Square(xcenter + 1, ycenter, 'blue'));
}

function lazyBeacon(xtop, ytop) {
    g.living.set(`${xtop},${ytop}`, new Square(xtop, ytop, 'blue'));
    g.living.set(`${xtop},${ytop-1}`, new Square(xtop, ytop-1, 'blue'));
    g.living.set(`${xtop+1},${ytop}`, new Square(xtop+1, ytop, 'blue'));
    
    g.living.set(`${xtop+3},${ytop-3}`, new Square(xtop+3, ytop-3, 'blue'));
    g.living.set(`${xtop+2},${ytop-3}`, new Square(xtop+2, ytop-3, 'blue'));
    g.living.set(`${xtop+3},${ytop-2}`, new Square(xtop+3, ytop-2, 'blue'));   
}

function lazyPentaDecathlon(xcenter, ytop) {
    var x = xcenter - 1, y = ytop;
    g.living.set(`${x},${y}`, new Square(x, y, 'blue'));   
    var x = xcenter, y = ytop;
    g.living.set(`${x},${y}`, new Square(x, y, 'blue'));   
    var x = xcenter + 1, y = ytop;
    g.living.set(`${x},${y}`, new Square(x, y, 'blue'));   
    
    var x = xcenter, y = ytop - 1;
    g.living.set(`${x},${y}`, new Square(x, y, 'blue'));   
    var x = xcenter, y = ytop - 2;
    g.living.set(`${x},${y}`, new Square(x, y, 'blue'));   
    
    var x = xcenter - 1, y = ytop - 3;
    g.living.set(`${x},${y}`, new Square(x, y, 'blue'));   
    var x = xcenter, y = ytop - 3;
    g.living.set(`${x},${y}`, new Square(x, y, 'blue'));   
    var x = xcenter + 1, y = ytop - 3;
    g.living.set(`${x},${y}`, new Square(x, y, 'blue'));   
    
    var x = xcenter - 1, y = ytop - 5;
    g.living.set(`${x},${y}`, new Square(x, y, 'blue'));   
    var x = xcenter, y = ytop - 5;
    g.living.set(`${x},${y}`, new Square(x, y, 'blue'));   
    var x = xcenter + 1, y = ytop - 5;
    g.living.set(`${x},${y}`, new Square(x, y, 'blue'));   
    var x = xcenter - 1, y = ytop - 6;
    g.living.set(`${x},${y}`, new Square(x, y, 'blue'));   
    var x = xcenter, y = ytop - 6;
    g.living.set(`${x},${y}`, new Square(x, y, 'blue'));   
    var x = xcenter + 1, y = ytop - 6;
    g.living.set(`${x},${y}`, new Square(x, y, 'blue'));  
    
    var bottom = 8;
    var x = xcenter - 1, y = ytop - bottom;
    g.living.set(`${x},${y}`, new Square(x, y, 'blue'));   
    var x = xcenter, y = ytop - bottom;
    g.living.set(`${x},${y}`, new Square(x, y, 'blue'));   
    var x = xcenter + 1, y = ytop - bottom;
    g.living.set(`${x},${y}`, new Square(x, y, 'blue'));   
    
    var x = xcenter, y = ytop - 1 - bottom;
    g.living.set(`${x},${y}`, new Square(x, y, 'blue'));   
    var x = xcenter, y = ytop - 2 - bottom;
    g.living.set(`${x},${y}`, new Square(x, y, 'blue'));   
    
    var x = xcenter - 1, y = ytop - 3 - bottom;
    g.living.set(`${x},${y}`, new Square(x, y, 'blue'));   
    var x = xcenter, y = ytop - 3 - bottom;
    g.living.set(`${x},${y}`, new Square(x, y, 'blue'));   
    var x = xcenter + 1, y = ytop - 3 - bottom;
    g.living.set(`${x},${y}`, new Square(x, y, 'blue'));  
}

// function lazyPulsar(xcenter, ycenter) {
//     g.living.set(`0,2`, new Square(0,2, 'blue'));
//     g.living.set(`1,2`, new Square(1,2, 'blue'));
//     g.living.set(`2,2`, new Square(2,2, 'blue'));
// }

// let found = false;
//                 for (row of col.contents) {
//                     if (shallowCompare(square, row)) {
//                         found = true;
//                         break;
//                     };
//                 }
//                 found? "do nothing" : 

// function Column(square_x) {
//     this.contents = [];
//     this.x = square_x;
//     return this;
// }

// checks if two objects have the same keys
function compareKeys(obj1, obj2) {
    const akeys = Object.keys(obj1).sort();
    const bkeys = Object.keys(obj2).sort();

    return JSON.stringify(akeys) === JSON.stringify(bkeys);
}

// checks if two objects have the same keys and values
function shallowCompare(obj1, obj2) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (let key of keys1) {
        if (obj1[key] !== obj2[key]) return false;
    }

    return true;
}