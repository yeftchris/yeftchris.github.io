/* ============================================================
   TRON ARCADE — tron.js
   Attract mode (auto-play) → Insert Coin → Play mode
   Player: WASD (cyan) vs AI (yellow)
   ============================================================ */

(function() {
  const canvas = document.getElementById('tronCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const ui  = document.getElementById('tronScore');

  const CELL  = 12;
  const COLS  = 40;
  const ROWS  = 28;
  const W     = COLS * CELL;
  const H     = ROWS * CELL;
  const SPEED = 85;

  const CYAN   = '#00e5ff';
  const YELLOW = '#ffe600';
  const BG     = '#090d14';

  canvas.width  = W;
  canvas.height = H;

  /* ── STATE ─────────────────────────────────────────────── */
  // mode: 'attract' | 'playing' | 'over' | 'win' | 'lose' | 'draw'
  let mode = 'attract';
  let grid, p1, p2, last;
  let scores = {p1: 0, p2: 0};
  let blinkOn = true;
  let blinkTimer = 0;
  let attractBots = [];

  /* ── GRID ───────────────────────────────────────────────── */
  function initGrid() {
    grid = Array.from({length: ROWS}, () => new Array(COLS).fill(0));
  }

  function makePlayer(x, y, dx, dy, color, id) {
    return {x, y, dx, dy, color, id, alive: true};
  }

  /* ── ATTRACT MODE ───────────────────────────────────────── */
  function makeBot(x, y, dx, dy, color, id) {
    return {x, y, dx, dy, color, id, alive: true};
  }

  function initAttract() {
    initGrid();
    attractBots = [
      makeBot(4,  4,  1,  0, CYAN,   1),
      makeBot(COLS-5, 4,  0,  1, YELLOW, 2),
      makeBot(4,  ROWS-5, 0, -1, '#ff00ff', 3),
      makeBot(COLS-5, ROWS-5, -1, 0, '#00ff88', 4),
    ];
    attractBots.forEach(b => { grid[b.y][b.x] = b.id; });
    mode = 'attract';
    updateUI();
  }

  function aiStep(bot, allBots) {
    if (!bot.alive) return;
    const nx = bot.x + bot.dx;
    const ny = bot.y + bot.dy;
    const straight = canMove(nx, ny);
    const shouldTurn = !straight || Math.random() < 0.1;
    if (shouldTurn) {
      const opts = [
        {dx: bot.dx,  dy: bot.dy},
        {dx: -bot.dy, dy: bot.dx},
        {dx: bot.dy,  dy: -bot.dx},
      ].filter(o => canMove(bot.x + o.dx, bot.y + o.dy));
      if (opts.length === 0) { bot.alive = false; return; }
      const best = opts.reduce((a, b) => {
        let sa = 0, sb = 0;
        for (let d = 1; d <= 5; d++) {
          if (canMove(bot.x + a.dx*d, bot.y + a.dy*d)) sa += (6-d);
          if (canMove(bot.x + b.dx*d, bot.y + b.dy*d)) sb += (6-d);
        }
        return sa >= sb ? a : b;
      });
      bot.dx = best.dx; bot.dy = best.dy;
    }
    const mx = bot.x + bot.dx;
    const my = bot.y + bot.dy;
    if (!canMove(mx, my)) { bot.alive = false; return; }
    bot.x = mx; bot.y = my;
    grid[my][mx] = bot.id;
  }

  function stepAttract() {
    attractBots.forEach(b => aiStep(b, attractBots));
    const alive = attractBots.filter(b => b.alive).length;
    if (alive <= 1) initAttract();
  }

  /* ── GAME MODE ──────────────────────────────────────────── */
  function initGame() {
    initGrid();
    p1 = makePlayer(6, Math.floor(ROWS/2), 1, 0, CYAN, 1);
    p2 = makePlayer(COLS-7, Math.floor(ROWS/2), -1, 0, YELLOW, 2);
    grid[p1.y][p1.x] = 1;
    grid[p2.y][p2.x] = 2;
    mode = 'playing';
    last = 0;
    updateUI();
  }

  function canMove(x, y) {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
    return grid[y][x] === 0;
  }

  function aiMoveP2() {
    if (!p2.alive) return;
    const nx = p2.x + p2.dx;
    const ny = p2.y + p2.dy;
    if (canMove(nx, ny) && Math.random() > 0.28) return;
    const options = [
      {dx: p2.dx,  dy: p2.dy},
      {dx: -p2.dy, dy: p2.dx},
      {dx: p2.dy,  dy: -p2.dx},
      {dx: -p2.dx, dy: -p2.dy}
    ];
    let best = null, bestScore = -Infinity;
    for (const opt of options) {
      const tx = p2.x + opt.dx, ty = p2.y + opt.dy;
      if (!canMove(tx, ty)) continue;
      let score = 0;
      for (let d = 1; d <= 6; d++) {
        if (canMove(tx + opt.dx*d, ty + opt.dy*d)) score += (7-d);
      }
      score += (Math.abs(tx - p1.x) + Math.abs(ty - p1.y)) * 0.08;
      if (score > bestScore) { bestScore = score; best = opt; }
    }
    if (best) { p2.dx = best.dx; p2.dy = best.dy; }
  }

  function movePlayer(p) {
    if (!p.alive) return;
    const nx = p.x + p.dx, ny = p.y + p.dy;
    if (!canMove(nx, ny)) { p.alive = false; return; }
    p.x = nx; p.y = ny;
    grid[ny][nx] = p.id;
  }

  function checkEnd() {
    if (!p1.alive || !p2.alive) {
      if (!p1.alive && !p2.alive) { mode = 'draw'; }
      else if (!p1.alive)         { scores.p2++; mode = 'lose'; }
      else                         { scores.p1++; mode = 'win'; }
      updateUI();
    }
  }

  /* ── UI ─────────────────────────────────────────────────── */
  function updateUI() {
    if (!ui) return;
    if (mode === 'attract') {
      ui.innerHTML = `<span style="color:${CYAN};letter-spacing:0.15em">CLICK OR PRESS ANY KEY TO INSERT COIN</span>`;
    } else if (mode === 'playing') {
      ui.innerHTML =
        `<span style="color:${CYAN}">■ USER</span> WASD &nbsp;` +
        `<span style="color:#4a5568">|</span>&nbsp; ` +
        `<span style="color:${YELLOW}">■ CLU</span> &nbsp;&nbsp;` +
        `<span style="color:#4a5568">Score:</span> ` +
        `<span style="color:${CYAN}">${scores.p1}</span>` +
        `<span style="color:#4a5568"> — </span>` +
        `<span style="color:${YELLOW}">${scores.p2}</span>` +
        ` &nbsp;<span style="color:#4a5568;font-size:11px">R = restart</span>`;
    } else {
      ui.innerHTML =
        `<span style="color:#4a5568">Score:</span> ` +
        `<span style="color:${CYAN}">${scores.p1}</span>` +
        `<span style="color:#4a5568"> — </span>` +
        `<span style="color:${YELLOW}">${scores.p2}</span>` +
        ` &nbsp;<span style="color:#4a5568;font-size:11px">R or Space = play again</span>`;
    }
  }

  /* ── DRAW ───────────────────────────────────────────────── */
  const BOT_COLORS = { 1: CYAN, 2: YELLOW, 3: '#ff00ff', 4: '#00ff88' };

  function drawBg() {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);
  }

  function drawGridLines() {
    ctx.strokeStyle = 'rgba(0,229,255,0.04)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= W; x += CELL) {
      ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += CELL) {
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
    }
  }

  function drawTrails() {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const cell = grid[row][col];
        if (!cell) continue;
        const color = mode === 'attract'
          ? (BOT_COLORS[cell] || CYAN)
          : (cell === 1 ? CYAN : YELLOW);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.22;
        ctx.fillRect(col*CELL+1, row*CELL+1, CELL-2, CELL-2);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.strokeRect(col*CELL+0.5, row*CELL+0.5, CELL-1, CELL-1);
      }
    }
  }

  function drawBot(b) {
    if (!b.alive) return;
    const color = BOT_COLORS[b.id] || CYAN;
    ctx.shadowBlur = 16;
    ctx.shadowColor = color;
    ctx.fillStyle = '#fff';
    ctx.fillRect(b.x*CELL+1, b.y*CELL+1, CELL-2, CELL-2);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(b.x*CELL+0.5, b.y*CELL+0.5, CELL-1, CELL-1);
  }

  function drawHead(p) {
    if (!p.alive) return;
    ctx.shadowBlur = 18;
    ctx.shadowColor = p.color;
    ctx.fillStyle = '#fff';
    ctx.fillRect(p.x*CELL+1, p.y*CELL+1, CELL-2, CELL-2);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(p.x*CELL+0.5, p.y*CELL+0.5, CELL-1, CELL-1);
  }

  function drawBorder() {
    ctx.strokeStyle = 'rgba(0,229,255,0.25)';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, W-2, H-2);
  }

  function drawAttractOverlay() {
    ctx.fillStyle = 'rgba(9,13,20,0.55)';
    ctx.fillRect(0, 0, W, H);

    ctx.textAlign = 'center';
    ctx.fillStyle = CYAN;
    ctx.font = 'bold 22px "Space Mono", monospace';
    ctx.shadowBlur = 20; ctx.shadowColor = CYAN;
    ctx.fillText('TRON', W/2, H/2 - 38);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#e8edf5';
    ctx.font = '11px "Space Mono", monospace';
    ctx.fillText('LIGHT CYCLES', W/2, H/2 - 18);

    if (blinkOn) {
      ctx.fillStyle = YELLOW;
      ctx.font = 'bold 13px "Space Mono", monospace';
      ctx.shadowBlur = 14; ctx.shadowColor = YELLOW;
      ctx.fillText('— INSERT COIN —', W/2, H/2 + 12);
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = 'rgba(126,143,168,0.6)';
    ctx.font = '10px "Space Mono", monospace';
    ctx.fillText('CLICK CANVAS OR PRESS ANY KEY', W/2, H/2 + 34);
    ctx.textAlign = 'left';
  }

  function drawGameOverlay() {
    ctx.fillStyle = 'rgba(9,13,20,0.78)';
    ctx.fillRect(0, 0, W, H);
    let msg, color;
    if (mode === 'win')  { msg = 'USER WIN';  color = CYAN; }
    if (mode === 'lose') { msg = 'CLU WINS';  color = YELLOW; }
    if (mode === 'draw') { msg = 'DRAW';     color = '#888'; }
    ctx.textAlign = 'center';
    ctx.shadowBlur = 24; ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.font = 'bold 28px "Space Mono", monospace';
    ctx.fillText(msg, W/2, H/2 - 14);
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(200,220,255,0.5)';
    ctx.font = '10px "Space Mono", monospace';
    ctx.fillText('R  OR  SPACE  TO  PLAY  AGAIN', W/2, H/2 + 12);
    if (blinkOn) {
      ctx.fillStyle = 'rgba(126,143,168,0.4)';
      ctx.fillText('or click canvas to return to attract mode', W/2, H/2 + 28);
    }
    ctx.textAlign = 'left';
  }

  function draw(ts) {
    blinkTimer += 16;
    if (blinkTimer > 520) { blinkOn = !blinkOn; blinkTimer = 0; }

    drawBg();
    drawGridLines();
    drawTrails();

    if (mode === 'attract') {
      attractBots.forEach(drawBot);
      drawAttractOverlay();
    } else {
      drawHead(p1);
      drawHead(p2);
      if (mode !== 'playing') drawGameOverlay();
    }
    drawBorder();
  }

  /* ── LOOP ───────────────────────────────────────────────── */
  function loop(ts) {
    requestAnimationFrame(loop);
    if (mode === 'attract' && ts - (last||0) > SPEED) {
      last = ts; stepAttract();
    }
    if (mode === 'playing' && ts - (last||0) > SPEED) {
      last = ts;
      aiMoveP2();
      movePlayer(p1);
      movePlayer(p2);
      checkEnd();
    }
    draw(ts);
  }

  /* ── INPUT ──────────────────────────────────────────────── */
  function insertCoin() {
    if (mode === 'attract') { initGame(); return; }
    if (mode !== 'playing') { initGame(); }
  }

  canvas.addEventListener('click', () => {
    if (mode === 'attract') { initGame(); return; }
    if (mode !== 'playing') { initGame(); }
  });

  document.addEventListener('keydown', e => {
    if (mode === 'attract') {
      initGame(); return;
    }
    if (mode !== 'playing') {
      if (e.key === 'r' || e.key === ' ') initGame();
      return;
    }
    if ((e.key === 'w' || e.key === 'ArrowUp')    && p1.dy !== 1)  { p1.dx=0;  p1.dy=-1; e.preventDefault(); }
    if ((e.key === 's' || e.key === 'ArrowDown')  && p1.dy !== -1) { p1.dx=0;  p1.dy=1;  e.preventDefault(); }
    if ((e.key === 'a' || e.key === 'ArrowLeft')  && p1.dx !== 1)  { p1.dx=-1; p1.dy=0;  e.preventDefault(); }
    if ((e.key === 'd' || e.key === 'ArrowRight') && p1.dx !== -1) { p1.dx=1;  p1.dy=0;  e.preventDefault(); }
    if (e.key === 'r') initGame();
  });

  /* ── START ──────────────────────────────────────────────── */
  initAttract();
  requestAnimationFrame(loop);
})();
