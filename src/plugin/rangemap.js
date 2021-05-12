export default class RangeMap {
  constructor (ranges) {
    this.ranges = ranges
  }

  getValue (value) {
    const result = this.ranges.filter(r => {
      if (r.mode === 'invert') {
        return r.min <= value || value < r.max
      } else {
        return r.min <= value && value < r.max
      }
    })
      .map(r => r.value)

    if (result && result.length > 0) {
      return result[0]
    } else {
      return undefined
    }
  }
}
