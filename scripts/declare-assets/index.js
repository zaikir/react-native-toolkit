const fs = require('fs');
const path = require('path');

const getAllFiles = require('./readdirRecursiveSync');

// eslint-disable-next-line no-undef
const declarationFilename = path.join(__dirname, '..', '..', 'generated.d.ts');

const snakeToPascal = (string) => {
  return string
    .split('/')
    .map((snake) =>
      snake
        .split('_')
        .map((substr) => substr.charAt(0).toUpperCase() + substr.slice(1))
        .join(''),
    )
    .join('/');
};

module.exports = () => {
  const workingPath = process.env.INIT_CWD || process.env.PWD || process.cwd();
  const pathToIcons = path.join(workingPath, 'assets', 'icons');
  const pathToImages = path.join(workingPath, 'assets', 'images');

  const modules = [];

  const icons = getAllFiles(pathToIcons)
    .map((filename) => {
      const relativeFilename = filename.replace(pathToIcons, '');

      const extension = path.extname(relativeFilename);
      const fullname = path.basename(relativeFilename);

      if (fullname === '.gitkeep') {
        return;
      }

      if (extension !== '.svg') {
        console.warn(`Wrong icon extension detected for ${fullname}`);
        return;
      }

      const basename = path.basename(relativeFilename, extension);
      const moduleName = `icons${relativeFilename}`;
      const iconName =
        snakeToPascal(
          basename
            .trim()
            .replace(/\-+/g, ' ')
            .replace(/ +/g, ' ')
            .replace(/[ -]/g, '_'),
        ) + 'Icon';

      return `declare module '${moduleName}' {\n  import type { SvgProps } from 'react-native-svg';\n\n  const ${iconName}: React.FC<SvgProps>;\n  export default ${iconName};\n}`;
    })
    .filter((x) => !!x);

  modules.push(...icons);

  const images = getAllFiles(pathToImages)
    .map((filename) => {
      const relativeFilename = filename.replace(pathToImages, '');

      const extension = path.extname(relativeFilename);
      const fullname = path.basename(relativeFilename);

      if (fullname === '.gitkeep') {
        return;
      }

      if (!['.png', '.jpg', '.jpeg', '.gif'].includes(extension)) {
        console.warn(`Wrong image extension detected for ${fullname}`);
        return;
      }

      const basename = path.basename(relativeFilename, extension);
      const moduleName = `images${relativeFilename}`;
      const imageName =
        snakeToPascal(
          basename
            .trim()
            .replace(/\-+/g, ' ')
            .replace(/ +/g, ' ')
            .replace(/[ -]/g, '_'),
        ) + 'Image';

      return `
declare module '${moduleName}' {
  import { ImageSourcePropType } from 'react-native';

  const ${imageName}: ImageSourcePropType;
  export default ${imageName};
}`.trim();
    })
    .filter((x) => !!x);

  modules.push(...images);

  // const declaration = modules.join('\n\n')
  const declaration = `
declare module '*.svg' {
  import type { SvgProps } from 'react-native-svg';

  const svg: React.FC<SvgProps>;
  export default svg;
}

declare module '*.png' { const img: any; export default img; }
declare module '*.jpg' { const img: any; export default img; }
declare module '*.jpeg' { const img: any; export default img; }
declare module '*.gif' { const img: any; export default img; }`.trim();

  fs.writeFileSync(declarationFilename, declaration, 'utf-8');
};
