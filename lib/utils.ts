import { Point, Style } from './types'

/**
 * @param selector 
 * @returns
 * @description  
 * 获取元素的中心点坐标
 * https://developer.mozilla.org/zh-CN/docs/Web/API/Element/getBoundingClientRect
 * getBoundingClientRect获取到的是矩形的外接矩形的left、top、right、bottom、width、height
 * 很容易证明外接矩形的中心点坐标就是元素的中心点坐标
 * 
 * 缺点就是getBoundingClientRect会导致页面重排，性能不好
 */
export function getCenterPoint(selector: string) {
  const transable = document.querySelector(selector) as HTMLElement
  const rect= transable.getBoundingClientRect()
  console.log(rect, 'rect')
  const coord = {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  }
  return coord
}

/**
 * 矩形中点坐标公式
 * @param rect
 * @returns {x: number, y: number}
 * @description
 * 根据矩形的left、top、width、height计算矩形的中心点坐标
 * 
 * 前提是有类似的数据支持 getBoundingClientRect是无条件的
 */
export function getCenterPoint2(rect: Style) {
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  }
}

// 矩阵旋转公式：x' = x * cosθ - y * sinθ, y' = x * sinθ + y * cosθ
// 由于我们的坐标系是以组件中心点为原点，所以我们需要将坐标系平移到原点，然后再旋转，最后再平移回去
// 旋转后的坐标：x' = (x - centerPoint.x) * cosθ - (y - centerPoint.y) * sinθ + centerPoint.x
//             y' = (x - centerPoint.x) * sinθ + (y - centerPoint.y) * cosθ + centerPoint.y
// 写出通用函数如下
// 知乎链接：https://www.zhihu.com/question/67425734/answer/252724399
export function rotatePoint(currentPoint: Point, centerPoint: Point, angle: number) {
  const radian = angle * Math.PI / 180
  const dx = currentPoint.x - centerPoint.x
  const dy = currentPoint.y - centerPoint.y
  const x = dx * Math.cos(radian) - dy * Math.sin(radian) + centerPoint.x
  const y = dx * Math.sin(radian) + dy * Math.cos(radian) + centerPoint.y
  return { x, y }
}

export function generateClassName() {
  const random = Math.random().toString(36).slice(2, 8) + Date.now().toString(36)
  return `vuetransable-${random}`
}


