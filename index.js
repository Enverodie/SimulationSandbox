const mainCSSProperty = '--mainWidth';
const root = document.querySelector(":root");

function percentToNumber(percent) {
    return Number.parseFloat(percent.substring(0, percent.length - 1));
}

function toggleMainView(percent = '20%') {
    const percentThreshold = 3;
    let ps = getComputedStyle(root).getPropertyValue(mainCSSProperty);
    percentToNumber(ps) <= percentThreshold ? setMainView(percent) : setMainView('0%');

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
}

const roundThreshold = 10;
let hasCrossedRoundThreshold = false; // will be used to prevent snapping on initial pull out

function setMainView(percent) {
    let numericPercent = percentToNumber(percent);
    if (numericPercent <= roundThreshold && hasCrossedRoundThreshold) {
        root.style.setProperty(mainCSSProperty, '0%');
    } 
    else root.style.setProperty(mainCSSProperty, percent);
    console.log(window.getComputedStyle(canvasContainer));
    
    MUStates.gridIsUpToDate = false;
}

let isDraggingMain = false;
function resizeMain(move) {
    if (!isDraggingMain) return;
    let x = move.clientX, wX = window.innerWidth;

    let percent = x / wX;
    percent = 1 - percent;
    percent *= 100;
    
    if (percent > roundThreshold) hasCrossedRoundThreshold = true;

    setMainView(percent + "%");
}

const mainDragger = document.getElementById('dragMainBox');
mainDragger.addEventListener('mousedown', () => {
    isDraggingMain = true;
    document.querySelector('main').classList.add("dragging");
    document.getElementById('canvasContainer').classList.add("dragging");
});
document.addEventListener('mouseup', () => {
    if (isDraggingMain) {
        document.querySelector('main').classList.remove("dragging");
        document.getElementById('canvasContainer').classList.remove("dragging");
    }
    isDraggingMain = false;
    hasCrossedRoundThreshold = false;
});
document.addEventListener('mousemove', e => resizeMain(e));

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