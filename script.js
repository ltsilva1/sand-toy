console.log(canvas)
const ctx = canvas.getContext('2d')

const DISPLAY_WIDTH = 600
const DISPLAY_HEIGHT = 600

const BACKGROUND_COLOR = '#1C1C1C'
const SAND_COLOR = '#E4C97B'
const BRUSH_RADIUS = 10;

const cellSize = 3
const cols = Math.floor(DISPLAY_WIDTH / cellSize)
const rows = Math.floor(DISPLAY_HEIGHT / cellSize)

const grid = new Uint8Array(cols * rows)

canvas.width = DISPLAY_WIDTH
canvas.height = DISPLAY_HEIGHT

// convert x, y coordinates to a linear index (C++ habits, sorry not sorry!)
function gridIndex(x, y) {
    return x + y * cols
}

// sand falling logic
function step() {
    for (let y = rows - 2; y >= 0; y--) {
        for (let x = 0; x < cols; x++) {
            
            if(grid[gridIndex(x, y)] !== 1) {
                continue;
            }
            
            // try falling straight down
            const below = gridIndex(x, y + 1)
            if (grid[below] === 0) {
                grid[below] = 1
                grid[gridIndex(x, y)] = 0
            } else {
                // if blocked, try random diagonal
                /* normally, in the standard algorithm, you try the right side
                first, but that creates an abnormal effect for me, so I preferred
                using random directions here.
                */
                const dir = Math.random() < 0.5 ? -1 : 1
                const nx = x + dir

                if (nx >= 0 && nx < cols) {
                    const diag = gridIndex(nx, y + 1)
                    if (grid[diag] === 0) {
                        grid[diag] = 1
                        grid[gridIndex(x, y)] = 0
                    }
                }
            }
        }
    }
}

function render() {
    ctx.fillStyle = BACKGROUND_COLOR
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = SAND_COLOR
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (grid[gridIndex(x, y)] === 1) {
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
            }
        }
    }
}

// main loop
let running = true
function loop() {
    if (mouseDown) {
        paintCircle(mouseX, mouseY, BRUSH_RADIUS);
    }

    step();
    render();
    requestAnimationFrame(loop);
}


// mouse interactions
let mouseDown = false;
let mouseX = 0;
let mouseY = 0;

canvas.addEventListener('pointerdown', e => {
    mouseDown = true;
    updatePointer(e);
});

canvas.addEventListener('pointermove', e => {
    updatePointer(e);
});

window.addEventListener('pointerup', () => {
    mouseDown = false;
});

function updatePointer(e) {
    const rect = canvas.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / cellSize) | 0;
    mouseY = ((e.clientY - rect.top) / cellSize) | 0;
}

function paintCircle(cx, cy, r) {
    const r2 = r * r;

    for (let y = cy - r; y <= cy + r; y++) {
        if (y < 0 || y >= rows)
            continue;

        for (let x = cx - r; x <= cx + r; x++) {
            if (x < 0 || x >= cols)
                continue;

            const dx = x - cx;
            const dy = y - cy;
            if (dx * dx + dy * dy > r2)
                continue;

            grid[gridIndex(x, y)] = 1;
        }
    }
}

loop();

// unused legacy functions (keeping them here just in case)
/*
function onPointerDown(e) {
    mouseDown = true;
    paintAtPointer(e);
}

function onPointerMove(e) {
    if (!mouseDown) return;
    paintAtPointer(e);
}

function onPointerUp() {
    mouseDown = false;
}

function paintAtPointer(e) {
    const { x, y } = pointerToCell(e);
    paintCircle(x, y, BRUSH_RADIUS);
}

function pointerToCell(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: ((e.clientX - rect.left) / cellSize) | 0,
        y: ((e.clientY - rect.top) / cellSize) | 0
    };
}
*/
