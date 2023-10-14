<script setup lang='ts' name="NoMoveable">
// 拖动和缩放的start坐标实际上可以共用，因为每次操作的时候，只会有一个生效，但是为了方便理解，还是分开写
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Props } from './props.d'

const props = defineProps(Props)

// 基础配置--------------------------------------
const initStyle = ref({
  width: props.width,
  height: props.height,
  left: props.left,
  top: props.top,
})
const scaleableStyle = computed(() => {
  return {
    width: `${initStyle.value.width}px`,
    height: `${initStyle.value.height}px`,
    left: `${initStyle.value.left}px`,
    top: `${initStyle.value.top}px`,
  }
})

// 选中状态 ------------------------------------
const selected = ref(false)
function clickHanlder(e: MouseEvent) {
  e.stopPropagation()
  selected.value = true
}
// 点击任意非选中区域，取消选中状态
document.addEventListener('click', () => {
  selected.value = false
})

// 方位与坐标--------------------------------------------------------------
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

// 拖动--------------------------------------------------------------
const moveLock = ref(false)
const dragStart = { x: 0, y: 0 }
const delta = { x: 0, y: 0 }
let mode = 'normal'

function mousedownHandler(e: MouseEvent) {
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
// ----------------------------------------------------------------

// 缩放------------------------------------------------------------
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
// 等比 因为等比可能会有其他不同的需求，单独拆出写，后面方便按需改 -----------------------
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

// 坐标计算 ------------------------------------------------
// 当开始拖动或者缩放的时候 我们会在图形的四个顶点展示坐标
// 这里我们需要计算出四个顶点的坐标
// 但是我们不需要每次都计算，只有在拖动或者缩放的时候才需要计算
// 所以我们可以把计算的逻辑放到一个函数里面，然后在拖动或者缩放的时候调用
const coordinate = ref<Coordinate>()
function calculateCoordinate() {
  // 计算出四个顶点的坐标
  const lt = {
    x: initStyle.value.left,
    y: initStyle.value.top,
  }
  const rt = {
    x: initStyle.value.left + initStyle.value.width,
    y: initStyle.value.top,
  }
  const rb = {
    x: initStyle.value.left + initStyle.value.width,
    y: initStyle.value.top + initStyle.value.height,
  }
  const lb = {
    x: initStyle.value.left,
    y: initStyle.value.top + initStyle.value.height,
  }
  return coordinate.value = { lt, rt, rb, lb }
}
// ----------------------------------------------------------------
const keyupHandler = (e: KeyboardEvent) => {
  mode = e.key === 'Shift' ? 'normal' : 'ratio'
}
onMounted(() => {
  document.addEventListener('keyup', keyupHandler)
})
onUnmounted(() => {
  document.removeEventListener('keyup', keyupHandler)
})

// expose -------------------------------------------
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
  <div class="transable" 
    :class="{
      'selected': selected,
      'transable-wrapper': selected,
    }" 
    :style="scaleableStyle" 
    @click="clickHanlder" 
    @mousedown="mousedownHandler"
    @contextmenu.prevent="moveLock = false"
  >
    <slot />
    <!-- 八个方向的点 -->
    <template v-for="(item) of orientation" :key="item">
      <div v-if="selected" :class="item" class="bigger bg-blue-400"
        @mousedown.stop="($event) => mousedownTransHandler($event, item)" />
    </template>
    <!-- 四个角的坐标 -->
    <template v-for="(item) of ratioOrientation" :key="item">
      <div v-if="(moveLock || scaleLock) && props.showCoords" :class='[`ratio-${item}`, item]'>
        [{{ ~~(coordinate?.[item].x || 0) }}, {{ ~~(coordinate?.[item].y || 0) }}]   
      </div>
    </template>
  </div>
</template>

<style scoped>
@import './main.css';
</style>
