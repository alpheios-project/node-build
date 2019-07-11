/*
This preset is for building libraries in a UMD format.
It includes support for JS only.
 */
import { TERSER_OPTIONS } from './data/settings.mjs'
import TerserPlugin from 'terser-webpack-plugin'
import path from 'path'
const projectRoot = process.cwd()

const webpack = {
  // Settings that are shared between both production and development configs
  common: {
    context: path.join(projectRoot, 'src/'),
    output: {
      path: path.join(projectRoot, 'dist/'),
      libraryTarget: 'umd'
    },
    resolve: {
      mainFields: ['moduleExternal', 'module', 'main']
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: ['source-map-loader'],
          enforce: 'pre'
        }
      ]
    }
  },

  // Settings that are used for production mode only
  production: {
    mode: 'production',
    optimization: {
      minimizer: [
        new TerserPlugin(TERSER_OPTIONS)
      ]
    }
  },

  // Settings that are used for development mode only
  development: {
    mode: 'development',
    devtool: 'source-map'
  }
}

export default { webpack }