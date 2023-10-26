
import type { MousePoint } from './types';

// 矩阵旋转公式：x' = x * cosθ - y * sinθ, y' = x * sinθ + y * cosθ
// 由于我们的坐标系是以组件中心点为原点，所以我们需要将坐标系平移到原点，然后再旋转，最后再平移回去
// 旋转后的坐标：x' = (x - centerPoint.x) * cosθ - (y - centerPoint.y) * sinθ + centerPoint.x
//             y' = (x - centerPoint.x) * sinθ + (y - centerPoint.y) * cosθ + centerPoint.y
// 写出通用函数如下
// 知乎链接：https://www.zhihu.com/question/67425734/answer/252724399
export function rotatePoint(currentPoint: MousePoint, centerPoint: MousePoint, angle: number) {
  const radian = angle * Math.PI / 180
  const dx = currentPoint.x - centerPoint.x
  const dy = currentPoint.y - centerPoint.y
  const x = dx * Math.cos(radian) - dy * Math.sin(radian) + centerPoint.x
  const y = dx * Math.sin(radian) + dy * Math.cos(radian) + centerPoint.y
  return { x, y }
}

// 根据两点计算出方程
// y = kx + b
// k = (y2 - y1) / (x2 - x1)
// b = y1 - kx1
export function getLineEquation(point1: MousePoint, point2: MousePoint) {
  const k = (point2.y - point1.y) / (point2.x - point1.x)
  const b = point1.y - k * point1.x
  return { k, b }
}

// 根据两个直线方程计算出交点
// x = (b2 - b1) / (k1 - k2)
// y = k1 * x + b1
export function getCrossPoint(line1: { k: number, b: number }, line2: { k: number, b: number }) {
  const x = (line2.b - line1.b) / (line1.k - line2.k)
  const y = line1.k * x + line1.b
  return { x, y }
}
