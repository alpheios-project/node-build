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
import generateBuildNumber from './support/build-number.mjs'
import path from 'path'
import chalk from 'chalk'

const clArgPrefixes = {
  mode: '-mode',
  module: '-module',
  preset: '-preset',
  configFileName: '-confFile',
  libBuildNumber: '-libBuildNum'
}

const clArgDefaults = {
  mode: false,
  module: false,
  preset: false,
  configFileName: 'config.mjs',
  libBuildNumber: false
}

const presets = {
  app: appPreset,
  lib: libPreset,
  vue: vuePreset,
  'vue-postcss': vuePostcssPreset,
  'pwa-vue': pwaVuePreset,
  'node-app': nodeAppPreset,
  'node-lib': nodeLibPreset
}

const parseClArgs = () => {
  let params = clArgDefaults

  if (process.argv.length > 2) {
    // Parsing arguments
    for (let i = 2; i < process.argv.length; i++) {
      let param = process.argv[i]
      if (param.startsWith(`${clArgPrefixes.libBuildNumber}=`)) {
        params.libBuildNumber = param.replace(`${clArgPrefixes.libBuildNumber}=`, '')
      } else if (param.startsWith(`${clArgPrefixes.mode}=`)) {
        params.mode = param.replace(`${clArgPrefixes.mode}=`, '')
      } else if (param.startsWith(`${clArgPrefixes.module}=`)) {
        params.module = param.replace(`${clArgPrefixes.module}=`, '')
      } else if (param.startsWith(`${clArgPrefixes.preset}=`)) {
        params.preset = param.replace(`${clArgPrefixes.preset}=`, '')
      } else if (param.startsWith(`${clArgPrefixes.configFileName}=`)) {
        params.configFileName = param.replace(`${clArgPrefixes.configFileName}=`, '')
      }
    }
    // If build number is not set after parsion all arguments, set it to a value generated by a build script
    if (!params.libBuildNumber) { params.libBuildNumber = generateBuildNumber() }
    // Host project config file. Must be located in `build` directory of a host project. Default filename is 'config.mjs'
    // If config file name is not specified with a parameter, take its value from the 5th argument.
    if (params.configFileName === clArgDefaults.configFileName && process.argv[5] && !process.argv[5].startsWith('-')) {
      params.configFileName = process.argv[5]
    }
  }
  return params
}

class Build {
  /**
   *
   * @param {object} config - A configuration object for one or severl tasks from an external file
   */
  constructor (clArgValues, config) {
    Build.checkArgs()
    this.clArgValues = clArgValues
    this.config = config
    this.module = this.selectedModule
    this.mode = this.selectedMode
    this.modeList = (this.mode === Build.all.modes) ? Build.allModes : [this.mode]
    this.presetName = this.selectedPresetName
    this.preset = presets[this.presetName]
    this.codeAnalysis = Build.needsCodeAnalysis
    this.webpackOptions = {
      modes: this.modeList,
      codeAnalysis: this.codeAnalysis,
      config: this.config.webpack,
      configTemplate: this.preset.webpack || {},
      libBuildNumber: this.clArgValues.libBuildNumber
    }
  }

  static get all () {
    return {
      modules: Build.modules[0],
      modes: Build.modes[0]
    }
  }

  runModules () {

    console.log(chalk.bold.white(`\nRunning ${this.module} module(s) in ${this.mode} mode(s) with ${this.presetName} preset. Config file: ${this.clArgValues.configFileName}. Code analysis is ${this.codeAnalysis ? 'on' : 'off'}`))

    if (this.module === Build.all.modules) {
      // Run all available modules
      // Primary modules should run before webpack
      let primaryModulesResults = Build.primaryModules.map(module => Build[module](this.config[module]))

      Promise.all(primaryModulesResults).then(() => {
        Build.webpack(this.webpackOptions)
      }).catch(err => {
        console.log(`Error while executing one of the modules: ${err}`)
      })
    } else if (this.module === Build.webpackModule) {
      // Run a webpack module only
      Build.webpack(this.webpackOptions)
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
  Build script should be run with at least the required three parameters in the order shown below.
  Each paramter must be prefixed with a parameter name (ex. "node build.mjs -module=moduleName -mode=modeName -preset=presetName"):
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
      confFile - an optional parameter which can be used to override the default config file name. 
                 Ex.: "-confFile=config.mjs". Default is config.mjs.
      libBuildNum - an optional parameter which can be used to provide a library build number. It must not contain spaces.
                    Ex.: "-libBuildNum=qa.20200101999". Defaults to an autogenrated value in a format of "branch-name.YYYYMMDDCCC".
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

  get selectedModule () {
    let module
    if (this.clArgValues.module === clArgDefaults.module && process.argv[2] && !process.argv[2].startsWith(`${clArgPrefixes.module}=`)) {
      module = process.argv[2]
    } else {
      module = this.clArgValues.module
    }
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
      'development',
      'code-analysis'
    ]
  }

  static get allModes () {
    return Build.modes.slice(1, Build.modes.length)
  }

  get selectedMode () {
    let mode
    if (this.clArgValues.mode === clArgDefaults.mode && process.argv[3] && !process.argv[3].startsWith(`${clArgPrefixes.mode}=`)) {
      mode = process.argv[3]
    } else {
      mode = this.clArgValues.mode
    }
    if (!Build.modes.includes(mode)) {
      Build.printUsageStatement()
      process.exit(1)
    }
    return mode
  }

  get selectedPresetName () {
    let preset
    if (this.clArgValues.preset === clArgDefaults.preset && process.argv[4] && !process.argv[4].startsWith(`${clArgPrefixes.preset}=`)) {
      preset = process.argv[4]
    } else {
      preset = this.clArgValues.preset
    }
    if (!Object.keys(presets).includes(preset)) {
      Build.printUsageStatement()
      process.exit(1)
    }
    return preset
  }

  static get needsCodeAnalysis () {
    return process.argv.includes('--code-analysis')
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

let configParams = parseClArgs()
const configModule = 'file:///' + path.posix.join(process.cwd().replace(/\\/g, '/'), 'build/', configParams.configFileName)

import(configModule)
  .then(config => {
    let build = new Build(configParams, config)
    build.runModules()
  }).catch(e => console.error(`Cannot resolve a config file module ${configModule}: ${e}`))

export { generateBuildNumber }