const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

let player;
let enemies = [];
let keys = {};
let score = 0;
let gameSpeed = 3;
let gameRunning = false;
let roadOffset = 0;

/* PLAYER */
function createPlayer() {
return {
x: canvas.width / 2 - 20,
y: canvas.height - 100,
width: 40,
height: 70,
speed: 6
};
}

/* SPAWN ENEMY */
function spawnEnemy() {

const lane = Math.floor(Math.random() * 3);
const laneWidth = canvas.width / 3;

enemies.push({
x: lane * laneWidth + laneWidth/2 - 20,
y: -80,
width: 40,
height: 70
});

}

/* DRAW ROAD */
function drawRoad() {

ctx.fillStyle = "#555";
ctx.fillRect(0,0,canvas.width,canvas.height);

ctx.strokeStyle = "white";
ctx.lineWidth = 5;
ctx.setLineDash([20,20]);

roadOffset += gameSpeed;
ctx.lineDashOffset = -roadOffset;

ctx.beginPath();
ctx.moveTo(canvas.width/3,0);
ctx.lineTo(canvas.width/3,canvas.height);
ctx.stroke();

ctx.beginPath();
ctx.moveTo(canvas.width/3*2,0);
ctx.lineTo(canvas.width/3*2,canvas.height);
ctx.stroke();

ctx.setLineDash([]);

}

/* DRAW CAR */
function drawCar(car,color){
ctx.fillStyle = color;
ctx.fillRect(car.x,car.y,car.width,car.height);
}

/* COLLISION */
function isColliding(a,b){
return (
a.x < b.x + b.width &&
a.x + a.width > b.x &&
a.y < b.y + b.height &&
a.y + a.height > b.y
);
}

/* GAME LOOP */
function update(){

if(!gameRunning) return;

ctx.clearRect(0,0,canvas.width,canvas.height);

drawRoad();

/* PLAYER MOVEMENT */

if(keys["ArrowLeft"] || keys["a"]) player.x -= player.speed;
if(keys["ArrowRight"] || keys["d"]) player.x += player.speed;

player.x = Math.max(0, Math.min(canvas.width-player.width, player.x));

drawCar(player,"lime");

/* ENEMIES */

for(let i=0;i<enemies.length;i++){

enemies[i].y += gameSpeed;

drawCar(enemies[i],"red");

if(isColliding(player,enemies[i])){
endGame();
}

if(enemies[i].y > canvas.height){
enemies.splice(i,1);
score++;
document.getElementById("score").innerText = score;
}

}

/* SPAWN NEW ENEMY */

if(Math.random() < 0.02){
spawnEnemy();
}

/* INCREASE DIFFICULTY */

gameSpeed += 0.0005;

requestAnimationFrame(update);

}

/* START GAME */

function startGame(){

player = createPlayer();
enemies = [];
score = 0;
gameSpeed = 3;

gameRunning = true;

document.getElementById("score").innerText = score;

document.getElementById("menu").classList.add("hidden");
document.getElementById("gameOver").classList.add("hidden");

update();

}

/* GAME OVER */

function endGame(){

gameRunning = false;

document.getElementById("finalScore").innerText = score;
document.getElementById("gameOver").classList.remove("hidden");

}

/* BUTTONS */

startBtn.onclick = startGame;
restartBtn.onclick = startGame;

/* CONTROLS */

document.addEventListener("keydown",(e)=>{
keys[e.key] = true;
});

document.addEventListener("keyup",(e)=>{
keys[e.key] = false;
});
