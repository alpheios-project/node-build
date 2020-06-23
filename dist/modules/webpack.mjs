import { outputLevels } from './consts/consts.js'
import webpack from 'webpack'
import merge from 'webpack-merge'
import chalk from 'chalk'
import {createRequire} from 'module'
import generateBuildInfo from '../support/build-info.mjs'
const require = createRequire(import.meta.url)
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const { DuplicatesPlugin } = require("inspectpack/plugin");
const mergeStrategy = {
  'externals': 'replace',
  'resolve.mainFields': 'append',
  'resolve.alias': 'replace'
}

const codeAnalysisConfig = {
  plugins: [
    new DuplicatesPlugin({
      // Emit compilation warning or error? (Default: `false`)
      emitErrors: false,
      // Handle all messages with handler function (`(report: string)`)
      // Overrides `emitErrors` output.
      emitHandler: undefined,
      // Display full duplicates information? (Default: `false`)
      verbose: true
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: '../reports/bundle-analyzer-report.html',
      generateStatsFile: false
    })
  ]
}

export default async function build (options, outputLevel) {
  const productionConfig = merge.smartStrategy(mergeStrategy)(
    options.configTemplate.common,
    options.configTemplate.production,
    options.config.common,
    options.config.production,
    options.codeAnalysis ? codeAnalysisConfig : {}
  )
  const developmentConfig = merge.smartStrategy(mergeStrategy)(
    options.configTemplate.common,
    options.configTemplate.development,
    options.config.common,
    options.config.development,
    options.codeAnalysis ? codeAnalysisConfig : {}
  )

  const buildInfo = generateBuildInfo(options.buildTime)

  if (!productionConfig.plugins) { productionConfig.plugins = [] }
  if (!developmentConfig.plugins) { developmentConfig.plugins = [] }

  const injectionPlugin = new webpack.DefinePlugin({
    BUILD_BRANCH: JSON.stringify(buildInfo.branch),
    BUILD_NUMBER: JSON.stringify(buildInfo.number),
    BUILD_NAME: JSON.stringify(buildInfo.name)
  })

  const prodInjectionPlugin = new webpack.DefinePlugin({
    PRODUCTION_MODE_BUILD: true,
    DEVELOPMENT_MODE_BUILD: false
  })

  const devInjectionPlugin = new webpack.DefinePlugin({
    PRODUCTION_MODE_BUILD: false,
    DEVELOPMENT_MODE_BUILD: true
  })

  // Difine a plugin for injection of constants
  productionConfig.plugins.push(injectionPlugin, prodInjectionPlugin)
  developmentConfig.plugins.push(injectionPlugin, devInjectionPlugin)

  /*
  If any custom plugins are listed in a configuration, they should be added to the plugin list.
  Constructor of each plugin will be passed an object that will contain a `buildInfo` prop.
   */
  if (options.config.custom) {
    if (options.config.custom.production && options.config.custom.production.plugins) {
      options.config.custom.production.plugins.forEach(plugin => {
        productionConfig.plugins.push(new plugin({
          buildInfo
        }))
      })
    }

    if (options.config.custom) {
      if (options.config.custom.development && options.config.custom.development.plugins) {
        options.config.custom.development.plugins.forEach(plugin => {
          developmentConfig.plugins.push(new plugin({
            buildInfo
          }))
        })
      }
    }

    if (options.config.custom.common && options.config.custom.common.plugins) {
      options.config.custom.common.plugins.forEach(plugin => {
        productionConfig.plugins.push(new plugin({
          buildInfo
        }))
      })
      options.config.custom.common.plugins.forEach(plugin => {
        developmentConfig.plugins.push(new plugin({
          buildInfo
        }))
      })
    }
  }

  if (!Array.isArray(options.modes)) {
    options.modes = [options.modes]
  }
  let webpackConfigs = [] // eslint-disable-line prefer-const
  // If both mods are on, development should be run before production to avoid overwriting artefacts of production
  if (options.modes.includes('development')) { webpackConfigs.push(developmentConfig) }
  if (options.modes.includes('production')) { webpackConfigs.push(productionConfig) }

  let startTime = new Date().getTime()
  console.log(chalk.blue(`\nWebpack tasks:`))
  for (const config of webpackConfigs) {
    let compiler = webpack(config)
    if (outputLevel !== outputLevels.MIN) {
      new webpack.ProgressPlugin().apply(compiler)
    }
    await runCompiler(compiler, config, outputLevel)
  }

  let duration = new Date().getTime() - startTime
  console.log(chalk.blue(`Webpack tasks completed in ${duration} ms`))
}


const runCompiler = async (compiler, config, outputLevel) => {
  return new Promise((resolve, reject) => {
    console.log(`Task: ${config.mode}`)
    compiler.run((err, stats) => {
      if (err) {
        console.error(err.stack || err)
        if (err.details) {
          console.error(err.details)
        }
        return
      }

      // Base options for minimal output
      let statsOptions = {
        chunks: false,
        assets: false,
        moduleAssets: false,
        hash: false,
        logging: 'none',
        version: false,
        timings: false,
        builtAt: false,
        entrypoints: false,
        chunks: false,
        modules: false,
        reasons: false,
        children: false,
        source: false,
        warnings: false,
        errors: false,
        colors: true
      }

      // Options for normal and verbose output level
      if ([outputLevels.NORMAL, outputLevels.VERBOSE].includes(outputLevel)) {
        statsOptions = { ...statsOptions, ...{
          chunks: true,
          assets: true,
          moduleAssets: true,
          logging: 'info',
          version: true,
          timings: true,
          builtAt: true,
          entrypoints: true,
          chunks: true,
          warnings: true,
          warningsFilter: [
            /Failed to parse source map/
          ],
          errors: true
        } }
      }

      // Options for verbose output level only
      if ([outputLevels.VERBOSE].includes(outputLevel)) {
        statsOptions = { ...statsOptions, ...{
            logging: 'log',
            hash: true,
            modules: true,
            reasons: true,
            children: true,
            source: true,
            warningsFilter: [] // Do not filter any warnings
          } }
      }
      console.log()
      console.log(stats.toString(statsOptions))
      resolve()
    })
  })
}