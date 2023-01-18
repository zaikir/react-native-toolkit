const path = require('path');
const fs = require('fs');

const iconsDeclarationFilename = path.join(__dirname, '..', 'icons.d.ts')

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
  const pathToImages = path.join(workingPath, 'assets', 'icons');

  fs.readdir(pathToIcons, function(err, filenames) {
    if (err) {
      onError(err);
      return;
    }
  
    const icons = filenames.map(filename => {
      const extension = path.extname(filename)
      const basename = path.basename(filename, extension)

      if (basename === '.gitkeep') {
        return
      }

      if (extension !== '.svg') {
        console.warn(`Wrong icon extension detected for ${basename}`)
        return
      }

      const moduleName = `icons/${filename}`
      const iconName = snakeToPascal(filename.trim().replace(/\-+/g, ' ').replace(/ +/g, ' ').replace(/[ -]/g, '_')) + 'Icon'

      return `declare module '${moduleName}' {\n  import type { SvgProps } from 'react-native-svg';\n\n  const ${iconName}: React.FC<SvgProps>;\n  export default ${iconName};\n}`
    }).filter(x => !!x)

    const iconsDeclaration = icons.join('\n\n')
    fs.writeFileSync(iconsDeclarationFilename, iconsDeclaration, 'utf-8')
  });
}