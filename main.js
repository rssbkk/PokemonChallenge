import * as THREE from 'three'
import gsap from 'gsap'
import GUI from 'lil-gui'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
 
/**
* Loaders
*/
const rgbeLoader = new RGBELoader()
const loader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
 
/**
* Debug
*/
const gui = new GUI({
    width: 300,
    title: 'Debug UI',
    closeFolders: false
})
window.addEventListener('keydown', (event) =>
{
    if(event.key == 'h')
        gui.show(gui._hidden)
})
 
const debugObject = {}
const debugPlinth = {}
const debugCard = {}
const debugTargetObject = {}
 
/**
* Base
*/
// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
 
window.addEventListener('resize', () =>
{
// Update sizes
sizes.width = window.innerWidth
sizes.height = window.innerHeight
 
// Update camera
camera.aspect = sizes.width / sizes.height
camera.updateProjectionMatrix()
 
// Update renderer
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})
 
// Cursor
const cursor = {
  x: 0,
  y: 0
}
window.addEventListener('mousemove', (event) =>
{
  cursor.x = event.clientX / sizes.width - 0.5
  cursor.y = event.clientY / sizes.height - 0.5
})

let cameraMove = true;
let cardFocus = false;

function sceneReset(){
  gsap.to(card.position, {duration:1, x:0 ,y:0 ,z:0.33 })
  gsap.to(card.scale, { duration:1, x:1 ,y:1 ,z:1 })

  gsap.to(leftCard.position, {duration:1, x:-0.65 ,y:0 ,z:0.5 })
  gsap.to(leftCard.scale, { duration:1, x:1 ,y:1 ,z:1 })
  gsap.to(leftCard.rotation, { duration:1, y:0.5})

  gsap.to(rightCard.position, {duration:1, x:0.65 ,y:0 ,z:0.5 })
  gsap.to(rightCard.scale, { duration:1, x:1 ,y:1 ,z:1 })
  gsap.to(rightCard.rotation, { duration:1, y:-0.5})

  cardFocus =  false;
}

window.addEventListener('click', (event)=>
{
  if(currentIntersect.object === card)
  {
    gsap.to(card.position, {duration: 1, x:0, y:0, z:0.4})
    gsap.to(card.rotation, {duration: 1, y: 0})
    gsap.to(card.scale, {duration: 1, x:1.6, y: 1.6})

    gsap.to(leftCard.position, {duration: 1, x:-1, y:0, z:0})
    gsap.to(leftCard.rotation, {duration: 1, y: 0})
    gsap.to(leftCard.scale, {duration: 1, x:0.5, y: 0.5})

    gsap.to(rightCard.position, {duration: 1, x:1, y:0, z:0})
    gsap.to(rightCard.rotation, {duration: 1, y: 0})
    gsap.to(rightCard.scale, {duration: 1, x:0.5, y: 0.5})

    cameraMove = false
    cardFocus = true
    console.log('animate card1');

  } else if(currentIntersect.object === leftCard)
  {
    gsap.to(leftCard.position, {duration: 1, x:0, y:0, z:0.4})
    gsap.to(leftCard.rotation, {duration: 1, y: 0})
    gsap.to(leftCard.scale, {duration: 1, x:1.6, y: 1.6})

    gsap.to(card.position, {duration: 1, x:-1, y:0, z:0})
    gsap.to(card.scale, {duration: 1, x:0.5, y: 0.5})

    gsap.to(rightCard.position, {duration: 1, x:1, y:0, z:0})
    gsap.to(rightCard.rotation, {duration: 1, y: 0})
    gsap.to(rightCard.scale, {duration: 1, x:0.5, y: 0.5})

    cameraMove = false
    cardFocus = true
    console.log('animate leftCard');

  }else if(currentIntersect.object === rightCard)
  {
    gsap.to(rightCard.position, {duration: 1, x:0, y:0, z:0.4})
    gsap.to(rightCard.rotation, {duration: 1, y: 0})
    gsap.to(rightCard.scale, {duration: 1, x:1.6, y: 1.6})

    gsap.to(card.position, {duration: 1, x:-1, y:0, z:0})
    gsap.to(card.scale, {duration: 1, x:0.5, y: 0.5})

    gsap.to(leftCard.position, {duration: 1, x:1, y:0, z:0})
    gsap.to(leftCard.rotation, {duration: 1, y: 0})
    gsap.to(leftCard.scale, {duration: 1, x:0.5, y: 0.5})

    cameraMove = false
    cardFocus = true

    console.log('animate rightCard');

  } else {
    sceneReset()
  }
})
 
// Mouse
const mouse = new THREE.Vector2()
 
window.addEventListener('mousemove', (event) =>
{
  mouse.x = event.clientX / sizes.width * 2 - 1
  mouse.y = - (event.clientY / sizes.height) * 2 + 1
})
 
// Primary Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color("#FEFBEA")
 
// Center Card Scene
const centerCardScene = new THREE.Scene()
 
// Left Card Scene
const leftCardScene = new THREE.Scene()
 
// Right Card Scene
const rightCardScene = new THREE.Scene()
rightCardScene.rotation.y = 5.5
 
/**
* Environment Maps (RGBE Equirectangular) & (LDR Cube Maps)
*/
const centerCardEnvMap = loader.load("assets/environmentMaps/charmanderBG.jpg",
    () => {
      const centerCardBG = new THREE.WebGLCubeRenderTarget(centerCardEnvMap.image.height);
      centerCardBG.fromEquirectangularTexture(renderer, centerCardEnvMap);
      centerCardScene.background = centerCardBG.texture;
    }
  );
 
const leftCardEnvMap = loader.load("assets/environmentMaps/bulbasaurBG.jpg",
    () => {
      const leftCardBG = new THREE.WebGLCubeRenderTarget(leftCardEnvMap.image.height);
      leftCardBG.fromEquirectangularTexture(renderer, leftCardEnvMap);
      leftCardScene.background = leftCardBG.texture;
    }
  );
 
const rightCardEnvMap = loader.load("assets/environmentMaps/squirtleBG.jpg",
    () => {
      const rightCardBG = new THREE.WebGLCubeRenderTarget(rightCardEnvMap.image.height);
      rightCardBG.fromEquirectangularTexture(renderer, rightCardEnvMap);
      rightCardScene.background = rightCardBG.texture;
    }
  );
 
/**
 * LIGHTS
 */
const centerAmbientLight = new THREE.AmbientLight(0x404040, 80)
const leftAmbientLight = new THREE.AmbientLight(0x404040, 100)
const rightAmbientLight = new THREE.AmbientLight(0x404040, 100)
centerCardScene.add(centerAmbientLight)
leftCardScene.add(leftAmbientLight)
rightCardScene.add(rightAmbientLight)

/**
* Object
*/
// Details
const cardDetails = {
  width: 2.5 / 4,
  height: 3.5 / 4
}
 
// Center Card
const cardSizes = { width: 0.125, height: 0.18 }
const renderTargetCenter = new THREE.WebGLRenderTarget(cardSizes.width * 2048, cardSizes.height * 2048);
 
const cardGeometry = new THREE.PlaneGeometry(cardDetails.width, cardDetails.height)
const cardMaterial = new THREE.MeshBasicMaterial({
  map: renderTargetCenter.texture
})
const card = new THREE.Mesh(cardGeometry, cardMaterial)
 
card.position.y = 0
card.position.z = 0.33

card.material.side = THREE.DoubleSide

scene.add(card)
 
const cardTweaks = gui.addFolder('Card Tweaks')
cardTweaks.close()
 
cardTweaks
  .add(card.position, 'y')
  .min(- 10)
  .max(10)
  .step(0.01)
  .name('vertical')
 
cardTweaks
  .add(card.position, 'x')
  .min(- 10)
  .max(10)
  .step(0.01)
  .name('horizontal')
 
cardTweaks
  .add(card.position, 'z')
  .min(- 10)
  .max(10)
  .step(0.01)
  .name('depth')

cardTweaks
  .add(card, 'visible')
 
debugCard.spin = () =>
{
    gsap.to(card.rotation, { duration: 1, y: card.rotation.y + Math.PI * 2 })
}
cardTweaks
    .add(debugCard, 'spin')
 
debugCard.subdivision = 2
cardTweaks
  .add(debugCard, 'subdivision')
  .min(1)
  .max(20)
  .step(1)
  .onFinishChange(() =>
  {
    card.geometry.dispose()
    card.geometry = new THREE.PlaneGeometry(
      debugCard.width, debugCard.height,
        debugCard.subdivision, debugCard.subdivision, debugCard.subdivision
    )
  })
 
debugCard.scale = 3.3
cardTweaks
  .add(debugCard, 'scale')
  .min(1)
  .max(5)
  .step(0.1)
  .onFinishChange(() =>
{
  card.geometry.dispose()
  card.geometry = new THREE.PlaneGeometry(
    (debugCard.width * debugCard.scale), (debugCard.height * debugCard.scale),
    debugCard.subdivision, debugCard.subdivision, debugCard.subdivision
  )
})
 
debugCard.width = 0.125
  cardTweaks
    .add(debugCard, 'width')
    .min(1)
    .max(4)
    .step(0.1)
    .onFinishChange(() =>
    {
      card.geometry.dispose()
      card.geometry = new THREE.PlaneGeometry(
        debugCard.width, debugCard.height,
          debugCard.subdivision, debugCard.subdivision, debugCard.subdivision
      )
    })
 
debugCard.height = 0.18
  cardTweaks
    .add(debugCard, 'height')
    .min(1)
    .max(4)
    .step(0.1)
    .onFinishChange(() =>
    {
      card.geometry.dispose()
      card.geometry = new THREE.PlaneGeometry(
          debugCard.width, debugCard.height,
          debugCard.subdivision, debugCard.subdivision, debugCard.subdivision
      )
    })
   
// Left Card
  const renderTargetLeft = new THREE.WebGLRenderTarget(cardSizes.width * 2056, cardSizes.height * 2056);
 
  const leftCardGeometry = new THREE.PlaneGeometry(cardDetails.width, cardDetails.height)
  const leftCardMaterial = new THREE.MeshBasicMaterial({
    map: renderTargetLeft.texture
  })
  const leftCard = new THREE.Mesh(leftCardGeometry, leftCardMaterial)
 
  leftCard.position.x = -0.65
  leftCard.position.y = 0
  leftCard.position.z = 0.5
 
  leftCard.rotation.y = 0.5
 
  scene.add(leftCard)
 
  const leftCardTweaks = gui.addFolder('Left Card Tweaks')
  leftCardTweaks.close()
 
  leftCardTweaks
    .add(leftCard.position, 'x')
    .min(- 10)
    .max(10)
    .step(0.01)
    .name('horizontal')
 
    leftCardTweaks
    .add(leftCard.position, 'z')
    .min(- 10)
    .max(10)
    .step(0.01)
    .name('range')
 
  leftCardTweaks
    .add(leftCard.rotation, 'y')
    .min(- 10)
    .max(10)
    .step(0.01)
    .name('rotation Y')

  leftCardTweaks
    .add(leftCard, 'visible')
 

// Right Card
  const renderTargetRight = new THREE.WebGLRenderTarget(cardSizes.width * 2056, cardSizes.height * 2056);
 
  const rightCardGeometry = new THREE.PlaneGeometry(cardDetails.width, cardDetails.height)
  const rightCardMaterial = new THREE.MeshBasicMaterial({
    map: renderTargetRight.texture
  })
  const rightCard = new THREE.Mesh(rightCardGeometry, rightCardMaterial)
 
 
  rightCard.position.x = 0.65
  rightCard.position.y = 0
  rightCard.position.z = 0.5
 
  rightCard.rotation.y = -0.5
  scene.add(rightCard)

  const rightCardTweaks = gui.addFolder('Right Card Tweaks')
  rightCardTweaks.close()

  rightCardTweaks
    .add(rightCard, 'visible')
 
// inTargetObject

gltfLoader.load('/assets/models/charmander.gltf',
(gltf) =>
{
  centerCardScene.add(gltf.scene)
}
) 
gltfLoader.load('/assets/models/bulbasaur.gltf',
(gltf) =>
{
  gltf.scene.rotation.y = Math.PI
  leftCardScene.add(gltf.scene)
}
) 
gltfLoader.load('/assets/models/squirtle.gltf',
(gltf) =>
{
  rightCardScene.add(gltf.scene)
}
) 

/**
* Camera
*/
// Base Camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 0.5
camera.position.z = 2
// const controls = new OrbitControls( camera, renderer.domElement );
scene.add(camera)

const cameraTweaks = gui.addFolder('Camera Tweaks')
const mainCameraTweaks = cameraTweaks.addFolder('Main Camera')
   
mainCameraTweaks
  .add(camera.rotation, 'x')
  .min(0)
  .max(12)
  .step(0.1)
  .name('Camera Rotation x')
   
mainCameraTweaks
  .add(camera.rotation, 'y')
  .min(0)
  .max(12)
  .step(0.1)
  .name('Camera Rotation y')
   
mainCameraTweaks
  .add(camera.rotation, 'z')
  .min(0)
  .max(12)
  .step(0.1)
  .name('Camera Rotation z')

  mainCameraTweaks
  .add(camera.position, 'x')
  .min(0)
  .max(12)
  .step(0.1)
  .name('Camera position x')
   
mainCameraTweaks
  .add(camera.position, 'y')
  .min(0)
  .max(12)
  .step(0.1)
  .name('Camera position y')
   
mainCameraTweaks
  .add(camera.position, 'z')
  .min(0)
  .max(12)
  .step(0.1)
  .name('Camera position z')
 
// Center Card Camera
const centerCardCamera = new THREE.PerspectiveCamera(45, cardSizes.width / cardSizes.height, 0.1, 100)
centerCardCamera.position.x = 0
centerCardCamera.position.y = 1
centerCardCamera.position.z = 4.5
centerCardCamera.lookAt(0, 0, 0)
centerCardScene.add(centerCardCamera)
 
// Left Card Camera
const leftCardCamera = new THREE.PerspectiveCamera(45, cardSizes.width / cardSizes.height, 0.1, 100)
leftCardCamera.position.x = 0
leftCardCamera.position.y = 1
leftCardCamera.position.z = - 4.5
leftCardCamera.lookAt(0, 0, 0)
leftCardScene.add(leftCardCamera)
 
// Right Card Camera
const rightCardCamera = new THREE.PerspectiveCamera(45, cardSizes.width / cardSizes.height, 0.1, 100)
rightCardCamera.position.x = 0
rightCardCamera.position.y = 1
rightCardCamera.position.z = 4.5
rightCardCamera.lookAt(0,0,0)
rightCardScene.add(rightCardCamera)

const centerCardCameraTweaks = cameraTweaks.addFolder('Center Camera')
 
centerCardCameraTweaks
  .add(centerCardScene.rotation, 'x')
  .min(0)
  .max(12)
  .step(0.1)
 
centerCardCameraTweaks
  .add(centerCardScene.rotation, 'y')
  .min(0)
  .max(12)
  .step(0.1)
 
centerCardCameraTweaks
  .add(centerCardScene.rotation, 'z')
  .min(0)
  .max(12)
  .step(0.1)
 
const rightCardCameraTweaks = cameraTweaks.addFolder('Right Camera')
   
rightCardCameraTweaks
  .add(rightCardScene.rotation, 'x')
  .min(0)
  .max(12)
  .step(0.1)
   
rightCardCameraTweaks
  .add(rightCardScene.rotation, 'y')
  .min(0)
  .max(12)
  .step(0.1)
   
rightCardCameraTweaks
  .add(rightCardScene.rotation, 'z')
  .min(0)
  .max(12)
  .step(0.1)

/**
*  Raycater
*/
const raycaster = new THREE.Raycaster()
 
// Animation Dependancies
let currentIntersect = null
let hovering = false;

/**
* Animate
*/
const clock = new THREE.Clock()
 
const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Cast a Ray
    raycaster.setFromCamera(mouse, camera)
 
    const objectsToTest = [card, leftCard, rightCard]
    const intersects = raycaster.intersectObjects(objectsToTest)

    // changes the state of hovering and logs 
    if(intersects.length)
    {
      if(currentIntersect === null){
        console.log('mouse enter');
        }
      currentIntersect = intersects[0]
    } else {
      if(currentIntersect){
        console.log('mouse leave');
        hovering = true;
      }
      currentIntersect = null
    }

    for(const object of objectsToTest)
    {
      if(!cardFocus){
        object.scale.set(1, 1, 1)
      }
    }

    for(const intersect of intersects)
    {
        if(!cardFocus){
        intersect.object.scale.set(1.5, 1.5, 1.5)
        }
    }

    if(intersects.object === card){
      console.log("hello");
    }
 
    // Update Camera
    
    camera.position.x = cursor.x * - 2.5
    camera.position.y = cursor.y * 2.5
    camera.lookAt(0, 0, 0)
 
    // Update Card Cameras
    centerCardCamera.position.x = cursor.x * - 2.5
    centerCardCamera.position.y = cursor.y * 2.5
    centerCardCamera.lookAt(0, 0, 0)
 
    leftCardCamera.position.x = cursor.x * 2.5
    leftCardCamera.position.y = cursor.y * 2.5
    leftCardCamera.lookAt(0, 0, 0)
 
    rightCardCamera.position.x = cursor.x * - 2.5
    rightCardCamera.position.y = cursor.y * 2.5
    rightCardCamera.lookAt(0, 0, 0)
 
    // Center Card Render
    renderer.setRenderTarget(renderTargetCenter)
    renderer.render(centerCardScene, centerCardCamera)
    renderer.setRenderTarget(null)
 
    // Center Card Render
    renderer.setRenderTarget(renderTargetLeft)
    renderer.render(leftCardScene, leftCardCamera)
    renderer.setRenderTarget(null)
 
    // Center Card Render
    renderer.setRenderTarget(renderTargetRight)
    renderer.render(rightCardScene, rightCardCamera)
    renderer.setRenderTarget(null)
 
    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}
 
tick()
console.log(card.position);
console.log(leftCard.position);
console.log(rightCard.position);