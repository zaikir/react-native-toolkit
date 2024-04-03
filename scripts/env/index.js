const fs = require('fs');

function pathAndroidProguard(env) {
  const filename = 'android/app/proguard-rules.pro';
  const bundleId =
    typeof env.APP_BUNDLE_ID === 'string'
      ? env.APP_BUNDLE_ID
      : env.APP_BUNDLE_ID.android;

  const content = fs
    .readFileSync(filename, 'utf-8')
    .replace(
      /\-keepclassmembers class .*.BuildConfig \{ # keep env unchanged/,
      `-keepclassmembers class ${bundleId}.BuildConfig { # keep env unchanged`,
    );

  fs.writeFileSync(filename, content, 'utf-8');
}

function copyGoogleServices(env) {
  const rootFileContent = fs.readFileSync('src/Root.tsx', 'utf-8');

  if (!rootFileContent.includes('FirebasePlugin')) {
    return;
  }

  if (!env.FIREBASE_API_KEY) {
    throw new Error('FIREBASE_API_KEY env variable required');
  }

  if (!env.FIREBASE_GCM_SENDER_ID) {
    throw new Error('FIREBASE_GCM_SENDER_ID env variable required');
  }

  if (!env.FIREBASE_PROJECT_ID) {
    throw new Error('FIREBASE_PROJECT_ID env variable required');
  }

  if (!env.FIREBASE_GOOGLE_APP_ID) {
    throw new Error('FIREBASE_GOOGLE_APP_ID env variable required');
  }

  if (!fs.existsSync(`ios/GoogleService-Info.plist`)) {
    throw new Error(`File ios/GoogleService-Info.plist not found`);
  }

  const filename = 'ios/GoogleService-Info.plist';

  const plistFileContent = fs
    .readFileSync(filename, 'utf-8')
    .replace(
      /<key>API_KEY<\/key>\n	<string>.*<\/string>/m,
      `<key>API_KEY</key>\n	<string>${env.FIREBASE_API_KEY}</string>`,
    )
    .replace(
      /<key>GCM_SENDER_ID<\/key>\n	<string>.*<\/string>/m,
      `<key>GCM_SENDER_ID</key>\n	<string>${env.FIREBASE_GCM_SENDER_ID}</string>`,
    )
    .replace(
      /<key>BUNDLE_ID<\/key>\n	<string>.*<\/string>/m,
      `<key>BUNDLE_ID</key>\n	<string>${env.APP_BUNDLE_ID}</string>`,
    )
    .replace(
      /<key>PROJECT_ID<\/key>\n	<string>.*<\/string>/m,
      `<key>PROJECT_ID</key>\n	<string>${env.FIREBASE_PROJECT_ID}</string>`,
    )
    .replace(
      /<key>STORAGE_BUCKET<\/key>\n	<string>.*<\/string>/m,
      `<key>STORAGE_BUCKET</key>\n	<string>${env.FIREBASE_PROJECT_ID}.appspot.com</string>`,
    )
    .replace(
      /<key>IS_ANALYTICS_ENABLED<\/key>\n	<false><\/false>/m,
      `<key>IS_ANALYTICS_ENABLED</key>\n	<true></true>`,
    )
    .replace(
      /<key>GOOGLE_APP_ID<\/key>\n	<string>.*<\/string>/m,
      `<key>GOOGLE_APP_ID</key>\n	<string>${env.FIREBASE_GOOGLE_APP_ID}</string>`,
    );

  fs.writeFileSync(filename, plistFileContent, 'utf-8');
}

function addGeneratedEnv(env) {
  env['APP_BUNDLE_URL_SCHEME'] =
    env['APP_BUNDLE_URL_SCHEME'] ||
    env['APP_BUNDLE_ID'].replace(/[^a-zA-Z0-9]/g, '');
}

module.exports = {
  async processEnv(env) {
    // patch android/app/proguard-rules.pro
    pathAndroidProguard(env);

    // copy GoogleService-Info.plist and Google-Services.json
    copyGoogleServices(env);

    // add generated env variables
    addGeneratedEnv(env);

    return env;
  },
};
