# node-build

This is a set of node.js scripts to automate building of Alpheios modules. It uses Webpack as a main
build tool. It might also use other tools (imagemin, node-sass, etc.) if required.

## Modules
`node-build` script utilizes a concept of modules. Each module is a script that uses one or more external tools
to fulfill some specific build task. For example, a `webpack` module uses Webpack to produce a JS assembly,
and `imagemin` module uses `imagemin` with `imagemin-jpegtran`, `imagemin-optipng`, `imagemin-svgo` to
optimize all images in a project and move them from `src` to `dist` directory.

Modules are stored in a `modules` directory. They are easily pluggable: once a new module is created,
dropped into a `modules` directory, and registered in a `build.mjs`, it is ready to be used.

## Modes
`node-build` can run in two modes: `production` and `development`. The former produces a highly-optimized
production ready code without source maps. The latter renders a development version optimized for
debugging. Development version is generated with source maps, whenever possible.

`all` mode produces both production and development versions of a build. It is a default script running mode.

## Configuration
`node-build` takes a build configuration from `build/config.mjs` in a host project. Typical `config.mjs`
is an ESM file that exports several config objects. The name of each object must match the name of a 
module that will handle the task. Properties of configuration objects are module-specific.