<script setup lang='ts'>
import { ref } from 'vue'
import { Props } from './props'
import { orientation } from './types'
import type { Orientation } from './types'
import { generateClassName, rafDebounce } from '../share'
import { Transable } from '../core'

const props = defineProps(Props)
const className = generateClassName()

const transable = new Transable({
  x: props.x,
  y: props.y,
  width: props.width,
  height: props.height,
})

const style = ref<any>()

function genStyle() {
  const { x, y, width, height } = transable.getRect()
  style.value = {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
    transform: `rotate(${transable.angle}deg)`,
  }
}
genStyle()


// 选中与取消选中 --------------------------------------------
const selected = ref(false)
document.addEventListener('click', (e) => {
  // 检查是不是点在了自己身上 通过className来判断
  const target = e.target as HTMLElement
  if(target.classList.contains(className)) return
  selected.value = false
})

/**************************拖动*****************************/
let mouseStartMove = {x: 0, y: 0}
let mouseEndMove = {x: 0, y: 0} 
let startMove = false
const moveTaskQueue: any[] = []
function mousedownMoveHandler(e: MouseEvent) {
  selected.value = true
  startMove = true
  mouseStartMove = { x: e.clientX, y: e.clientY }
  document.addEventListener('mousemove', mousemoveMoveHandler)
  document.addEventListener('mouseup', mouseupMoveHandler)
}
function mousemoveMoveHandler(e: MouseEvent) {
  if(!startMove) return
  const task = () => {
    mouseEndMove = { x: e.clientX, y: e.clientY }
    transable.drag(mouseStartMove, mouseEndMove)
    mouseStartMove = mouseEndMove
    genStyle()
  }
  rafDebounce(task, moveTaskQueue)
}
function mouseupMoveHandler() {
  startMove = false
  document.removeEventListener('mousemove', mousemoveMoveHandler)
  document.removeEventListener('mouseup', mouseupMoveHandler)
}
/**************************拖动end**************************/

/***************************缩放****************************/
let startScale = false
let direction: Orientation = 'lt'
const transQueue: any[] = []  
function mousedownTransHandler(e: MouseEvent, d: Orientation) {
  e.stopPropagation()
  startScale = true
  direction = d
  document.addEventListener('mousemove', mousemoveTransHandler)
  document.addEventListener('mouseup', mouseupTransHandler)
  transable.initResizeTool({ x: e.clientX, y: e.clientY }, direction)
}
function mousemoveTransHandler(e: MouseEvent) {
  if(!startScale) return
  const task = () => {
    transable.resize({ x: e.clientX, y: e.clientY })
    genStyle()
  }
  rafDebounce(task, transQueue)
}
function mouseupTransHandler() {
  startScale = false
  document.removeEventListener('mousemove', mousemoveTransHandler)
  document.removeEventListener('mouseup', mouseupTransHandler)
}
/*****************************缩放end***************************/

/*****************************旋转计算***************************/
let mouseStartRatate = {x: 0, y: 0}
let strartRotate = false
let rotateTaskQueue: any[] = []
function rotateHanlder(e: MouseEvent) {
  e.stopPropagation()
  strartRotate = true
  mouseStartRatate = { x: e.clientX, y: e.clientY }
  document.addEventListener('mousemove', mousemoveRotateHandler)
  document.addEventListener('mouseup', mouseupRotateHandler)
}
function mousemoveRotateHandler(e: MouseEvent) {
  if(!strartRotate) return
  const task = () => {
    const mouseEndRatate = { x: e.clientX, y: e.clientY }
    transable.rotate(mouseStartRatate, mouseEndRatate)
    genStyle()
    mouseStartRatate = mouseEndRatate
  }
  rafDebounce(task, rotateTaskQueue)
}
function mouseupRotateHandler() {
  strartRotate = false
  document.removeEventListener('mousemove', mousemoveRotateHandler)
  document.removeEventListener('mouseup', mouseupRotateHandler)
}
/***************************旋转计算end**************************/

// expose -----------------------------------------------------
defineExpose({
  transable
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
    :style="style"
    @mousedown="mousedownMoveHandler"
  >
    <slot />
    <!-- 旋转图标 -->
    <div v-if="selected" class="rotate bg-blue-400 select-none" @mousedown="rotateHanlder">↻</div>
    <!-- 八个方向的点 -->
    <template v-for="(item) of orientation" :key="item">
      <div 
        v-if="selected" :class="item" class="bigger bg-blue-400"
        @mousedown="(e) => mousedownTransHandler(e , item)"
      />
    </template>
  </div>
</template>

<style scoped>
@import '../main.css';
</style>
