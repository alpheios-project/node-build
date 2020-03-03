// Node build modules
import webpack from './modules/webpack.mjs'
import sass from './modules/sass.mjs'
import imagemin from './modules/imagemin.mjs'

// Presets
import appPreset from './presets/app.mjs'
import libPreset from './presets/lib.mjs'
import vuePreset from './presets/vue.mjs'
import vuePostcssPreset from './presets/vue-postcss.mjs'
import pwaVuePreset from './presets/pwa-vue.mjs'
import nodeAppPreset from './presets/node-app.mjs' //for cmd applications
import nodeLibPreset from './presets/node-lib.mjs' //for libs used in cmd applications

// Support
import commandLineArgs from 'command-line-args'
import generateBuildNumber from './support/build-number.mjs'
import path from 'path'
import chalk from 'chalk'

const optionDefinitions = [
  { name: 'module', alias: 'm', type: String },
  { name: 'mode', alias: 'M', type: String },
  { name: 'preset', alias: 'p', type: String },
  { name: 'externalConfig', alias: 'c', type: String, defaultOption: 'config.mjs' },
  { name: 'libBuild', alias: 'l', type: String },
  { name: 'codeAnalysis', alias: 'a', type: Boolean, defaultOption: false }
]

const presets = {
  app: appPreset,
  lib: libPreset,
  vue: vuePreset,
  'vue-postcss': vuePostcssPreset,
  'pwa-vue': pwaVuePreset,
  'node-app': nodeAppPreset,
  'node-lib': nodeLibPreset
}

class Build {
  /**
   *
   * @param {object} options - An object with parsed command line parameters
   * @param {object} config - A configuration object for one or severl tasks from an external file
   */
  constructor (options, config) {
    this.options = options
    this.config = config
    this.modeList = (this.options.mode === Build.all.modes) ? Build.allModes : [this.options.mode]
    this.presetObject = presets[this.options.preset]
    this.webpackOptions = {
      modes: this.modeList,
      codeAnalysis: options.codeAnalysis,
      config: this.config.webpack,
      configTemplate: this.presetObject.webpack || {},
      libBuildNumber: this.options.libBuild
    }
  }

  static get all () {
    return {
      modules: Build.modules[0],
      modes: Build.modes[0]
    }
  }

  runModules () {
    console.log(chalk.bold.white(`\nRunning ${this.options.module} module(s) in ${this.options.mode} mode(s) with a ${this.options.preset} preset. Config file: ${this.options.externalConfig}. Code analysis is ${this.options.codeAnalysis ? 'on' : 'off'}`))

    if (this.options.module === Build.all.modules) {
      // Run all available modules
      // Primary modules should run before webpack
      let primaryModulesResults = Build.primaryModules.map(module => Build[module](this.config[module]))

      Promise.all(primaryModulesResults).then(() => {
        Build.webpack(this.webpackOptions)
      }).catch(err => {
        console.log(`Error while executing one of the modules: ${err}`)
      })
    } else if (this.options.module === Build.webpackModule) {
      // Run a webpack module only
      Build.webpack(this.webpackOptions)
    }
    else {
      // Run any other single module
      Build[this.options.module](this.config[this.options.module])
    }
  }

  static printUsageStatement () {
    console.error(`
  Build script should be run with at least the required three parameters in the order shown below.
  Each paramter must be prefixed with a parameter name (ex. "node build.mjs --module=moduleName --mode=modeName --preset=presetName"):
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
      externalConfig - an optional parameter which can be used to override the default config file name. 
                 Ex.: "--externalConfig=config.mjs". Default is "config.mjs".
      libBuild - an optional parameter which can be used to provide a library build number. It must not contain spaces.
                    Ex.: "--libBuild=qa.20200101999". Defaults to an autogenrated value in a format of "branch-name.YYYYMMDDCCC".
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

  static get modes () {
    // First module is a default one, it will run tasks in both production and development modes
    return [
      'all',
      'production',
      'development',
      'code-analysis'
    ]
  }

  static get allModes () {
    return Build.modes.slice(1, Build.modes.length)
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
  static webpack (options) {
    if (options.modes) {
      return webpack(options)
    } else {
      return [new Promise(resolve => resolve('Nothing to do'))]
    }
  }
}

let options
try {
  options = commandLineArgs(optionDefinitions)
} catch (e) {
  console.error(e)
  Build.printUsageStatement()
}
let configModule
try {
  configModule = 'file:///' + path.posix.join(process.cwd().replace(/\\/g, '/'), 'build/', options.externalConfig)
} catch (e) {
  console.error('Cannot construct path to the external config file:', e)
}

import(configModule)
  .then(config => {
    try {
      let build = new Build(options, config)
    build.runModules()
    } catch (e) {
      console.error(`A build process failed:`, e)
    }
  }).catch(e => console.error(`Cannot resolve a config file module ${configModule}:`, e))

export { generateBuildNumber }