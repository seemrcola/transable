export function generateClassName() {
  const random = Math.random().toString(36).slice(2, 8) + Date.now().toString(36)
  return `vuetransable-${random}`
}
