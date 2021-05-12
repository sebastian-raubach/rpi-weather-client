const Plotly = require('plotly.js/lib/core')

// Only register the chart types we're actually using to reduce the final bundle size
Plotly.register([
  require('plotly.js/lib/scatter'),
  require('plotly.js/lib/barpolar')
])

module.exports = Plotly
