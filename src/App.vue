<script setup lang='ts'>
import { Transable } from '../dist/es/index.mjs';
import '../dist/style.css';
</script>

<template>
  <div class="wrapper" >
    <Transable :left="500" :top="500" class="tran">
      <div class="slot">
        <img src="../imgs/test.png" style="object-fit:fill;">
      </div>
    </Transable>
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
