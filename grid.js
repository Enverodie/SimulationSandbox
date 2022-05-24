const g = {
    stage : 0,
    dead : new Map(),
    permadead : new Map(), // as of now, the distinction is permadeath is rendered to the dead canvas while dead is rendered to the primary canvas
    living : new Map(),
    nextGen : new Map(),
    createdLifeforms : [new Square(null, null, null)], // start with one available lifeform: conway
}

