import { Point } from './types'

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
 * 根据矩形的两个对角点坐标计算矩形的中心点坐标
 * 
 * 前提是有类似的数据支持 而getBoundingClientRect是无条件的
 */
export function getCenterPoint2(p1: Point, p2: Point) {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
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

/**
 * @param slope 
 * @returns 
 * description
 * 根据斜率获取垂直的斜率
 */
export function getVerticalSlope(slope: number) {
  return -1 / slope
}

/**
 * @param point1 
 * @param point2 
 * @returns 
 * description
 * 根据两点坐标获取直线的斜率和截距
 */
export function getSlopeAndIntercept(point1: Point, point2: Point) {
  const slope = (point2.y - point1.y) / (point2.x - point1.x)
  const intercept = point1.y - slope * point1.x
  return { 
    slope, 
    intercept, 
    fn: (x: number) => slope * x + intercept 
  }
}

/**
 * @param point 
 * @param slope 
 * @param intercept 
 * @returns 
 * description
 * 根据已知的斜率或者截距，以及已知的点的坐标，求斜率或者截距
 */
export function getPointBySlopeOrIntercept(point: Point, opts: {
  slope?: number, 
  intercept?: number
} = {}) {
  const { slope, intercept } = opts
  if(slope) {
    const intercept = point.y - slope * point.x
    return { 
      slope, intercept, 
      fn: (x: number) => slope * x + intercept 
    }
  } 
  else if(intercept) {
    const slope = (point.y - intercept) / point.x
    return { 
      slope, intercept, 
      fn: (x: number) => slope * x + intercept 
    }
  }
  else 
    throw new Error('slope or intercept must be provided')
}

// 求出两个一次函数的交点
// y = k1 * x + b1
// y = k2 * x + b2
export function getIntersectionPoint([k1, b1]:[number, number], [k2, b2]:[number,number]) {
  const x = (b2 - b1) / (k1 - k2)
  const y = k1 * x + b1
  return { x, y }
}
