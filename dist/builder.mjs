import { outputLevels } from './modules/consts/consts.js'

// Presets
import appPreset from './presets/app.mjs'
import libPreset from './presets/lib.mjs'
import vuePreset from './presets/vue.mjs'
import vuePostcssPreset from './presets/vue-postcss.mjs'
import pwaVuePreset from './presets/pwa-vue.mjs'
import nodeAppPreset from './presets/node-app.mjs' //for cmd applications
import nodeLibPreset from './presets/node-lib.mjs' //for libs used in cmd applications

// System modules
import path from 'path'
import chalk from 'chalk'

// Node build modules
import webpack from './modules/webpack.mjs'
import sass from './modules/sass.mjs'
import imagemin from './modules/imagemin.mjs'

export default class Builder {
  /**
   *
   * @param {object} options - An object with parsed command line parameters
   */
  constructor (options) {
    this.options = options
    this.modeList = (this.options.mode === 'all') ? ['code-analysis', 'development', 'production'] : [this.options.mode]
    this.presetObject = Builder.presets[this.options.preset]
    this.webpackOptions = {
      modes: this.modeList,
      codeAnalysis: options.codeAnalysis,
      configTemplate: this.presetObject.webpack || {},
      buildTime: this.options.buildTime
    }
  }

  /**
   *
   * @param {string} fileName - A name of a file containing a configuration object for the builder
   * @param {string} [filePath='build'] - A path to the config file relative to directory
   *                 from where the script was run (process.cwd()
   * @returns {Promise<void>}
   */
  async importConfig (fileName, filePath = 'build') {
    try {
      const runDir = process.cwd().replace(/\\/g, '/')
      filePath = filePath.replace(/\\/g, '/')
      this._configPath = 'file:///' + path.posix.join(runDir, filePath, fileName)
    } catch (e) {
      console.error('Cannot construct path to the external config file:', e)
    }
    try {
      this.config = await import(this._configPath)
    } catch (e) {
      console.error(`Cannot resolve a config file module ${this._configPath}:`, e)
    }

    // Set webpack options from a config file
    this.webpackOptions.config = this.config.webpack
  }

  async runModules () {
    console.log(chalk.bold.white(`\nRunning ${this.options.module} module(s) in ${this.options.mode} mode(s) with a ${this.options.preset} preset. Config file: ${this._configPath}. Output level: ${this.options.outputLevel}. Code analysis is ${this.options.codeAnalysis ? 'on' : 'off'}`))

    if ([Builder.runModules.IMAGEMIN, Builder.runModules.ALL].includes(this.options.module)) {
      if (this.config.imagemin) {
        try {
          await imagemin(this.config.imagemin)
        } catch (err) {
          throw new Error (`Imagemin task failed: ${err.message}`)
        }
      } else {
        console.warn('Imagemin task will be skipped because no settings are provided')
      }
    }

    if ([Builder.runModules.SASS, Builder.runModules.ALL].includes(this.options.module)) {
      if (this.config.sass) {
        try {
          await sass(this.config.sass)
        } catch (err) {
          throw new Error (`Sass task failed: ${err.message}`)
        }
      } else {
        console.warn('Sass task will be skipped because no settings are provided')
      }
    }

    // Webpack task mast be executed last
    if ([Builder.runModules.WEBPACK, Builder.runModules.ALL].includes(this.options.module)) {
      if (this.webpackOptions) {
        try {
          await webpack(this.webpackOptions, this.options.outputLevel)
        } catch (err) {
          throw new Error (`Webpack task failed: ${err.message}`)
        }
      } else {
        console.warn('Webpack task will be skipped because no settings are provided')
      }
    }
  }
}

// The first module is a default one, it will run all modules at once
// The last module is always a webpack. It will run after all other modules
Builder.runModules = {
  ALL: 'all',
  IMAGEMIN: 'imagemin',
  SASS: 'sass',
  WEBPACK: 'webpack'
}

Builder.presets = {
  app: appPreset,
  lib: libPreset,
  vue: vuePreset,
  'vue-postcss': vuePostcssPreset,
  'pwa-vue': pwaVuePreset,
  'node-app': nodeAppPreset,
  'node-lib': nodeLibPreset
}

Builder.outputLevels = outputLevels