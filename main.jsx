import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaee6f8);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Свет
const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
light.position.set(0, 20, 0);
scene.add(light);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 7.5);
scene.add(dirLight);

const clock = new THREE.Clock();
let mixer;
let chickenModel;
let moveDirection = { left: false, right: false, forward: false };
let velocityY = 0;
let isJumping = false;
let isGameOver = false;

// Загрузка курицы
const loader = new GLTFLoader();
loader.load('/models/chicken.glb', (gltf) => {
  const model = gltf.scene;
  model.scale.set(1.5, 1.5, 1.5);
  model.position.y = 0;
  scene.add(model);
  chickenModel = model;

  mixer = new THREE.AnimationMixer(model);
  gltf.animations.forEach((clip) => {
    mixer.clipAction(clip).setEffectiveTimeScale(2.5).play();
  });
}, undefined, (error) => {
  console.error('Ошибка загрузки курицы:', error);
});

// Загрузка дороги
const roadTiles = [];
const roadTileCount = 10;
const roadSpacing = 5;

const gltfLoader = new GLTFLoader();
gltfLoader.load('/models/road.glb', (gltf) => {
  for (let i = 0; i < roadTileCount; i++) {
    const tile = gltf.scene.clone();
    tile.rotation.y = Math.PI / 2;
    tile.position.set(0, -1, -i * roadSpacing);
    tile.scale.set(1, 1, 1);
    scene.add(tile);
    roadTiles.push(tile);
  }
}, undefined, (error) => {
  console.error('Ошибка загрузки дороги:', error);
});

// Управление
document.addEventListener('keydown', (event) => {
  if (event.code === 'ArrowLeft') moveDirection.left = true;
  if (event.code === 'ArrowRight') moveDirection.right = true;
  if (event.code === 'ArrowUp' && !isJumping) {
    velocityY = 0.15;
    isJumping = true;
  }
});
document.addEventListener('keyup', (event) => {
  if (event.code === 'ArrowLeft') moveDirection.left = false;
  if (event.code === 'ArrowRight') moveDirection.right = false;
});

// Машины
let car1, car2;
loader.load('/models/car1.glb', (gltf) => {
  car1 = gltf.scene;
  car1.scale.set(20, 20, 20);
  car1.position.set(1.5, -0.75, -30);
  scene.add(car1);
}, undefined, (error) => {
  console.error('Ошибка загрузки car1:', error);
});

loader.load('/models/car2.glb', (gltf) => {
  car2 = gltf.scene;
  car2.scale.set(1, 1, 1);
  car2.position.set(-1.5, -1.1, -60);
  car2.rotation.y = Math.PI;
  scene.add(car2);
}, undefined, (error) => {
  console.error('Ошибка загрузки car2:', error);
});

// Препятствия
const obstacles = [];
const obstacleModels = [];
const lanes = [-1.5, 0, 1.5];

function spawnObstacle(model) {
  const clone = model.clone();
  clone.position.set(lanes[Math.floor(Math.random() * 3)], 0, -60 - Math.random() * 40);
  scene.add(clone);
  obstacles.push(clone);
}

// Загрузка препятствий
gltfLoader.load('/models/obstacle1.glb', (gltf) => {
  const model = gltf.scene;
  model.rotation.y = Math.PI / 2.2; // сильнее повернуть влево
  obstacleModels.push(model);
  spawnObstacle(model);
}, undefined, (error) => {
  console.error('Ошибка загрузки obstacle1:', error);
});

gltfLoader.load('/models/obstacle2.glb', (gltf) => {
  const model = gltf.scene;
  model.position.y = -4; // сильно опустить
  obstacleModels.push(model);
  spawnObstacle(model);
}, undefined, (error) => {
  console.error('Ошибка загрузки obstacle2:', error);
});

function resetGame() {
  location.reload();
}

function checkCollision(a, b) {
  const ab = new THREE.Box3().setFromObject(a);
  const bb = new THREE.Box3().setFromObject(b);
  return ab.intersectsBox(bb);
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
  if (isGameOver) return;

  if (chickenModel) {
    if (moveDirection.left) chickenModel.position.x = Math.max(-1.5, chickenModel.position.x - 0.05);
    if (moveDirection.right) chickenModel.position.x = Math.min(1.5, chickenModel.position.x + 0.05);

    // Прыжок
    chickenModel.position.y += velocityY;
    velocityY -= 0.01;
    if (chickenModel.position.y <= 0) {
      chickenModel.position.y = 0;
      velocityY = 0;
      isJumping = false;
    }

    // Столкновения
    [car1, car2, ...obstacles].forEach(obj => {
      if (obj && checkCollision(chickenModel, obj)) {
        isGameOver = true;
        setTimeout(resetGame, 1500);
      }
    });
  }

  // Дорога
  roadTiles.forEach(tile => {
    tile.position.z += 0.1;
    if (tile.position.z > 5) {
      tile.position.z -= roadTileCount * roadSpacing;
    }
  });

  // Машины
  if (car1) {
    car1.position.z += 0.2;
    if (car1.position.z > 5) {
      car1.position.z = -30 - Math.random() * 20;
      car1.position.x = lanes[Math.floor(Math.random() * 3)];
    }
  }

  if (car2) {
    car2.position.z += 0.25;
    if (car2.position.z > 5) {
      car2.position.z = -60 - Math.random() * 20;
      car2.position.x = lanes[Math.floor(Math.random() * 3)];
    }
  }

  // Препятствия движение
  obstacles.forEach(ob => {
    ob.position.z += 0.1;
    if (ob.position.z > 5) {
      scene.remove(ob);
      obstacles.splice(obstacles.indexOf(ob), 1);
      spawnObstacle(obstacleModels[Math.floor(Math.random() * obstacleModels.length)]);
    }
  });

  renderer.render(scene, camera);
}
animate();

// Ресайз
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
