import Builder from './builder.mjs'
import commandLineArgs from 'command-line-args'

const optionDefinitions = [
  { name: 'module', alias: 'm', type: String, defaultValue: 'webpack' },
  { name: 'mode', alias: 'M', type: String, defaultValue: 'all' },
  { name: 'preset', alias: 'p', type: String },
  { name: 'externalConfig', alias: 'c', type: String, defaultValue: 'config.mjs' },
  { name: 'configPath', alias: 'C', type: String, defaultValue: 'build' },
  { name: 'buildTime', alias: 't', type: Number },
  { name: 'codeAnalysis', alias: 'a', type: Boolean, defaultValue: false },
  { name: 'outputLevel', alias: 'L', type: String, defaultValue: 'normal' },
]

const printUsageStatement = () => {
  console.error(`
  Build script should be run with at least the required three parameters in the order shown below.
  Each paramter must be prefixed with a parameter name (ex. "node build.mjs --module=moduleName --mode=modeName --preset=presetName"):
      module - a name of the module to use during build. Possible values: ${Builder.modules.map(t => '"' + t + '"').join(', ')}.
               "all": will run all modules. Default value: "webpack"
      mode   - a build mode. Possible values: ${Builder.modes.map(t => '"' + t + '"').join(', ')}.
               "production":  creates a highly-optimized production-ready code without source maps.
               "development": renders a development code version optimized for debugging.
                              Development version is generated with source maps, whenever possible.
               "all":         generates both production and development versions of a build. This is a default value.
      preset - a name of preset that will be used by a build script. Possible values: ${Object.keys(Builder.presets).map(t => '"' + t + '"').join(', ')}.
               "lib": for building a JS library with no UI.
               "vue": a preset for a build that uses Vue.js and its single file components (".vue") as well as CSS,
                      Sass, and JPEG, PNG, and SVG images.
      externalConfig - an optional parameter which can be used to override the default config file name. 
                 Ex.: "--externalConfig=config.mjs". Default is "config.mjs".
      configPath - an optional parameter which can be used to override a location of the config file. 
                 Ex.: "--configPath=build/custom-path". Default is "build".
      buildTime - an optional parameter that provides a build date and time that will be used for generation of a build info.
                  It is a number of milliseconds elapsed since January 1, 1970 00:00:00 UTC.
                  Ex.: "--buildTime=1586360771369". Defaults to a current date and time value.
      codeAnalysis - whether to provide code analysis (optional). Possible values are true or false.
                     Ex.: "--codeAnalysis=true". Defaults to false.
      outputLevel - how much output to print (optional). Possible values are: "min", "normal", "verbose".
                    Ex.: "--outputLevel=normal". Defaults to "normal".
      `)
}

let options
try {
  options = commandLineArgs(optionDefinitions)
} catch (e) {
  console.error(e)
  printUsageStatement()
}

try {
  const build = new Builder(options)
  build.importConfig(options.externalConfig, options.configPath).then(() => {
    try {
      build.runModules()
    } catch (err) {
      console.error(err)
    }
  })
} catch (e) {
  console.error(`A build process failed:`, e)
}