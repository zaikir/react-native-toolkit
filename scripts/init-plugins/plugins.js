const {
  addLines,
  updatePlist,
  deleteLines,
  setGradleMinSdkVersion,
} = require('./utils');

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
      openURL: 'openURL',
    },
  },
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
    env: [
      { name: 'FIREBASE_API_KEY' },
      { name: 'FIREBASE_GCM_SENDER_ID' },
      { name: 'FIREBASE_PROJECT_ID' },
      { name: 'FIREBASE_GOOGLE_APP_ID' },
    ],
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
    env: [{ name: 'FACEBOOK_APP_ID' }, { name: 'FACEBOOK_CLIENT_TOKEN' }],
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
  BranchPlugin: {
    dependencies: ['react-native-branch'],
    add(appName) {
      const links = [
        `$(BRANCH_SUBDOMAIN).app.link`,
        `$(BRANCH_SUBDOMAIN)-alternate.app.link`,
        `$(BRANCH_SUBDOMAIN).test-app.link`,
        `$(BRANCH_SUBDOMAIN)-alternate.test-app.link`,
      ];

      // iOS
      addLines(
        `ios/${appName}/AppDelegate.mm`,
        placeholders.ios.appDelegate.import,
        `#import <RNBranch/RNBranch.h>`,
      );
      addLines(
        `ios/${appName}/AppDelegate.mm`,
        placeholders.ios.appDelegate.didFinishLaunchingWithOptions.start,
        `#ifdef DEBUG // BranchPlugin\n  [RNBranch useTestInstance];\n#endif // BranchPlugin\n  if (@available(iOS 16.0, *)) { } else if (@available(iOS 15.0, *)) { [[Branch getInstance] checkPasteboardOnInstall]; }\n  [RNBranch initSessionWithLaunchOptions:launchOptions isReferrable:YES]`,
      );
      addLines(
        `ios/${appName}/AppDelegate.mm`,
        placeholders.ios.appDelegate.continueUserActivity,
        `  [RNBranch continueUserActivity:userActivity];`,
      );
      addLines(
        `ios/${appName}/AppDelegate.mm`,
        placeholders.ios.appDelegate.openURL,
        `  [RNBranch application:app openURL:url options:options];`,
      );
      updatePlist(`ios/${appName}/Info.plist`, [
        {
          key: 'branch_universal_link_domains',
          value: links,
        },
        {
          key: 'branch_key',
          value: {
            test: `$(BRANCH_TEST_KEY)`,
            live: `$(BRANCH_LIVE_KEY)`,
          },
        },
      ]);
      updatePlist(`ios/${appName}/${appName}.entitlements`, (plist) => {
        plist['com.apple.developer.associated-domains'] =
          plist['com.apple.developer.associated-domains'] || [];
        links.forEach((link) => {
          if (
            !plist['com.apple.developer.associated-domains'].includes(
              `applinks:${link}`,
            )
          ) {
            plist['com.apple.developer.associated-domains'].push(
              `applinks:${link}`,
            );
          }
        });
      });
    },
    delete(appName) {
      const links = [
        `$(BRANCH_SUBDOMAIN).app.link`,
        `$(BRANCH_SUBDOMAIN)-alternate.app.link`,
        `$(BRANCH_SUBDOMAIN).test-app.link`,
        `$(BRANCH_SUBDOMAIN)-alternate.test-app.link`,
      ];

      // iOS
      deleteLines(
        `ios/${appName}/AppDelegate.mm`,
        placeholders.ios.appDelegate.import,
        `#import <RNBranch/RNBranch.h>`,
      );
      deleteLines(
        `ios/${appName}/AppDelegate.mm`,
        placeholders.ios.appDelegate.didFinishLaunchingWithOptions.start,
        [
          `#ifdef DEBUG // BranchPlugin`,
          `[RNBranch useTestInstance];`,
          `#endif // BranchPlugin`,
          'if (@available(iOS 16.0, *)) { } else if (@available(iOS 15.0, *)) { [[Branch getInstance] checkPasteboardOnInstall]; }',
          '[RNBranch initSessionWithLaunchOptions:launchOptions isReferrable:YES]',
        ],
      );
      deleteLines(
        `ios/${appName}/AppDelegate.mm`,
        placeholders.ios.appDelegate.continueUserActivity,
        [`[RNBranch continueUserActivity:userActivity];`],
      );
      deleteLines(
        `ios/${appName}/AppDelegate.mm`,
        placeholders.ios.appDelegate.openURL,
        [`[RNBranch application:app openURL:url options:options];`],
      );
      updatePlist(`ios/${appName}/Info.plist`, [
        {
          key: 'branch_universal_link_domains',
        },
        {
          key: 'branch_key',
        },
      ]);

      updatePlist(`ios/${appName}/${appName}.entitlements`, (plist) => {
        plist['com.apple.developer.associated-domains'] =
          plist['com.apple.developer.associated-domains'] || [];
        links.forEach((link) => {
          plist['com.apple.developer.associated-domains'] = plist[
            'com.apple.developer.associated-domains'
          ].filter((link) => !links.includes(link.replace('applinks:', '')));
        });

        if (!plist['com.apple.developer.associated-domains'].length) {
          delete plist['com.apple.developer.associated-domains'];
        }
      });
    },
    env: [
      { name: 'BRANCH_TEST_KEY' },
      { name: 'BRANCH_LIVE_KEY' },
      { name: 'BRANCH_SUBDOMAIN' },
    ],
  },
};
