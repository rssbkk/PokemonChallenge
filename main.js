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
const cubeTextureLoader = new THREE.CubeTextureLoader()

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
 * Environment Maps (RGBE Equirectangular) & (LDR Cube Maps)
 */
// const texture = loader.load("assets/environmentMaps/bulbasaurBG.jpg",
//     () => {
//       const leftCardBG = new THREE.WebGLCubeRenderTarget(texture.image.height);
//       leftCardBG.fromEquirectangularTexture(renderer, texture);
//       leftCardScene.background = leftCardBG.texture;
//     }
//   );

// Left Card Debug
const leftCardCubeMap = cubeTextureLoader.load([
  'assets/environmentMaps/bulbasaurCubeMap/px.png',
  'assets/environmentMaps/bulbasaurCubeMap/nx.png',
  'assets/environmentMaps/bulbasaurCubeMap/py.png',
  'assets/environmentMaps/bulbasaurCubeMap/ny.png',
  'assets/environmentMaps/bulbasaurCubeMap/pz.png',
  'assets/environmentMaps/bulbasaurCubeMap/nz.png'
])

/**
 * Base
 */
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
centerCardScene.background = new THREE.Color("#00ff00")

// Left Card Scene
const leftCardScene = new THREE.Scene()
leftCardScene.background = leftCardCubeMap

// Right Card Scene
const rightCardScene = new THREE.Scene()
rightCardScene.background = new THREE.Color("#af30c0")

/**
 * Object
 */
// Details
const cardDetails = {
  width: 2.5 / 4, 
  height: 3.5 / 4
}

// Plinth
debugObject.color = '#dedede'

const plinthGeometry = new THREE.BoxGeometry(2, 1, 1, 2, 2, 2)
const plinthMaterial = new THREE.MeshBasicMaterial({ color: '#dedede', wireframe: false })
const plinth = new THREE.Mesh(plinthGeometry, plinthMaterial)

plinth.position.x = 0
plinth.position.y = -0.6
plinth.position.z = 0

scene.add(plinth)

const plinthTweaks = gui.addFolder('Plinth Tweaks')
plinthTweaks.close()

plinthTweaks
  .add(plinth.position, 'y')
  .min(- 10)
  .max(10)
  .step(0.01)
  .name('vertical')

plinthTweaks
  .add(plinth.position, 'x')
  .min(- 10)
  .max(10)
  .step(0.01)
  .name('horizontal')

plinthTweaks
  .add(plinth.position, 'z')
  .min(- 10)
  .max(10)
  .step(0.01)
  .name('depth')

plinthTweaks
  .add(plinth, 'visible')

plinthTweaks
  .add(plinthMaterial, 'wireframe')

plinthTweaks
  .addColor(debugObject, 'color')
  .onChange(() =>
  {
    plinthMaterial.color.set(debugObject.color)
  })

debugPlinth.spin = () =>
{
    gsap.to(plinth.rotation, { duration: 1, y: plinth.rotation.y + Math.PI * 2 })
}
plinthTweaks
    .add(debugPlinth, 'spin')

debugPlinth.subdivision = 2
plinthTweaks
    .add(debugPlinth, 'subdivision')
    .min(1)
    .max(20)
    .step(1)
    .onFinishChange(() =>
    {
      plinth.geometry.dispose()
      plinth.geometry = new THREE.BoxGeometry(
        debugPlinth.width, debugPlinth.height, debugPlinth.depth,
          debugPlinth.subdivision, debugPlinth.subdivision, debugPlinth.subdivision
      )
    })

debugPlinth.width = 1
  plinthTweaks
    .add(debugPlinth, 'width')
    .min(1)
    .max(20)
    .step(1)
    .onFinishChange(() =>
    {
      plinth.geometry.dispose()
      plinth.geometry = new THREE.BoxGeometry(
        debugPlinth.width, debugPlinth.height, debugPlinth.depth,
          debugPlinth.subdivision, debugPlinth.subdivision, debugPlinth.subdivision
      )
    })

debugPlinth.height = 1
  plinthTweaks
      .add(debugPlinth, 'height')
      .min(1)
      .max(20)
      .step(1)
      .onFinishChange(() =>
      {
        plinth.geometry.dispose()
        plinth.geometry = new THREE.BoxGeometry(
            debugPlinth.width, debugPlinth.height, debugPlinth.depth,
            debugPlinth.subdivision, debugPlinth.subdivision, debugPlinth.subdivision
        )
      })

debugPlinth.depth = 1
  plinthTweaks
    .add(debugPlinth, 'depth')
    .min(1)
    .max(20)
    .step(1)
    .onFinishChange(() =>
    {
      plinth.geometry.dispose()
      plinth.geometry = new THREE.BoxGeometry(
          debugPlinth.width, debugPlinth.height, debugPlinth.depth,
          debugPlinth.subdivision, debugPlinth.subdivision, debugPlinth.subdivision
      )
    })

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

cardTweaks
  .add(card, 'visible')

cardTweaks
  .add(cardMaterial, 'wireframe')

cardTweaks
  .addColor(debugObject, 'color')
  .onChange(() =>
  {
    cardMaterial.color.set(debugObject.color)
  })

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
  targetObject.position.z = - 5
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
leftTargetObject.position.z = - 5
// scene.add(targetObject)
leftCardScene.add(leftTargetObject)

const leftTargetObjectTweaks = gui.addFolder('Left Target Object Tweaks')
leftTargetObjectTweaks.close()

leftTargetObjectTweaks
.add(targetObject.position, 'y')
.min(- 10)
.max(10)
.step(0.01)
.name('vertical')

leftTargetObjectTweaks
.add(targetObject.position, 'x')
.min(- 10)
.max(10)
.step(0.01)
.name('horizontal')

leftTargetObjectTweaks
.add(targetObject.position, 'z')
.min(- 10)
.max(10)
.step(0.01)
.name('depth')

  // inTargetObject Right
  const rightTargetObjectGeometry = new THREE.DodecahedronGeometry(1)
  const rightTargetObjectMaterial = new THREE.MeshBasicMaterial({ color: '#0000ff'})
  const rightTargetObject = new THREE.Mesh(rightTargetObjectGeometry, rightTargetObjectMaterial)
  rightTargetObject.position.z = - 5
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
 * Sizes
 */
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
centerCardCamera.position.z = 2
centerCardCamera.lookAt(targetObject.position)
centerCardScene.add(centerCardCamera)

// Left Card Camera
const leftCardCamera = new THREE.PerspectiveCamera(45, cardSizes.width / cardSizes.height, 0.1, 100)
leftCardCamera.position.x = 0
leftCardCamera.position.y = 1
leftCardCamera.position.z = 2
leftCardCamera.lookAt(leftTargetObject.position)
centerCardScene.add(leftCardCamera)

// Right Card Camera
const rightCardCamera = new THREE.PerspectiveCamera(45, cardSizes.width / cardSizes.height, 0.1, 100)
rightCardCamera.position.x = 0
rightCardCamera.position.y = 1
rightCardCamera.position.z = 2
rightCardCamera.lookAt(rightTargetObject.position)
centerCardScene.add(rightCardCamera)

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