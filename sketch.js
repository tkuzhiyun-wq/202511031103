let questionTable;
let allQuestions = [];
let quizQuestions = []; // 儲存本次測驗的3個題目
let currentQuestionIndex = 0;
let score = 0;
let gameState = 'START'; // 遊戲狀態: START, QUESTION, FEEDBACK, RESULT

// 按鈕物件
let answerButtons = [];
let startButton, restartButton;

// 互動效果
let particles = [];
let resultParticles = []; // 成績結果的特殊粒子
let feedbackMessage = '';
let feedbackColor;
let feedbackTimer = 0;
let resultAnimationTime = 0; // 成績動畫計時器

function preload() {
  // 載入 CSV 檔案，指定 'csv' 格式且沒有標頭
  questionTable = loadTable('questions.csv', 'csv');
}

function setup() {
  let canvasW = windowWidth * 0.8;
  let canvasH = windowHeight * 0.9;
  createCanvas(canvasW, canvasH);
  processData();
  setupButtons();
  setupParticles();
  startGame();
}

function windowResized() {
  let canvasW = windowWidth * 0.8;
  let canvasH = windowHeight * 0.9;
  resizeCanvas(canvasW, canvasH);
}

function draw() {
  // 深色背景
  background(10, 20, 40);
  drawParticles();

  // 根據不同的遊戲狀態繪製不同畫面
  switch (gameState) {
    case 'START':
      drawStartScreen();
      break;
    case 'QUESTION':
      drawQuestionScreen();
      break;
    case 'FEEDBACK':
      drawFeedbackScreen();
      break;
    case 'RESULT':
      drawResultScreen();
      break;
  }
}

// ---------------------------------
// 遊戲流程函數
// ---------------------------------

// 1. 處理CSV資料
function processData() {
  // 遍歷 CSV 的每一行
  for (let row of questionTable.getRows()) {
    allQuestions.push({
      question: row.getString(0),
      opA: row.getString(1),
      opB: row.getString(2),
      opC: row.getString(3),
      opD: row.getString(4),
      correct: row.getString(5) // 儲存 'A', 'B', 'C', or 'D'
    });
  }
}

// 2. 設定按鈕位置
function setupButtons() {
  // 開始按鈕
  let startBtnW = width * 0.25;
  let startBtnH = height * 0.1;
  startButton = { x: width / 2 - startBtnW / 2, y: height / 2 + 50, w: startBtnW, h: startBtnH, text: '開始測驗' };
  // 重新開始按鈕
  restartButton = { x: width / 2 - startBtnW / 2, y: height / 2 + 150, w: startBtnW, h: startBtnH, text: '重新開始' };

  // 四個答案按鈕
  let btnW = width * 0.35;
  let btnH = height * 0.12;
  let gap = width * 0.02;
  let startX = width * 0.05;
  let startY = height * 0.4;
  answerButtons.push({ x: startX, y: startY, w: btnW, h: btnH, option: 'A' });
  answerButtons.push({ x: startX + btnW + gap, y: startY, w: btnW, h: btnH, option: 'B' });
  answerButtons.push({ x: startX, y: startY + btnH + gap, w: btnW, h: btnH, option: 'C' });
  answerButtons.push({ x: startX + btnW + gap, y: startY + btnH + gap, w: btnW, h: btnH, option: 'D' });
}

// 3. 開始或重新開始遊戲
function startGame() {
  score = 0;
  currentQuestionIndex = 0;
  resultParticles = []; // 清空結果粒子
  resultAnimationTime = 0;
  // 隨機排序所有問題，並取出前3題
  quizQuestions = shuffle(allQuestions).slice(0, 3);
  gameState = 'START';
}

// 4. 檢查答案
function checkAnswer(selectedOption) {
  let correctOption = quizQuestions[currentQuestionIndex].correct;

  if (selectedOption === correctOption) {
    score++;
    feedbackMessage = '答對了！';
    feedbackColor = color(0, 200, 100, 220); // 綠色
  } else {
    feedbackMessage = `答錯了... 正確答案是 ${correctOption}`;
    feedbackColor = color(200, 50, 50, 220); // 紅色
  }
  
  gameState = 'FEEDBACK';
  feedbackTimer = 90; // 顯示回饋 1.5 秒 (60fps * 1.5)
}

// 5. 進入下一題
function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex >= quizQuestions.length) {
    gameState = 'RESULT';
  } else {
    gameState = 'QUESTION';
  }
}

// 6. 取得回饋用語
function getFeedbackText() {
  if (score === 3) return '太棒了，全部答對！';
  if (score >= 1) return '不錯喔，再接再厲！';
  return '別灰心，再試一次吧！';
}

// ---------------------------------
// 畫面繪製函數
// ---------------------------------

function drawStartScreen() {
  textAlign(CENTER, CENTER);
  fill(255);
  let titleSize = width * 0.06;
  let subtitleSize = width * 0.03;
  textSize(titleSize);
  text('p5.js 題庫測驗', width / 2, height / 2 - 100);
  textSize(subtitleSize);
  text(`從 ${allQuestions.length} 題中隨機抽取 3 題`, width / 2, height / 2 - 30);
  
  // 繪製開始按鈕
  drawButton(startButton);
}

function drawQuestionScreen() {
  if (quizQuestions.length === 0) return; // 防止資料還沒載入
  
  let q = quizQuestions[currentQuestionIndex];
  let questionSize = width * 0.035;
  let progressSize = width * 0.025;
  
  // 繪製問題
  textAlign(LEFT, TOP);
  fill(255);
  textSize(progressSize);
  text(`第 ${currentQuestionIndex + 1} 題 / 3 題`, 40, 40);
  textSize(questionSize);
  text(q.question, 40, 100, width - 80, 150); // 自動換行
  
  // 更新並繪製答案按鈕
  answerButtons[0].text = 'A. ' + q.opA;
  answerButtons[1].text = 'B. ' + q.opB;
  answerButtons[2].text = 'C. ' + q.opC;
  answerButtons[3].text = 'D. ' + q.opD;
  
  for (let btn of answerButtons) {
    drawButton(btn);
  }
}

function drawFeedbackScreen() {
  // 顯示回饋文字 (綠色或紅色)
  fill(feedbackColor);
  rect(0, 0, width, height); // 蓋住全螢幕
  
  textAlign(CENTER, CENTER);
  fill(255);
  let feedbackSize = width * 0.08;
  textSize(feedbackSize);
  text(feedbackMessage, width / 2, height / 2);
  
  // 計時
  feedbackTimer--;
  if (feedbackTimer <= 0) {
    nextQuestion();
  }
}

function drawResultScreen() {
  textAlign(CENTER, CENTER);
  fill(255);
  
  // 根據成績初始化特殊粒子效果
  if (resultAnimationTime === 0) {
    createResultParticles(score);
  }
  resultAnimationTime++;
  
  // 更新並繪製結果粒子
  updateAndDrawResultParticles();
  
  let titleSize = width * 0.065;
  let scoreSize = width * 0.05;
  let msgSize = width * 0.03;
  
  textSize(titleSize);
  text('測驗結束！', width / 2, 150);
  
  textSize(scoreSize);
  text(`你的成績: ${score} / 3`, width / 2, 250);
  
  textSize(msgSize);
  fill(200, 200, 0); // 黃色
  text(getFeedbackText(), width / 2, 350);
  
  // 根據分數繪製額外的動畫文字效果
  drawScoreAnimation(score);
  
  // 繪製重新開始按鈕
  drawButton(restartButton);
}

// ---------------------------------
// 互動與輔助函數
// ---------------------------------

// 繪製按鈕 (含 hover 效果)
function drawButton(btn) {
  let isHover = isMouseOver(btn);
  
  push(); // 保存繪圖狀態
  if (isHover) {
    fill(100, 180, 255); // hover 亮藍色
    stroke(255);
    strokeWeight(2);
    cursor(HAND); // 改變滑鼠游標
  } else {
    fill(50, 100, 200, 200); // 預設藍色
    noStroke();
  }
  rect(btn.x, btn.y, btn.w, btn.h, 10); // 圓角矩形
  
  fill(255);
  let btnTextSize = width * 0.018;
  textSize(btnTextSize);
  textAlign(CENTER, CENTER);
  text(btn.text, btn.x, btn.y, btn.w, btn.h); // 按鈕文字
  pop(); // 恢復繪圖狀態
}

// 檢查滑鼠是否在按鈕上
function isMouseOver(btn) {
  return (mouseX > btn.x && mouseX < btn.x + btn.w &&
          mouseY > btn.y && mouseY < btn.y + btn.h);
}

// 滑鼠點擊事件
function mousePressed() {
  // 重設游標
  cursor(ARROW);

  if (gameState === 'START') {
    if (isMouseOver(startButton)) {
      gameState = 'QUESTION';
    }
  } else if (gameState === 'QUESTION') {
    for (let btn of answerButtons) {
      if (isMouseOver(btn)) {
        checkAnswer(btn.option);
        break; // 點擊後就停止檢查
      }
    }
  } else if (gameState === 'RESULT') {
    if (isMouseOver(restartButton)) {
      startGame();
    }
  }
}

// ---------------------------------
// 互動視覺效果 (背景粒子)
// ---------------------------------

function setupParticles() {
  for (let i = 0; i < 100; i++) {
    particles.push({
      x: random(width),
      y: random(height),
      vx: random(-0.5, 0.5),
      vy: random(-0.5, 0.5),
      r: random(2, 5),
      alpha: random(50, 150)
    });
  }
}

function drawParticles() {
  for (let p of particles) {
    // 更新位置
    p.x += p.vx;
    p.y += p.vy;
    
    // 邊界環繞
    if (p.x < 0) p.x = width;
    if (p.x > width) p.x = 0;
    if (p.y < 0) p.y = height;
    if (p.y > height) p.y = 0;
    
    // 繪製
    noStroke();
    fill(255, p.alpha);
    ellipse(p.x, p.y, p.r);
  }
}

// ---------------------------------
// 成績結果動畫特效
// ---------------------------------

function createResultParticles(finalScore) {
  resultParticles = [];
  
  if (finalScore === 3) {
    // 完美分數：炫彩爆炸 + 星星
    for (let i = 0; i < 80; i++) {
      let angle = random(TWO_PI);
      let speed = random(2, 8);
      resultParticles.push({
        x: width / 2,
        y: height / 2,
        vx: cos(angle) * speed,
        vy: sin(angle) * speed,
        life: 255,
        type: 'confetti',
        size: random(4, 12),
        col: color(random(100, 255), random(100, 255), random(100, 255))
      });
    }
    // 星星
    for (let i = 0; i < 20; i++) {
      let angle = random(TWO_PI);
      let dist = random(100, 200);
      resultParticles.push({
        x: width / 2 + cos(angle) * dist,
        y: height / 2 + sin(angle) * dist,
        vx: cos(angle) * 1.5,
        vy: sin(angle) * 1.5,
        life: 255,
        type: 'star',
        rotation: random(TWO_PI),
        rotSpeed: random(-0.1, 0.1)
      });
    }
  } else if (finalScore === 2) {
    // 很好：金色粒子雨
    for (let i = 0; i < 100; i++) {
      resultParticles.push({
        x: random(width),
        y: random(-50, 0),
        vx: random(-1, 1),
        vy: random(1, 3),
        life: 255,
        type: 'rain',
        size: random(3, 8),
        col: color(255, 200, 50)
      });
    }
  } else if (finalScore === 1) {
    // 及格：溫暖心形
    for (let i = 0; i < 40; i++) {
      let angle = random(TWO_PI);
      let speed = random(0.5, 3);
      resultParticles.push({
        x: width / 2,
        y: height / 2,
        vx: cos(angle) * speed,
        vy: sin(angle) * speed - 2,
        life: 255,
        type: 'heart',
        scale: random(0.3, 0.8)
      });
    }
  } else {
    // 不及格：溫暖光圈 + 鼓勵
    for (let i = 0; i < 60; i++) {
      let angle = random(TWO_PI);
      resultParticles.push({
        x: width / 2 + cos(angle) * random(30, 100),
        y: height / 2 + sin(angle) * random(30, 100),
        vx: cos(angle) * random(0.5, 2),
        vy: sin(angle) * random(0.5, 2),
        life: 255,
        type: 'glow',
        size: random(2, 6),
        col: color(255, 150, 100, 150)
      });
    }
  }
}

function updateAndDrawResultParticles() {
  for (let i = resultParticles.length - 1; i >= 0; i--) {
    let p = resultParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 3;
    
    if (p.type === 'confetti') {
      p.vy += 0.1; // 重力
      noStroke();
      fill(red(p.col), green(p.col), blue(p.col), p.life);
      rect(p.x, p.y, p.size, p.size);
    } else if (p.type === 'star') {
      p.rotation += p.rotSpeed;
      push();
      translate(p.x, p.y);
      rotate(p.rotation);
      noStroke();
      fill(255, 255, 100, p.life);
      drawStar(0, 0, 8, 12, 5);
      pop();
    } else if (p.type === 'rain') {
      noStroke();
      fill(red(p.col), green(p.col), blue(p.col), p.life);
      ellipse(p.x, p.y, p.size);
    } else if (p.type === 'heart') {
      push();
      translate(p.x, p.y);
      scale(p.scale);
      noStroke();
      fill(255, 100, 150, p.life);
      drawHeart(0, 0, 20);
      pop();
    } else if (p.type === 'glow') {
      noStroke();
      fill(red(p.col), green(p.col), blue(p.col), p.life * 0.5);
      ellipse(p.x, p.y, p.size * 3);
      fill(red(p.col), green(p.col), blue(p.col), p.life);
      ellipse(p.x, p.y, p.size);
    }
    
    if (p.life <= 0) {
      resultParticles.splice(i, 1);
    }
  }
}

function drawScoreAnimation(score) {
  push();
  let t = resultAnimationTime;
  let animTextSize = width * 0.04;
  
  if (score === 3) {
    // 完美：閃爍且旋轉文字
    let bobbing = sin(t * 0.08) * 10;
    let scale = 1 + sin(t * 0.05) * 0.1;
    push();
    translate(width / 2, 200 + bobbing);
    scale(scale);
    fill(255, 255, 0);
    textSize(animTextSize);
    textAlign(CENTER, CENTER);
    text('🎉 完美滿分！🎉', 0, 0);
    pop();
  } else if (score === 2) {
    // 很好：上升文字
    let yOffset = -t * 1.5;
    if (yOffset > -height) {
      push();
      fill(200, 255, 100, 200 - abs(yOffset) / 2);
      textSize(animTextSize);
      textAlign(CENTER, CENTER);
      text('⭐ 表現優異！⭐', width / 2, 200 + yOffset);
      pop();
    }
  } else if (score === 1) {
    // 及格：溫暖鼓勵
    let pulse = sin(t * 0.05) * 20 + 30;
    push();
    fill(255, 150, 100, 200);
    textSize(animTextSize);
    textAlign(CENTER, CENTER);
    text('✨ 很好的努力！✨', width / 2, 200);
    pop();
  } else {
    // 不及格：柔和鼓勵
    let alpha = sin(t * 0.04) * 100 + 155;
    push();
    fill(200, 200, 255, alpha);
    textSize(animTextSize);
    textAlign(CENTER, CENTER);
    text('💪 加油！你可以的！', width / 2, 200);
    pop();
  }
  
  pop();
}

// 繪製星星
function drawStar(x, y, radius1, radius2, npoints) {
  let angle = TWO_PI / npoints;
  beginShape();
  for (let a = -PI / 2; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius2;
    let sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a + angle / 2) * radius1;
    sy = y + sin(a + angle / 2) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

// 繪製心形
function drawHeart(x, y, size) {
  beginShape();
  for (let t = 0; t < TWO_PI; t += 0.01) {
    let sx = 16 * sin(t) ** 3;
    let sy = 13 * cos(t) - 5 * cos(2 * t) - 2 * cos(3 * t) - cos(4 * t);
    vertex(x + sx * size / 32, y - sy * size / 32);
  }
  endShape(CLOSE);
}
