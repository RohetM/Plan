/**
 * Mulberry32 Seeded Pseudo-Random Number Generator.
 * Provides high-quality, reproducible uniform random floats [0, 1).
 */
export function createSeededRng(seed: number = 42) {
  let s = Math.floor(seed) >>> 0;
  return function next(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Samples from a Triangular Distribution using Inverse Transform Sampling.
 * @param a Min value
 * @param c Mode (peak / most likely value)
 * @param b Max value
 * @param rand Uniform random number [0, 1)
 */
export function sampleTriangular(
  a: number,
  c: number,
  b: number,
  rand: number
): number {
  if (b <= a) return a;
  const fc = (c - a) / (b - a);
  if (rand < fc) {
    return a + Math.sqrt(rand * (b - a) * (c - a));
  } else {
    return b - Math.sqrt((1 - rand) * (b - a) * (b - c));
  }
}
