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
  console.log() // Inserts an empty line
  console.log(chalk.blue('Webpack tasks:'))
  for (const task of tasks) {
    webpack(task, (err, stats) => {
      if (err) {
        console.error(err.stack || err)
        if (err.details) {
          console.error(err.details)
        }
        return
      }
      const info = stats.toJson()
      if (stats.hasErrors()) { console.error(info.errors) }
      if (stats.hasWarnings()) { console.warn(info.warnings) }

      console.log(stats.toString({
        chunks: true,
        assets: true,
        hash: true,
        colors: true
      }))
      let duration = new Date().getTime() - startTime
      console.log(chalk.blue(`Webpack task completed in ${duration} ms`))
    })
  }
}
