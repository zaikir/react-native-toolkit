const fs = require('fs');
const path = require('path');
const plist = require('plist');

const label = `react-native-tooklit`;
const workingPath = process.cwd();

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
  if (typeof values === 'function') {
    values(parsed);
  } else {
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
  }

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
  addLines,
  deleteLines,
  updatePlist,
  setGradleMinSdkVersion,
};
