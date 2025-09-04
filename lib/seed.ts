// Simple LCG to generate deterministic sequences
export function lcg(seed: number) {
  let state = seed >>> 0 || 1
  return function next() {
    state = (1664525 * state + 1013904223) >>> 0
    return state
  }
}

export function randomInt(next: () => number, max: number) {
  return next() % max
}
