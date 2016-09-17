const blessed = require('blessed')

function Dashboard() {
  this.styles = {
    log: {
      fg: -1,
      border: {
        fg: 'green'
      }
    },
    stats: {
      fg: -1,
      border: {
        fg: 'blue'
      }
    }
  }

  this.screen= blessed.screen({smartCSR: true})
  this.screen.key(['escape', 'q', 'C-c'], () => process.exit(0))

  this.log = blessed.log({
    alwaysScroll: true,
    label: 'Log',
    width: '70%',
    height: '100%',
    alwaysScroll: true,
    keys: true,
    mouse: true,
    vi: true,
    border: {
      type: 'line'
    },
    style: this.styles.log
  })

  this.stats = blessed.box({
    label: 'Stats',
    left: '70%',
    width: '30%',
    height: '100%',
    border: {
      type: 'line'
    },
    style: this.styles.stats
  })

  this.screen.append(this.log)
  this.screen.append(this.stats)

  this.emberStats = {}

  this.screen.render()
}

Dashboard.prototype.updateStatesDisplay = function () {
  this.stats.setContent(`Serving: ${this.emberStats.serving}
Livereload: ${this.emberStats.livereload}`)
}

Dashboard.prototype.logBuffer = function (buffer) {
  const contents = buffer.toString()
  if (contents.includes('Livereload')) {
    this.emberStats.livereload = /.*(http.*)/.exec(contents)[1]
    this.updateStatesDisplay()
  }
  else if (contents.includes('Serving')) {
    this.emberStats.serving = /.*(http.*)/.exec(contents)[1]
    this.updateStatesDisplay()
  }

  this.log.log(buffer.toString())

  this.screen.render()
}

module.exports = Dashboard
