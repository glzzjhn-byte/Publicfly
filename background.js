// Particle system logic
const scene = document.querySelector('.scene');

// Random number generator
function rand(min, max) {
     return Math.random() * (max - min) + min; 
    }

// Particle spawn logic
function spawnParticle(cls) {
    const el = document.createElement('div');
    el.className = cls;
    const size = rand(3, 7);
    el.style.cssText = `
        width:${size}px; height:${size}px;
        left:${rand(5, 90)}%;
        bottom:${rand(10, 55)}%;
        animation-duration:${rand(3, 7)}s;
        animation-delay:${rand(0, 5)}s;
    `;
    if (scene) {
        scene.appendChild(el);
        setTimeout(() => el.remove(), rand(12000, 25000));
    }
}

// Initial logic
if (scene) {
    for (let i = 0; i < 18; i++) spawnParticle('spark');
    for (let i = 0; i < 12; i++) spawnParticle('pollen');

    setInterval(() => { if (!document.hidden) spawnParticle('spark'); },  900);
    setInterval(() => { if (!document.hidden) spawnParticle('pollen'); }, 1400);
}

// panning logic
const bg = document.querySelector('.bg');
function getMaxPanX() { return window.innerWidth * 0.04; }
function getMaxPanY() { return window.innerHeight * 0.04; }
let targetX = 0, targetY = 0;
let currentX = 0, currentY = 0;

// hint UI logic
const hint = document.createElement('div');
hint.id = 'pan-hint';
hint.innerHTML = `
    <span class="arrow left"  data-dir="left">&#9664;</span>
    <span class="arrow right" data-dir="right">&#9654;</span>
    <span class="arrow up"    data-dir="up">&#9650;</span>
    <span class="arrow down"  data-dir="down">&#9660;</span>
    <span class="tip">^_^ Welcome to my digital Link ^_^</span>
`;
document.body.appendChild(hint);

// Zone logic
['left','right','top','bot'].forEach(d => {
    const z = document.createElement('div');
    z.className = `edge-zone zone-${d}`;
    z.id = `zone-${d}`;
    document.body.appendChild(z);
});

// Edge zone toggle logic
function showZone(id) {
    document.querySelectorAll('.edge-zone').forEach(z => z.classList.remove('active'));
    if (id) document.getElementById(`zone-${id}`)?.classList.add('active');
}

// Position tracking logic
function applyPosition(nx, ny) {
    nx = Math.max(0, Math.min(1, nx));
    ny = Math.max(0, Math.min(1, ny));

    targetX = (nx - 0.5) * 2 * -getMaxPanX();
    targetY = (ny - 0.5) * 2 * -getMaxPanY();

    if      (nx < 0.18) showZone('left');
    else if (nx > 0.82) showZone('right');
    else if (ny < 0.18) showZone('top');
    else if (ny > 0.82) showZone('bot');
    else                showZone(null);
}

// Mouse movement logic
document.addEventListener('mousemove', e => {
    applyPosition(e.clientX / window.innerWidth, e.clientY / window.innerHeight);
});

// Touch movement logic
document.addEventListener('touchmove', e => {
    const t = e.touches[0];
    applyPosition(t.clientX / window.innerWidth, t.clientY / window.innerHeight);
}, { passive: true });

document.addEventListener('touchend', () => showZone(null));
document.addEventListener('mouseleave', () => {
    targetX = 0; targetY = 0; showZone(null);
});

// Arrow button logic
const arrowDirs = { left:[1,0], right:[-1,0], up:[0,1], down:[0,-1] };
let holdTimer = null;
document.querySelectorAll('.arrow').forEach(btn => {
    const [dx, dy] = arrowDirs[btn.dataset.dir];
    function pushDir() { targetX = dx * getMaxPanX(); targetY = dy * getMaxPanY(); }
    function releaseDir() { targetX = 0; targetY = 0; clearInterval(holdTimer); }
    btn.addEventListener('mousedown',  () => { pushDir(); clearInterval(holdTimer); holdTimer = setInterval(pushDir, 50); });
    btn.addEventListener('touchstart', () => { pushDir(); clearInterval(holdTimer); holdTimer = setInterval(pushDir, 50); }, { passive:true });
    btn.addEventListener('mouseup',   releaseDir);
    btn.addEventListener('touchend',  releaseDir);
});

// Animation loop logic
function lerp(a, b, t) { return a + (b - a) * t; }

(function loop() {
    if (!bg) return;
    currentX = lerp(currentX, targetX, 0.06);
    currentY = lerp(currentY, targetY, 0.06);
    bg.style.transform = `scale(1.15) translate(${currentX}px, ${currentY}px)`;
    requestAnimationFrame(loop);
})();