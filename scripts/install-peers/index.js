const { spawnSync } = require('child_process');

const { peerDependencies } = require('../../package.json');

module.exports = () => {
  const names = Object.keys(peerDependencies);

  const packages = names.map((x) => `${x}@${peerDependencies[x]}`);

  console.log(`🔧 npm i ${packages.join(' ')}`);
  spawnSync('npm', ['i', ...packages]);

  console.log(`🔧 npx pod-install`);
  spawnSync('npx', ['pod-install']);

  console.log(`✅ done`);
};
