const { devDependencies } = require('../../package.json')
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const PluginsDef = require('./plugins');

const allPluginNames = Object.keys(PluginsDef)
const workingPath = process.cwd();
const packageJsonPath = path.join(workingPath, 'package.json')
const pluginsFilename = path.join(__dirname, 'plugins.json')
const rootFilename = path.join(workingPath, 'src', 'Root.tsx')

module.exports = () => {
  // fetch names of previously installed plugins (from temp folder in node_modules)
  let installedPlugins = []
  if(fs.existsSync(pluginsFilename)) {
    installedPlugins = JSON.parse(fs.readFileSync(pluginsFilename))
  }

  console.log({ installedPlugins })

  // find list of current plugins
  const rootFile = fs.readFileSync(rootFilename, 'utf-8').replace(/\/\*[\s\S]*?\*\/|\/\/.*/g,'');
  const currentPlugins = allPluginNames.filter(name => rootFile.includes(`new ${name}(`))

  console.log({ currentPlugins })

  // find names of plugins to delete and plugins to add
  const pluginsToDelete = installedPlugins.filter(name => !currentPlugins.includes(name))
  const pluginsToAdd = currentPlugins.filter(name => !installedPlugins.includes(name))
  
  console.log({ pluginsToDelete, pluginsToAdd })

  // for every deleted plugin:
  const dependenciesToDelete = []
  pluginsToDelete.forEach(name => {
    const pluginInfo = PluginsDef[name]

    if (!pluginInfo) {
      return
    }

    //// add dependencies to delete list
    dependenciesToDelete.push(...pluginInfo.dependencies || [])

    //// execute "delete" action
    if (pluginInfo.delete) {
      pluginInfo.delete()
      console.log(`❌ [${name}]: deleted`)
    }
  })

  console.log({dependenciesToDelete})

  // for every added plugin:
  const dependenciesToAdd = []
  pluginsToAdd.forEach(name => {
    const pluginInfo = PluginsDef[name]

    if (!pluginInfo) {
      return
    }

    //// add dependencies to add list
    dependenciesToAdd.push(...pluginInfo.dependencies || [])

    //// execute "add" action
    if (pluginInfo.add) {
      pluginInfo.add()
      console.log(`✅ [${name}]: installed`)
    }
  })

  console.log({dependenciesToAdd})

  const { dependencies: projectDependencies } = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
  const projectDependenciesNames = Object.keys(projectDependencies)

  // execute "npm r" if needed using delete list
  const resultDependenciesToDelete = dependenciesToDelete.filter(x => projectDependenciesNames.includes(x))
  if (resultDependenciesToDelete.length) {
    spawnSync('npm', ['r', ...resultDependenciesToDelete])
    console.log(`npm r ${resultDependenciesToDelete.join(' ')}`)
  }

  console.log({resultDependenciesToDelete})

  // execute "npm i" if needed using add list
  const resultDependenciesToAdd = dependenciesToAdd.filter(x => !projectDependenciesNames.includes(x))
  if (resultDependenciesToAdd.length) {
    const packages = resultDependenciesToAdd.map(x => `${x}@${devDependencies[x]}`)

    spawnSync('npm', ['i', ...packages])  
    console.log(`npm i ${packages.join(' ')}`)
  }

  console.log({resultDependenciesToAdd})

  // save plugins to a file
  const resultPluginsList = currentPlugins
  fs.writeFileSync(pluginsFilename, JSON.stringify(resultPluginsList))

  console.log({ resultPluginsList })
}
