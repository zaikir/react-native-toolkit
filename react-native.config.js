/* eslint-disable no-console */
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

module.exports = {
  commands: [
    {
      name: 'generate-bootsplash',
      description: 'Generate a launch screen using info from app.json',
      options: [],
      func: () => {
        const workingPath = process.env.INIT_CWD || process.env.PWD || process.cwd();
        const pathToAppInfo = path.join(workingPath, 'app.json');

        if (!fs.existsSync(pathToAppInfo)) {
          console.log(
            '❌  File `app.json` not found. Exiting…\n',
          );

          process.exit(1);
        }

        const appFile = JSON.parse(fs.readFileSync(pathToAppInfo));
        if (!appFile.splash) {
          console.log(
            '⚠️  Missing `splash` info. Skipping generation…\n',
          );

          process.exit(1);
        }

        spawnSync('npx', [
          'react-native', 'generate-bootsplash',
          appFile.splash.icon,
          '--logo-width', appFile.splash.width || 100,
          '--background-color', appFile.splash.background || '#fff',
        ]);
      },
    },
  ],
};
