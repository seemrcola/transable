<script setup lang='ts'>
// 拖动和缩放的start坐标实际上可以共用，因为每次操作的时候，只会有一个生效，但是为了方便理解，还是分开写
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Props } from './props'
import type { Point, Coordinate, Orientation, Style } from './types'
import { ratioOrientation, orientation } from './types'
import { 
  getCenterPoint, rotatePoint, generateClassName, 
  getPointBySlopeOrIntercept, getVerticalSlope, getSlopeAndIntercept, getIntersectionPoint
} from './utils'
import { rafDebounce } from './raf'

const props = defineProps(Props)
const className = generateClassName()
// const RATIO = props.width / props.height

const initStyle = ref<Style>({
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

const coordinate = ref<Coordinate>()
function calculateCoordinate() {
  const { left, top, width, height } = initStyle.value
  const lt = { x: left, y: top }
  const rt = {x: left + width, y: top}
  const rb = { x: left + width, y: top + height}
  const lb = { x: left, y: top + height}
  return coordinate.value = { lt, rt, rb, lb }
}

// 选中与取消选中 --------------------------------------------
const selected = ref(false)
function clickHanlder(e: MouseEvent) {
  e.stopPropagation()
  selected.value = true
  // 坐标计算
  calculateCoordinate()
}
document.addEventListener('click', () => {
  selected.value = false
})

/**************************拖动*****************************/
// 拖动的时候会出现连续一个渲染周期内连续多次的mousemove事件，实际上可以处理成只有一个
const moveLock = ref(false)
const dragStart = { x: 0, y: 0 }
const delta = { x: 0, y: 0 }
const dragMouseMoveQueue: any[] = []
function mousedownHandler(e: MouseEvent) {
  selected.value = true
  moveLock.value = true
  const { clientX, clientY } = e
  dragStart.x = clientX
  dragStart.y = clientY
  document.addEventListener('mousemove', mousemoveHandler)
  document.addEventListener('mouseup', mouseupHandler)
}
function mousemoveHandler(e: MouseEvent) {
  if (!moveLock.value)
    return
  const task = () => {
    const { clientX, clientY } = e
    delta.x = clientX - dragStart.x
    delta.y = clientY - dragStart.y
    dragStart.x = clientX
    dragStart.y = clientY
    // 通过delta.x和delta.y来改变组件的left和top
    initStyle.value.left += delta.x
    initStyle.value.top += delta.y
    // 坐标计算
    calculateCoordinate()
  }
  // 为了防止一些不必要的计算，我们可以将连续的mousemove事件合并成一个
  // 通过一个队列来存储mousemove事件，然后在下一个渲染周期内，只取最后一个事件来处理
  rafDebounce(task, dragMouseMoveQueue)
}
function mouseupHandler() {
  moveLock.value = false
  document.removeEventListener('mousemove', mousemoveHandler)
  document.removeEventListener('mouseup', mouseupHandler)
}
/**************************拖动end**************************/

/***************************缩放****************************/
const scaleLock = ref(false)
let staticPoint: Point = { x: 0, y: 0 }
let mousePoint: Point = { x: 0, y: 0 }
let direction: Orientation = 'lt'
const scaleMouseQueue: any[] = []
function mousedownTransHandler(e: MouseEvent, item: Orientation) {
  scaleLock.value = true
  direction = item
  document.addEventListener('mousemove', mousemoveTransHandler)
  document.addEventListener('mouseup', mouseupTransHandler)
  // 1.根据当前点击的点，计算出其关于中心点对称的点，称为staticPoint
  centerPoint = getCenterPoint(`.${className}`)
  // centerPoint = getCenterPoint2(initStyle.value)
  staticPoint = { x: centerPoint.x * 2 - e.clientX, y: centerPoint.y * 2 - e.clientY }
  mousePoint = { x: e.clientX, y: e.clientY }
}
function mousemoveTransHandler(e: MouseEvent) {
  if (!scaleLock.value)
    return
  const task = () => {
    // 2. 点击组件某个点进行拉伸时，通过当前鼠标实时坐标和对称点计算出新的组件中心点：
    // 3. 由于组件可能处于旋转状态，所以我们的缩放应该是去计算组件未旋转时的情况，然后transform: rotate(rotate)即可
    // 当移动四个角的时候
    if(['lt', 'lb', 'rt', 'rb'].includes(direction)) {
      centerPoint = { x: (e.clientX + staticPoint.x) / 2, y: (e.clientY + staticPoint.y) / 2 }
      mousePoint = { x: e.clientX, y: e.clientY }
      const before = rotatePoint(mousePoint, centerPoint, -initStyle.value.rotate)
      vertex(before) 
    }
    // 当移动四条边的时候
    if(['t', 'b', 'l', 'r'].includes(direction)) {
      // 通过staticPoint和centerPoint计算出直线的方程 
      // fx = (x: number) => k * x + b
      const { slope:k, intercept:b } = getSlopeAndIntercept(staticPoint, centerPoint)
      // 容易知道 无论如何移动我们的mousePoint 该点必定在fx的过staticPoint垂线(记为fx2)上 
      // 拿到fx2的斜率
      const k2 = getVerticalSlope(k)
      // 拿到过fx2的一个点mousePointss
      mousePoint = { x: e.clientX, y: e.clientY }
      // 求出fx2的方程 fx2 = (x: number) => k2 * x + b2
      const { intercept:b2 } = getPointBySlopeOrIntercept(mousePoint,  { slope: k2 })
      // 求出fx2和fx的交点
      const { x, y } = getIntersectionPoint([k, b], [k2, b2])
      // 算出centerPoint 
      centerPoint = { x: (x + staticPoint.x) / 2, y: (y + staticPoint.y) / 2 }
      // 根据矩形旋转的角度，计算旋转前的点before
      const before = rotatePoint({ x, y }, centerPoint, -initStyle.value.rotate)

      if(direction === 't' || direction === 'b') edgeX(before)
      if(direction === 'l' || direction === 'r') edgeY(before)
    }
    calculateCoordinate()
  }
  rafDebounce(task, scaleMouseQueue)
}
function mouseupTransHandler() {
  scaleLock.value = false
  document.removeEventListener('mousemove', mousemoveTransHandler)
  document.removeEventListener('mouseup', mouseupTransHandler)
}
// 顶点 ------------------------------------------------
function vertex(before: Point) {
  // 当移动四个角的时候
  const width = Math.abs(before.x - centerPoint.x) * 2
  const height = Math.abs(before.y - centerPoint.y) * 2
  initStyle.value.width = width
  initStyle.value.height = height
  initStyle.value.left = centerPoint.x - width / 2
  initStyle.value.top = centerPoint.y - height / 2
}
// 边 --------------------------------------------------
function edgeX(before: Point) {
  // 这个情况下，width不变，height变化
  const height = Math.abs(before.y - centerPoint.y) * 2
  initStyle.value.height = height
  initStyle.value.top = centerPoint.y - height / 2
  initStyle.value.left = centerPoint.x - initStyle.value.width / 2
}
function edgeY(before: Point) {
  // 这个情况下，height不变，width变化
  const width = Math.abs(before.x - centerPoint.x) * 2
  initStyle.value.width = width
  initStyle.value.left = centerPoint.x - width / 2
  initStyle.value.top = centerPoint.y - initStyle.value.height / 2
}
/*****************************缩放end***************************/

/*****************************旋转计算***************************/
const rotateLock = ref(false)
let centerPoint = { x: 0, y: 0 }
let rotateStart = { x: 0, y: 0 }
const rotateMouseQueue:any[] = []
function rotateHanlder(e: MouseEvent) {
  e.stopPropagation()
  rotateLock.value = true
  document.addEventListener('mousemove', mousemoveRotateHandler)
  document.addEventListener('mouseup', mouseupRotateHandler)

  const { clientX, clientY } = e
  rotateStart = { x: clientX, y: clientY }
  centerPoint = getCenterPoint(`.${className}`)
}
function mousemoveRotateHandler(e: MouseEvent) {
  if (!rotateLock)
    return
  const task = () => {
    const { clientX, clientY } = e

    // 计算出旋转角度 deltatheta = theta after - theta before
    const rotateAfter = Math.atan2(
      clientY - centerPoint.y, 
      clientX - centerPoint.x) * (180 / Math.PI)
    const rotateBefore = Math.atan2(
      rotateStart.y - centerPoint.y, 
      rotateStart.x - centerPoint.x) * (180 / Math.PI)
    const deltaTheta = rotateAfter - rotateBefore

    initStyle.value.rotate += deltaTheta
    rotateStart = { x: clientX, y: clientY }
  }
  
  rafDebounce(task, rotateMouseQueue)
}
function mouseupRotateHandler() {
  rotateLock.value = false
  document.removeEventListener('mousemove', mousemoveRotateHandler)
  document.removeEventListener('mouseup', mouseupRotateHandler)
}
/***************************旋转计算end**************************/

function reset(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  selected.value = false
  moveLock.value = false
  scaleLock.value = false
  rotateLock.value = false
}

let mode = 'normal'
const keydownHandler = (e: KeyboardEvent) =>  mode = e.key === 'Shift' ? 'ratio' : 'normal'
const keyupHandler = (e: KeyboardEvent) => {
  if (e.key === 'Shift')  mode = 'normal'
}
onMounted(() => {
  document.addEventListener('keydown', keydownHandler)
  document.addEventListener('keyup', keyupHandler)
})
onUnmounted(() => {
  document.removeEventListener('keydown', keydownHandler)
  document.removeEventListener('keyup', keyupHandler)
})

// expose ------------------------------------------------------
function setMode(m: 'normal' | 'ratio') {
  mode = m
}
function getMode() {
  return mode
}
function getCoordinate() {
  return { ...coordinate.value, rotate: initStyle.value.rotate }
}
defineExpose({
  setMode,
  getMode,
  getCoordinate,
})
</script>

<template>
  <div 
    class="transable __transable__" 
    :class="{
      'selected': selected,
      'transable-wrapper': selected,
      [className]: true,
    }" 
    :style="scaleableStyle" 
    @click="clickHanlder" 
    @mousedown="mousedownHandler"
    @contextmenu="reset"
  >
    <slot />
    <!-- 旋转图标 -->
    <div v-if="selected" class="rotate bg-blue-400 select-none" @mousedown="rotateHanlder">↻</div>
    <!-- 八个方向的点 -->
    <template v-for="(item) of orientation" :key="item">
      <div 
        v-if="selected" :class="item" class="bigger bg-blue-400"
        @mousedown.stop="($event) => mousedownTransHandler($event, item)" 
      />
    </template>
    <!-- 四个角的坐标 -->
    <template v-for="(item) of ratioOrientation" :key="item">
      <div 
        v-if="(moveLock || scaleLock || rotateLock) && props.showCoords" 
        :class='[`ratio-${item}`, item]'
        class="select-none"
      >
        [{{ ~~(coordinate?.[item].x || 0) }}, {{ ~~(coordinate?.[item].y || 0) }}]
      </div>
    </template>
  </div>
</template>

<style scoped>
@import './main.css';
</style>
./props
