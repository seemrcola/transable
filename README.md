### vue-transable 组件

### 1. 介绍
一个简单实现拖拽/缩放/旋转的组件  
目前只能改变外部组件的大小和位置，不能改变slot的大小和位置  

### 2. 安装
```
pnpm install vue-transable
```
```vue
<script setup lang='ts'>
import { ref } from 'vue'
import { Transable } from 'vue-transable';
import 'vue-transable/dist/style.css';
const instance = ref(null)
</script>

<template>
  <div class="wrapper" >
    <Transable ref="instance" :left="500" :top="500" class="tran">
      <div class="slot">
        <img src="path.jpg">
      </div>
    </Transable>
  </div>
</template>
```
组件的props如下：
```ts
export const Props = {
  width: number       // default: 100,
  height: number      // default: 100,
  left: number        // default: 0,
  top: number         // default: 0,
  rotate: number      // default: 0, 
  showCoords: boolean // default: false, 是否显示坐标
}
```
组件内部事件如下：
```ts
instance.getCoordinate() // 获取组件的坐标
// { left: number, top: number, width: number, height: number, rotate: number }
```

### 功能 
- [x] 旋转
- [x] 缩放
- [x] 拖拽
- [x] 坐标展示
- [ ] 等比缩放  
- [ ] 控制组件内元素缩放 `(scale(x, y))`
