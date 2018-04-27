import path from 'path'
import chalk from 'chalk'
import webpack from './modules/webpack.mjs'
import sass from './modules/sass.mjs'
import imagemin from './modules/imagemin.mjs'

const configFileName = 'config.mjs'
const configModule = 'file:///' + path.posix.join(process.cwd().replace(/\\/g, '/'), 'build/', configFileName)

class Build {
  static get modules () {
    // The first module is a default one, it will run all modules at once
    // The last module is always a webpack. It will run after all other modules
    return [
      'all',
      'imagemin',
      'sass',
      'webpack'
    ]
  }

  static get defaultModule () {
    return Build.modules[0]
  }

  static get primaryModules () {
    return Build.modules.slice(1, Build.modules.length - 1)
  }

  static get webpackModule () {
    return Build.modules[Build.modules.length]
  }

  static get selectedModule () {
    if (process.argv.length > 2) {
      const module = process.argv[2]
      if (!this.modules.includes(module)) {
        console.error(`
  The first parameter (module name) must be one of the following: ${Build.modules.map(t => '"' + t + '"').join(', ')}.
  With no parameters specified it will run all tasks at once.
     `)
        process.exit(1)
      }
      return module
    } else {
      return Build.defaultModule
    }
  }

  static get modes () {
    // First module is a default one, it will run tasks in both production and development modes
    return [
      'all',
      'production',
      'development'
    ]
  }

  static get defaultMode () {
    return Build.modes[0]
  }

  static get selectedMode () {
    if (process.argv.length > 3) {
      const mode = process.argv[3]
      if (!this.modes.includes(mode)) {
        console.error(`
  The second parameter (mode name) must be one of the following: ${Build.modes.map(t => '"' + t + '"').join(', ')}.
  With no parameters specified it will run in production mode.
     `)
        process.exit(1)
      }
      return mode
    } else {
      return Build.defaultMode
    }
  }

  // Primary tasks
  static imagemin (tasks) {
    if (tasks) {
      return imagemin(taks)
    } else {
      return new Promise(resolve => resolve('Nothing to do'))
    }
  }

  static sass (tasks) {
    if (tasks) {
      return sass(tasks)
    } else {
      return new Promise(resolve => resolve('Nothing to do'))
    }
  }

  static webpack (tasks) {
    if (tasks) {
      const mode = Build.selectedMode
      if (mode === Build.defaultMode) {
        return [
          webpack(tasks[Build.modes[1]]),
          webpack(tasks[Build.modes[2]])
        ]
      } else {
        return [webpack(tasks[mode])]
      }
    } else {
      return [new Promise(resolve => resolve('Nothing to do'))]
    }
  }
}

import(configModule)
  .then(config => {
    const selectedModule = Build.selectedModule
    const selectedMode = Build.selectedMode

    const webpackTasks = {
      production: config.webpack.production.map(task => Object.assign(task, config.webpack.common)),
      development: config.webpack.development.map(task => Object.assign(task, config.webpack.common))
    }

    console.log(chalk.yellow(`Running ${selectedModule} module(s) in ${selectedMode} mode(s)`))

    if (selectedModule === Build.defaultModule) {
      // Run all available modules
      // Primary modules should run before webpack
      let primaryModulesResults = Build.primaryModules.map(module => Build[module](config[module]))

      Promise.all(primaryModulesResults).then(() => {
        Promise.all(Build.webpack(webpackTasks)).catch(err => console.log(err))
      }).catch(err => {
        console.log(`Error while executing one of the modules: ${err}`)
      })
    } else if (selectedModule === Build.webpackModule) {
      // Run a webpack module only
      Promise.all(Build.webpack(webpackTasks)).catch(err => console.log(err))
    }
    else {
      // Run any other single module
      Build[selectedModule](config[selectedModule])
    }
  }).catch(e => console.error(`Cannot resolve a config file module ${configModule}: ${e}`))
