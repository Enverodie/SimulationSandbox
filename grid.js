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
        if (gs.playing) setTimeout(() => {
            if (gs.playing) {
                this.calcNextGen();
                g.runLoop();
            } 
        }, loopTime);
    },
    reset : function() {
        g.living.clear();
        g.nextGen.clear();
    }
}

// lazy initialization
function lazyInitGoL() {
    /*
    for (let i = 0; i < 1000; i++) {
        const spawnRange = 50;
        let coordinate1 = Math.floor(Math.random() * spawnRange);
        let coordinate2 = Math.floor(Math.random() * spawnRange);
        g.living.set(`${coordinate1},${coordinate2}`, new Square(coordinate1, coordinate2, 'blue'))
    }
    lazyBlinker(10, 10);
    lazyBeacon(16, 10);
    lazyPentaDecathlon(32, 10);
    */
   g.living.set('0,0', new Square(0,0, 'blue'));
   g.living.set('95,0', new Square(95,0, 'blue'));
   g.living.set('0,47', new Square(0,47, 'blue'));
   g.living.set('95,47', new Square(95,47, 'blue'));
   g.runLoop();
}
lazyInitGoL();

// Test structures for GoL

function lazyBlinker(xcenter, ycenter) {
    const color = 'rgb(155, 0, 0)';
    g.living.set(`${xcenter - 1},${ycenter}`, new Square(xcenter - 1, ycenter, color));
    g.living.set(`${xcenter    },${ycenter}`, new Square(xcenter    , ycenter, color));
    g.living.set(`${xcenter + 1},${ycenter}`, new Square(xcenter + 1, ycenter, color));
}

function lazyBeacon(xtop, ytop) {
    const color = 'red';
    g.living.set(`${xtop},${ytop}`, new Square(xtop, ytop, color));
    g.living.set(`${xtop},${ytop-1}`, new Square(xtop, ytop-1, color));
    g.living.set(`${xtop+1},${ytop}`, new Square(xtop+1, ytop, color));
    
    g.living.set(`${xtop+3},${ytop-3}`, new Square(xtop+3, ytop-3, color));
    g.living.set(`${xtop+2},${ytop-3}`, new Square(xtop+2, ytop-3, color));
    g.living.set(`${xtop+3},${ytop-2}`, new Square(xtop+3, ytop-2, color));   
}

function lazyPentaDecathlon(xcenter, ytop) {
    const color = 'green';
    var x = xcenter - 1, y = ytop;
    g.living.set(`${x},${y}`, new Square(x, y, color));   
    var x = xcenter, y = ytop;
    g.living.set(`${x},${y}`, new Square(x, y, color));   
    var x = xcenter + 1, y = ytop;
    g.living.set(`${x},${y}`, new Square(x, y, color));   
    
    var x = xcenter, y = ytop - 1;
    g.living.set(`${x},${y}`, new Square(x, y, color));   
    var x = xcenter, y = ytop - 2;
    g.living.set(`${x},${y}`, new Square(x, y, color));   
    
    var x = xcenter - 1, y = ytop - 3;
    g.living.set(`${x},${y}`, new Square(x, y, color));   
    var x = xcenter, y = ytop - 3;
    g.living.set(`${x},${y}`, new Square(x, y, color));   
    var x = xcenter + 1, y = ytop - 3;
    g.living.set(`${x},${y}`, new Square(x, y, color));   
    
    var x = xcenter - 1, y = ytop - 5;
    g.living.set(`${x},${y}`, new Square(x, y, color));   
    var x = xcenter, y = ytop - 5;
    g.living.set(`${x},${y}`, new Square(x, y, color));   
    var x = xcenter + 1, y = ytop - 5;
    g.living.set(`${x},${y}`, new Square(x, y, color));   
    var x = xcenter - 1, y = ytop - 6;
    g.living.set(`${x},${y}`, new Square(x, y, color));   
    var x = xcenter, y = ytop - 6;
    g.living.set(`${x},${y}`, new Square(x, y, color));   
    var x = xcenter + 1, y = ytop - 6;
    g.living.set(`${x},${y}`, new Square(x, y, color));  
    
    var bottom = 8;
    var x = xcenter - 1, y = ytop - bottom;
    g.living.set(`${x},${y}`, new Square(x, y, color));   
    var x = xcenter, y = ytop - bottom;
    g.living.set(`${x},${y}`, new Square(x, y, color));   
    var x = xcenter + 1, y = ytop - bottom;
    g.living.set(`${x},${y}`, new Square(x, y, color));   
    
    var x = xcenter, y = ytop - 1 - bottom;
    g.living.set(`${x},${y}`, new Square(x, y, color));   
    var x = xcenter, y = ytop - 2 - bottom;
    g.living.set(`${x},${y}`, new Square(x, y, color));   
    
    var x = xcenter - 1, y = ytop - 3 - bottom;
    g.living.set(`${x},${y}`, new Square(x, y, color));   
    var x = xcenter, y = ytop - 3 - bottom;
    g.living.set(`${x},${y}`, new Square(x, y, color));   
    var x = xcenter + 1, y = ytop - 3 - bottom;
    g.living.set(`${x},${y}`, new Square(x, y, color));  
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