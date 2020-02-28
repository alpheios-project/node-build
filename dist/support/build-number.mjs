import branch from 'git-branch'

/**
 * Returns a timestamp in YYYYMMDDCCC format
 * @returns {string} - A timestamp in a string format
 */
const generateTimestamp = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString(10).padStart(2, '0')
  const day = now.getDate().toString(10).padStart(2, '0')
  // Counter is a number of two-minute intervals elapsed since midnight
  const counter = Math.round((now.getHours() * 60 + now.getMinutes()) / 2).toString(10).padStart(3)
  return `${year}${month}${day}${counter}`
}

/**
 * Generates a build number string
 * @returns {string} - A build number in the following format: branch-name.YYYYMMDDCCC
 */
const generateBuildNumber = () => {
  let branchName = branch.sync()
  if (branchName === 'master') {
    branchName = 'dev'
  }
  if (branchName === 'production') {
    branchName = ''
  } else {
    branchName += '.'
  }
  const buildNumber = generateTimestamp()
  return `${branchName}${buildNumber}`
}

export default generateBuildNumber