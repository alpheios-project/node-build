// Node build modules
import webpack from './modules/webpack.mjs'
import sass from './modules/sass.mjs'
import imagemin from './modules/imagemin.mjs'

// Config templates
import templateDefault from './config/default.mjs'

// Host project config file. Named `config.mjs`, it must be located in `build` directory of a host project
const configFileName = 'config.mjs'
const configModule = 'file:///' + path.posix.join(process.cwd().replace(/\\/g, '/'), 'build/', configFileName)

// Support npm packages
import path from 'path'
import chalk from 'chalk'

class Build {
  constructor (config) {
    this.config = config
    this.module = Build.selectedModule
    this.mode = Build.selectedMode
    this.modeList = (this.mode === Build.defaultMode)? Build.allModes : [this.mode]
  }

  runModules () {
    console.log(chalk.yellow(`Running ${this.module} module(s) in ${this.mode} mode(s)`))

    if (this.module === Build.defaultModule) {
      // Run all available modules
      // Primary modules should run before webpack
      let primaryModulesResults = Build.primaryModules.map(module => Build[module](this.config[module]))

      Promise.all(primaryModulesResults).then(() => {
        Build.webpack(this.modeList, this.config.webpack, templateDefault)
      }).catch(err => {
        console.log(`Error while executing one of the modules: ${err}`)
      })
    } else if (this.module === Build.webpackModule) {
      // Run a webpack module only
      Build.webpack(this.modeList, this.config.webpack, templateDefault)
    }
    else {
      // Run any other single module
      Build[this.module](this.config[this.module])
    }
  }

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

  static get allModes () {
    return Build.modes.slice(1, Build.modes.length)
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

  // Primary modules
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

  // Webpack modules
  static webpack (modes, config, configTemplate) {
    if (modes) {
      return webpack(modes, config, configTemplate)
    } else {
      return [new Promise(resolve => resolve('Nothing to do'))]
    }
  }
}

import(configModule)
  .then(config => {
    let build = new Build(config)
    build.runModules()
  }).catch(e => console.error(`Cannot resolve a config file module ${configModule}: ${e}`))
