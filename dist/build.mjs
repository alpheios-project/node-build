// Node build modules
import webpack from './modules/webpack.mjs'
import sass from './modules/sass.mjs'
import imagemin from './modules/imagemin.mjs'

// Presets
import libPreset from './presets/lib.mjs'
import vuePreset from './presets/vue.mjs'
import pwaVuePreset from './presets/pwa-vue.mjs'
const presets = {
  lib: libPreset,
  vue: vuePreset,
  'pwa-vue': pwaVuePreset
}

// Host project config file. Must be located in `build` directory of a host project. Default filename is 'config.mjs'
const configFileName = process.argv[5] ? process.argv[5] : 'config.mjs'
const configModule = 'file:///' + path.posix.join(process.cwd().replace(/\\/g, '/'), 'build/', configFileName)

// Support npm packages
import path from 'path'
import chalk from 'chalk'

class Build {
  constructor (config) {
    Build.checkArgs()
    this.config = config
    this.module = Build.selectedModule
    this.mode = Build.selectedMode
    this.modeList = (this.mode === Build.all.modes) ? Build.allModes : [this.mode]
    this.presetName = Build.selectedPresetName
    this.preset = presets[this.presetName]
  }

  static get all () {
    return {
      modules: Build.modules[0],
      modes: Build.modes[0]
    }
  }

  runModules () {

    console.log(chalk.bold.white(`\nRunning ${this.module} module(s) in ${this.mode} mode(s) with ${this.presetName} preset. Config file: ${configFileName}`))

    if (this.module === Build.all.modules) {
      // Run all available modules
      // Primary modules should run before webpack
      let primaryModulesResults = Build.primaryModules.map(module => Build[module](this.config[module]))

      Promise.all(primaryModulesResults).then(() => {
        Build.webpack(this.modeList, this.config.webpack, this.preset.webpack)
      }).catch(err => {
        console.log(`Error while executing one of the modules: ${err}`)
      })
    } else if (this.module === Build.webpackModule) {
      // Run a webpack module only
      Build.webpack(this.modeList, this.config.webpack, this.preset.webpack)
    }
    else {
      // Run any other single module
      Build[this.module](this.config[this.module])
    }
  }

  static checkArgs () {
    if (process.argv.length < 5) {
      Build.printUsageStatement()
      process.exit(1)
    }
  }

  static printUsageStatement () {
    console.error(`
  Build script should be run with at least the required three parameters in the order shown below (ex. "node build.mjs module mode preset"):
      module - a name of the module to use during build. Possible values: ${Build.modules.map(t => '"' + t + '"').join(', ')}.
               "all": will run all modules.
      mode   - a build mode. Possible values: ${Build.modes.map(t => '"' + t + '"').join(', ')}.
               "production":  creates a highly-optimized production-ready code without source maps.
               "development": renders a development code version optimized for debugging.
                              Development version is generated with source maps, whenever possible.
               "all":         generates both production and development versions of a build.
      preset - a name of preset that will be used by a build script. Possible values: ${Object.keys(presets).map(t => '"' + t + '"').join(', ')}.
               "lib": for building a JS library with no UI.
               "vue": a preset for a build that uses Vue.js and its single file components (".vue") as well as CSS,
                      Sass, and JPEG, PNG, and SVG images.
      [configFileName] - an optional parameter which can be used to override the default config file name (default is config.mjs)
      `)
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

  static get primaryModules () {
    return Build.modules.slice(1, Build.modules.length - 1)
  }

  static get webpackModule () {
    return Build.modules[Build.modules.length-1]
  }

  static get selectedModule () {
    const module = process.argv[2]
    if (!Build.modules.includes(module)) {
      Build.printUsageStatement()
      process.exit(1)
    }
    return module
  }
  static get modes () {
    // First module is a default one, it will run tasks in both production and development modes
    return [
      'all',
      'production',
      'development'
    ]
  }

  static get allModes () {
    return Build.modes.slice(1, Build.modes.length)
  }

  static get selectedMode () {
    const mode = process.argv[3]
    if (!Build.modes.includes(mode)) {
      Build.printUsageStatement()
      process.exit(1)
    }
    return mode
  }
  static get selectedPresetName () {
    const preset = process.argv[4]
    if (!Object.keys(presets).includes(preset)) {
      Build.printUsageStatement()
      process.exit(1)
    }
    return preset
  }
  // Primary modules
  static imagemin (tasks) {
    if (tasks) {
      return imagemin(tasks)
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
