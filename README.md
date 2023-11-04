### vue-transable 组件

### 功能 
- [x] 旋转
- [x] 拖拽
- [x] 拖拽四个角
- [x] 拖拽四个边的中点
- [x] 坐标展示
- [ ] 等比缩放  
- [ ] 控制组件内元素缩放 `(scale(x, y))`  

#### 使用
```shell
pnpm add vue-transable
```
  
```vue
<script setup>
import {VueTransable} from 'vue-transable'
</script>

<template>
  <Teleport to='body'>
    <VueTransable :x="100" :y="100" :width="100" :height="100">
      <div class="slot" >
        <div contenteditable="true">
          hello world
        </div>
      </div>
    </VueTransable>
  </Teleport>
</template>
```

⚠️ 目前还是只支持相对于body定位。


