const fs = require('fs');
const path = require('path');
const plist = require('plist');

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
      continueUserActivity: 'continueUserActivity',
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

const updatePlist = (filename, values) => {
  const pathToFile = path.join(workingPath, filename);
  const content = fs.readFileSync(pathToFile, 'utf-8');

  const parsed = plist.parse(content);
  values.forEach(({ key, value }) => {
    if (key === 'url-scheme-add') {
      const arr = parsed['CFBundleURLTypes'][0]['CFBundleURLSchemes'];
      if (!arr.includes(value)) {
        arr.push(value);
      }

      return;
    }

    if (key === 'url-scheme-delete') {
      const arr = parsed['CFBundleURLTypes'][0]['CFBundleURLSchemes'];
      if (arr.includes(value)) {
        arr.splice(arr.indexOf(value));
      }
      return;
    }

    if (parsed[key] && !value) {
      delete parsed[key];
      return;
    }

    parsed[key] = value;
  });

  fs.writeFileSync(
    pathToFile,
    plist.build(parsed, {
      allowEmpty: false,
    }),
    'utf-8',
  );
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
        'android/app/src/main/AndroidManifest.xml',
        placeholders.android.manifest['meta-data'],
        `      <meta-data android:name="com.facebook.sdk.ApplicationId" android:value="@string/FACEBOOK_APP_ID"/>\n      <meta-data android:name="com.facebook.sdk.ClientToken" android:value="@string/FACEBOOK_CLIENT_TOKEN"/>`,
        'xml',
      );

      // iOS
      updatePlist(`ios/${appName}/Info.plist`, [
        {
          key: 'FacebookAppID',
          value: '$(FACEBOOK_APP_ID)',
        },
        {
          key: 'FacebookClientToken',
          value: '$(FACEBOOK_CLIENT_TOKEN)',
        },
        {
          key: 'FacebookDisplayName',
          value: '$(APP_DISPLAY_NAME)',
        },
        {
          key: 'url-scheme-add',
          value: 'fb$(FACEBOOK_APP_ID)',
        },
      ]);

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
        'android/app/src/main/AndroidManifest.xml',
        placeholders.android.manifest['meta-data'],
        [
          `<meta-data android:name="com.facebook.sdk.ApplicationId" android:value="@string/FACEBOOK_APP_ID"/>`,
          `<meta-data android:name="com.facebook.sdk.ClientToken" android:value="@string/FACEBOOK_CLIENT_TOKEN"/>`,
        ],
        'xml',
      );

      // iOS
      updatePlist(`ios/${appName}/Info.plist`, [
        {
          key: 'FacebookAppID',
        },
        {
          key: 'FacebookClientToken',
        },
        {
          key: 'FacebookDisplayName',
        },
        {
          key: 'url-scheme-delete',
          value: 'fb$(FACEBOOK_APP_ID)',
        },
      ]);

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
    add(appName) {
      // Android

      // iOS
      addLines(
        `ios/${appName}/AppDelegate.mm`,
        placeholders.ios.appDelegate.import,
        `#import <RNAppsFlyer.h>`,
      );
      addLines(
        `ios/${appName}/AppDelegate.mm`,
        placeholders.ios.appDelegate.continueUserActivity,
        `  [[AppsFlyerAttribution shared] continueUserActivity:userActivity restorationHandler:restorationHandler];`,
      );
    },
    delete(appName) {
      // Android

      // iOS
      deleteLines(
        `ios/${appName}/AppDelegate.mm`,
        placeholders.ios.appDelegate.import,
        `#import <RNAppsFlyer.h>`,
      );
      deleteLines(
        `ios/${appName}/AppDelegate.mm`,
        placeholders.ios.appDelegate.continueUserActivity,
        [
          `[[AppsFlyerAttribution shared] continueUserActivity:userActivity restorationHandler:restorationHandler];`,
        ],
      );
    },
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
        '        androidXAnnotation = "1.1.0"\n        androidXBrowser = "1.0.0"\n        kotlinVersion = "1.7.0"',
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
          'kotlinVersion = "1.7.0"',
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
    dependencies: ['@kirz/react-native-apphud'],
  },
  AdaptyPlugin: {
    dependencies: ['react-native-adapty'],
  },
  IdfaPlugin: {
    dependencies: ['@sparkfabrik/react-native-idfa-aaid'],
    add(appName) {
      // iOS

      updatePlist(`ios/${appName}/Info.plist`, [
        {
          key: 'NSUserTrackingUsageDescription',
          value:
            'This identifier will be used to deliver personalized ads to you.',
        },
      ]);
    },
    delete(appName) {
      // iOS
      updatePlist(`ios/${appName}/Info.plist`, [
        {
          key: 'NSUserTrackingUsageDescription',
        },
      ]);
    },
  },
  AppMetricaPlugin: {
    dependencies: ['@kirz/react-native-appmetrica'],
    add(appName) {},
    delete(appName) {},
  },
  AmplitudePlugin: {
    dependencies: ['@amplitude/analytics-react-native'],
    add(appName) {},
    delete(appName) {},
  },
};
