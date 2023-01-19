const path = require('path');
const fs = require('fs');
const getAllFiles = require('./readdirRecursiveSync')

const declarationFilename = path.join(__dirname, '..', '..', 'generated.d.ts')

const snakeToPascal = (string) => {
  return string.split("/")
    .map(snake => snake.split("_")
      .map(substr => substr.charAt(0)
        .toUpperCase() +
        substr.slice(1))
      .join(""))
    .join("/");
};

module.exports = () => {
  const workingPath = process.env.INIT_CWD || process.env.PWD || process.cwd();
  const pathToIcons = path.join(workingPath, 'assets', 'icons');
  const pathToImages = path.join(workingPath, 'assets', 'images');

  const modules = []
  
  const icons = getAllFiles(pathToIcons).map(filename => {
    const relativeFilename = filename.replace(pathToIcons, '')

    const extension = path.extname(relativeFilename)
    const fullname = path.basename(relativeFilename)

    if (fullname === '.gitkeep') {
      return
    }

    if (extension !== '.svg') {
      console.warn(`Wrong icon extension detected for ${fullname}`)
      return
    }

    const basename = path.basename(relativeFilename, extension)
    const moduleName = `icons${relativeFilename}`
    const iconName = snakeToPascal(basename.trim().replace(/\-+/g, ' ').replace(/ +/g, ' ').replace(/[ -]/g, '_')) + 'Icon'

    return `declare module '${moduleName}' {\n  import type { SvgProps } from 'react-native-svg';\n\n  const ${iconName}: React.FC<SvgProps>;\n  export default ${iconName};\n}`
  }).filter(x => !!x)

  modules.push(...icons)


  const images = getAllFiles(pathToImages).map(filename => {
    const relativeFilename = filename.replace(pathToImages, '')

    const extension = path.extname(relativeFilename)
    const fullname = path.basename(relativeFilename)

    if (fullname === '.gitkeep') {
      return
    }

    if (!['.png', '.jpg', '.jpeg'].includes(extension)) {
      console.warn(`Wrong image extension detected for ${fullname}`)
      return
    }

    const basename = path.basename(relativeFilename, extension)
    const moduleName = `images${relativeFilename}`
    const imageName = snakeToPascal(basename.trim().replace(/\-+/g, ' ').replace(/ +/g, ' ').replace(/[ -]/g, '_')) + 'Image'

    return `
declare module '${moduleName}' {
  import { ImageSourcePropType } from 'react-native';

  const ${imageName}: ImageSourcePropType;
  export default ${imageName};
}`.trim()
  }).filter(x => !!x)

  modules.push(...images)

  const declaration = modules.join('\n\n')

  fs.writeFileSync(declarationFilename, declaration, 'utf-8')
}