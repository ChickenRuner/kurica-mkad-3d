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

// Переменные
const clock = new THREE.Clock();
let mixer;
let chickenModel;
let moveDirection = { left: false, right: false, forward: false };

// Загрузка модели
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
  console.error('Ошибка загрузки модели:', error);
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

// Дорога
const roadTiles = [];
const roadTileLength = 5;
const roadTileCount = 10;

const roadGeometry = new THREE.BoxGeometry(4, 0.1, roadTileLength);
const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });

for (let i = 0; i < roadTileCount; i++) {
  const tile = new THREE.Mesh(roadGeometry, roadMaterial);
  tile.position.z = -i * roadTileLength;
  tile.position.y = -1;
  scene.add(tile);
  roadTiles.push(tile);
}

// Анимация
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);

  if (chickenModel) {
    if (moveDirection.left) chickenModel.position.x -= 0.05;
    if (moveDirection.right) chickenModel.position.x += 0.05;
  }

  // Бесконечная дорога
  roadTiles.forEach(tile => {
    tile.position.z += 0.1;
    if (tile.position.z > 5) {
      tile.position.z -= roadTileCount * roadTileLength;
    }
  });

  renderer.render(scene, camera);
}
animate();

// Обработка ресайза
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});