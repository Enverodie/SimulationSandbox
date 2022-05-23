const root = document.querySelector(":root");

const mainMenuDragging = {
    mainCSSProperty : '--mainWidth',
    mainSnapThreshold : 10,
    hasCrossedmainSnapThreshold : false, // will be used to prevent snapping on initial pull out
    isDraggingMain : false,
    mainDraggerElement : document.getElementById('dragMainBox'),

    toggleMainView: function(percent = '20%') {
        const percentThreshold = 3;
        let ps = getComputedStyle(root).getPropertyValue(mainMenuDragging.mainCSSProperty);
        percentToNumber(ps) <= percentThreshold ? mainMenuDragging.setMainView(percent) : mainMenuDragging.setMainView('0%');
    
        MUStates.cssInTransition = true;
        let str = window.getComputedStyle(canvasContainer).transition;
        let w = str.indexOf("width");
        let we = str.slice(w).indexOf('s');
        w = str.slice(w).indexOf(' ') + 1;
        str = str.slice(w, we);
        let cssTransitionSpeed; 
        str[str.length - 1] === 'm' ? 
            cssTransitionSpeed = Number.parseFloat(str) : 
            cssTransitionSpeed = Number.parseFloat(str) * 1000; // if the css property is written in milliseconds
        setTimeout(()=>MUStates.cssInTransition=false, cssTransitionSpeed);
    },
    
    setMainView: function(percent) {
        let numericPercent = percentToNumber(percent);
        if (numericPercent <= mainMenuDragging.mainSnapThreshold && mainMenuDragging.hasCrossedmainSnapThreshold) {
            root.style.setProperty(mainMenuDragging.mainCSSProperty, '0%');
        } 
        else root.style.setProperty(mainMenuDragging.mainCSSProperty, percent);
        console.log(window.getComputedStyle(canvasContainer));
        
        MUStates.gridIsUpToDate = false;
    },
    
    resizeMain: function(move) {
        if (!mainMenuDragging.isDraggingMain) return;
        let x = move.clientX, wX = window.innerWidth;
    
        let percent = x / wX;
        percent = 1 - percent;
        percent *= 100;
        
        if (percent > mainMenuDragging.mainSnapThreshold) mainMenuDragging.hasCrossedmainSnapThreshold = true;
    
        mainMenuDragging.setMainView(percent + "%");
    }
}

function percentToNumber(percent) {
    return Number.parseFloat(percent.substring(0, percent.length - 1));
}

mainMenuDragging.mainDraggerElement.addEventListener('mousedown', () => {
    mainMenuDragging.isDraggingMain = true;
    document.querySelector('main').classList.add("dragging");
    document.getElementById('canvasContainer').classList.add("dragging");
});
document.addEventListener('mouseup', () => {
    if (mainMenuDragging.isDraggingMain) {
        document.querySelector('main').classList.remove("dragging");
        document.getElementById('canvasContainer').classList.remove("dragging");
    }
    mainMenuDragging.isDraggingMain = false;
    mainMenuDragging.hasCrossedmainSnapThreshold = false;
});
document.addEventListener('mousemove', e => mainMenuDragging.resizeMain(e));

function setActiveLifeform(button) {

    // setup, ensure exclusive use of 'active'
    let list = [ ...document.getElementById('lifeformChoice').children ];
    list = list.filter(option => option.classList.contains('active'));
    item = list[0];
    button.classList.add('active');
    item.classList.remove('active');

    // set the placement
    as.placeType = button.innerText;
}