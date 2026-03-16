let scene = new THREE.Scene();

let camera = new THREE.PerspectiveCamera(
75,
window.innerWidth/window.innerHeight,
0.1,
1000
);

let renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);

/* CAMERA */

camera.position.set(0,4,8);
camera.rotation.x=-0.45;

/* LIGHTS */

const light=new THREE.DirectionalLight(0xffffff,1);
light.position.set(10,20,10);
scene.add(light);

scene.add(new THREE.AmbientLight(0x555555));

/* ROAD */

const roadGeo=new THREE.PlaneGeometry(12,600);
const roadMat=new THREE.MeshPhongMaterial({color:0x222222});
const road=new THREE.Mesh(roadGeo,roadMat);

road.rotation.x=-Math.PI/2;
scene.add(road);

/* CITY BUILDINGS */

for(let i=0;i<80;i++){

let geo=new THREE.BoxGeometry(
Math.random()*4+3,
Math.random()*20+10,
Math.random()*4+3
);

let mat=new THREE.MeshPhongMaterial({color:0x333333});

let building=new THREE.Mesh(geo,mat);

building.position.z=-i*20;
building.position.x=(Math.random()<0.5?-10:10);

building.position.y=geo.parameters.height/2;

scene.add(building);

}

/* PLAYER CAR */

const carGeo=new THREE.BoxGeometry(1,0.5,2);
const carMat=new THREE.MeshPhongMaterial({color:0x00ff00});
const car=new THREE.Mesh(carGeo,carMat);

car.position.y=0.5;
scene.add(car);

/* GAME VARIABLES */

let speed=0;
let maxSpeed=0.8;

let velocityX=0;

let moveLeft=false;
let moveRight=false;
let accelerating=false;
let braking=false;

let drifting=false;
let nitro=false;

let score=0;

const scoreUI=document.getElementById("score");
const speedUI=document.getElementById("speed");

/* COINS */

let coins=[];

function spawnCoin(){

let geo=new THREE.CylinderGeometry(.3,.3,.1,16);
let mat=new THREE.MeshPhongMaterial({color:0xffd700});

let coin=new THREE.Mesh(geo,mat);

coin.rotation.x=Math.PI/2;

coin.position.z=-120;
coin.position.x=(Math.random()-0.5)*6;
coin.position.y=0.5;

scene.add(coin);

coins.push(coin);

}

/* POLICE */

let policeCars=[];
let flashTimer=0;

function spawnPolice(){

let geo=new THREE.BoxGeometry(1,0.5,2);
let mat=new THREE.MeshPhongMaterial({color:0x0000ff});

let police=new THREE.Mesh(geo,mat);

police.position.z=-120;
police.position.x=(Math.random()-0.5)*6;
police.position.y=0.5;

let red=new THREE.PointLight(0xff0000,2,5);
let blue=new THREE.PointLight(0x0000ff,2,5);

red.position.set(-.3,.6,0);
blue.position.set(.3,.6,0);

police.add(red);
police.add(blue);

scene.add(police);

policeCars.push(police);

}

/* DRIFT SMOKE */

let smoke=[];

function spawnSmoke(){

let geo=new THREE.SphereGeometry(.2,8,8);
let mat=new THREE.MeshBasicMaterial({
color:0xaaaaaa,
transparent:true,
opacity:.6
});

let s=new THREE.Mesh(geo,mat);

s.position.copy(car.position);
s.position.y=.2;

scene.add(s);

smoke.push(s);

}

/* EXPLOSION */

function explode(){

let geo=new THREE.SphereGeometry(2,16,16);
let mat=new THREE.MeshBasicMaterial({color:0xff0000});

let boom=new THREE.Mesh(geo,mat);

boom.position.copy(car.position);

scene.add(boom);

setTimeout(()=>{

scene.remove(boom);

},500);

}

/* CONTROLS */

document.addEventListener("keydown",e=>{

if(e.key==="a"||e.key==="ArrowLeft") moveLeft=true;
if(e.key==="d"||e.key==="ArrowRight") moveRight=true;

if(e.key==="w") accelerating=true;
if(e.key==="s") braking=true;

if(e.key==="c") drifting=!drifting;

if(e.key==="Shift") nitro=true;

});

document.addEventListener("keyup",e=>{

if(e.key==="a"||e.key==="ArrowLeft") moveLeft=false;
if(e.key==="d"||e.key==="ArrowRight") moveRight=false;

if(e.key==="w") accelerating=false;
if(e.key==="s") braking=false;

if(e.key==="Shift") nitro=false;

});

/* MOBILE */

document.getElementById("left").ontouchstart=()=>moveLeft=true;
document.getElementById("left").ontouchend=()=>moveLeft=false;

document.getElementById("right").ontouchstart=()=>moveRight=true;
document.getElementById("right").ontouchend=()=>moveRight=false;

/* LEADERBOARD */

function updateLeaderboard(){

let scores=JSON.parse(localStorage.getItem("scores")||"[]");

scores.push(score);

scores.sort((a,b)=>b-a);

scores=scores.slice(0,5);

localStorage.setItem("scores",JSON.stringify(scores));

document.getElementById("leaderboard").innerHTML=
"<h3>Leaderboard</h3>"+scores.map(s=>"<div>"+s+"</div>").join("");

}

/* GAME LOOP */

function animate(){

requestAnimationFrame(animate);

/* SPEED */

if(accelerating) speed+=0.01;
if(braking) speed-=0.02;

speed=Math.max(0,Math.min(maxSpeed,speed));

if(nitro) speed+=0.02;

/* ROAD MOVE */

road.position.z+=speed*5;

/* DRIFT PHYSICS */

let turnSpeed=drifting?.08:.15;
let friction=drifting?.95:.7;

if(moveLeft) velocityX-=turnSpeed;
if(moveRight) velocityX+=turnSpeed;

velocityX*=friction;

car.position.x+=velocityX;

/* CAR ROTATION */

car.rotation.y = -velocityX*1.5;

/* DRIFT SMOKE */

if(drifting && Math.random()<0.3){

spawnSmoke();

}

smoke.forEach((s,i)=>{

s.scale.multiplyScalar(1.02);

s.material.opacity*=0.96;

if(s.material.opacity<.05){

scene.remove(s);
smoke.splice(i,1);

}

});

/* COINS */

coins.forEach((coin,i)=>{

coin.position.z+=speed*10;
coin.rotation.z+=.1;

if(coin.position.distanceTo(car.position)<1){

scene.remove(coin);
coins.splice(i,1);

score+=10;

}

});

/* POLICE */

policeCars.forEach((p,i)=>{

p.position.z+=speed*10;

flashTimer+=.1;

p.children[0].intensity=Math.sin(flashTimer)>0?2:0;
p.children[1].intensity=Math.sin(flashTimer)<0?2:0;

if(p.position.distanceTo(car.position)<1){

explode();

updateLeaderboard();

alert("Game Over");

location.reload();

}

});

/* SPAWN */

if(Math.random()<0.02) spawnCoin();
if(Math.random()<0.01) spawnPolice();

/* UI */

scoreUI.innerText="Score: "+score;
speedUI.innerText="Speed: "+Math.floor(speed*200);

renderer.render(scene,camera);

}

animate();
