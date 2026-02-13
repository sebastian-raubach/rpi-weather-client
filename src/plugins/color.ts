export interface RGB {
  r: number
  g: number
  b: number
}

/**
 * Creates a linear gradient between the two given colors with the given number of steps
 * @param {String} one The first color in HEX
 * @param {String} two The second color in HEX
 * @param {Number} steps The number of steps between the two colors
 */
function createColorGradient (one: string, two: string, steps: number) {
  const oneRgb = hexToRgb(one)
  const twoRgb = hexToRgb(two)

  const result = []

  if (oneRgb && twoRgb) {
    for (let i = 0; i < steps; i++) {
      const iNorm = i / (steps - 1)
      result.push(rgbToHex(
        Math.floor(oneRgb.r + iNorm * (twoRgb.r - oneRgb.r)),
        Math.floor(oneRgb.g + iNorm * (twoRgb.g - oneRgb.g)),
        Math.floor(oneRgb.b + iNorm * (twoRgb.b - oneRgb.b)),
      ))
    }
  }

  return result
}

/**
 * Converts the given R, G, B values into a HEX color
 * @param {Number} r The red color component
 * @param {Number} g The green color component
 * @param {Number} b The blue color component
 */
function rgbToHex (r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

/**
 * Converts a HEX value into an RGB object
 * @param {String} hex The hex color
 */
function hexToRgb (hex: string): RGB | undefined {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex) as string[]
  return result && result.length === 4
    ? {
        r: Number.parseInt(result[1] || '0', 16),
        g: Number.parseInt(result[2] || '0', 16),
        b: Number.parseInt(result[3] || '0', 16),
      }
    : undefined
}

export {
  createColorGradient,
}
