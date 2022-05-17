const g = {
    stage : 0,
    dead : new Map(),
    living : new Map(),
    nextGen : new Map(),
    createdLifeforms : [new Square(null, null, null)], // start with one available lifeform: conway
}

