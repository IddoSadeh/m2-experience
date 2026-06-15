import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";

const assets = {
  "chip-glb": {
    label: "Chip.glb",
    type: "glb",
    path: "3d_Models/GLTF/CHIP.glb",
  },
  "glass-glb": {
    label: "Glass.glb",
    type: "glb",
    path: "3d_Models/GLTF/GLASS.glb",
  },
  "metal-glb": {
    label: "Metal ring.glb",
    type: "glb",
    path: "3d_Models/GLTF/METAL_RING.glb",
  },
  "chip-obj": {
    label: "Chip.obj + Chip.mtl",
    type: "obj",
    path: "3d_Models/OBJ/Chip.obj",
    materialPath: "3d_Models/OBJ/Chip.mtl",
  },
  "glass-obj": {
    label: "Glass.obj + Glass.mtl",
    type: "obj",
    path: "3d_Models/OBJ/Glass.obj",
    materialPath: "3d_Models/OBJ/Glass.mtl",
  },
  "metal-obj": {
    label: "Metal_ring.obj + Metal_ring.mtl",
    type: "obj",
    path: "3d_Models/OBJ/Metal_ring.obj",
    materialPath: "3d_Models/OBJ/Metal_ring.mtl",
  },
};

const canvas = document.querySelector("#model-canvas");
const statusText = document.querySelector("#model-status");
const modelSelect = document.querySelector("#model-select");
const backgroundSelect = document.querySelector("#background-select");
const colorOutput = document.querySelector("#color-output");
const toneMapping = document.querySelector("#tone-mapping");
const autoRotate = document.querySelector("#auto-rotate");
const normalizeModelToggle = document.querySelector("#normalize-model");
const wireframe = document.querySelector("#wireframe");
const resetCamera = document.querySelector("#reset-camera");
const lightHemi = document.querySelector("#light-hemi");
const lightKey = document.querySelector("#light-key");
const lightFill = document.querySelector("#light-fill");
const materialOverride = document.querySelector("#material-override");
const materialRoughness = document.querySelector("#material-roughness");
const materialMetalness = document.querySelector("#material-metalness");
const materialOpacity = document.querySelector("#material-opacity");

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 100);
const controls = new OrbitControls(camera, renderer.domElement);
const gltfLoader = new GLTFLoader();
const mtlLoader = new MTLLoader();
const objLoader = new OBJLoader();

let currentModel = null;
let currentLoadId = 0;

renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

controls.enableDamping = true;
controls.autoRotateSpeed = 1.2;

const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x303030, Number(lightHemi.value));
scene.add(hemisphereLight);

const keyLight = new THREE.DirectionalLight(0xffffff, Number(lightKey.value));
keyLight.position.set(3, 4, 5);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffffff, Number(lightFill.value));
fillLight.position.set(-4, -1, 3);
scene.add(fillLight);

const resizeObserver = new ResizeObserver(sizeRenderer);
resizeObserver.observe(canvas.parentElement);

modelSelect.addEventListener("change", () => loadSelectedModel());
backgroundSelect.addEventListener("change", applyBackground);
colorOutput.addEventListener("change", applyRenderSettings);
toneMapping.addEventListener("change", applyRenderSettings);
normalizeModelToggle.addEventListener("change", () => loadSelectedModel());
wireframe.addEventListener("change", () => setWireframe(wireframe.checked));
resetCamera.addEventListener("click", () => frameModel(currentModel));
lightHemi.addEventListener("input", applyLighting);
lightKey.addEventListener("input", applyLighting);
lightFill.addEventListener("input", applyLighting);
materialOverride.addEventListener("change", updateMaterialControls);
materialRoughness.addEventListener("input", applyMaterialOverride);
materialMetalness.addEventListener("input", applyMaterialOverride);
materialOpacity.addEventListener("input", applyMaterialOverride);

applyBackground();
applyRenderSettings();
applyLighting();
updateMaterialControls();
loadSelectedModel();
renderer.setAnimationLoop(render);

function render() {
  controls.autoRotate = autoRotate.checked;
  controls.update();
  renderer.render(scene, camera);
}

async function loadSelectedModel() {
  const loadId = ++currentLoadId;
  const asset = assets[modelSelect.value];

  setStatus(`Loading ${asset.label}...`);
  clearCurrentModel();

  try {
    const model = asset.type === "glb" ? await loadGlb(asset.path) : await loadObjWithMtl(asset);

    if (loadId !== currentLoadId) return;

    currentModel = model;

    if (normalizeModelToggle.checked) {
      normalizeModel(currentModel);
    } else {
      centerModel(currentModel);
    }

    scene.add(currentModel);
    setWireframe(wireframe.checked);
    applyMaterialOverride();
    frameModel(currentModel);
    setStatus(`${asset.label} loaded`);
  } catch (error) {
    console.error(error);
    setStatus(`Could not load ${asset.label}`);
  }
}

async function loadGlb(path) {
  const gltf = await gltfLoader.loadAsync(path);

  return gltf.scene;
}

async function loadObjWithMtl(asset) {
  const materials = await mtlLoader.loadAsync(asset.materialPath);

  materials.preload();
  objLoader.setMaterials(materials);

  return objLoader.loadAsync(asset.path);
}

function clearCurrentModel() {
  if (!currentModel) return;

  scene.remove(currentModel);
  currentModel.traverse((child) => {
    if (!child.isMesh) return;

    child.geometry?.dispose();
  });
  currentModel = null;
}

function normalizeModel(model) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxAxis = Math.max(size.x, size.y, size.z) || 1;

  model.position.sub(center);
  model.scale.setScalar(2.6 / maxAxis);
}

function centerModel(model) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());

  model.position.sub(center);
}

function frameModel(model) {
  if (!model) return;

  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxAxis = Math.max(size.x, size.y, size.z) || 1;
  const distance = maxAxis * 2.4;

  camera.position.set(center.x, center.y + maxAxis * 0.18, center.z + distance);
  camera.near = Math.max(distance / 100, 0.01);
  camera.far = distance * 20;
  camera.updateProjectionMatrix();
  controls.target.copy(center);
  controls.update();
}

function setWireframe(enabled) {
  if (!currentModel) return;

  currentModel.traverse((child) => {
    if (!child.isMesh) return;

    const materials = Array.isArray(child.material) ? child.material : [child.material];

    for (const material of materials) {
      if (!material || !("wireframe" in material)) continue;

      material.wireframe = enabled;
      material.needsUpdate = true;
    }
  });
}

function updateMaterialControls() {
  const enabled = materialOverride.checked;

  materialRoughness.disabled = !enabled;
  materialMetalness.disabled = !enabled;
  materialOpacity.disabled = !enabled;
  applyMaterialOverride();
}

function applyMaterialOverride() {
  if (!currentModel || !materialOverride.checked) return;

  const roughness = Number(materialRoughness.value);
  const metalness = Number(materialMetalness.value);
  const opacity = Number(materialOpacity.value);

  currentModel.traverse((child) => {
    if (!child.isMesh) return;

    const materials = Array.isArray(child.material) ? child.material : [child.material];

    for (const material of materials) {
      if (!material) continue;

      if ("roughness" in material) material.roughness = roughness;
      if ("metalness" in material) material.metalness = metalness;
      if ("opacity" in material) {
        material.opacity = opacity;
        material.transparent = opacity < 1;
        material.depthWrite = opacity >= 0.5;
      }
      material.needsUpdate = true;
    }
  });
}

function sizeRenderer() {
  const { width, height } = canvas.parentElement.getBoundingClientRect();

  renderer.setSize(width, height, false);
  camera.aspect = width / Math.max(height, 1);
  camera.updateProjectionMatrix();
}

function applyBackground() {
  const value = backgroundSelect.value;

  document.body.dataset.viewerBackground = value;
  scene.background =
    value === "light"
      ? new THREE.Color(0xf1f0ef)
      : value === "dark"
        ? new THREE.Color(0x070707)
        : null;
}

function applyRenderSettings() {
  renderer.outputColorSpace =
    colorOutput.value === "linear" ? THREE.LinearSRGBColorSpace : THREE.SRGBColorSpace;

  renderer.toneMapping =
    {
      aces: THREE.ACESFilmicToneMapping,
      reinhard: THREE.ReinhardToneMapping,
      none: THREE.NoToneMapping,
    }[toneMapping.value] || THREE.NoToneMapping;
}

function applyLighting() {
  hemisphereLight.intensity = Number(lightHemi.value);
  keyLight.intensity = Number(lightKey.value);
  fillLight.intensity = Number(lightFill.value);
}

function setStatus(message) {
  statusText.textContent = message;
}
