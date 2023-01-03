const path = require('path');
const fs = require('fs');

const label = `react-native-tooklit`
const workingPath = process.cwd();

const placeholders = {
  android: {
    gradle: {
      buildscriptDependencies: 'buildscript/dependencies'
    }, 
    appGradle: {
      applyPlugin: 'apply-plugin'
    }
  },
  ios: {
    appDelegate: {
      import: 'import',
      didFinishLaunchingWithOptions: {
        start: 'didFinishLaunchingWithOptions/start'
      }
    }
  }
}

const addLines = (filename, placeholder, lines) => {
  const pathToFile = path.join(workingPath, filename)

  const content = fs.readFileSync(pathToFile, 'utf-8')
  const contentLines = content.split('\n')
  const sectionStartIndex = contentLines.findIndex(x => x.includes(`[${label}] ${placeholder}`))
  const sectionEndIndex = contentLines.findIndex(x => x.includes(`[${label}-end] ${placeholder}`))

  const currentLines = contentLines.slice(sectionStartIndex, sectionEndIndex)
  const linesToAdd = (typeof lines === 'string' ? [lines]: lines)
    .filter(line => !currentLines.find(y => y.includes(line)))

  if (linesToAdd.length) {
    const newContent = content.replace(`// [${label}] ${placeholder}`, `// [${label}] ${placeholder}\n${linesToAdd.join('\n')}`)
    fs.writeFileSync(pathToFile, newContent, 'utf-8')
  
    console.log(`➕ ${filename}`)
  }
}


const deleteLines = (filename, placeholder, lines) => {
  const pathToFile = path.join(workingPath, filename)

  const content = fs.readFileSync(pathToFile, 'utf-8')
  const contentLines = content.split('\n')
  const sectionStartIndex = contentLines.findIndex(x => x.includes(`[${label}] ${placeholder}`))
  const sectionEndIndex = contentLines.findIndex(x => x.includes(`[${label}-end] ${placeholder}`))

  const linesToDelete = []
  for (var i = sectionStartIndex + 1; i < sectionEndIndex; i++) {
    const line = contentLines[i]
    if ((typeof lines === 'string' ? [lines]: lines).find(x => x.includes(line.trim()))) {
      linesToDelete.push(i)
    }
  }

  if (linesToDelete.length) {
    const newContent = contentLines.filter((x, idx) => !linesToDelete.includes(idx)).join('\n')
    fs.writeFileSync(pathToFile, newContent, 'utf-8')

    console.log(`➖ ${filename}`)
  }
}

module.exports = {
  SentryPlugin: {
    dependencies: ["@sentry/integrations", "@sentry/react-native"],
  },
  FirebaseRemoteConfig: {
    dependencies: [
      "@react-native-firebase/app",
      "@react-native-firebase/analytics",
      "@react-native-firebase/remote-config"
    ],
    add(appName) {
      // Android
      addLines('android/build.gradle', placeholders.android.gradle.buildscriptDependencies, '        classpath("com.google.gms:google-services:4.3.14")')
      addLines('android/app/build.gradle', placeholders.android.appGradle.applyPlugin, `apply plugin: 'com.google.gms.google-services'`)

      // iOS
      addLines(`ios/${appName}/AppDelegate.mm`, placeholders.ios.appDelegate.import, `#import <Firebase.h>`)
      addLines(`ios/${appName}/AppDelegate.mm`, placeholders.ios.appDelegate.didFinishLaunchingWithOptions.start, `  [FIRApp configure];`)
    },
    delete(appName) {
      // Android
      deleteLines('android/build.gradle', placeholders.android.gradle.buildscriptDependencies, '        classpath("com.google.gms:google-services:4.3.14")')
      deleteLines('android/app/build.gradle', placeholders.android.appGradle.applyPlugin, `apply plugin: 'com.google.gms.google-services'`)

      // iOS
      deleteLines(`ios/${appName}/AppDelegate.mm`, placeholders.ios.appDelegate.import, `#import <Firebase.h>`)
      deleteLines(`ios/${appName}/AppDelegate.mm`, placeholders.ios.appDelegate.didFinishLaunchingWithOptions.start, `  [FIRApp configure];`)
    },
  },
};
