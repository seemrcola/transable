import type { Rect, MousePoint, Direction, ResizeTool } from './types';
import { rotatePoint, getLineEquation, getCrossPoint } from './utils';

export class Transable {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public angle: number = 0;

  #reszieTool: ResizeTool = {
    staticPoint: { x: 0, y: 0 },
    sideOrCorner: 'corner', // corner side
    direction: 'lt',
  }

  constructor(rect: Rect) {
    const { x, y, width, height } = rect;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.angle = 0;
  }

  public getRect(): Rect {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  public get center(): MousePoint {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    }
  }

  /** **************************拖拽***************************** **/
  /**
   * @param mouseStart 鼠标起始位置
   * @param mouseEnd 鼠标结束位置
   * @description 拖拽
   */
  drag(mouseStart: MousePoint, mouseEnd: MousePoint,) {
    this.x += (mouseEnd.x - mouseStart.x);
    this.y += (mouseEnd.y - mouseStart.y);
  }
  /** **************************拖拽end************************** **/

  /** **************************旋转***************************** **/
  /**
   * @param mouseStart 鼠标起始位置
   * @param mouseEnd 鼠标结束位置
   * @description 旋转  
   * 使用atan2计算角度 返回结果是一个弧度值 0 ~ 2π        
   */
  rotate(mouseStart: MousePoint, mouseEnd: MousePoint) {
    const ratio = 180 / Math.PI;
    // 拿到中心点
    const center = this.center;
    // 根据鼠标起始位置和中心点计算出起始角度
    const startAngle = Math.atan2(mouseStart.y - center.y, mouseStart.x - center.x) * ratio;
    // 根据鼠标结束位置和中心点计算出结束角度
    const endAngle = Math.atan2(mouseEnd.y - center.y, mouseEnd.x - center.x) * ratio;
    // 旋转角度为angle
    const deltaAngle = endAngle - startAngle;
    this.angle += deltaAngle;
  }
  /** **************************旋转end************************** **/

  /** **************************缩放***************************** **/
  /**
   * @param mousePoint 鼠标位置
   * @description 初始化缩放工具 
   * 根据鼠标位置和中心点计算出缩放工具的中心点和静态点
   */
  initResizeTool(mousePoint: MousePoint, direction: Direction) {
    this.#reszieTool.staticPoint = {
      x: this.center.x * 2 - mousePoint.x,
      y: this.center.y * 2 - mousePoint.y,
    }

    this.#reszieTool.direction = direction;

    if (['lt', 'lb', 'rt', 'rb'].includes(direction)) 
      this.#reszieTool.sideOrCorner = 'corner';
    if (['t', 'b', 'l', 'r'].includes(direction)) 
      this.#reszieTool.sideOrCorner = 'side';
  }
  /**
   * @param mouseStart 鼠标起始位置
   * @param mouseEnd 鼠标结束位置
   * @param direction 方向
   * @description 缩放
   */
  resize(mousePoint: MousePoint) {
    const mode = this.#reszieTool.sideOrCorner;
    if (mode === 'corner')
      this.resizeCorner(mousePoint);
    if(mode === 'side')
      this.resizeSide(mousePoint)
  }
  /**
   * @param mousePoint 
   * @description 缩放四个角
   */
  resizeCorner(mousePoint: MousePoint) {
    // 根据mousePoint拿到中心点
    const point = this.#reszieTool.staticPoint;
    const dynamicCenter = {
      x: (mousePoint.x + point.x) / 2,
      y: (mousePoint.y + point.y) / 2,
    }
    // 根据当前点和中心点以及旋转角度计算出【未旋转之前的点】
    const before = rotatePoint(mousePoint, dynamicCenter, -this.angle);
    // 根据before以及中心点算出宽高和xy
    this.width = Math.abs(before.x - dynamicCenter.x) * 2;
    this.height = Math.abs(before.y - dynamicCenter.y) * 2;
    this.x = dynamicCenter.x - this.width / 2;
    this.y = dynamicCenter.y - this.height / 2;
  }
  resizeSide(mousePoint: MousePoint) {
    // 根据staticPoint拿到中心点 和 中心点拿到 fx centerPoint作为原点
    const direction = this.#reszieTool.direction;
    const staticPoint = this.#reszieTool.staticPoint;
    const centerPoint = this.center;
    const { k, b } = getLineEquation(staticPoint, centerPoint);                    // 根据两点计算出方程
    const k2 = -1 / k;                                                             // 根据这个k算出垂直于这条线的k
    const b2 = mousePoint.y - k2 * mousePoint.x;                                   // 根据mousePoint和k2算出直线方程
    let {x, y} = getCrossPoint({k, b}, {k: k2, b: b2});                            // 算出两直线方程的交点
    const currentCenterPoint = { x: (x+staticPoint.x)/2, y: (y+staticPoint.y)/2 }  // 更新centerPoint
    const before = rotatePoint({x, y}, currentCenterPoint, -this.angle);           // 求出before点的坐标

    if(['l', 'r'].includes(direction)) 
      this.width = Math.abs(before.x - currentCenterPoint.x) * 2;
    if(['t', 'b'].includes(direction)) 
      this.height = Math.abs(before.y - currentCenterPoint.y) * 2;
    
    this.x = currentCenterPoint.x - this.width / 2;
    this.y = currentCenterPoint.y - this.height / 2;
  }
}
