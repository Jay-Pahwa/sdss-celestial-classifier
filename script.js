const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 2000
);
camera.position.z = 100;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);

// 🌌 LIGHT (IMPORTANT FOR GLOW)
const light = new THREE.PointLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);

// 🖱️ RAYCASTER
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

let objects = [];
let currentModel = "rf_pred";

// MODEL SELECT
document.getElementById("modelSelect").onchange = (e) => {
    currentModel = e.target.value;
};

// LOAD DATA
fetch("space_data.json")
.then(res => res.json())
.then(data => {

    data.forEach(point => {

        // SIZE (wrong bigger)
        const size = point.correct ? 0.3 : 0.5;

        const geometry = new THREE.SphereGeometry(size);

        // DEFAULT COLOR (based on actual class)
        let color;
        if (point.class_name === "Star") color = 0xffff00;
        else if (point.class_name === "Galaxy") color = 0x0000ff;
        else color = 0x800080;

        // WRONG → RED
        if (point.correct === false) color = 0xff0000;

        const material = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.6
        });

        const sphere = new THREE.Mesh(geometry, material);

        sphere.position.set(
            point.PC1 * 20,
            point.PC2 * 20,
            point.PC3 * 20
        );

        sphere.userData = point;

        scene.add(sphere);
        objects.push(sphere);
    });
});

// 🎥 ANIMATION
function animate() {
    requestAnimationFrame(animate);

    // 🌌 AUTO ROTATE BACK
    scene.rotation.y += 0.0005;

    // 🔥 MODEL COLORING (FIXED)
    objects.forEach(obj => {

        let pred = obj.userData[currentModel];

        let color;
        if (pred === 0) color = 0xffff00;
        else if (pred === 1) color = 0x0000ff;
        else color = 0x800080;

        // wrong stays red
        if (obj.userData.correct === false) color = 0xff0000;

        obj.material.color.set(color);
        obj.material.emissive.set(color);
    });

    // 🖱️ HOVER INFO
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {
        const obj = intersects[0].object;

        document.getElementById("info").innerHTML = `
        Class: ${obj.userData.class_name}<br>
        Correct: ${obj.userData.correct}<br>
        PC1: ${obj.userData.PC1.toFixed(2)}<br>
        PC2: ${obj.userData.PC2.toFixed(2)}<br>
        PC3: ${obj.userData.PC3.toFixed(2)}
        `;
    }

    controls.update();
    renderer.render(scene, camera);
}

document.getElementById("classSelect").onchange = (e) => {
    const selected = e.target.value;

    objects.forEach(obj => {
        if (selected === "All") {
            obj.visible = true;
        } else {
            obj.visible = obj.userData.class_name === selected;
        }
    });
};

animate();
