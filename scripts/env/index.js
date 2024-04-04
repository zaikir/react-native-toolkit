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

const GoogleServicePlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>API_KEY</key>
	<string>[API_KEY]</string>
	<key>GCM_SENDER_ID</key>
	<string>[GCM_SENDER_ID]</string>
	<key>PLIST_VERSION</key>
	<string>1</string>
	<key>BUNDLE_ID</key>
	<string>[BUNDLE_ID]</string>
	<key>PROJECT_ID</key>
	<string>[PROJECT_ID]</string>
	<key>STORAGE_BUCKET</key>
	<string>[STORAGE_BUCKET]</string>
	<key>IS_ADS_ENABLED</key>
	[IS_ADS_ENABLED]
	<key>IS_ANALYTICS_ENABLED</key>
  [IS_ANALYTICS_ENABLED]
	<key>IS_APPINVITE_ENABLED</key>
	<true></true>
	<key>IS_GCM_ENABLED</key>
	<true></true>
	<key>IS_SIGNIN_ENABLED</key>
	<true></true>
	<key>GOOGLE_APP_ID</key>
	<string>[GOOGLE_APP_ID]</string>
</dict>
</plist>`;

function copyGoogleServices(env) {
  const rootFileContent = fs.readFileSync('src/Root.tsx', 'utf-8');

  if (!rootFileContent.includes('FirebasePlugin')) {
    return;
  }

  if (!fs.existsSync(`ios/GoogleService-Info.plist`)) {
    throw new Error(`File ios/GoogleService-Info.plist not found`);
  }

  const filename = 'ios/GoogleService-Info.plist';

  const plistFileContent = GoogleServicePlist.replace(
    '[API_KEY]',
    env.FIREBASE_API_KEY,
  )
    .replace('[GCM_SENDER_ID]', env.FIREBASE_GCM_SENDER_ID)
    .replace('[BUNDLE_ID]', env.APP_BUNDLE_ID)
    .replace('[PROJECT_ID]', env.FIREBASE_PROJECT_ID)
    .replace('[STORAGE_BUCKET]', `${env.FIREBASE_PROJECT_ID}.appspot.com`)
    .replace('[IS_ADS_ENABLED]', `<false></false>`)
    .replace('[IS_ANALYTICS_ENABLED]', `<true></true>`)
    .replace('[GOOGLE_APP_ID]', env.FIREBASE_GOOGLE_APP_ID);

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
