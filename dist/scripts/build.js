const path = require('path')
const webpack = require('./webpack')
const sass = require('./sass')
const imagemin = require('./imagemin')
const chalk = require('chalk')
const config = require(path.join(process.cwd(),'build/node/config.js'))

const webpackTasks = {
  production: config.webpack.tasks.map(task => Object.assign(task, config.webpack.common)),
  development: config.webpack.devTasks.map(task => Object.assign(task, config.webpack.common))
}

let taskNamesAllowed = [
  'all', // A default one
  'images',
  'skins',
  'webpack'
]
let taskName = taskNamesAllowed[0]

let modesAllowed = [
  'all', // A default one
  'production',
  'development'
]
let mode = modesAllowed[0]

for (let [index, value] of process.argv.entries()) {
  if (index === 2) {
    if (!taskNamesAllowed.includes(value)) {
      console.error(`
  The first parameter (task name) must be one of the following: ${taskNamesAllowed.map(t => '"' + t + '"').join(', ')}.
  With no parameters specified it will run all tasks at once.
     `)
      process.exit(1)
    }
    taskName = value
  }
  if (index === 3) {
    if (!modesAllowed.includes(value)) {
      console.warn(`
  The second parameter (mode name) must be one of the following: ${modesAllowed.map(t => '"' + t + '"').join(', ')}.
  With no parameters specified it will run in production mode.
     `)
      process.exit(1)
    }
    mode = value
  }
}

console.log(chalk.yellow(`Running ${taskName} task(s) in ${mode} mode(s)`))
if (taskName === 'all') {
  // Run all build tasks in a sequence
  let imageminResult = imagemin.run(config.image)
  let skinsResult = sass.run(config.skins())
  Promise.all([imageminResult, skinsResult]).then(() => {
    if (mode === modesAllowed[0]) {
      Promise.all([
        webpack.run(webpackTasks[modesAllowed[1]]),
        webpack.run(webpackTasks[modesAllowed[2]])
      ]).catch(err => {
        console.log(err)
      })
    } else {
      webpack.run(webpackTasks[mode])
    }
  }).catch(err => {
    console.log(err)
  })
} else if (taskName === 'images') {
  // Optimizes images for web
  imagemin.run(config.image)
} else if (taskName === 'skins') {
  // Creates output scss files
  sass.run(config.skins())
} else if (taskName === 'webpack') {
  if (mode === modesAllowed[0]) {
    Promise.all([
      webpack.run(webpackTasks[modesAllowed[1]]),
      webpack.run(webpackTasks[modesAllowed[2]])
    ]).catch(err => {
      console.log(err)
    })
  } else {
    webpack.run(webpackTasks[mode])
  }
}
