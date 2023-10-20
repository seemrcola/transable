import type { Coordinate } from '../core'

export function generateClassName() {
  const random = Math.random().toString(36).slice(2, 8) + Date.now().toString(36)
  return `vuetransable-${random}`
}


export function getInitCoordinate(selector: string): Coordinate {
  const transable = document.querySelector(`${selector}`) as HTMLElement
  const rect = transable.getBoundingClientRect()
  const coord = {
    lt: { x: rect.left, y: rect.top },
    rt: { x: rect.right, y: rect.top },
    rb: { x: rect.right, y: rect.bottom },
    lb: { x: rect.left, y: rect.bottom },
  }
  return coord
}


