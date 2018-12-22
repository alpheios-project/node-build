/**
 * A scrip to automate routine file operations (e.g. handling external dependencies)
 */
import process from 'process'
import fs from 'fs'
import path from 'path'
let operation = null
let files = [] // Names of files to perform actions upon. If empty, will operate on all files in a directory
let sourceDir = null // A source directory
let targetDir = null // A target directory
let options = {
  sourceDir: '--s',
  targetDir: '--t',
  fileName: '--f'
}
let operations = {
  clean: 'clean', // Clean target directory
  copy: 'copy', // Copy files to the target directory
  replace: 'replace' // Replace files to the target directory with copies from a source dir
}
let cleanFiles = (dirName, files) => {
  let count = 0
  if (files.length === 0) { files = fs.readdirSync(dirName) } // If not file names provided, operate on all files
  for (const file of files) {
    fs.unlinkSync(path.join(dirName, file))
    count++
  }
  return count
}

let copyToDir = (sourceDir, targetDir, files, overwrite = false) => {
  const { COPYFILE_EXCL } = fs.constants
  const flags = overwrite ? 0 : COPYFILE_EXCL
  let count = 0
  if (files.length === 0) { files = fs.readdirSync(sourceDir) } // If not file names provided, operate on all files
  for (const file of files) {
    try {
      fs.copyFileSync(path.join(sourceDir, file), path.join(targetDir, file), flags)
      count++
    } catch {
      console.error(`    Cannot copy ${file} into ${targetDir}. File already exists?`)
    }
  }
  return count
}

let printHelp = () => {
  console.log(`\nPlease run ${path.basename(process.argv[1])} with one of the following parameters:`)
  console.log()
  console.log(`    clean      Removes specified file(s) from a target directory. If no file names are specified, all files in a target directory will be removed`)
  console.log(`               Example (remove file_one.txt and file_two.txt): ${path.basename(process.argv[1])} clean --t=target/dir --f=file_one.txt --f=file_two.txt`)
  console.log(`               Example (remove all files in a target directory): ${path.basename(process.argv[1])} clean --t=target/dir`)
  console.log()
  console.log(`    copy       Copy specified file(s) from a source directory to a target directory. If file already exist, they will not be overwritten. If not file names are specified, all files from a source directory will be copied to target`)
  console.log(`               Example (copy file_one.txt and file_two.txt from source to target): ${path.basename(process.argv[1])} copy --s=source/dir --t=target/dir --f=file_one.txt --f=file_two.txt`)
  console.log(`               Example (copy all files from source to target): ${path.basename(process.argv[1])} copy --s=source/dir --t=target/dir`)
  console.log()
  console.log(`    replace    Same as "copy", but will overwrite specified files in a target directory`)

}

let main = () => {
  if (process.argv.length > 2) {
    operation = process.argv[2]

    if (process.argv.length > 3) {
      // Parsing arguments
      for (let i = 3; i < process.argv.length; i++) {
        let param = process.argv[i]
        if (param.startsWith(`${options.sourceDir}=`)) {
          sourceDir = param.replace(`${options.sourceDir}=`, '')
        } else if (param.startsWith(`${options.targetDir}=`)) {
          targetDir = param.replace(`${options.targetDir}=`, '')
        } else if (param.startsWith(`${options.fileName}=`)) {
          files.push(param.replace(`${options.fileName}=`, ''))
        }
      }
    }

    if (
      !operation ||
      !Array.from(Object.values(operations)).includes(operation) ||
      (operation === operations.clean && !targetDir) ||
      (operation !== operations.clean && !sourceDir && !targetDir)
    ) {
      printHelp()
    }

    let cleaned = 0
    let copied = 0
    const projectRoot = process.cwd()
    const sourcePath = path.join(projectRoot, sourceDir)
    const targetPath = path.join(projectRoot, targetDir)

    switch (operation) {
      case operations.clean:
        cleaned = cleanFiles(targetPath, files)
        console.log(`Removed ${cleaned} files from ${targetPath}`)
        break
      case operations.copy:
        copied = copyToDir(sourcePath, targetPath, files)
        console.log(`Copied ${copied} files into ${targetPath}`)
        break
      case operations.replace:
        copied = copyToDir(sourcePath, targetPath, files, true)
        console.log(`Updated ${copied} file(s) within ${targetPath}`)
        break
    }
  } else { printHelp() }
}

main()