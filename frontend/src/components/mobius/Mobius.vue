<script setup lang="ts">
import * as THREE from 'three'
import { onMounted, onUnmounted, ref } from 'vue'
import type { MobiusProps, PointProps, Coor } from '@/types/components/Mobius'

const {
    phi0,
    points,
    trail = { lifetime: 1, emissionRate: 60 },
    pointSize = 0.025,
} = defineProps<MobiusProps>()

const r = 1

const entropyAnime = ref<HTMLDivElement | null>(null)
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer

function mobiusCoor(r: number, theta: number, v: number, h: number, phi0: number): Coor {
    const phi = phi0 + theta / 2
    const y = v * Math.sin(phi) + h * Math.cos(phi)
    const r0 = r + v * Math.cos(phi) - h * Math.sin(phi)
    const z = r0 * Math.cos(theta)
    const x = r0 * Math.sin(theta)
    return { x, y, z }
}

const coorBuf = new Float32Array(points.length * 3)

function setPointsCoor(point: THREE.Points, props: PointProps[], t: number) {
    for (let i = 0; i < props.length; i++) {
        const { theta0, omega } = props[i]
        let { v, h } = props[i]
        const theta = theta0 + omega * t
        const { randomProps } = props[i]
        if (randomProps) {
            const { randomList, hRandomScale, vRandomScale, hRandomIndex, vRandomIndex } =
                randomProps
            randomProps.vRandomIndex = (vRandomIndex + 1) % randomList.length
            randomProps.hRandomIndex = (hRandomIndex + 1) % randomList.length
            v += randomList[randomProps.vRandomIndex] * vRandomScale
            h += randomList[randomProps.hRandomIndex] * hRandomScale
        }
        const { x, y, z } = mobiusCoor(r, theta, v, h, phi0)
        coorBuf[i * 3] = x
        coorBuf[i * 3 + 1] = y
        coorBuf[i * 3 + 2] = z
    }
    const pointAttr = point.geometry.attributes.position
    const pointCoor = pointAttr.array
    pointCoor.set(coorBuf)
    pointAttr.needsUpdate = true
}

function initThree() {
    if (!entropyAnime.value) return
    const width = entropyAnime.value.clientWidth
    const height = entropyAnime.value.clientHeight

    scene = new THREE.Scene()

    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.z = 2
    camera.position.y = 1
    camera.lookAt(0, 0, 0)

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)

    renderer.setSize(width, height)
    entropyAnime.value.appendChild(renderer.domElement)
}

function resize() {
    if (!entropyAnime.value || !renderer) return
    const width = entropyAnime.value.clientWidth
    const height = entropyAnime.value.clientHeight
    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
}

const observer = new ResizeObserver(resize)

let pointCloudLength = Math.ceil(trail.lifetime * trail.emissionRate)
let dT = trail.lifetime / pointCloudLength
const pointCloud: THREE.Points[] = new Array(pointCloudLength)

function initPointCloud() {
    const dOpacity = pointCloudLength > 1 ? 1 / (pointCloudLength - 1) : 1

    const tempColor = new THREE.Color()
    const colors = new Float32Array(points.length * 3)
    for (let i = 0; i < points.length; i++) {
        tempColor.set(points[i].color)
        colors[i * 3] = tempColor.r
        colors[i * 3 + 1] = tempColor.g
        colors[i * 3 + 2] = tempColor.b
    }

    for (let i = 0; i < pointCloudLength; i++) {
        const geometry = new THREE.BufferGeometry()

        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

        const initialPositions = new Float32Array(points.length * 3)
        for (let j = 0; j < points.length; j++) {
            const { v, h, theta0, omega } = points[j]
            const dTheta = omega / trail.emissionRate
            const theta = theta0 - i * dTheta
            const { x, y, z } = mobiusCoor(r, theta, v, h, phi0)
            initialPositions[j * 3] = x
            initialPositions[j * 3 + 1] = y
            initialPositions[j * 3 + 2] = z
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(initialPositions, 3))

        const material = new THREE.PointsMaterial({
            size: pointSize,
            vertexColors: true,
            opacity: dOpacity * (pointCloudLength - i - 1),
            transparent: true,
        })

        const newPoints = new THREE.Points(geometry, material)
        pointCloud[i] = newPoints
        scene.add(newPoints)
    }
}

function createMobiusGeo(
    width: number,
    radSegments: number,
    widthSegments: number,
): THREE.BufferGeometry {
    const vertices: number[] = []
    const indices: number[] = []

    for (let i = 0; i <= radSegments; i++) {
        const theta = (i / radSegments) * Math.PI * 2
        for (let j = 0; j <= widthSegments; j++) {
            const v = (j / widthSegments - 0.5) * width
            const { x, y, z } = mobiusCoor(r, theta, v, 0, phi0)
            vertices.push(x, y, z)
        }
    }

    for (let i = 0; i < radSegments; i++) {
        for (let j = 0; j < widthSegments; j++) {
            const a = i * (widthSegments + 1) + j
            const b = a + 1
            const c = (i + 1) * (widthSegments + 1) + j
            const d = c + 1

            indices.push(a, b, c)
            indices.push(b, d, c)
        }
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setIndex(indices)
    geometry.computeVertexNormals()

    return geometry
}

let mobiusFrame: THREE.LineSegments
let lineMaterial: THREE.LineBasicMaterial

function initMobiusWireframe(geometry: THREE.BufferGeometry) {
    const wireframe = new THREE.WireframeGeometry(geometry)
    lineMaterial = new THREE.LineBasicMaterial({
        color: '#2980b9',
        linewidth: 1,
        opacity: 0.2,
        transparent: true,
    })
    mobiusFrame = new THREE.LineSegments(wireframe, lineMaterial)
    scene.add(mobiusFrame)
}

function initMobiusPlane(geometry: THREE.BufferGeometry) {
    const mobiusMaterial = new THREE.MeshBasicMaterial({
        color: '#ecf0f1',
        side: THREE.DoubleSide,
        opacity: 0.0,
        transparent: true,
    })
    const mobiusMesh = new THREE.Mesh(geometry, mobiusMaterial)
    scene.add(mobiusMesh)
}

let animationFrameId: number | null = null

function animate(t: number) {
    pointCloud.forEach((p, i) => {
        setPointsCoor(p, points, t / 1000 - dT * i)
    })

    renderer.render(scene, camera)

    animationFrameId = requestAnimationFrame(animate)
}

let mobiusGeometry: THREE.BufferGeometry

onMounted(() => {
    if (!entropyAnime.value) return
    observer.observe(entropyAnime.value)
    initThree()
    initPointCloud()

    mobiusGeometry = createMobiusGeo(0.2, 100, 2)
    // initMobiusPlane(mobiusGeometry)
    initMobiusWireframe(mobiusGeometry)

    animationFrameId = requestAnimationFrame(animate)
})

onUnmounted(() => {
    observer.disconnect()
    if (renderer && entropyAnime.value) {
        entropyAnime.value.removeChild(renderer.domElement)
    }
    pointCloud.forEach((p) => {
        scene.remove(p)
        p.geometry.dispose()
        const material = p.material as THREE.PointsMaterial
        material.dispose()
    })

    mobiusGeometry?.dispose()
    lineMaterial?.dispose()
    if (mobiusFrame) {
        scene.remove(mobiusFrame)
    }

    renderer?.dispose()
    scene?.clear()
    cancelAnimationFrame(animationFrameId as number)
})
</script>

<template>
    <div ref="entropyAnime" id="entropyAnime"></div>
</template>

<style scoped>
#entropyAnime {
    width: 100%;
    height: 100%;
}
</style>
