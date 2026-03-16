let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(
75,
window.innerWidth / window.innerHeight,
0.1,
1000
);

let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = 5;
camera.position.y = 3;
camera.rotation.x = -0.5;

let roadSpeed = 0.3;
let score = 0;

const scoreUI = document.getElementById("score");

/* LIGHT */

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7);
scene.add(light);

/* ROAD */

const roadGeo = new THREE.PlaneGeometry(10, 200);
const roadMat = new THREE.MeshPhongMaterial({ color: 0x333333 });
const road = new THREE.Mesh(roadGeo, roadMat);

road.rotation.x = -Math.PI / 2;
scene.add(road);

/* PLAYER CAR */

const carGeo = new THREE.BoxGeometry(1, 0.5, 2);
const carMat = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
const car = new THREE.Mesh(carGeo, carMat);

car.position.y = 0.5;
scene.add(car);

/* COINS */

let coins = [];

function spawnCoin() {

const geo = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
const mat = new THREE.MeshPhongMaterial({ color: 0xffff00 });

let coin = new THREE.Mesh(geo, mat);

coin.rotation.x = Math.PI / 2;
coin.position.z = -100;
coin.position.x = (Math.random() - 0.5) * 6;
coin.position.y = 0.5;

scene.add(coin);
coins.push(coin);

}

/* POLICE CARS */

let policeCars = [];

function spawnPolice() {

const geo = new THREE.BoxGeometry(1, 0.5, 2);
const mat = new THREE.MeshPhongMaterial({ color: 0x0000ff });

let police = new THREE.Mesh(geo, mat);

police.position.z = -100;
police.position.x = (Math.random() - 0.5) * 6;
police.position.y = 0.5;

scene.add(police);
policeCars.push(police);

}

/* EXPLOSION */

function explode() {

const geo = new THREE.SphereGeometry(2, 16, 16);
const mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });

let boom = new THREE.Mesh(geo, mat);

boom.position.copy(car.position);

scene.add(boom);

setTimeout(() => {
scene.remove(boom);
}, 500);

}

/* CONTROLS */

let moveLeft = false;
let moveRight = false;

let drifting = false;
let velocityX = 0;

/* KEYBOARD */

document.addEventListener("keydown", e => {

if (e.key === "ArrowLeft" || e.key === "a") moveLeft = true;
if (e.key === "ArrowRight" || e.key === "d") moveRight = true;

/* DRIFT TOGGLE */

if (e.key === "c") {
drifting = !drifting;
}

});

document.addEventListener("keyup", e => {

if (e.key === "ArrowLeft" || e.key === "a") moveLeft = false;
if (e.key === "ArrowRight" || e.key === "d") moveRight = false;

});

/* MOBILE CONTROLS */

document.getElementById("left").ontouchstart = () => moveLeft = true;
document.getElementById("left").ontouchend = () => moveLeft = false;

document.getElementById("right").ontouchstart = () => moveRight = true;
document.getElementById("right").ontouchend = () => moveRight = false;

/* GAME LOOP */

function animate() {

requestAnimationFrame(animate);

road.position.z += roadSpeed;

/* DRIFT PHYSICS */

let turnSpeed = drifting ? 0.08 : 0.15;
let friction = drifting ? 0.95 : 0.7;

if (moveLeft) velocityX -= turnSpeed;
if (moveRight) velocityX += turnSpeed;

velocityX *= friction;

car.position.x += velocityX;

/* COINS */

coins.forEach((coin, i) => {

coin.position.z += roadSpeed * 5;
coin.rotation.z += 0.1;

if (coin.position.distanceTo(car.position) < 1) {

scene.remove(coin);
coins.splice(i, 1);

score += 10;
scoreUI.innerText = score;

}

});

/* POLICE */

policeCars.forEach((p, i) => {

p.position.z += roadSpeed * 5;

if (p.position.distanceTo(car.position) < 1) {

explode();
alert("Game Over");

location.reload();

}

});

/* SPAWN */

if (Math.random() < 0.02) spawnCoin();
if (Math.random() < 0.01) spawnPolice();

renderer.render(scene, camera);

}

animate();
