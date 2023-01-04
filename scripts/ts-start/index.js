const concurrently = require('concurrently')

const args = process.argv.slice(3).join(' ')

module.exports = () => {
  concurrently([
    'tsc -p tsconfig.json --watch --preserveWatchOutput',
    'npm run watchman watch-del-all > /dev/null && react-native start ' + args
  ], {
    raw: true,
  });
}