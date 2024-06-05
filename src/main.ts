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

// Add a cube at the center
const geometry = new THREE.BoxGeometry(1, 2);
const material = new THREE.MeshStandardMaterial({ color: 0x0077ff });
const cube = new THREE.Mesh(geometry, material);

// Load GLTF model
let model: THREE.Group<THREE.Object3DEventMap> | null = null;
const loader = new GLTFLoader();
loader.load(
  "mug.glb",
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

// Load GLTF model
let model2: THREE.Group<THREE.Object3DEventMap> | null = null;
const loader2 = new GLTFLoader();
loader.load(
  "test1.gltf",
  (gltf) => {
    console.log(gltf);
    scene.add(gltf.scene);

    renderer.render(scene, camera);
    model2 = gltf.scene;
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
  model?.rotateY(0.1);
  model?.rotateZ(0.1);
  model?.rotateX(0.1);
  
}

animate();
