/*
This preset is for building applications that are used in a node.js environment.
 */
import path from 'path'
const projectRoot = process.cwd()

const webpack = {
  common: {
    target: "node",
    output: {
      path: path.resolve(projectRoot, "./dist")
    },
    externals: [],
    mode: "development",
    node: {
      __dirname: false
    },
    resolve: {
      modules: ['node_modules']
    }
  }
}

export default { webpack }