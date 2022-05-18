const mainCSSProperty = '--mainWidth';
const root = document.querySelector(":root");

function percentToNumber(percent) {
    return Number.parseFloat(percent.substring(0, percent.length - 1));
}

function toggleMainView(percent = '20%') {
    const percentThreshold = 3;
    let ps = getComputedStyle(root).getPropertyValue(mainCSSProperty);
    console.log(ps, percentToNumber(ps));
    percentToNumber(ps) <= percentThreshold ? root.style.setProperty(mainCSSProperty, percent) : root.style.setProperty(mainCSSProperty, '0%');
}

const roundThreshold = 10;
let hasCrossedRoundThreshold = false; // will be used to prevent snapping on initial pull out

function setMainView(percent) {
    let numericPercent = percentToNumber(percent);
    console.log(numericPercent, numericPercent <= roundThreshold, hasCrossedRoundThreshold);
    if (numericPercent <= roundThreshold && hasCrossedRoundThreshold) {
        root.style.setProperty(mainCSSProperty, '0%');
    } 
    else root.style.setProperty(mainCSSProperty, percent);
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