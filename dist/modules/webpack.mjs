import webpack from 'webpack'
import merge from 'webpack-merge'
import chalk from 'chalk'
import {createRequire} from 'module'
const require = createRequire(import.meta.url)
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const mergeStrategy = {
  'externals': 'replace',
  'resolve.mainFields': 'append',
  'resolve.alias': 'replace'
}

const codeAnalysisConfig = {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
}

export default function build (options/*, modes, config, configTemplate = {}*/) {
  const productionConfig = merge.strategy(mergeStrategy)(
    options.configTemplate.common,
    options.configTemplate.production,
    options.config.common,
    options.config.production,
    options.codeAnalysis ? codeAnalysisConfig : {}
  )
  const developmentConfig = merge.strategy(mergeStrategy)(
    options.configTemplate.common,
    options.configTemplate.development,
    options.config.common,
    options.config.development,
    options.codeAnalysis ? codeAnalysisConfig : {}
  )

  if (!Array.isArray(options.modes)) {
    options.modes = [options.modes]
  }
  let tasks = []
  if (options.modes.includes('production')) { tasks.push(productionConfig) }
  if (options.modes.includes('development')) { tasks.push(developmentConfig) }

  let startTime = new Date().getTime()
  console.log(chalk.blue(`\nWebpack tasks (code analysis is ${options.codeAnalysis ? 'on' : 'off'}):`))
  for (const task of tasks) {
    webpack(task, (err, stats) => {
      console.log(`Task: ${task.mode}`) // Inserts an empty line
      if (err) {
        console.error(err.stack || err)
        if (err.details) {
          console.error(err.details)
        }
        return
      }
      const info = stats.toJson()
      console.log()
      console.log(stats.toString({
        chunks: true,
        assets: true,
        hash: true,
        colors: true
      }))

      if (stats.hasWarnings()) {
        console.log(chalk.bold.bgYellow(`\nWARNINGS`))
        if (Array.isArray(info.warnings)) {
          for (const warn of info.warnings) {
            console.log(chalk.yellow(`${warn}`))
          }
        }
      }

      if (stats.hasErrors()) {
        console.log(chalk.bold.bgRed(`\nERRORS`))
        if (Array.isArray(info.errors)) {
          for (const err of info.errors) {
            console.log(chalk.red(`${err}`))
          }
        }
      }

      let duration = new Date().getTime() - startTime
      console.log(chalk.blue(`\nWebpack task completed in ${duration} ms`))
    })
  }
}
