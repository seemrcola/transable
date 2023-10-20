<script setup lang='ts'>
// import { VueTransable } from '../dist/es/index.mjs';
// import '../dist/style.css';
import { VueTransable } from '../lib'
</script>

<template>
  <div class="wrapper" >
    <VueTransable :left="500" :top="500" :show-coords="true" class="tran">
      <div class="slot">
        <img src="../imgs/test.png" style="object-fit:fill;">
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
  background-color: bisque;
}
.slot {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
