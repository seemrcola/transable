<script setup lang='ts' name="NoMoveable">
// 拖动和缩放的start坐标实际上可以共用，因为每次操作的时候，只会有一个生效，但是为了方便理解，还是分开写
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Props } from './props.d'

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

  // 坐标计算
  calculateCoordinate()
}
// 点击任意非选中区域，取消选中状态
// 没有选中状态的话，旋转点和缩放点都不会展示
document.addEventListener('click', () => {
  selected.value = false
})

// 方位与坐标---------------------------------------------
type Orientation = 'lt' | 'rt' | 'rb' | 'lb' | 't' | 'r' | 'b' | 'l'
const orientation: Orientation[] = ['lt', 'rt', 'rb', 'lb', 't', 'r', 'b', 'l']

type RatioOrientation = 'lt' | 'rb' | 'rt' | 'lb'
const ratioOrientation: RatioOrientation[] = ['lt', 'rb', 'rt', 'lb']

type Coordinate = {
  lt: { x: number, y: number },
  rt: { x: number, y: number },
  rb: { x: number, y: number },
  lb: { x: number, y: number },
}

// 拖动>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const moveLock = ref(false)
const dragStart = { x: 0, y: 0 }
const delta = { x: 0, y: 0 }
let mode = 'normal'

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
function mouseupHandler() {
  moveLock.value = false
  document.removeEventListener('mousemove', mousemoveHandler)
  document.removeEventListener('mouseup', mouseupHandler)
}
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<拖动end

// 缩放>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const scaleLock = ref(false)
let directionEnum: Orientation = 'rb'
const startTans = { x: 0, y: 0 } // 自由
const deltaTrans = { x: 0, y: 0 } // 自由
let lockCurrent = { ...initStyle.value } // 等比
function mousedownTransHandler(e: MouseEvent, item: Orientation) {
  scaleLock.value = true
  const { clientX, clientY } = e
  startTans.x = clientX
  startTans.y = clientY
  directionEnum = item
  lockCurrent = { ...initStyle.value }
  document.addEventListener('mousemove', mousemoveTransHandler)
  document.addEventListener('mouseup', mouseupTransHandler)
}
function mousemoveTransHandler(e: MouseEvent) {
  if (!scaleLock.value)
    return
  mode === 'normal' ? normal(e) : ratio(e)

  // 坐标计算
  calculateCoordinate()
}
function mouseupTransHandler() {
  scaleLock.value = false
  document.removeEventListener('mousemove', mousemoveTransHandler)
  document.removeEventListener('mouseup', mouseupTransHandler)
}
// 自由 ------------------------------------------------
function normal(e: MouseEvent) {
  const { clientX, clientY } = e
  deltaTrans.x = clientX - startTans.x
  deltaTrans.y = clientY - startTans.y

  // 拖拽不同的点的时候，我们要改变的component的属性不同
  // 当拖拽含有l的点的时候，我们要改变的是left和width
  // 当拖拽含有t的点的时候，我们要改变的是top和height
  // 当拖拽含有r的点的时候，我们要改变的是width
  // 当拖拽含有b的点的时候，我们要改变的是height

  // 根据上述规则修改wrapper宽高和位置
  if (directionEnum.includes('l')) {
    initStyle.value.width -= deltaTrans.x
    initStyle.value.left += deltaTrans.x
  }
  if (directionEnum.includes('t')) {
    initStyle.value.height -= deltaTrans.y
    initStyle.value.top += deltaTrans.y
  }
  if (directionEnum.includes('r'))
    initStyle.value.width += deltaTrans.x

  if (directionEnum.includes('b'))
    initStyle.value.height += deltaTrans.y

  startTans.x = clientX
  startTans.y = clientY
}
// 等比 因为等比可能会有其他不同的需求，单独拆出写，后面方便按需改 
function ratio(e: MouseEvent) {
  initStyle.value = { ...lockCurrent }
  const { clientX, clientY } = e

  // 有了下面的代码作为例子 我们就可以开始实现 
  // 首先获取到用户点的哪个点 我们只对四个角落点进行处理
  const usefulOrientation = ratioOrientation
  if (!usefulOrientation.includes(directionEnum as RatioOrientation))
    return
  // 我们分别拿到当前点为活动点 对角线的点为固定点 也就是说对角线的点left和top是固定的
  const usefulOrientationMap = {
    'lt': { left: lockCurrent.left + lockCurrent.width, top: lockCurrent.top + lockCurrent.height },
    'rb': { left: lockCurrent.left, top: lockCurrent.top },
    'rt': { left: lockCurrent.left, top: lockCurrent.top + lockCurrent.height },
    'lb': { left: lockCurrent.left + lockCurrent.width, top: lockCurrent.top },
  }
  const moveDirection = directionEnum as RatioOrientation
  // 拿到固定点的left和top
  const lockDirection = usefulOrientationMap[moveDirection]
  // 根据当前的clientX和clientY 计算出鼠标到固定点的距离的绝对值
  const distance = {
    x: Math.abs(clientX - lockDirection.left),
    y: Math.abs(clientY - lockDirection.top),
  }
  // 再算出活动点到固定点的距离 即元素当前的宽高
  const distance2 = {
    x: lockCurrent.width,
    y: lockCurrent.height,
  }
  // 计算出鼠标到固定点的距离和活动点到固定点的距离的比例
  const ratio = {
    x: distance.x / distance2.x,
    y: distance.y / distance2.y,
  }

  const ratioValue = Math.max(ratio.x, ratio.y)
  // 根据ratioValue计算出新的宽高
  initStyle.value.width *= ratioValue
  initStyle.value.height *= ratioValue
  // 如果是l和t的点，我们还要修改left和top
  if (moveDirection.includes('l'))
    initStyle.value.left = lockCurrent.left + lockCurrent.width - initStyle.value.width
  if (moveDirection.includes('t'))
    initStyle.value.top = lockCurrent.top + lockCurrent.height - initStyle.value.height

}
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<缩放end

// 拖拽和缩放的坐标计算 （旋转的需要单独写） >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
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
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<坐标计算end


// 旋转计算 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const rotateLock = ref(false)
function rotateHanlder(e: MouseEvent) {
  e.stopPropagation()
  rotateLock.value = true
  console.log('rotate', rotateLock.value)
  document.addEventListener('mousemove', mousemoveRotateHandler)
  document.addEventListener('mouseup', mouseupRotateHandler)
}
function mousemoveRotateHandler(e: MouseEvent) {
  if (!rotateLock)
    return
  const { clientX, clientY } = e
  // 两个对角线的函数分别是y = k1 * x + b1 和 y = k2 * x + b2
  // 我们可以通过两个点的坐标来计算出k和b
  function calcFx(p1: { x: number, y: number }, p2: { x: number, y: number }) {
    const k = (p2.y - p1.y) / (p2.x - p1.x)
    const b = p1.y - k * p1.x
    return { k, b }
  }
  const { lt, rt, rb, lb } = coordinate.value as Coordinate
  const { k: k1, b: b1 } = calcFx(lt, rb)
  const { k: k2, b: b2 } = calcFx(rt, lb)
  // 计算交点
  // 即 k1 * x + b1 = k2 * x + b2 
  const x0 = (b2 - b1) / (k1 - k2)
  const y0 = k1 * x0 + b1
  const thePoint = { x: x0, y: y0 } // 交点即为中心点

  // 接下来需要计算的就是旋转的角度
  function calcAngle(p0: { x: number, y: number }, target: { x: number, y: number }) {
    const x = target.x - p0.x
    const y = target.y - p0.y
    // 
    const angle = Math.atan2(x, y) * (180 / Math.PI) 
    return 180 - angle
  }
  const theTheta = calcAngle(thePoint, { x: clientX, y: clientY })
  initStyle.value.rotate = theTheta

  // 计算出旋转后的四个顶点的坐标
  function calculateRotateCoordinate() {
    const theta = theTheta
    const center = thePoint
    // 把对角线当作直径，圆心即位中心点
    // theta代表旋转的角度
    // 1. 先算出半径
    // 先随便找一个顶点 
    const p = coordinate.value?.lb as { x: number, y: number }
    const R = Math.sqrt(Math.pow(p.x - center.x, 2) + Math.pow(p.y - center.y, 2))
    // 2. 算出旋转后的四个顶点的坐标 例如 lt 的横坐标即为 center.x + R * cos(theta) 纵坐标 center.y + R * sin(theta)
    console.log(theta, R, 'xxxx')

    return {lt, rt, rb, lb}
  }
  const coords = calculateRotateCoordinate()
  coordinate.value = coords
}
function mouseupRotateHandler() {
  rotateLock.value = false
  document.removeEventListener('mousemove', mousemoveRotateHandler)
  document.removeEventListener('mouseup', mouseupRotateHandler)
}
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<旋转计算end

function reset(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  selected.value = false
  moveLock.value = false
  scaleLock.value = false
  rotateLock.value = false
}

const keyupHandler = (e: KeyboardEvent) => {
  mode = e.key === 'Shift' ? 'normal' : 'ratio'
}
onMounted(() => {
  document.addEventListener('keyup', keyupHandler)
})
onUnmounted(() => {
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
  return coordinate.value
}
defineExpose({
  setMode,
  getMode,
  getCoordinate,
})
</script>

<template>
  <div 
    class="transable" 
    :class="{
      'selected': selected,
      'transable-wrapper': selected,
    }" 
    :style="scaleableStyle" 
    @click="clickHanlder" 
    @mousedown="mousedownHandler"
    @contextmenu="reset"
  >
    <slot />
    <!-- 旋转图标 -->
    <div v-if="selected" class="rotate" @mousedown="rotateHanlder">↻</div>
    <!-- 八个方向的点 -->
    <template v-for="(item) of orientation" :key="item">
      <div 
        v-if="selected" :class="item" class="bigger bg-blue-400"
        @mousedown.stop="($event) => mousedownTransHandler($event, item)" 
      />
    </template>
    <!-- 四个角的坐标 -->
    <template v-for="(item) of ratioOrientation" :key="item">
      <div v-if="(moveLock || scaleLock || rotateLock) && props.showCoords" :class='[`ratio-${item}`, item]'>
        [{{ ~~(coordinate?.[item].x || 0) }}, {{ ~~(coordinate?.[item].y || 0) }}]
      </div>
    </template>
  </div>
</template>

<style scoped>
@import './main.css';
</style>
