const concurrently = require('concurrently')
const declareAssets = require('../declare-assets')

const args = process.argv.slice(3).join(' ')

const clear =  function (isSoft) {
	process.stdout.write(
		isSoft ? '\x1B[H\x1B[2J' : '\x1B[2J\x1B[3J\x1B[H\x1Bc'
	);
}

module.exports = () => {
  clear()
  declareAssets()

  concurrently([
    'tsc -p tsconfig.json --watch --preserveWatchOutput',
    'watchman watch-del-all > /dev/null && react-native start ' + args
  ], {
    raw: true,
  });
}