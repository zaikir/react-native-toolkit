const { peerDependencies } = require('../../package.json')
const { spawnSync } = require('child_process');

module.exports = () => {
  const deps = Object.entries(peerDependencies)
    .map(([package, version]) => ({ package, version }))
    .filter(x => !['react', 'react-native'].includes(x.package))
    .map(x => `${x.package}@${x.version}`)

  spawnSync('npm', ['i', ...deps])
}