import * as THREE from 'three'
import gsap from 'gsap'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'

/**
 * Loaders
 */
const rgbeLoader = new RGBELoader()
const loader = new THREE.TextureLoader();

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

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Primary Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color("#554e4e")

// Center Card Scene
const centerCardScene = new THREE.Scene()
centerCardScene.rotation.y = 4
centerCardScene.background = new THREE.Color("#00ff00")

// Left Card Scene
const leftCardScene = new THREE.Scene()

// Right Card Scene
const rightCardScene = new THREE.Scene()
rightCardScene.background = new THREE.Color("#af30c0")

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
 * Object
 */
// Details
const cardDetails = {
  width: 2.5 / 4, 
  height: 3.5 / 4
}

// Center Card
const cardSizes = { width: 0.125, height: 0.18 }
const renderTargetCenter = new THREE.WebGLRenderTarget(cardSizes.width * 1024, cardSizes.height * 1024);

const cardGeometry = new THREE.PlaneGeometry(cardDetails.width, cardDetails.height)
const cardMaterial = new THREE.MeshBasicMaterial({
  map: renderTargetCenter.texture
})
const card = new THREE.Mesh(cardGeometry, cardMaterial)

card.position.y = 0.3
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
  leftCard.position.y = 0.3
  leftCard.position.z = 0.2

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


// Right Card
  const renderTargetRight = new THREE.WebGLRenderTarget(cardSizes.width * 2056, cardSizes.height * 2056);

  const rightCardGeometry = new THREE.PlaneGeometry(cardDetails.width, cardDetails.height)
  const rightCardMaterial = new THREE.MeshBasicMaterial({
    map: renderTargetRight.texture
  })
  const rightCard = new THREE.Mesh(rightCardGeometry, rightCardMaterial)

  
  rightCard.position.x = 0.65
  rightCard.position.y = 0.3
  rightCard.position.z = 0.2

  rightCard.rotation.y = -0.5
  scene.add(rightCard)

// inTargetObject
  const targetObjectGeometry = new THREE.CylinderGeometry(1, 1, 1, 8)
  const targetObjectMaterial = new THREE.MeshBasicMaterial({ color: '#FF0000'})
  const targetObject = new THREE.Mesh(targetObjectGeometry, targetObjectMaterial)
  targetObject.position.y = 0.25
  // scene.add(targetObject)
  centerCardScene.add(targetObject)

const targetObjectTweaks = gui.addFolder('Target Object Tweaks')
targetObjectTweaks.close()

targetObjectTweaks
  .add(targetObject.position, 'y')
  .min(- 10)
  .max(10)
  .step(0.01)
  .name('vertical')

targetObjectTweaks
  .add(targetObject.position, 'x')
  .min(- 10)
  .max(10)
  .step(0.01)
  .name('horizontal')

targetObjectTweaks
  .add(targetObject.position, 'z')
  .min(- 10)
  .max(10)
  .step(0.01)
  .name('depth')

  // inTargetObject Left
const leftTargetObjectGeometry = new THREE.ConeGeometry(1, 1, 8)
const leftTargetObjectMaterial = new THREE.MeshBasicMaterial({ color: '#0000ff'})
const leftTargetObject = new THREE.Mesh(leftTargetObjectGeometry, leftTargetObjectMaterial)
leftTargetObject.position.y = 0.25
// scene.add(targetObject)
leftCardScene.add(leftTargetObject)

const leftTargetObjectTweaks = gui.addFolder('Left Target Object Tweaks')
leftTargetObjectTweaks.close()

leftTargetObjectTweaks
.add(leftTargetObject.position, 'y')
.min(- 10)
.max(10)
.step(0.01)
.name('vertical')

leftTargetObjectTweaks
.add(leftTargetObject.position, 'x')
.min(- 10)
.max(10)
.step(0.01)
.name('horizontal')

leftTargetObjectTweaks
.add(leftTargetObject.position, 'z')
.min(- 10)
.max(10)
.step(0.01)
.name('depth')

  // inTargetObject Right
  const rightTargetObjectGeometry = new THREE.DodecahedronGeometry(1)
  const rightTargetObjectMaterial = new THREE.MeshBasicMaterial({ color: '#0000ff'})
  const rightTargetObject = new THREE.Mesh(rightTargetObjectGeometry, rightTargetObjectMaterial)
  rightTargetObject.position.z = 0.25
  // scene.add(targetObject)
  rightCardScene.add(rightTargetObject)
  
  const rightTargetObjectTweaks = gui.addFolder('Right Target Object Tweaks')
  rightTargetObjectTweaks.close()
  
  rightTargetObjectTweaks
  .add(targetObject.position, 'y')
  .min(- 10)
  .max(10)
  .step(0.01)
  .name('vertical')
  
  rightTargetObjectTweaks
  .add(targetObject.position, 'x')
  .min(- 10)
  .max(10)
  .step(0.01)
  .name('horizontal')
  
  rightTargetObjectTweaks
  .add(targetObject.position, 'z')
  .min(- 10)
  .max(10)
  .step(0.01)
  .name('depth')

/**
 * Camera
 */
// Base Camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 1
camera.position.z = 2
camera.lookAt(0, 0.5, -2)
scene.add(camera)

// Center Card Camera
const centerCardCamera = new THREE.PerspectiveCamera(45, cardSizes.width / cardSizes.height, 0.1, 100)
centerCardCamera.position.x = 0
centerCardCamera.position.y = 1
centerCardCamera.position.z = 4.5
centerCardCamera.lookAt(targetObject.position)
centerCardScene.add(centerCardCamera)

// Left Card Camera
const leftCardCamera = new THREE.PerspectiveCamera(45, cardSizes.width / cardSizes.height, 0.1, 100)
leftCardCamera.position.x = 0
leftCardCamera.position.y = 1
leftCardCamera.position.z = - 4.5
leftCardCamera.lookAt(leftTargetObject.position)
leftCardScene.add(leftCardCamera)

// Right Card Camera
const rightCardCamera = new THREE.PerspectiveCamera(45, cardSizes.width / cardSizes.height, 0.1, 100)
rightCardCamera.position.x = 0
rightCardCamera.position.y = 1
rightCardCamera.position.z = 4.5
rightCardCamera.lookAt(rightTargetObject.position)
rightCardScene.add(rightCardCamera)

const cameraTweaks = gui.addFolder('Camera Tweaks')
const centerCardCameraTweaks = cameraTweaks.addFolder('Center Camera')

centerCardCameraTweaks
  .add(centerCardScene.rotation, 'x')
  .min(1)
  .max(12)
  .step(0.1)

centerCardCameraTweaks
  .add(centerCardScene.rotation, 'y')
  .min(1)
  .max(12)
  .step(0.1)

centerCardCameraTweaks
  .add(centerCardScene.rotation, 'z')
  .min(1)
  .max(12)
  .step(0.1)
  
  

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update Camera
    camera.position.x = cursor.x * 0.5
    camera.position.y = cursor.y * - 0.5
    camera.lookAt(0, 0.5, -2)

    // Update Card Cameras
    centerCardCamera.position.x = cursor.x * - 2.5
    centerCardCamera.position.y = cursor.y * 2.5
    centerCardCamera.lookAt(0, 0.5, -2)

    leftCardCamera.position.x = cursor.x * - 2.5
    leftCardCamera.position.y = cursor.y * 2.5
    leftCardCamera.lookAt(0, 0.5, -2)

    rightCardCamera.position.x = cursor.x * - 2.5
    rightCardCamera.position.y = cursor.y * 2.5
    rightCardCamera.lookAt(0, 0.5, -2)

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