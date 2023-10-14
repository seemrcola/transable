<script setup lang='ts'>
import { ref } from 'vue'
import Tran from '../lib/Transable.vue'
const trans = ref(null)

function toggle() {
  //@ts-ignore
  const mode = trans.value?.getMode()
  if (mode === 'normal')
  //@ts-ignore
    trans.value?.setMode('ratio')
  else
  //@ts-ignore
    trans.value?.setMode('normal')
}

</script>

<template>
  <div class="wrapper">
    <Tran ref="trans" class="tran"></Tran>
  </div>
  <button @click="toggle">click me toggle mode</button>
</template>

<style>
.wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #000;
}

.tran {
  background-color: bisque;
}
</style>
