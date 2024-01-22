
// Author: Yakup Mert Akan
// Sci-Fi Museum

import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r125/build/three.module.js';
import { PointerLockControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/controls/PointerLockControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';




let scene, camera, renderer, cubes = [], controls,planets= [];
let earthRotationAngle = 0;
let moonRotationAngle = 0;
//Shader
const vertexShader = `
  varying vec3 vPos;
  void main() {
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
varying vec3 vPos;
  uniform float time;

  void main() {
    // Add distortion
    float distortion = 0.05 * sin(time * 1.5);
    vec2 distortedPos = vPos.xy + distortion * normalize(vPos.xy);

    // Apply a checkerboard pattern for a hologram-like effect
    float checkerboard = mod(floor(distortedPos.x * 10.0) + floor(distortedPos.y * 10.0), 2.0);
    checkerboard = smoothstep(0.48, 0.52, checkerboard);

    // Combine the checkerboard pattern with base and hologram colors
    vec3 baseColor = vec3(0.0, 0.0, 0.0); 
    vec3 hologramColor = mix(baseColor, vec3(0.588, 0.475, 0.275), checkerboard);

    gl_FragColor = vec4(hologramColor, 1.0);
}
`;

const shaderMaterial = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  uniforms: {
    time: { value: 0 } // Initial time value
  }

});


function init() 
//
// Summary:(1)Initialize the scene, camera, renderer, and other elements
// (2)Add lights, textures, and 3D objects to the scene,
// (3)Set up the cubes for sculptures and load corresponding 3D models,
// (4)Set up the skybox with textures for each face and
// (5)Add event listeners for window resize and keydown events.
// Precondition: -
// Postcondition:(1)The scene, camera, and renderer are set up.
//(2)Lights, textures, and 3D objects are added to the scene.
//(3)Cubes with sculptures and corresponding 3D models are added to the scene.
//(4)A skybox with textures for each face is added to the scene.
//(5)Event listeners for window resize and keydown events are registered.
//
{

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
  

//light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);
    const oppdirectionalLight = new THREE.DirectionalLight(0xffffff, 1);
    oppdirectionalLight.position.set(-1, -1, -1).normalize();
    scene.add(oppdirectionalLight);

    //Load fresco texture 
    const texture = new THREE.TextureLoader().load('public/image.png');
    const material = new THREE.MeshBasicMaterial({ map: texture });

    //Load column texture 
    const texture2 = new THREE.TextureLoader().load('public/column.jpg');
    const material2 = new THREE.MeshBasicMaterial({ map: texture2 });
    
    //Earth
    const geometry = new THREE.SphereGeometry(5, 32, 32);
    const material5 = new THREE.MeshPhongMaterial();
    const earthmesh = new THREE.Mesh(geometry, material5);
   //Add bumps and specs for earth
    material5.map    = THREE.ImageUtils.loadTexture('public/earth.png');
    material5.bumpMap   = THREE.ImageUtils.loadTexture('public/earthbump.jpeg');     
    material5.bumpScale = 0.5;
    material5.specularMap = THREE.ImageUtils.loadTexture('public/earthspec.jpeg')
    material5.specular  = new THREE.Color('grey')
    earthmesh.position.set(40, camera.position.y + 6, 1);

    
    //Clouds
    const cloudGeo=new THREE.SphereGeometry(1,32,32);
    const cloudMaterial = new THREE.MeshPhongMaterial({
        map : THREE.ImageUtils.loadTexture( 'public/earthcloudmap.jpg'),
        transparent : true,
        opacity : 0.5
    });
    const clouds=new THREE.Mesh(cloudGeo,cloudMaterial)
  
   earthmesh.add(clouds);
   planets.push(earthmesh);
   scene.add(earthmesh);
    //Sun
    const sunMaterial= new THREE.MeshStandardMaterial({
    emissive: 0xffd700,
    emissiveMap: THREE.ImageUtils.loadTexture( 'public/sunmap.jpg'),
    emissiveIntensity: 1
    });
    const sunGeo = new THREE.SphereGeometry(30,128,128);
    const sunMesh = new THREE.Mesh(sunGeo,sunMaterial);
    sunMesh.position.set(60, camera.position.y + 6, 40);
    // Add a PointLight inside the sun
    const sunLight = new THREE.PointLight(0xffd700, 1, 100);
    sunMesh.add(sunLight);
    planets.push(sunMesh);
    scene.add(sunMesh);
     


// Create ground material with texture
const groundMaterial = new THREE.MeshBasicMaterial({
    map: THREE.ImageUtils.loadTexture( 'public/ground3.webp'),  // Assign the loaded texture to the 'map' property
    bumpMap: THREE.ImageUtils.loadTexture( 'public/bumpground.jpg'),
    bumpScale: 0.002,
    side: THREE.DoubleSide,
});

// Create ground mesh
const groundGeometry = new THREE.PlaneGeometry(50, 50, 2);
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = Math.PI / 2;
scene.add(ground);

    

    // Cubes for sculptures
    const cubeCount = 8;
    const radius = 5;
   
    const objData = [
        { path: 'public/models/sculpt1.obj', scale: new THREE.Vector3(5.1, 5.1, 5.1) },
        { path: 'public/models/sculpt2.obj', scale: new THREE.Vector3(0.19, 0.19, 0.19) },
        { path: 'public/models/sculpt3.obj', scale: new THREE.Vector3(0.5, 0.5, 0.5) },
        { path: 'public/models/sculpt4.obj', scale: new THREE.Vector3(0.003, 0.003, 0.003) },
        { path: 'public/models/sculpt5.obj', scale: new THREE.Vector3(0.01, 0.01, 0.01) },
        { path: 'public/models/sculpt6.obj', scale: new THREE.Vector3(0.01, 0.01, 0.01) },
        { path: 'public/models/sculpt7.obj', scale: new THREE.Vector3(0.02, 0.02, 0.02) },
        { path: 'public/models/sculpt8.obj', scale: new THREE.Vector3(0.2, 0.2, 0.2) }
    ];

    for (let i = 0; i < cubeCount; i++) {
        const angle = (i / cubeCount) * Math.PI * 2;
        const xPos = Math.cos(angle) * radius;
        const zPos = Math.sin(angle) * radius;

        // Create and add the cube
        const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material2);
        cube.position.set(xPos, 0.5, zPos);
        scene.add(cube);

        // Load and add the sculpt object on top of the cube
        const objPath = objData[i].path;
        const objScale = objData[i].scale;
        loadObj(objPath, new THREE.Vector3(xPos, 1.5, zPos), objScale);
        cube.material = shaderMaterial;

        cubes.push(cube);
    
        scene.add(cube);
    }




    
// Skybox
const skyboxLoader = new THREE.CubeTextureLoader();
const skyboxTexture = skyboxLoader.load([
    'public/skybox/right.png',
    'public/skybox/left.png',
    'public/skybox/top.png',
    'public/skybox/bot.png',
    'public/skybox/front.png',
    'public/skybox/back.png'
]);
scene.background = skyboxTexture;
   



//Columns    
const columnCount = 8;
const columnRadius = 10;

for (let i = 0; i < columnCount; i++) {
    const angle = (i / columnCount) * Math.PI * 2;
    const xPos = Math.cos(angle) * columnRadius;
    const zPos = Math.sin(angle) * columnRadius;

    const column = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 15, 20), material2); 
    column.position.set(xPos, 2.5, zPos); 
    scene.add(column);
}

//Moon
const moongeometry = new THREE.SphereGeometry(2, 32, 32);
const moonmaterial = new THREE.MeshPhongMaterial({
    // Diffuse Texture
    map: THREE.ImageUtils.loadTexture( 'public/moonmap1k.jpg'),
    
    // Bump Texture
    bumpMap: THREE.ImageUtils.loadTexture( 'public/moonbump1k.jpg'),
    bumpScale: 0.002,
});
const moonmesh = new THREE.Mesh(moongeometry, moonmaterial);
moonmesh.position.set(40, camera.position.y + 6, 5);
planets.push(moonmesh);
scene.add(moonmesh);

// Dome
const sphereGeometry = new THREE.SphereGeometry(10, 32, 16, Math.PI/2,  Math.PI*2, 0, 0.5*Math.PI);
const sphere = new THREE.Mesh(sphereGeometry, material2);
material.side = THREE.FrontSide;
const sphere2 = new THREE.Mesh(sphereGeometry, material);
material.side = THREE.BackSide;
sphere.position.set(0, camera.position.y + 10, 0);
sphere2.position.set(0, camera.position.y + 10, 0); 
scene.add(sphere);
scene.add(sphere2);

   
// Initial camera position
const initialCameraPosition = new THREE.Vector3(0, 2, 0); 
camera.position.copy(initialCameraPosition);

// FPS Controls
controls = new PointerLockControls(camera, renderer.domElement);
scene.add(controls.getObject()); 

    

document.addEventListener('click', () => {
        controls.lock();
    });

    
   
// Event listeners
window.addEventListener('resize', onWindowResize, false);
document.addEventListener('keydown', onDocumentKeyDown, false);

}

function onDocumentKeyDown(event)
//
// Summary: Handle keydown events for camera movement
// Precondition:The camera, scene, and controls are initialized.
// Postcondition:Camera position is updated based on key input.
//
{
const keyCode = event.which;

const cameraDirection = new THREE.Vector3();
camera.getWorldDirection(cameraDirection);
cameraDirection.y=0;// Ignore the vertical component


switch (keyCode) {
        case 38: // Up
        case 87: // W
            camera.position.add(cameraDirection.multiplyScalar(0.5));
            break;
        case 37: // Left
        case 65: // A
        const leftVector = new THREE.Vector3();
        leftVector.crossVectors(camera.up, cameraDirection);
        camera.position.add(leftVector.multiplyScalar(0.1));
            break;
        case 40: // Down
        case 83: // S
        camera.position.sub(cameraDirection.multiplyScalar(0.1));
            break;
        case 39: // Right
        case 68: // D
        const rightVector = new THREE.Vector3();
        rightVector.crossVectors(camera.up, cameraDirection);
        camera.position.sub(rightVector.multiplyScalar(0.1));
            break;
        
    }
}

function loadObj(objPath, position, scale)
//
// Summary: Load and add 3D models (OBJ files) to the scene
// Precondition: objPath is a valid path to an OBJ file, position is a THREE.Vector3,
//and scale is a THREE.Vector3.
// Postcondition: 3D models are loaded and added to the scene with the specified position and scale.
//
{
    
    const objLoader = new OBJLoader();
    objLoader.load(
        objPath,
        (object) => {
            object.scale.copy(scale);
            object.position.copy(position);
             // Calculate the rotation to make the object face towards the camera
             const lookAtVector = new THREE.Vector3();
             camera.getWorldPosition(lookAtVector);
             object.lookAt(lookAtVector);
 
            scene.add(object);
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (error) => {
            console.error('Error loading model', error);
        }
    );
    
}


function animate() 
//
//Summary:(1)Animation loop for updating the scene and camera,
//(2)update positions and rotations of planets and cubes and
//(3)update FPS controls
// Precondition: The scene, camera, planets, cubes, and controls are initialized.
// Postcondition:(1)The scene is animated, and camera and object positions are updated.
// (2)Positions and rotations of planets and cubes are updated for animation.
// (3)First-person controls are updated.
//
{ requestAnimationFrame( animate );


	renderer.render( scene, camera );
    shaderMaterial.uniforms.time.value += 0.01;

    //Earth's rotation around the Sun
    const earthOrbitRadius = 150;
    const earthOrbitSpeed = 0.001;
    earthRotationAngle += earthOrbitSpeed;

    const earthX = Math.cos(earthRotationAngle) * earthOrbitRadius;
    const earthZ = Math.sin(earthRotationAngle) * earthOrbitRadius;

    planets[0].position.set(earthX, camera.position.y + 6, earthZ);

    //Moon's rotation around the Sun
    const moonOrbitRadius = 120;
    const moonOrbitSpeed = 0.003;
    moonRotationAngle += moonOrbitSpeed;

    const moonX = Math.cos(moonRotationAngle) * moonOrbitRadius;
    const moonZ = Math.sin(moonRotationAngle) * moonOrbitRadius;

    planets[2].position.set(moonX, camera.position.y + 6, moonZ);

    planets.forEach((planet) => {
            
    //Rotation around its own axis
    const rotationSpeed = 0.001;
    planet.rotation.y += rotationSpeed;

    });

  
    // Update FPS controls
    controls.update();
    
}


function onWindowResize()
//
// Summary: Handle window resize event to adjust camera and renderer
// Precondition: The camera and renderer are initialized.
// Postcondition:Camera and renderer are updated to fit the new window size.
//
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
animate();
