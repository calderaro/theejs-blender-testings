import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// Load GLTF model
let model: THREE.Group<THREE.Object3DEventMap> | null = null;
const loader = new GLTFLoader();
loader.load(
  "char02.glb",
  (gltf) => {
    console.log(gltf);
    scene.add(gltf.scene);

    renderer.render(scene, camera);
    model = gltf.scene;
  },
  undefined,
  (error) => {
    console.error(error);
  }
);


// Add a light
const light = new THREE.AmbientLight(0x404040); // soft white light
scene.add(light);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Add a camera position
camera.position.z = 10;

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  model?.rotateY(0.01);
  model?.rotateZ(0.01);
  model?.rotateX(0.01);
  
}

animate();
