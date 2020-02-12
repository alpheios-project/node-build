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

## Presets
`node-build` can run with several presets. Each preset defines configuration options that will be merged
with options form `build/config.mjs` in a host project. If no preset specified, a `lib` preset will be
used.

The following presets are defined currently:
* `lib` (default): suitable for a JS library module with no UI.
* `vue`: a preset for modules that uses Vue.js and its single file components (`.vue`) as well as CSS,
Sass, and JPEG, PNG, and SVG images.

## Dependencies
Automatic installation of packages that are required for `node-build` to work might cause issues in some repository configurations. To avoid this, all packages required for `node-build` tools has been moved to peer dependencies. They will not be installed by npm during installation of `node-build`.

To avoid adding peer dependencies to the client's `package.json` manually one can use the following sequence of commands: `npx install-peerdeps alpheios-node-build --dev --only`. It will use an `install-peeredeps` npm packages to add peer dependencies of `node-build` into dev dependencies of the `package.json` of a client. 

If `node-build` should not be installed but its dependencies steel need to be added to `package.json` as is the case with the root directory of a Lerna controlled monorepo we can install `node-build`, update dependencies, and then remove it: `npm i -D git://github.com/alpheios-project/node-build.git#v2.0.0 && npx install-peerdeps alpheios-node-build --dev --only-peers && npm un alpheios-node-build`. Please note that installation and removal are needed only because `node-build` is not published as an npm packages; publishing it will eliminate a need for that.
