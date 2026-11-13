// ============================================================
// 紙芸書籍「折り・展開」と絵柄の連動 — p5.js デモ
//   V折り（テント折り）構造を開き具合で立ち上げ、
//   その折り面に「顔」の絵柄をテクスチャとして貼り付ける。
//   閉じた状態＝一枚の平面絵　→　開く＝折り目で絵が左右に分かれて立ち上がる。
// ============================================================

let pattern;      // 紙に印刷された絵柄（createGraphics）
let openT = 0;    // 開き具合 0..1（スライダー）
let slider;

const W = 150;    // 折り面の半幅（折り目から左右の端まで）
const D = 160;    // 奥行きの半分
const MAXH = 170; // 全開時の頂点の高さ

function setup() {
  createCanvas(880, 640, WEBGL);
  smooth();

  // URL クエリ ?open=0..1 で初期開き具合を指定（スクリーンショット用）
  const q = new URLSearchParams(window.location.search);
  if (q.has('open')) { openT = parseFloat(q.get('open')); }

  // スライダー（DOM）
  slider = createSlider(0, 1, openT, 0.01);
  slider.position(24, height - 56);
  slider.style('width', '260px');
  slider.input(() => { openT = slider.value(); });

  // 紙の絵柄を作る（顔）
  pattern = createGraphics(512, 512);
  drawPattern(pattern);
}

// 絵柄：顔（左右対称、中央の折り目で左右に分かれる）
function drawPattern(pg) {
  pg.background(246, 236, 214);        // クリーム色の紙
  pg.noStroke();

  // 顔の輪郭
  pg.fill(255, 214, 170);
  pg.ellipse(256, 260, 360, 380);

  // 髪
  pg.fill(90, 60, 40);
  pg.arc(256, 210, 360, 320, PI, TWO_PI, CHORD);

  // 目（左右対称、中央線=折り目）
  pg.fill(255);
  pg.ellipse(190, 260, 88, 64);
  pg.ellipse(322, 260, 88, 64);
  pg.fill(30, 30, 30);
  pg.ellipse(190, 260, 34, 40);
  pg.ellipse(322, 260, 34, 40);
  pg.fill(255);
  pg.ellipse(202, 248, 12, 12);
  pg.ellipse(334, 248, 12, 12);

  // ほっぺ
  pg.fill(250, 150, 150, 140);
  pg.ellipse(140, 320, 60, 40);
  pg.ellipse(372, 320, 60, 40);

  // 鼻
  pg.fill(240, 180, 140);
  pg.ellipse(256, 300, 26, 20);

  // 口（笑顔）
  pg.stroke(120, 40, 40);
  pg.strokeWeight(12);
  pg.noFill();
  pg.arc(256, 340, 150, 90, 0.15 * PI, 0.85 * PI);

  // 中央の折り目（視認用の淡いガイド、実際の折り目位置）
  pg.noStroke();
  pg.fill(120, 90, 60, 40);
  pg.rect(253, 0, 6, 512);
}

function draw() {
  background(40, 44, 52);

  // 照明
  ambientLight(150, 150, 160);
  directionalLight(255, 255, 255, 0.4, -1, -0.6);
  directionalLight(200, 210, 230, -0.6, 0.3, 0.4);

  // カメラを少し引く＋上から見下ろす
  const camDist = 640;
  const camX = sin(frameCount * 0.0006) * 0; // 固定（orbitControl で回す）
  camera(0, -260, camDist, 0, 0, 0, 0, 1, 0);
  orbitControl(2, 2, 0.05);

  // 開き具合 → 頂点の高さ（イージングで自然に）
  const h = easeInOutCubic(openT) * MAXH;

  // ---- 土台（本のページ、閉じた紙の面） ----
  push();
  noStroke();
  fill(226, 214, 188);
  // 左ページ
  beginShape();
  vertex(-W, 0, -D);
  vertex(0, 0, -D);
  vertex(0, 0, D);
  vertex(-W, 0, D);
  endShape(CLOSE);
  // 右ページ
  fill(216, 204, 180);
  beginShape();
  vertex(0, 0, -D);
  vertex(W, 0, -D);
  vertex(W, 0, D);
  vertex(0, 0, D);
  endShape(CLOSE);
  pop();

  // ---- 折り面（V折り、テクスチャマッピング） ----
  push();
  noStroke();
  texture(pattern);

  // 左の折り面：左端(u=0) → 頂点(u=0.5)
  beginShape();
  textureMode(NORMAL);
  vertex(-W, 0, -D, 0, 0);          // 奥左
  vertex(0, h, 0, 0.5, 0.5);        // 頂点
  vertex(-W, 0, D, 0, 1);           // 手前左
  endShape(CLOSE);

  // 右の折り面：頂点(u=0.5) → 右端(u=1)
  beginShape();
  vertex(W, 0, -D, 1, 0);           // 奥右
  vertex(0, h, 0, 0.5, 0.5);        // 頂点
  vertex(W, 0, D, 1, 1);            // 手前右
  endShape(CLOSE);
  pop();

  // ---- 折り目の稜線をハイライト ----
  if (h > 0.5) {
    push();
    stroke(255, 200, 80, 160);
    strokeWeight(3);
    line(0, 0, -D, 0, h, 0);
    line(0, 0, D, 0, h, 0);
    pop();
  }

  // ---- タイトル（DOM） ----
  if (frameCount === 1) {
    const title = select('#title');
    if (!title) {
      const div = createDiv(
        '紙芸書籍の「折り・展開」と絵柄の連動 — p5.js デモ'
      );
      div.id('title');
      div.style('position', 'absolute');
      div.style('top', '16px');
      div.style('left', '24px');
      div.style('color', '#fff');
      div.style('font-size', '15px');
      div.style('font-family', 'sans-serif');
    }
  }
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
