/* eslint-disable no-console */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const declareAssets = require('./scripts/declare-assets');
const initPlugins = require('./scripts/init-plugins');
const loadFonts = require('./scripts/load-fonts');
const tsStart = require('./scripts/ts-start');

module.exports = {
  commands: [
    {
      name: 'generate-splash-screen',
      description: 'Generate a launch screen using info from app.json',
      options: [],
      func: () => {
        const workingPath =
          process.env.INIT_CWD || process.env.PWD || process.cwd();
        const pathToAppInfo = path.join(workingPath, 'app.json');

        if (!fs.existsSync(pathToAppInfo)) {
          console.log('❌ File `app.json` not found. Exiting…\n');

          process.exit(1);
        }

        const appFile = JSON.parse(fs.readFileSync(pathToAppInfo));
        if (!appFile.splash) {
          console.log('⚠️ Missing `splash` info. Skipping generation…\n');

          process.exit(1);
        }

        spawnSync('npx', [
          'react-native',
          'generate-bootsplash',
          appFile.splash.icon,
          '--logo-width',
          appFile.splash.width || 100,
          '--background-color',
          appFile.splash.background || '#fff',
        ]);
      },
    },
    {
      name: 'load-fonts',
      description: 'Load fonts from assets/fonts and initialize fonts in theme',
      options: [],
      func: () => {
        loadFonts();

        console.log('✅ Fonts loaded successfully');
      },
    },
    {
      name: 'ts-start',
      description: 'Start metro bundle with typescript compiler',
      options: [
        {
          name: '--reset-cache',
          description: 'Reset cache',
        },
      ],
      func: () => {
        tsStart();
      },
    },
    {
      name: 'init-plugins',
      description: 'Initialize plugins',
      options: [],
      func: () => {
        initPlugins();
      },
    },
    {
      name: 'declare-assets',
      description:
        'Generate TypeScript definitions for icons and images from the assets folder',
      options: [],
      func: () => {
        declareAssets();
      },
    },
  ],
};
