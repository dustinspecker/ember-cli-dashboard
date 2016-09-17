#!/usr/bin/env node
const Dashboard = require('../lib')
const spawn = require('cross-spawn')

const dashboard = new Dashboard

const {env} = process
env.FORCE_COLOR = true

const child = spawn('ember', ['serve'], {env, detached: true})

child.on('error', err => {
  dashboard.styles.log.border.fg = 'red'
  dashboard.logBuffer(err)
})
child.stdout.on('data', data => {
  dashboard.styles.log.border.fg = 'green'
  dashboard.logBuffer(data)
})
child.stderr.on('data', data => {
  dashboard.styles.log.border.fg = 'red'
  dashboard.logBuffer(data)
})

process.on('exit', () => process.kill(process.platform === 'win32' ? child.pid : -child.pid))
