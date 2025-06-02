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
  if (event.code === 'ArrowUp') moveDirection.forward = true;
});
document.addEventListener('keyup', (event) => {
  if (event.code === 'ArrowLeft') moveDirection.left = false;
  if (event.code === 'ArrowRight') moveDirection.right = false;
  if (event.code === 'ArrowUp') moveDirection.forward = false;
});

// Машины
let car1, car2;

// Машина 1 (возвращаю как ты настраивал)
loader.load('/models/car1.glb', (gltf) => {
  car1 = gltf.scene;
  car1.scale.set(20, 20, 20); // как ты сам сделал
  car1.position.set(1.5, -0.75, -30); // как было у тебя
  scene.add(car1);
}, undefined, (error) => {
  console.error('Ошибка загрузки car1:', error);
});

// Машина 2 (аккуратно настраиваю)
loader.load('/models/car2.glb', (gltf) => {
  car2 = gltf.scene;
  car2.scale.set(20, 20, 20); // тот же масштаб, чтобы были одинаковые
  car2.position.set(-1.5, -0.75, -60); // та же высота, как у car1
  // НЕ вращаю, если она уже смотрит вперёд
  scene.add(car2);
}, undefined, (error) => {
  console.error('Ошибка загрузки car2:', error);
});

// Анимация
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);

  // Курица
  if (chickenModel) {
    if (moveDirection.left) chickenModel.position.x -= 0.05;
    if (moveDirection.right) chickenModel.position.x += 0.05;
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
      car1.position.z = -30;
    }
  }

  if (car2) {
    car2.position.z += 0.25;
    if (car2.position.z > 5) {
      car2.position.z = -60;
    }
  }

  renderer.render(scene, camera);
}
animate();

// Ресайз
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});



