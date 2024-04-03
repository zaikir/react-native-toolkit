const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PluginsDef = require('./plugins');
const { devDependencies } = require('../../package.json');

const allPluginNames = Object.keys(PluginsDef);
const workingPath = process.cwd();
const packageJsonPath = path.join(workingPath, 'package.json');
// eslint-disable-next-line no-undef
const pluginsFilename = path.join(workingPath, 'rnt.json');
const rootFilename = path.join(workingPath, 'src', 'Root.tsx');

module.exports = () => {
  const { name: appName } = JSON.parse(
    fs.readFileSync(path.join(workingPath, 'app.json')),
  );

  // fetch names of previously installed plugins (from temp folder in node_modules)
  let installedPlugins = [];
  if (fs.existsSync(pluginsFilename)) {
    installedPlugins = JSON.parse(fs.readFileSync(pluginsFilename)).plugins;
  }

  // find list of current plugins
  const rootFile = fs
    .readFileSync(rootFilename, 'utf-8')
    .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
  const currentPlugins = allPluginNames.filter((name) =>
    rootFile.includes(`new ${name}(`),
  );

  // find names of plugins to delete and plugins to add
  const pluginsToDelete = installedPlugins.filter(
    (name) => !currentPlugins.includes(name),
  );
  const pluginsToAdd = currentPlugins.filter(
    (name) => !installedPlugins.includes(name),
  );

  // for every deleted plugin:
  const dependenciesToDelete = [];
  pluginsToDelete.forEach((name) => {
    const pluginInfo = PluginsDef[name];

    if (!pluginInfo) {
      return;
    }

    // // add dependencies to delete list
    dependenciesToDelete.push(...(pluginInfo.dependencies || []));

    if (pluginInfo.delete) {
      pluginInfo.delete(appName);
    }

    console.log(`❌ [${name}] removed`);
  });

  // for every added plugin:
  const dependenciesToAdd = [];
  pluginsToAdd.forEach((name) => {
    const pluginInfo = PluginsDef[name];

    if (!pluginInfo) {
      return;
    }

    // // add dependencies to add list
    dependenciesToAdd.push(...(pluginInfo.dependencies || []));

    if (pluginInfo.add) {
      pluginInfo.add(appName);
    }

    console.log(`✅ [${name}] added`);
  });

  const { dependencies: projectDependencies } = JSON.parse(
    fs.readFileSync(packageJsonPath, 'utf-8'),
  );
  const projectDependenciesNames = Object.keys(projectDependencies);

  // execute "npm r" if needed using delete list
  const resultDependenciesToDelete = dependenciesToDelete.filter((x) =>
    projectDependenciesNames.includes(x),
  );
  if (resultDependenciesToDelete.length) {
    console.log(`🔧 npm r ${resultDependenciesToDelete.join(' ')}`);
    spawnSync('npm', ['r', ...resultDependenciesToDelete]);
  }

  // execute "npm i" if needed using add list
  const resultDependenciesToAdd = dependenciesToAdd.filter(
    (x) => !projectDependenciesNames.includes(x),
  );
  if (resultDependenciesToAdd.length) {
    const packages = resultDependenciesToAdd.map(
      (x) => `${x}@${devDependencies[x]}`,
    );

    console.log(`🔧 npm i ${packages.join(' ')}`);
    spawnSync('npm', ['i', ...packages]);
    spawnSync('npx', ['pod-install']);
  }

  // save plugins to a file
  const resultPluginsList = currentPlugins;
  fs.writeFileSync(
    pluginsFilename,
    JSON.stringify({ plugins: resultPluginsList }),
  );
};
