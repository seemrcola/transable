<script setup lang='ts'>
// 拖动和缩放的start坐标实际上可以共用，因为每次操作的时候，只会有一个生效，但是为了方便理解，还是分开写
import { computed, ref } from 'vue'
import { Props } from './props'
import type { Orientation } from './types'
import { ratioOrientation, orientation } from './types'

import { Transable } from '../core/index'
import type { Style, Coordinate } from '../core/index'

import { generateClassName, getInitCoordinate } from './utils'
import { rafDebounce } from '../raf'

const props = defineProps(Props)
const className = generateClassName()

const initStyle = ref<Style>({
  width: props.width,
  height: props.height,
  left: props.left,
  top: props.top,
  rotate: props.rotate,
})

const transable = new Transable({
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

const ifFirstRender = ref(true) // 第一次渲染的时候，还没有组件坐标信息
const coordinate = ref<Coordinate>()

// 选中与取消选中 --------------------------------------------
const selected = ref(false)
function clickHanlder(e: MouseEvent) {
  e.stopPropagation()
  selected.value = true
}
document.addEventListener('click', () => {
  selected.value = false
})

/**************************拖动*****************************/
// 拖动的时候会出现连续一个渲染周期内连续多次的mousemove事件，实际上可以处理成只有一个
const moveLock = ref(false)
const dragStart = { x: 0, y: 0 }
const dragMouseMoveQueue: any[] = []
function mousedownHandler(e: MouseEvent) {
  selected.value = true
  moveLock.value = true
  const { clientX, clientY } = e
  dragStart.x = clientX
  dragStart.y = clientY
  document.addEventListener('mousemove', mousemoveHandler)
  document.addEventListener('mouseup', mouseupHandler)
  // 补丁，处理第一次渲染的时候，获取不到组件的坐标信息
  if(ifFirstRender.value) {
    coordinate.value = getInitCoordinate(`.${className}`)
    ifFirstRender.value = false
  }
}
function mousemoveHandler(e: MouseEvent) {
  if (!moveLock.value)
    return
  const task = () => {
    const { clientX, clientY } = e

    const style = transable._drag({ deltaX: clientX - dragStart.x, deltaY: clientY - dragStart.y})
    const coord = transable.getCoordinate()
    initStyle.value = { ...style}
    coordinate.value = { ...coord }

    dragStart.x = clientX
    dragStart.y = clientY
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
let direction: Orientation = 'lt'
const scaleMouseQueue: any[] = []
function mousedownTransHandler(e: MouseEvent, item: Orientation) {
  scaleLock.value = true
  direction = item
  document.addEventListener('mousemove', mousemoveTransHandler)
  document.addEventListener('mouseup', mouseupTransHandler)

  const mousePoint = { x: e.clientX, y: e.clientY }
  transable._initResizePoints(mousePoint)
}
function mousemoveTransHandler(e: MouseEvent) {
  if (!scaleLock.value)
    return
  const task = () => {
    const mousePoint = { x: e.clientX, y: e.clientY }
    let style: Style = initStyle.value
    // 当移动四个角的时候
    if(['lt', 'lb', 'rt', 'rb'].includes(direction)) {
      style = transable._resize(mousePoint, 'vertex')
    }
    // 当移动四条边的时候
    if(['t', 'b', 'l', 'r'].includes(direction)) {
      if(direction === 't' || direction === 'b') 
        style = transable._resize(mousePoint, 'edgeX')
      if(direction === 'l' || direction === 'r')
        style = transable._resize(mousePoint, 'edgeY')
    }
    initStyle.value = { ...style }
    const coord = transable.getCoordinate()
    coordinate.value = { ...coord }
  }
  rafDebounce(task, scaleMouseQueue)
}
function mouseupTransHandler() {
  scaleLock.value = false
  document.removeEventListener('mousemove', mousemoveTransHandler)
  document.removeEventListener('mouseup', mouseupTransHandler)
}
/*****************************缩放end***************************/

/*****************************旋转计算***************************/
const rotateLock = ref(false)
let rotateStart = { x: 0, y: 0 }
const rotateMouseQueue:any[] = []
function rotateHanlder(e: MouseEvent) {
  e.stopPropagation()
  rotateLock.value = true
  document.addEventListener('mousemove', mousemoveRotateHandler)
  document.addEventListener('mouseup', mouseupRotateHandler)

  rotateStart = { x: e.clientX, y: e.clientY }
}
function mousemoveRotateHandler(e: MouseEvent) {
  if (!rotateLock)
    return
  const task = () => {
    const { clientX, clientY } = e
    const start = rotateStart
    const after = { x: clientX, y: clientY }
    const style = transable._rotate(start, after)
    initStyle.value = { ...style }
    rotateStart = after
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

// expose ------------------------------------------------------
function getCoordinate() {
  return { ...coordinate.value, rotate: initStyle.value.rotate }
}
defineExpose({
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
@import '../main.css';
</style>
