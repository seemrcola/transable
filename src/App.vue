<script setup lang='ts'>
// import { VueTransable } from '../dist/es/index.mjs';
// import '../dist/style.css';
import { VueTransable } from '../lib'
</script>

<template>
  <div class="wrapper" >
    <VueTransable class="tran" :x="100" :y="100" :width="100" :height="100">
      <div class="slot">
      </div>
    </VueTransable>
  </div>
</template>

<style>
.wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #000;
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
</style>
