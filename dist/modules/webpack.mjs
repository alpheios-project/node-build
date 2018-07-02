import webpack from 'webpack'
import merge from 'webpack-merge'
import chalk from 'chalk'
const mergeStrategy = {
  'externals': 'replace',
  'resolve.mainFields': 'append',
  'resolve.alias': 'replace'
}

export default function build (modes, config, configTemplate = {}) {
  const productionConfig = merge.strategy(mergeStrategy)(
    configTemplate.common,
    configTemplate.production,
    config.common,
    config.production
  )
  const developmentConfig = merge.strategy(mergeStrategy)(
    configTemplate.common,
    configTemplate.development,
    config.common,
    config.development
  )

  if (!Array.isArray(modes)) {
    modes = [modes]
  }
  let tasks = []
  if (modes.includes('production')) { tasks.push(productionConfig) }
  if (modes.includes('development')) { tasks.push(developmentConfig) }

  let startTime = new Date().getTime()
  console.log(chalk.blue('\nWebpack tasks:'))
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
