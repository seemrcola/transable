<script setup lang='ts'>
import { ref } from 'vue'
import { VueTransable } from '../lib'

const transale = ref<any>(null)
const rect = ref<any>({})

function mousedownHandler(e: MouseEvent) {
  document.addEventListener('mousemove', mousemoveHandler)
  document.addEventListener('mouseup', mouseupHandler)
}
function mousemoveHandler(e: MouseEvent) {
  rect.value = transale.value.transable.getRect()
}
function mouseupHandler(e: MouseEvent) {
  document.removeEventListener('mousemove', mousemoveHandler)
  document.removeEventListener('mouseup', mouseupHandler)
}
</script>

<template>
  <div class="wrapper">
    <VueTransable 
      ref="transale" class="tran" 
      :x="100" :y="100" :width="100" :height="100" 
      @mousedown="mousedownHandler"
      @mousemove="mousemoveHandler" 
      @mouseup="mouseupHandler"
    >
      <div class="slot" >
        <div contenteditable="true">
          sfhdckbldsjvchdsncsvjsdgcjhsdgvsdfbsjdkgvsdhjvcsdjhcsdhjcvdshhjsvdfv;
          kchvsdkhcbdskvjhbsdvknldsnvjkldsfnvfd
          fsdvjcjhsdbvckjdsvbhsdvsdhjvsdmvbndfs
          djvsvkjfhvlfdbdlfjbdfkvbjvhsdgchnsdkvjhsdcbdcn 
        </div>
      </div>
    </VueTransable>

    <div class="coord">
      <div class="box">
        <div>X</div>
        <div>{{ ~~rect.x }}</div>
      </div>
      <div class="box">
        <div>Y</div>
        <div>{{ ~~rect.y }}</div>
      </div>
      <div class="box">
        <div>宽度</div>
        <div>{{ ~~rect.width }}</div>
      </div>
      <div class="box">
        <div>高度</div>
        <div>{{ ~~rect.height }}</div>
      </div>
    </div>
  </div>
</template>

<style>
.wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #000;
  overflow: hidden;
}

.tran {
  width: 100px;
  height: 100px;
}

.slot {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 1px solid #fff;
}

.coord {
  position: absolute;
  top: 50px;
  right: 50px;
  background-color: #fff;
  color: #000;
}

.box {
  width: 200px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  font-weight: bold;
  box-shadow: 0px 0px 8px 8px #fff;
  font-size: 15px;
}
</style>
