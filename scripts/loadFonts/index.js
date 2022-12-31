const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');
const FontName = require('./fontname');

module.exports = () => {
  const workingPath = process.env.INIT_CWD || process.env.PWD || process.cwd();
  const pathToFonts = path.join(workingPath, 'assets', 'fonts');
  
  fs.readdir(pathToFonts, function(err, filenames) {
    if (err) {
      onError(err);
      return;
    }
  
    const fonts = filenames.map(filename => {
      const pathToFile = path.join(pathToFonts, filename)
      const content = fs.readFileSync(pathToFile)
      const [res] = FontName.parse(content)
      const extension = path.extname(filename)
  
      const [fontFamily, fontWeight] = res.postScriptName.split('-')
      
      // const italic = fontWeight.toLowerCase().endsWith('italic')
  
      // const weight = (() => {
      //   let weight = fontWeight.toLowerCase()
      //   if (italic) {
      //     weight = weight.replace(/italic$/, '')
      //   }
  
      //   switch (weight) {
      //     case 'hairline': 
      //     case 'thin': 
      //       return '100'
      //     case 'extralight':
      //     case 'ultralight':
      //       return '200'
      //     case 'light':
      //       return '300'
      //     case 'normal':
      //     case 'regular':
      //       return '400'
      //     case 'medium':
      //       return '500'
      //     case 'semibold':
      //     case 'demibold':
      //       return '600'
      //     case 'bold':
      //       return '700'
      //     case 'extrabold':
      //     case 'ultrabold':
      //       return '800'
      //     case 'black':
      //     case 'heavy':
      //       return '900'
      //   }
      // })()
      
      return {
        path: pathToFile,
        name: path.basename(filename, extension),
        extension,
        postScriptName: res.postScriptName,
        family: fontFamily,
        weight: fontWeight,
        newPath: path.join(pathToFonts, `${res.postScriptName}${extension}`)
      }
    })
  
    fonts.forEach(font => {
      if (font.name !== font.postScriptName) {
        fs.renameSync(font.path, font.newPath)
      }
    })
  
    const groupedFonts = fonts.reduce((acc, item) => {
      acc[item.family] = acc[item.family] || []
      acc[item.family].push(item)
  
      return acc
    }, {})
  
    const pathToTheme = path.join(workingPath, 'src', 'theme', 'theme.ts')
    const themeContent = fs.readFileSync(pathToTheme, 'utf-8')
  
    const newContent = themeContent.replace(/fonts: *\{[^}]*\},/gm, `fonts: ${
      Object.entries(groupedFonts).reduce((acc, [family, items]) => {
        return acc + `    ${family}: [${items.map(x => `'${x.weight}'`).sort((a,b) => a.localeCompare(b)).join(', ')}],\n`
      }, '{\n') + '  },'
    }`)
  
    fs.writeFileSync(pathToTheme, newContent, 'utf-8')

    spawnSync('npx', ['react-native-asset', '--assets', ...fonts.map(x => x.newPath)]);
  });
}