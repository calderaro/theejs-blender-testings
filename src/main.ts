import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Timer } from "three/addons/misc/Timer.js";

const timer = new Timer();
const keys = new Set<string>();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.castShadow = true;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Create the scene.
scene.background = new THREE.Color(0xccddff);
scene.fog = new THREE.Fog(0xccddff, 500, 2000);

// Ambient lights.
var ambient = new THREE.AmbientLight(0xffffff);
scene.add(ambient);

// Add hemisphere lighting.
var hemisphereLight = new THREE.HemisphereLight(0xdddddd, 0x000000, 0.5);
scene.add(hemisphereLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 100, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 8192 * 2;
directionalLight.shadow.mapSize.height = 8192 * 2;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 400000000;
directionalLight.shadow.radius = 2;
directionalLight.shadow.camera.top = directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.bottom = directionalLight.shadow.camera.left =
  -100;
scene.add(directionalLight);

// Add a helper to visualize the direction of the light
const helper = new THREE.DirectionalLightHelper(directionalLight, 10);
scene.add(helper);

const pivot = new THREE.Object3D();
pivot.position.set(0, 50, 50);

const yaw = new THREE.Object3D();
const pitch = new THREE.Object3D();

scene.add(pivot);
pivot.add(yaw);
yaw.add(pitch);
pitch.add(camera);

const box = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
);
scene.add(box);

// Load GLTF model
let model: THREE.Group<THREE.Object3DEventMap> | null = null;
const loader = new GLTFLoader();
loader.load(
  "char04.glb",
  (gltf) => {
    gltf.scene.traverse(function (model) {
      if (model.isObject3D) {
        model.castShadow = true;
      }
    });

    scene.add(gltf.scene);
    model = gltf.scene;
  },
  undefined,
  (error) => {
    console.error(error);
  }
);

// Load GLTF model
let sword: THREE.Group<THREE.Object3DEventMap> | null = null;
loader.load(
  "sword03.glb",
  (gltf) => {
    console.log(gltf);
    scene.add(gltf.scene);

    gltf.scene.traverse(function (model) {
      if (model.isObject3D) {
        model.castShadow = true;
      }
    });

    sword = gltf.scene;
    sword.position.x = 5;
    sword.position.y = 8;
    sword.position.z = 6;
  },
  undefined,
  (error) => {
    console.error(error);
  }
);

// Load GLTF model
let axe: THREE.Group<THREE.Object3DEventMap> | null = null;
loader.load(
  "axe01.glb",
  (gltf) => {
    gltf.scene.traverse(function (model) {
      if (model.isObject3D) {
        model.castShadow = true;
      }
    });

    console.log(gltf);
    scene.add(gltf.scene);

    axe = gltf.scene;
    axe.position.x = -5;
    axe.position.y = 5;
  },
  undefined,
  (error) => {
    console.error(error);
  }
);

createCube();
createFloor();
createShadowFloor();

let x = 10;

const v = new THREE.Vector3();
const inputVelocity = new THREE.Vector3();
const euler = new THREE.Euler();
const quaternion = new THREE.Quaternion();
const tempObject = new THREE.Object3D();

// Animation loop
function animate(timestamp: number) {
  requestAnimationFrame(animate);
  // timestamp is optional
  timer.update(timestamp);
  const delta = timer.getDelta();

  sword?.rotateY(0.01);
  sword?.rotateZ(0.01);

  axe?.rotateY(0.01);
  axe?.rotateZ(0.01);

  inputVelocity.set(0, 0, 0);

  if (model) {
    if (keys.has("w")) {
      inputVelocity.z = -20 * delta;
    }
    if (keys.has("s")) {
      inputVelocity.z = 20 * delta;
    }
    if (keys.has("a")) {
      inputVelocity.x = -20 * delta;
    }
    if (keys.has("d")) {
      inputVelocity.x = 20 * delta;
    }

    // apply camera rotation to inputVelocity
    euler.y = yaw.rotation.y;
    quaternion.setFromEuler(euler);
    inputVelocity.applyQuaternion(quaternion);

    const dir = inputVelocity.clone().dot(inputVelocity);

    if (dir) {
      tempObject.position.copy(model.position);
      tempObject.lookAt(model.position.clone().add(inputVelocity));
    }

    model.quaternion.rotateTowards(tempObject.quaternion, 0.25);

    model.position.add(inputVelocity);
    model.getWorldPosition(v);

    box.position.lerp(v, 0.1);
    pivot.position.lerp(v, 0.3);
    camera.position.lerp(new THREE.Vector3(0, 3, x), 0.1);
  }

  renderer.render(scene, camera);
}

animate(0);

window.addEventListener("keydown", (e) => {
  keys.add(e.key);

  if (e.key === "x") {
    if (sword) {
      sword.position.y = 0;
    }
  }
});

window.addEventListener("keyup", (e) => {
  keys.delete(e.key);
});

let down = false;

window.addEventListener(
  "mousedown",
  () => {
    down = true;
  },
  false
);

window.addEventListener(
  "mouseup",
  () => {
    down = false;
  },
  false
);

window.addEventListener(
  "mousemove",
  (e) => {
    if (down) {
      yaw.rotation.y -= e.movementX * 0.003;
      const v = pitch.rotation.x - e.movementY * 0.002;
      if (v > -1 && v < 0.1) {
        pitch.rotation.x = v;
      }
    }
  },
  false
);

window.addEventListener("wheel", (e) => {
  const v = x - e.deltaY * 0.05;
  if (v >= 1 && v <= 40) {
    x = v;
  }

  // const v = camera.position.z - e.deltaY * 0.05;
  // if (v >= 1 && v <= 40) {
  //   camera.position.z = v;
  // }

  return false;
});

function createFloor() {
  let geometry = new THREE.PlaneGeometry(100000, 100000);
  let material = new THREE.MeshBasicMaterial({ color: 0x336633 });
  let plane = new THREE.Mesh(geometry, material);
  plane.rotation.x = (-1 * Math.PI) / 2;
  plane.position.y = 0;
  scene.add(plane);
  // objects.push( plane );
}

function createShadowFloor() {
  let geometry = new THREE.PlaneGeometry(100000, 100000);
  let material = new THREE.ShadowMaterial({ color: 0x000000 });
  let plane = new THREE.Mesh(geometry, material);
  plane.rotation.x = (-1 * Math.PI) / 2;
  plane.position.y = 0;
  plane.receiveShadow = true;
  plane.material.opacity = 0.1;
  scene.add(plane);
  // objects.push( plane );
}

function createCube() {
  let geometry = new THREE.BoxGeometry(10, 10, 10);
  let material = new THREE.MeshToonMaterial({ color: 0xff0000 });
  let plane = new THREE.Mesh(geometry, material);
  plane.position.y = 10;
  plane.position.z = -20;

  plane.receiveShadow = true;
  plane.castShadow = false;
  scene.add(plane);
  // objects.push( plane );
}
