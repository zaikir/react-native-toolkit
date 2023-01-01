const concurrently = require('concurrently')

const args = process.argv.slice(3).join(' ')

module.exports = () => {
  concurrently([
    'tsc -p tsconfig.json --watch',
    'npm:clear-watchman && react-native start ' + args
  ], {
    raw: true,
  });
}