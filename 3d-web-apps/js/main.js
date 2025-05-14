import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, model, light;
let controls;
const loader = new GLTFLoader();
let rotate = false;
let isWireframe = false;
let ambientLight, directionalLight, pointLight, spotLight;
const rotateSound = new Audio('audio/weee.mp3');
const canSound = new Audio('audio/soda_can.mp3');

const lightingPresets = {
    ambientOnly: () => {
        clearLights();
        scene.add(ambientLight);
    },
    directionalOnly: () => {
        clearLights();
        scene.add(directionalLight);
    },
    pointOnly: () => {
        clearLights();
        scene.add(pointLight);
    },
    spotOnly: () => {
        clearLights();
        scene.add(spotLight);
    },
    full: () => {
        clearLights();
        scene.add(ambientLight);
        scene.add(directionalLight);
        scene.add(pointLight);
        scene.add(spotLight);
    }
};

const modelDescriptions = {
    "coke_can.glb": "This is a 3D model of a coca cola can, featuring accurate textures and geometry.",
    "sprite_can.glb": "A 3D model of a Sprite can, featuring accurate textures and geometry.",
    "sprite_bottle.glb": "A vibrant and detailed model of a plastic sprite bottle."
};

init();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(10, 1, 5);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById("viewer").appendChild(renderer.domElement);

    document.getElementById("camera-front").addEventListener("click", () => setCameraView("front"));
    document.getElementById("camera-top").addEventListener("click", () => setCameraView("top"));
    document.getElementById("camera-side").addEventListener("click", () => setCameraView("side"));
    document.getElementById("camera-default").addEventListener("click", () => setCameraView("default"));




    controls = new OrbitControls(camera, renderer.domElement);


    ambientLight = new THREE.AmbientLight(0x404040, 0.6);

    directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(2, 3, 4);
    directionalLight.castShadow = true;

    pointLight = new THREE.PointLight(0xFF0000, 1, 100);
    pointLight.position.set(-2, 2, 2);

    spotLight = new THREE.SpotLight(0x00FF00, 1);
    spotLight.position.set(5, 5, 5);
    spotLight.castShadow = true;


    animate();
}

function animate() {
    requestAnimationFrame(animate);

    if (model && rotate) {
        model.rotation.y += 0.01;
    }

    controls.update();
    renderer.render(scene, camera);
}

function loadModel(path, playSound = false) {
    if (model) {
        scene.remove(model);
    }

    loader.load(path, (gltf) => {
        model = gltf.scene;
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        model.position.set(0, 0, 0);
        scene.add(model);

        if (playSound) {
            canSound.play();
        }


        const fileName = path.split('/').pop();
        const desc = modelDescriptions[fileName] || "No description available.";
        document.getElementById("model-description").innerText = desc;

        console.log("Model loaded:", path);
    }, undefined, (error) => {
        console.error("Failed to load model:", error);
    });
}

document.getElementById('cola-button').addEventListener('click', () => {
    loadModel('models/coke_can.glb', true);
});

document.getElementById('bottle-button').addEventListener('click', () => {
    loadModel('models/sprite_bottle.glb', false);
});

document.getElementById('sprite-button').addEventListener('click', () => {
    loadModel('models/sprite_can.glb', true);
});

document.getElementById('wireframe-button').addEventListener('click', () => {
    if (model) {
        model.traverse((child) => {
            if (child.isMesh) {
                child.material.wireframe = !isWireframe;
            }
        });
        isWireframe = !isWireframe;
    }
});

document.getElementById('rotate-button').addEventListener('click', () => {
    rotate = !rotate;
    rotateSound.play();
});

document.getElementById('lighting-select').addEventListener('change', (event) => {
    const selected = event.target.value;
    if (lightingPresets[selected]) {
        lightingPresets[selected]();
    }
});

function clearLights() {
    scene.remove(ambientLight);
    scene.remove(directionalLight);
    scene.remove(pointLight);
    scene.remove(spotLight);
}

function setCameraView(view) {
    controls.reset();

    switch (view) {
        case 'front':
            camera.position.set(1, 2, 10);
            break;
        case 'top':
            camera.position.set(0, 15, 0);
            break;
        case 'side':
            camera.position.set(7, 1, 0);
            break;
        case 'default':
            camera.position.set(0, 5, 5);
            break;
    }

    camera.lookAt(0, 0, 0);
}

