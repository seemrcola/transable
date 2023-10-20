// todo 使用原生js实现一版，以便扩展到别的框架

import { Coordinate, Point, Style } from './types'
import { 
  getCenterPoint2, rotatePoint,
  getSlopeAndIntercept, getVerticalSlope, getPointBySlopeOrIntercept, getIntersectionPoint
} from './utils'

interface TransableOptions {
  left: number
  top: number
  width: number
  height: number
  rotate: number
}

export class Transable {
  public left: number
  public top: number
  public width: number
  public height: number
  public rotate: number

  public coordinate: Coordinate = {
    lt: { x: 0, y: 0 },
    rt: { x: 0, y: 0 },
    rb: { x: 0, y: 0 },
    lb: { x: 0, y: 0 },
  }

  public dragPoint = {
    startPoint: { x: 0, y: 0 },  // 鼠标按下时的位置
    currentPoint: { x: 0, y: 0 },// 鼠标位置
  }

  public resizePoint = {
    mousePoint: { x: 0, y: 0 },  // 鼠标当前的位置
    staticPoint: { x: 0, y: 0 }, // 鼠标按下时的对称点位置
    centerPoint: { x: 0, y: 0 }, // 矩形中心点
  }

  constructor(options: TransableOptions) {
    const { left = 0, top = 0, width = 100, height = 100, rotate = 0 } = options
    this.left = left
    this.top = top
    this.width = width
    this.height = height
    this.rotate = rotate

    this.calcCoordinate()
  }

  calcCoordinate() {
    const { left, top, width, height } = this
    const lt = { x: left, y: top }
    const rt = { x: left + width, y: top }
    const rb = { x: left + width, y: top + height }
    const lb = { x: left, y: top + height }
    this.coordinate = { lt, rt, rb, lb }
  }

  getCoordinate(): Coordinate {
    return this.coordinate
  }

  getStyle(): Style {
    const { left, top, width, height, rotate } = this
    return { left, top, width, height, rotate }
  }

  /*************************拖拽*************************/
  /**
   * @param param {deltaX: number, deltaY: number}
   * @returns 
   * description
   * 拖拽功能
   * 可以想象成就是矩形中点在坐标系中的移动 然后反馈到矩形的四个点上 我们修改left和top即可
   */
  _drag({deltaX, deltaY}: {deltaX: number, deltaY: number}) {
    const { left, top } = this
    this.left = left + deltaX
    this.top = top + deltaY
    this.calcCoordinate()
    return this.getStyle() 
  }

  /*************************旋转*************************/
  /**
   * @param beforePoint  旋转前 {x: number, y: number}
   * @param afterPoint   旋转后 {x: number, y: number}
   * @returns deltaTheta 旋转角度差 number
   * description
   * 根据math.atan2计算旋转角度差 即旋转后的角度减去旋转前的角度
   */
  _rotate(beforePoint: Point, afterPoint: Point) {
    // 拿到中心点
    const centerPoint = getCenterPoint2(this.coordinate.lt, this.coordinate.rb)
    const { x:cx, y:cy } = centerPoint
    const ratio = 180 / Math.PI
    // 旋转后的角度
    const rotateAfter = Math.atan2(afterPoint.y - cy, afterPoint.x - cx) * ratio
    // 旋转前的角度
    const rotateBefore = Math.atan2(beforePoint.y - cy, beforePoint.x - cx) * ratio
    // 旋转角度差
    const deltaTheta = rotateAfter - rotateBefore
    // 更新旋转角度
    this.rotate += deltaTheta

    this.calcCoordinate()
    return this.getStyle()
  }

  /**************************拖拽缩放***************************/
  // 确定计算要素
  _initResizePoints(mousePoint: Point) {
    this.resizePoint.mousePoint = mousePoint
    this.resizePoint.centerPoint = getCenterPoint2(this.coordinate.lt, this.coordinate.rb)
    // 计算鼠标按下时的对称点位置
    this.resizePoint.staticPoint = {
      x: 2 * this.resizePoint.centerPoint.x - mousePoint.x,
      y: 2 * this.resizePoint.centerPoint.y - mousePoint.y,
    }
  }
  // 计算
  _resize(mousePoint: Point, type: 'vertex' | 'edgeX' | 'edgeY') {
    if(type === 'vertex') {
      this.resizePoint.mousePoint = mousePoint
      this.resizePoint.centerPoint = {
        x: (mousePoint.x + this.resizePoint.staticPoint.x) / 2,
        y: (mousePoint.y + this.resizePoint.staticPoint.y) / 2,
      }
      const before = rotatePoint(mousePoint, this.resizePoint.centerPoint, -this.rotate)
      this._vertexResize(before)
    }
    if(type.startsWith('edge')) {
      this.resizePoint.mousePoint = mousePoint
      const { staticPoint } = this.resizePoint
      // 通过staticPoint和centerPoint计算出直线的方程 
      // fx = (x: number) => k * x + b
      const { slope:k, intercept:b } = getSlopeAndIntercept(staticPoint, this.resizePoint.centerPoint)
      // 容易知道 无论如何移动我们的mousePoint 该点必定在fx的过staticPoint垂线(记为fx2)上 
      // 拿到fx2的斜率
      const k2 = getVerticalSlope(k)
      // 拿到过fx2的一个点mousePointss
      // 求出fx2的方程 fx2 = (x: number) => k2 * x + b2
      const { intercept:b2 } = getPointBySlopeOrIntercept(mousePoint,  { slope: k2 })
      // 求出fx2和fx的交点
      const { x, y } = getIntersectionPoint([k, b], [k2, b2])
      // 算出centerPoint 
      this.resizePoint.centerPoint = { x: (x + staticPoint.x) / 2, y: (y + staticPoint.y) / 2 }
      // 根据矩形旋转的角度，计算旋转前的点before
      const before = rotatePoint({ x, y }, this.resizePoint.centerPoint, -this.rotate)

      if(type === 'edgeX') 
        this._edgeResizeX(before)
      if(type === 'edgeY')
        this._edgeResizeY(before)
    }

    this.calcCoordinate()
    return this.getStyle()
  } 
  // 顶点缩放
  _vertexResize(before: Point) {
    // 根据before坐标算出宽高和left top
    const { centerPoint } = this.resizePoint
    const width = Math.abs(before.x - centerPoint.x) * 2
    const height = Math.abs(before.y - centerPoint.y) * 2
    this.width = width
    this.height = height
    this.left = centerPoint.x - width / 2
    this.top = centerPoint.y - height / 2
  }
  // 边缩放
  _edgeResizeX(before: Point) {
    // 这个情况下，width不变，height变化
    const { centerPoint } = this.resizePoint
    const height = Math.abs(before.y - centerPoint.y) * 2
    this.height = height
    this.top = centerPoint.y - height / 2
    this.left = centerPoint.x - this.width / 2
  }
  _edgeResizeY(before: Point) {
    // 这个情况下，height不变，width变化
    const { centerPoint } = this.resizePoint
    const width = Math.abs(before.x - centerPoint.x) * 2
    this.width = width
    this.left = centerPoint.x - width / 2
    this.top = centerPoint.y - this.height / 2
  }
}
