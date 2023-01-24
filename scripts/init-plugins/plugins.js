const fs = require('fs');
const path = require('path');

const label = `react-native-tooklit`;
const workingPath = process.cwd();

const placeholders = {
  android: {
    gradle: {
      'buildscript/ext': 'buildscript/ext',
      'buildscript/dependencies': 'buildscript/dependencies',
    },
    appGradle: {
      applyPlugin: 'apply-plugin',
      defaultConfig: 'defaultConfig',
    },
    res: {
      strings: 'strings',
    },
    manifest: {
      'meta-data': 'meta-data',
      'uses-permission': 'uses-permission',
    },
  },
  ios: {
    info: {
      BundleURLSchemes: 'BundleURLSchemes',
      dict: 'dict',
    },
    appDelegate: {
      import: 'import',
      didFinishLaunchingWithOptions: {
        start: 'didFinishLaunchingWithOptions/start',
      },
    },
  },
};

const addLines = (filename, placeholder, lines, commentType) => {
  const pathToFile = path.join(workingPath, filename);

  const content = fs.readFileSync(pathToFile, 'utf-8');
  const contentLines = content.split('\n');
  const sectionStartIndex = contentLines.findIndex((x) =>
    x.includes(`[${label}] ${placeholder}`),
  );
  const sectionEndIndex = contentLines.findIndex((x) =>
    x.includes(`[${label}-end] ${placeholder}`),
  );

  const currentLines = contentLines.slice(sectionStartIndex, sectionEndIndex);
  const linesToAdd = (typeof lines === 'string' ? [lines] : lines).filter(
    (line) => !currentLines.find((y) => y.includes(line)),
  );

  if (linesToAdd.length) {
    let newContent = content.replace(
      `// [${label}] ${placeholder}`,
      `// [${label}] ${placeholder}\n${linesToAdd.join('\n')}`,
    );
    if (commentType === 'xml') {
      newContent = content.replace(
        `<!-- [${label}] ${placeholder} -->`,
        `<!-- [${label}] ${placeholder} -->\n${linesToAdd.join('\n')}`,
      );
    }
    fs.writeFileSync(pathToFile, newContent, 'utf-8');

    console.log(`➕ ${filename}`);
  }
};

const deleteLines = (filename, placeholder, lines) => {
  const pathToFile = path.join(workingPath, filename);

  const content = fs.readFileSync(pathToFile, 'utf-8');
  const contentLines = content.split('\n');
  const sectionStartIndex = contentLines.findIndex((x) =>
    x.includes(`[${label}] ${placeholder}`),
  );
  const sectionEndIndex = contentLines.findIndex((x) =>
    x.includes(`[${label}-end] ${placeholder}`),
  );

  const linesToDelete = [];
  for (let i = sectionStartIndex + 1; i < sectionEndIndex; i++) {
    const line = contentLines[i];
    if (
      (typeof lines === 'string' ? [lines] : lines).find((x) =>
        x.includes(line.trim()),
      )
    ) {
      linesToDelete.push(i);
    }
  }

  if (linesToDelete.length) {
    const newContent = contentLines
      .filter((x, idx) => !linesToDelete.includes(idx))
      .join('\n');
    fs.writeFileSync(pathToFile, newContent, 'utf-8');

    console.log(`➖ ${filename}`);
  }
};

const setGradleMinSdkVersion = (version) => {
  const pathToFile = path.join(workingPath, '/android/build.gradle');
  let content = fs.readFileSync(pathToFile, 'utf-8');

  const currentVersion = /minSdkVersion *= *(\d*)/.exec(content)[1];
  if (parseFloat(currentVersion) < parseFloat(version)) {
    content = content.replace(
      /minSdkVersion *= *(\d*)/,
      `minSdkVersion = ${version}`,
    );
    fs.writeFileSync(pathToFile, content, 'utf-8');
  }
};

module.exports = {
  SentryPlugin: {
    dependencies: ['@sentry/integrations', '@sentry/react-native'],
  },
  FirebasePlugin: {
    dependencies: [
      '@react-native-firebase/app',
      '@react-native-firebase/analytics',
      '@react-native-firebase/remote-config',
    ],
    add(appName) {
      // Android
      addLines(
        'android/build.gradle',
        placeholders.android.gradle['buildscript/dependencies'],
        '        classpath("com.google.gms:google-services:4.3.14")',
      );
      addLines(
        'android/app/build.gradle',
        placeholders.android.appGradle.applyPlugin,
        `apply plugin: 'com.google.gms.google-services'`,
      );

      // iOS
      addLines(
        `ios/${appName}/AppDelegate.mm`,
        placeholders.ios.appDelegate.import,
        `#import <Firebase.h>`,
      );
      addLines(
        `ios/${appName}/AppDelegate.mm`,
        placeholders.ios.appDelegate.didFinishLaunchingWithOptions.start,
        `  [FIRApp configure];`,
      );
    },
    delete(appName) {
      // Android
      deleteLines(
        'android/build.gradle',
        placeholders.android.gradle['buildscript/dependencies'],
        '        classpath("com.google.gms:google-services:4.3.14")',
      );
      deleteLines(
        'android/app/build.gradle',
        placeholders.android.appGradle.applyPlugin,
        `apply plugin: 'com.google.gms.google-services'`,
      );

      // iOS
      deleteLines(
        `ios/${appName}/AppDelegate.mm`,
        placeholders.ios.appDelegate.import,
        `#import <Firebase.h>`,
      );
      deleteLines(
        `ios/${appName}/AppDelegate.mm`,
        placeholders.ios.appDelegate.didFinishLaunchingWithOptions.start,
        `  [FIRApp configure];`,
      );
    },
  },
  FacebookPlugin: {
    dependencies: ['react-native-fbsdk-next'],
    add(appName) {
      // Android
      addLines(
        'android/app/src/main/res/values/strings.xml',
        placeholders.android.res.strings,
        '    <string name="facebook_app_id">${FACEBOOK_APP_ID}</string>\n    <string name="facebook_client_token">${FACEBOOK_CLIENT_TOKEN}</string>',
        'xml',
      );
      addLines(
        'android/app/src/main/AndroidManifest.xml',
        placeholders.android.manifest['meta-data'],
        `      <meta-data android:name="com.facebook.sdk.ApplicationId" android:value="@string/facebook_app_id"/>\n      <meta-data android:name="com.facebook.sdk.ClientToken" android:value="@string/facebook_client_token"/>`,
        'xml',
      );

      // iOS
      addLines(
        `ios/${appName}/Info.plist`,
        placeholders.ios.info.BundleURLSchemes,
        `					<string>fb$(FACEBOOK_APP_ID)</string>`,
        'xml',
      );
      addLines(
        `ios/${appName}/Info.plist`,
        placeholders.ios.info.dict,
        `		<key>FacebookAppID</key>\n		<string>$(FACEBOOK_APP_ID)</string>\n		<key>FacebookClientToken</key>\n		<string>$(FACEBOOK_CLIENT_TOKEN)</string>\n		<key>FacebookDisplayName</key>\n		<string>$(APP_DISPLAY_NAME)</string>`,
        'xml',
      );
      addLines(
        `ios/${appName}/AppDelegate.mm`,
        placeholders.ios.appDelegate.import,
        `#import <FBSDKCoreKit/FBSDKCoreKit-Swift.h>`,
      );
      addLines(
        `ios/${appName}/AppDelegate.mm`,
        placeholders.ios.appDelegate.didFinishLaunchingWithOptions.start,
        `  [[FBSDKApplicationDelegate sharedInstance] application:application didFinishLaunchingWithOptions:launchOptions];\n  [FBSDKApplicationDelegate.sharedInstance initializeSDK];`,
      );
    },
    delete(appName) {
      // Android
      deleteLines(
        'android/app/src/main/res/values/strings.xml',
        placeholders.android.res.strings,
        '<string name="facebook_app_id">${FACEBOOK_APP_ID}</string>\n    <string name="facebook_client_token">${FACEBOOK_CLIENT_TOKEN}</string>',
        'xml',
      );
      deleteLines(
        'android/app/src/main/AndroidManifest.xml',
        placeholders.android.manifest['meta-data'],
        [
          `<meta-data android:name="com.facebook.sdk.ApplicationId" android:value="@string/facebook_app_id"/>`,
          `<meta-data android:name="com.facebook.sdk.ClientToken" android:value="@string/facebook_client_token"/>`,
        ],
        'xml',
      );

      // iOS
      deleteLines(
        `ios/${appName}/Info.plist`,
        placeholders.ios.info.BundleURLSchemes,
        `<string>fb$(FACEBOOK_APP_ID)</string>`,
      );
      deleteLines(
        `ios/${appName}/Info.plist`,
        placeholders.ios.info.dict,
        [
          `<key>FacebookAppID</key>`,
          `<string>$(FACEBOOK_APP_ID)</string>`,
          `<key>FacebookClientToken</key>`,
          `<string>$(FACEBOOK_CLIENT_TOKEN)</string>`,
          `<key>FacebookDisplayName</key>`,
          `<string>$(APP_DISPLAY_NAME)</string>`,
        ],
        'xml',
      );
      deleteLines(
        `ios/${appName}/AppDelegate.mm`,
        placeholders.ios.appDelegate.import,
        `#import <FBSDKCoreKit/FBSDKCoreKit-Swift.h>`,
      );
      deleteLines(
        `ios/${appName}/AppDelegate.mm`,
        placeholders.ios.appDelegate.didFinishLaunchingWithOptions.start,
        [
          `[[FBSDKApplicationDelegate sharedInstance] application:application didFinishLaunchingWithOptions:launchOptions];`,
          `[FBSDKApplicationDelegate.sharedInstance initializeSDK];`,
        ],
      );
    },
  },
  AppsFlyerPlugin: {
    dependencies: ['react-native-appsflyer'],
  },
  NetworkPlugin: {
    dependencies: [],
  },
  RevenueCatPlugin: {
    dependencies: ['react-native-purchases'],
    add(appName) {
      // Android
      addLines(
        'android/app/src/main/AndroidManifest.xml',
        placeholders.android.manifest['uses-permission'],
        '    <uses-permission android:name="com.android.vending.BILLING" />',
        'xml',
      );

      // iOS
      // In-App Purchase capability enabled in a @kirz/react-native-template by default
    },
    delete(appName) {
      // Android
      deleteLines(
        'android/app/src/main/AndroidManifest.xml',
        placeholders.android.manifest['uses-permission'],
        ' <uses-permission android:name="com.android.vending.BILLING" />',
        'xml',
      );
    },
  },
  InAppPurchasePlugin: {
    dependencies: ['react-native-iap'],
    add(appName) {
      // Android
      setGradleMinSdkVersion(24);
      addLines(
        'android/build.gradle',
        placeholders.android.gradle['buildscript/ext'],
        '        androidXAnnotation = "1.1.0"        androidXBrowser = "1.0.0"        kotlinVersion = "1.5.0"',
      );
      addLines(
        'android/build.gradle',
        placeholders.android.gradle['buildscript/dependencies'],
        '        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion"',
      );
      addLines(
        'android/app/build.gradle',
        placeholders.android.appGradle.defaultConfig,
        `        missingDimensionStrategy ('store', 'play')`,
      );
    },
    delete(appName) {
      // Android
      deleteLines(
        'android/build.gradle',
        placeholders.android.gradle['buildscript/ext'],
        [
          'androidXAnnotation = "1.1.0"',
          'androidXBrowser = "1.0.0"',
          'kotlinVersion = "1.5.0"',
        ],
      );
      deleteLines(
        'android/build.gradle',
        placeholders.android.gradle['buildscript/dependencies'],
        'classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion"',
      );
      deleteLines(
        'android/app/build.gradle',
        placeholders.android.appGradle.defaultConfig,
        `missingDimensionStrategy ('store', 'play')`,
      );
    },
  },
  ApphudPlugin: {
    dependencies: ['@kirz/react-native-apphud-sdk'],
  },
};
