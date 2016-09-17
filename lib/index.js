#!/usr/bin/env node
const blessed = require('blessed')
const spawn = require('cross-spawn')

const { env } = process
env.FORCE_COLOR = true

const child = spawn('ember', ['serve'], {env, detached: true})

process.on('exit', () => process.kill(process.platform === 'win32' ? child.pid : -child.pid))

const styles = {
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

const screen = blessed.screen({smartCSR: true})
screen.key(['escape', 'q', 'C-c'], () => process.exit(0))

const log = blessed.log({
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
  style: styles.log
})

const stats = blessed.box({
  label: 'Stats',
  left: '70%',
  width: '30%',
  height: '100%',
  border: {
    type: 'line'
  },
  style: styles.stats
})

screen.append(log)
screen.append(stats)

const emberStats = {}

const updateStatesDisplay = () => {
  stats.setContent(`Serving: ${emberStats.serving}
Livereload: ${emberStats.livereload}`)
}

const logBuffer = buffer => {
  const contents = buffer.toString()
  if (contents.includes('Livereload')) {
    emberStats.livereload = /.*(http.*)/.exec(contents)[1]
    updateStatesDisplay()
  }
  else if (contents.includes('Serving')) {
    emberStats.serving = /.*(http.*)/.exec(contents)[1]
    updateStatesDisplay()
  }
  else {
    log.log(buffer.toString())
  }
  screen.render()
}

child.on('error', err => {
  styles.log.border.fg = 'red'
  logBuffer(err)
})
child.stdout.on('data', data => {
  styles.log.border.fg = 'green'
  logBuffer(data)
})
child.stderr.on('data', data => {
  styles.log.border.fg = 'red'
  stats.setContent(data.toString())
  logBuffer(data)
})

screen.render()
