
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaee6f8);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
scene.add(light);

const loader = new GLTFLoader();

function loadModel(path, position = [0, 0, 0], scale = 1) {
  loader.load(path, (gltf) => {
    const model = gltf.scene;
    model.position.set(...position);
    model.scale.set(scale, scale, scale);
    scene.add(model);
  });
}

// Примеры загрузки (замени на свои модели)
loadModel('/models/road.glb', [0, -1, 0], 1);
loadModel('/models/car1.glb', [-2, -1, -10], 1);
loadModel('/models/car2.glb', [2, -1, -15], 1);
loadModel('/models/barrier1.glb', [-1.5, -1, -5], 0.8);
loadModel('/models/barrier2.glb', [1.5, -1, -8], 0.8);

const controls = new OrbitControls(camera, renderer.domElement);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
