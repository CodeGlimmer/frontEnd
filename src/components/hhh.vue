<template>
  <div class="urdf-viewer-container">
    <div ref="container" class="urdf-container"></div>
  </div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { URDFLoader } from 'urdf-loader'

export default {
  name: 'URDFViewer',
  props: {
    urdfPath: {
      type: String,
      default: '/models/robot.urdf',
    },
    width: {
      type: Number,
      default: 800,
    },
    height: {
      type: Number,
      default: 600,
    },
  },
  data() {
    return {
      scene: null,
      camera: null,
      renderer: null,
      controls: null,
      robot: null,
      loader: null,
      animationFrameId: null,
    }
  },
  mounted() {
    this.initScene()
    this.loadURDF()
    window.addEventListener('resize', this.onResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize)
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }
    // 清理Three.js资源
    if (this.renderer) {
      this.renderer.dispose()
    }
  },
  methods: {
    initScene() {
      // 创建场景
      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color(0xf0f0f0)

      // 创建相机
      this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000)
      this.camera.position.set(2, 2, 2)
      this.camera.lookAt(0, 0, 0)

      // 创建渲染器
      this.renderer = new THREE.WebGLRenderer({ antialias: true })
      this.renderer.setSize(this.width, this.height)
      this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.shadowMap.enabled = true
      this.$refs.container.appendChild(this.renderer.domElement)

      // 创建控制器
      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
      this.controls.enableDamping = true
      this.controls.dampingFactor = 0.25
      this.controls.screenSpacePanning = false
      this.controls.maxPolarAngle = Math.PI / 2

      // 添加灯光
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
      this.scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
      directionalLight.position.set(10, 10, 10)
      directionalLight.castShadow = true
      this.scene.add(directionalLight)

      // 添加网格地面
      const gridHelper = new THREE.GridHelper(10, 10)
      this.scene.add(gridHelper)

      // 开始动画循环
      this.animate()
    },
    loadURDF() {
      // 创建URDF加载器
      this.loader = new URDFLoader()

      // 配置模型加载回调
      this.loader.loadMeshCb = this.loadMesh

      // 加载URDF模型
      this.loader.load(this.urdfPath, (robot) => {
        this.robot = robot
        this.scene.add(robot)

        // 调整机器人的位置
        robot.position.set(0, 0, 0)

        // 设置关节初始位置
        Object.values(robot.joints).forEach((joint) => {
          if (joint.isActuated) {
            joint.setJointValue(0)
          }
        })

        // 调整相机以便能完全看到机器人
        this.fitCameraToObject(robot)
      })
    },
    loadMesh(path, manager, onComplete) {
      // 处理相对路径
      if (path.indexOf('package://') === 0) {
        path = path.replace('package://', '/models/')
      }

      const loader = new STLLoader(manager)
      loader.load(
        path,
        (geometry) => {
          const material = new THREE.MeshPhongMaterial({
            color: 0x888888,
            specular: 0x111111,
            shininess: 200,
          })
          const mesh = new THREE.Mesh(geometry, material)
          mesh.castShadow = true
          mesh.receiveShadow = true

          onComplete(mesh)
        },
        undefined,
        (error) => {
          console.error('加载STL文件出错:', error)
          onComplete(null)
        },
      )
    },
    animate() {
      this.animationFrameId = requestAnimationFrame(this.animate)

      // 更新控制器
      if (this.controls) {
        this.controls.update()
      }

      // 渲染场景
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera)
      }
    },
    onResize() {
      if (this.camera && this.renderer) {
        // 更新相机和渲染器
        this.camera.aspect = this.width / this.height
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(this.width, this.height)
      }
    },
    fitCameraToObject(object) {
      // 计算包围盒
      const boundingBox = new THREE.Box3().setFromObject(object)
      const center = boundingBox.getCenter(new THREE.Vector3())
      const size = boundingBox.getSize(new THREE.Vector3())

      // 计算新的相机位置
      const maxDim = Math.max(size.x, size.y, size.z)
      const fov = this.camera.fov * (Math.PI / 180)
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2))
      cameraZ = Math.max(cameraZ, 1) // 确保相机不会太近

      // 设置相机位置
      this.camera.position.set(center.x + cameraZ, center.y + cameraZ, center.z + cameraZ)
      this.camera.lookAt(center)

      // 更新控制器的目标位置
      this.controls.target.set(center.x, center.y, center.z)
      this.controls.update()
    },
  },
}
</script>

<style scoped>
.urdf-viewer-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.urdf-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
