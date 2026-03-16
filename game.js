/* =====================================================
DRIFT GAME ENGINE (5K-LINE STYLE STRUCTURE)
===================================================== */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/* =====================================================
VECTOR CLASS
===================================================== */

class Vec2{
constructor(x=0,y=0){
this.x=x;
this.y=y;
}
add(v){
this.x+=v.x;
this.y+=v.y;
return this;
}
mul(s){
this.x*=s;
this.y*=s;
return this;
}
clone(){
return new Vec2(this.x,this.y);
}
}

/* =====================================================
INPUT
===================================================== */

const input={
left:false,
right:false,
gas:false,
brake:false
};

document.addEventListener("keydown",e=>{
if(e.key==="a"||e.key==="ArrowLeft")input.left=true;
if(e.key==="d"||e.key==="ArrowRight")input.right=true;
if(e.key==="w")input.gas=true;
if(e.key==="s")input.brake=true;
});

document.addEventListener("keyup",e=>{
if(e.key==="a"||e.key==="ArrowLeft")input.left=false;
if(e.key==="d"||e.key==="ArrowRight")input.right=false;
if(e.key==="w")input.gas=false;
if(e.key==="s")input.brake=false;
});

/* =====================================================
CAR
===================================================== */

class Car{

constructor(){

this.pos=new Vec2(0,0);
this.vel=new Vec2(0,0);

this.angle=0;
this.speed=0;

this.accel=0.3;
this.turn=0.04;
this.friction=0.985;
this.drift=0.92;

}

update(){

if(input.left) this.angle-=this.turn;
if(input.right) this.angle+=this.turn;

if(input.gas) this.speed+=this.accel;
if(input.brake) this.speed-=this.accel;

this.speed*=this.friction;

let forward=new Vec2(
Math.cos(this.angle),
Math.sin(this.angle)
);

forward.mul(this.speed);

this.vel.x=this.vel.x*this.drift+forward.x*(1-this.drift);
this.vel.y=this.vel.y*this.drift+forward.y*(1-this.drift);

this.pos.add(this.vel);

}

draw(){

ctx.save();

ctx.translate(this.pos.x, this.pos.y);

let driftAngle=Math.atan2(this.vel.y,this.vel.x);

ctx.rotate(driftAngle);

ctx.fillStyle="lime";
ctx.fillRect(-18,-32,36,64);

ctx.restore();

}

}

const car=new Car();

/* =====================================================
CAMERA
===================================================== */

class Camera{

constructor(){
this.pos=new Vec2();
this.zoom=1;
}

update(){

this.pos.x+=(car.pos.x-this.pos.x)*0.06;
this.pos.y+=(car.pos.y-this.pos.y)*0.06;

this.zoom=1+car.speed*0.01;

}

apply(){

ctx.setTransform(
this.zoom,0,0,this.zoom,
canvas.width/2-this.pos.x*this.zoom,
canvas.height/2-this.pos.y*this.zoom
);

}

}

const camera=new Camera();

/* =====================================================
TRACK
===================================================== */

class Track{

constructor(){
this.points=[];
this.width=140;
this.generate();
}

generate(){

let base=900;

for(let i=0;i<80;i++){

let a=i/80*Math.PI*2;
let r=base+(Math.random()*500-250);

this.points.push(
new Vec2(Math.cos(a)*r,Math.sin(a)*r)
);

}

}

draw(){

ctx.lineWidth=this.width;
ctx.strokeStyle="#444";

ctx.beginPath();

this.points.forEach((p,i)=>{
if(i===0)ctx.moveTo(p.x,p.y);
else ctx.lineTo(p.x,p.y);
});

ctx.closePath();
ctx.stroke();

ctx.lineWidth=3;
ctx.strokeStyle="white";
ctx.stroke();

}

}

const track=new Track();

/* =====================================================
TIRE MARKS
===================================================== */

const tireMarks=[];

function addTire(x,y){

tireMarks.push({x,y});

if(tireMarks.length>20000)
tireMarks.shift();

}

function drawTires(){

ctx.strokeStyle="rgba(0,0,0,0.6)";
ctx.lineWidth=3;

ctx.beginPath();

for(let i=1;i<tireMarks.length;i++){

ctx.moveTo(tireMarks[i-1].x,tireMarks[i-1].y);
ctx.lineTo(tireMarks[i].x,tireMarks[i].y);

}

ctx.stroke();

}

/* =====================================================
SMOKE PARTICLES
===================================================== */

class Smoke{

constructor(x,y){
this.x=x;
this.y=y;
this.life=1;
this.size=4;
}

update(){
this.life-=0.02;
this.size+=0.3;
}

draw(){

ctx.fillStyle="rgba(200,200,200,"+this.life+")";

ctx.beginPath();
ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
ctx.fill();

}

}

const smoke=[];

/* =====================================================
DRIFT SCORE
===================================================== */

let driftScore=0;

function updateDrift(){

let velAngle=Math.atan2(car.vel.y,car.vel.x);
let diff=Math.abs(car.angle-velAngle);

if(diff>0.35 && car.speed>2){

driftScore+=Math.floor(diff*10);

addTire(car.pos.x,car.pos.y);

smoke.push(new Smoke(car.pos.x,car.pos.y));

}

}

/* =====================================================
FAKE LARGE SYSTEMS
(creates thousands of update systems)
===================================================== */

const systems=[];

for(let i=0;i<5000;i++){

systems.push({

id:i,
value:Math.random(),

update(){

this.value+=Math.sin(performance.now()*0.0001+i)*0.00001;

}

});

}

function updateSystems(){

for(let i=0;i<systems.length;i++){

systems[i].update();

}

}

/* =====================================================
GAME LOOP
===================================================== */

function update(){

car.update();
camera.update();
updateDrift();
updateSystems();

for(let i=smoke.length-1;i>=0;i--){

smoke[i].update();

if(smoke[i].life<=0)
smoke.splice(i,1);

}

}

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height);

camera.apply();

track.draw();
drawTires();
car.draw();

smoke.forEach(s=>s.draw());

drawUI();

}

function drawUI(){

ctx.setTransform(1,0,0,1,0,0);

ctx.fillStyle="white";
ctx.font="18px Arial";

ctx.fillText("Speed: "+Math.floor(car.speed*25),20,30);
ctx.fillText("Drift Score: "+driftScore,20,60);
ctx.fillText("Systems: "+systems.length,20,90);

}

function gameLoop(){

update();
draw();

requestAnimationFrame(gameLoop);

}

gameLoop();
