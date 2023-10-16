<script setup lang='ts'>
// 拖动和缩放的start坐标实际上可以共用，因为每次操作的时候，只会有一个生效，但是为了方便理解，还是分开写
import { computed, ref } from 'vue'
import { Props } from '../lib/props.d'

const props = defineProps(Props)

// 样式对象------------------------------------------
const initStyle = ref({
  width: props.width,
  height: props.height,
  left: props.left,
  top: props.top,
  rotate: props.rotate,
})
const scaleableStyle = computed(() => {
  return {
    width: `${initStyle.value.width}px`,
    height: `${initStyle.value.height}px`,
    left: `${initStyle.value.left}px`,
    top: `${initStyle.value.top}px`,
    transform: `rotate(${initStyle.value.rotate}deg)`,
  }
})
// ------------------------------------------------------- 

// 选中状态 ------------------------------------------------
const selected = ref(false)
function clickHanlder(e: MouseEvent) {
  e.stopPropagation()
  selected.value = true
  calculateCoordinate()
}

document.addEventListener('click', () => {
  selected.value = false
})

// 方位与坐标---------------------------------------------
type Point = { x: number, y: number }
type Coordinate = { lt: Point, rt: Point, rb: Point, lb: Point }

const coordinate = ref<Coordinate>()
function calculateCoordinate() {
  // 计算出四个顶点的坐标 需考虑旋转
  const { left, top, width, height } = initStyle.value
  const lt = { x: left, y: top }
  const rt = {x: left + width, y: top}
  const rb = { x: left + width, y: top + height}
  const lb = { x: left, y: top + height}
  return coordinate.value = { lt, rt, rb, lb }
}

// 旋转计算 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const rotateLock = ref(false)
let staticPoint = { x: 0, y: 0 }
let centerPoint = { x: 0, y: 0 }
let rotateStart = { x: 0, y: 0 }
function rotateHanlder(e: MouseEvent) {
  e.stopPropagation()
  rotateLock.value = true
  document.addEventListener('mousemove', mousemoveRotateHandler)
  document.addEventListener('mouseup', mouseupRotateHandler)

  const { clientX, clientY } = e
  rotateStart = { x: clientX, y: clientY }
  // 思路如下：
  // 首先依然是，我们从某个点开始拖动的时候，以这个点为动点，其关于中心点的对称点为固定点
  // 第一步：我们要计算出中心点的坐标
  // 两个对角线的函数分别是y = k1 * x + b1 和 y = k2 * x + b2
  // 我们可以通过两个点的坐标来计算出k和b
  // 然后通过两个函数的交点来计算出中心点
  // 第二步：拿到固定点坐标
  // 第三步：存下固定点坐标
  const { lt, rb } = coordinate.value as Coordinate
  centerPoint = getCenterPoint(lt, rb)
  staticPoint = {
    x: centerPoint.x * 2 - clientX,
    y: centerPoint.y * 2 - clientY,
  }
}
function mousemoveRotateHandler(e: MouseEvent) {
  if (!rotateLock)
    return
  const { clientX, clientY } = e
  // 第四步：根据之前存下的静态点坐标 计算出当前情况下的中心点
  // 第五步：计算出旋转角度
  // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2
  const rotateAfter = Math.atan2(
    clientY - centerPoint.y, 
    clientX - centerPoint.x
    ) * (180 / Math.PI)
  const rotateBefore = Math.atan2(
    rotateStart.y - centerPoint.y, 
    rotateStart.x - centerPoint.x
    ) * (180 / Math.PI)
  const deltaTheta = rotateAfter - rotateBefore
  initStyle.value.rotate += deltaTheta
  rotateStart = { x: clientX, y: clientY }
  console.log(initStyle.value.rotate, rotateAfter, rotateBefore , 'rotate')

  // 第六步：根据当前坐标计算未旋转时的坐标
  // 注：我们的坐标是不考虑旋转的 所以我们要把当前的计算处理成不旋转的时候再计算
  // https://www.zhihu.com/question/67425734/answer/252724399
  // 也可以直接用R来计算 以centerPoint为中心点 旋转angle角度
  // 这里我们采用知乎这个回答的矩阵计算
}
function mouseupRotateHandler() {
  rotateLock.value = false
  document.removeEventListener('mousemove', mousemoveRotateHandler)
  document.removeEventListener('mouseup', mouseupRotateHandler)
}
function getCenterPoint(lt: Point, rb: Point) {
  // 矩形中心点公式
  return {
    x: (lt.x + rb.x) / 2,
    y: (lt.y + rb.y) / 2,
  }
}
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<旋转计算end

function reset(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  selected.value = false
  rotateLock.value = false
}
</script>

<template>
  <div 
    class="transable" 
    :class="{
      'selected': selected,
      'transable-wrapper': selected,
    }" 
    bg-red
    :style="scaleableStyle" 
    @click="clickHanlder" 
    @contextmenu="reset"
  >
    <slot />
    <!-- 旋转图标 -->
    <div v-if="selected" class="rotate bg-blue-400" @mousedown="rotateHanlder">↻</div>
  </div>
</template>

<style scoped>
@import '../lib/main.css';
</style>
