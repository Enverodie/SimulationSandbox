const g = {
    living : new Map(),
    nextGen : new Map(),
    calcNextGen : function() {
        for (square of g.living.values()) {
            square.testAll();
        }
        g.living = new Map(g.nextGen);
        g.nextGen.clear();
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
    lazyBlinker(10, 10);
    lazyBeacon(16, 10);
    lazyPentaDecathlon(32, 10);
    g.runLoop();
}
lazyInitGoL();

// Test structures for GoL

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

// not currently in use

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