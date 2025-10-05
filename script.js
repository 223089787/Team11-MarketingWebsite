const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');
const header = document.getElementById('header');

menuToggle.addEventListener('click', () => {
    nav.classList.toggle('open');
});

window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

const canvas = document.getElementById('padelGame');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startGame');
const resetBtn = document.getElementById('resetGame');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const bouncesElement = document.getElementById('bounces');
const levelElement = document.getElementById('level');

let gameRunning = false;
let countdownActive = false;
let countdownValue = 3;
let score = 0;
let highScore = localStorage.getItem('padelHighScore') || 0;
let totalBounces = 0;
let level = 1;
let animationId;
let countdownInterval;
let lastTime = 0; 

const paddle = {
    width: 100,
    height: 15,
    x: 0,
    speed: 8
};

const ball = {
    x: 0,
    y: 0,
    radius: 10,
    speedX: 1,
    speedY: 1,
    color: '#a3e635'
};

function resizeCanvas() {
    const container = canvas.parentElement;
    const containerWidth = container.clientWidth;
    
    canvas.width = Math.min(600, containerWidth - 40);
    canvas.height = 400 * (canvas.width / 600);
    
    if (!gameRunning && !countdownActive) {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        paddle.x = canvas.width / 2 - paddle.width / 2;
        paddle.width = Math.max(80, canvas.width / 6);
    }
}

function initGame() {
    resizeCanvas();
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    paddle.x = canvas.width / 2 - paddle.width / 2;
    paddle.width = Math.max(80, canvas.width / 6);
    

    const baseSpeed = Math.max(2, (canvas.width / 600) * 2.5);
    ball.speedX = baseSpeed;
    ball.speedY = baseSpeed;
    lastTime = 0; 
}

highScoreElement.textContent = highScore;

function drawPaddle() {
    ctx.fillStyle = '#7c3aed';
    ctx.fillRect(paddle.x, canvas.height - 30, paddle.width, paddle.height);
    ctx.fillStyle = '#8b5cf6';
    ctx.fillRect(paddle.x, canvas.height - 30, paddle.width, 5);
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

function drawNet() {
    ctx.strokeStyle = '#4a5568';
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawCountdown() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.min(48, canvas.width / 12)}px Poppins`;
    ctx.textAlign = 'center';
    ctx.fillText(countdownValue, canvas.width / 2, canvas.height / 2);
    
    ctx.font = `${Math.min(24, canvas.width / 25)}px Poppins`;
    ctx.fillText('Get ready!', canvas.width / 2, canvas.height / 2 + 40);
    
    ctx.textAlign = 'left';
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawNet();
    drawBall();
    drawPaddle();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = `${Math.min(16, canvas.width / 35)}px Poppins`;
    ctx.fillText(`Score: ${score}`, 10, 20);
    ctx.fillText(`Level: ${level}`, 10, 40);
}

function startCountdown() {
    countdownActive = true;
    countdownValue = 3;
    
    countdownInterval = setInterval(() => {
        countdownValue--;
        drawCountdown();
        
        if (countdownValue <= 0) {
            clearInterval(countdownInterval);
            countdownActive = false;
            gameRunning = true;
            requestAnimationFrame(updateGame);
        }
    }, 1000);
    
    drawCountdown();
}

function updateGame(timestamp) {
    if (!gameRunning) return;

    if (!lastTime) lastTime = timestamp;
    const delta = (timestamp - lastTime) / 16.67; 
    lastTime = timestamp;

    // Apply delta-based movement
    ball.x += ball.speedX * delta;
    ball.y += ball.speedY * delta;

    // Wall collisions
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.speedX = -ball.speedX;
        ball.x = Math.max(ball.radius, Math.min(canvas.width - ball.radius, ball.x));
    }

    if (ball.y - ball.radius < 0) {
        ball.speedY = -ball.speedY;
        ball.y = ball.radius;
    }

    // Paddle collision
    if (ball.y + ball.radius > canvas.height - 30 &&
        ball.y - ball.radius < canvas.height - 15 &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width) {
        
        const hitPos = (ball.x - paddle.x) / paddle.width;
        const angle = (hitPos - 0.5) * 1.5;
        
        ball.speedY = -Math.abs(ball.speedY);
        ball.speedX = ball.speedX + angle * 2;
        
        const maxSpeed = 15;
        ball.speedX = Math.max(-maxSpeed, Math.min(maxSpeed, ball.speedX));
        ball.speedY = Math.max(-maxSpeed, Math.min(maxSpeed, ball.speedY));
        
        score += 10;
        totalBounces++;
        
        if (totalBounces % 5 === 0) {
            level++;
            levelElement.textContent = level;
        
            const baseSpeed = Math.max(2, (canvas.width / 600) * 2.5);
            const speedMultiplier = Math.pow(1.25, level - 1);
        
            ball.speedX = Math.sign(ball.speedX) * baseSpeed * speedMultiplier;
            ball.speedY = -Math.abs(baseSpeed * speedMultiplier); 
        
            ball.color = '#fbbf24';
            setTimeout(() => {
                ball.color = '#a3e635';
            }, 100);
        }

        
        scoreElement.textContent = score;
        bouncesElement.textContent = totalBounces;
        
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('padelHighScore', highScore);
        }
    }

    // Game over
    if (ball.y + ball.radius > canvas.height) {
        gameOver();
        return;
    }

    drawGame();
    animationId = requestAnimationFrame(updateGame);
}

function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.min(32, canvas.width / 18)}px Poppins`;
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20);
    
    ctx.font = `${Math.min(24, canvas.width / 25)}px Poppins`;
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    
    ctx.textAlign = 'left';
}

function resetGame() {
    cancelAnimationFrame(animationId);
    clearInterval(countdownInterval);
    
    initGame();
    
    score = 0;
    totalBounces = 0;
    level = 1;
    countdownActive = false;
    gameRunning = false;
    
    scoreElement.textContent = score;
    bouncesElement.textContent = totalBounces;
    levelElement.textContent = level;
    
    drawGame();
}

function startGame() {
    if (gameRunning || countdownActive) return;
    
    resetGame();
    startCountdown();
}

startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);

// Paddle movement
canvas.addEventListener('mousemove', (e) => {
    if (!gameRunning && !countdownActive) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;
    paddle.x = mouseX - paddle.width / 2;
    
    paddle.x = Math.max(0, Math.min(canvas.width - paddle.width, paddle.x));
});

canvas.addEventListener('touchmove', (e) => {
    if (!gameRunning && !countdownActive) return;
    
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const touchX = (e.touches[0].clientX - rect.left) * scaleX;
    paddle.x = touchX - paddle.width / 2;
    
    paddle.x = Math.max(0, Math.min(canvas.width - paddle.width, paddle.x));
}, { passive: false });

canvas.addEventListener('touchstart', (e) => { if (e.target === canvas) e.preventDefault(); }, { passive: false });
canvas.addEventListener('touchend', (e) => { if (e.target === canvas) e.preventDefault(); }, { passive: false });

window.addEventListener('resize', () => {
    if (!gameRunning && !countdownActive) {
        initGame();
        drawGame();
    }
});

window.addEventListener('load', () => {
    initGame();
    drawGame();
});

canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
});



