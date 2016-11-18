const Fs = require('fs');
const Path = require('path');
const Rl = require('readline');
const RimrafSync = require('rimraf').sync;
const SpawnSync = require('cross-spawn').sync;
const Chalk = require('chalk');
const green = Chalk.green;
const cyan = Chalk.cyan;


function prompt(question, isYesDefault) {
  if (typeof isYesDefault !== 'boolean') {
    throw new Error('Provide explicit boolean isYesDefault as second argument.');
  }
  return new Promise(resolve => {
    var rlInterface = Rl.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    var hint = isYesDefault === true ? '[Y/n]' : '[y/N]';
    var message = question + ' ' + hint + '\n';

    rlInterface.question(message, function(answer) {
      rlInterface.close();

      var useDefault = answer.trim().length === 0;
      if (useDefault) {
        return resolve(isYesDefault);
      }

      var isYes = answer.match(/^(yes|y)$/i);
      return resolve(isYes);
    });
  });
};

prompt(
  'Are you sure you want to eject? This action is permanent.',
  false
).then(shouldEject => {
  if (!shouldEject) {
    console.log(cyan('Close one! Eject aborted.'));
    process.exit(1);
  }

  console.log('Ejecting...');

  var ownPath = Path.join(__dirname, '..');
  var appPath = Path.join(ownPath, '..', '..');

  function verifyAbsent(file) {
    if (Fs.existsSync(Path.join(appPath, file))) {
      console.error(
        '`' + file + '` already exists in your app folder. We cannot ' +
        'continue as you would lose all the changes in that file or directory. ' +
        'Please move or delete it (maybe make a copy for backup) and run this ' +
        'command again.'
      );
      process.exit(1);
    }
  }

  var folders = [
    'config',
    'extensions'
  ];

  var files = [
    Path.join('config', 'index.js'),
    Path.join('extensions', 'discovery.js'),
    Path.join('extensions', 'health.js'),
    Path.join('extensions', 'swarm.js')
  ];

  // Ensure that the app folder is clean and we won't override any files
  folders.forEach(verifyAbsent);
  files.forEach(verifyAbsent);

  // Copy the files over
  folders.forEach(function(folder) {
    Fs.mkdirSync(Path.join(appPath, folder))
  });

  console.log();

  var ownPackage = require(Path.join(ownPath, 'package.json'));
  var appPackage = require(Path.join(appPath, 'package.json'));
  var babelConfig = JSON.parse(Fs.readFileSync(Path.join(ownPath, '.babelrc'), 'utf8'));
  var eslintConfig = JSON.parse(Fs.readFileSync(Path.join(ownPath, '.eslintrc'), 'utf8'));

  console.log(cyan('Updating the dependencies'));
  var ownPackageName = ownPackage.name;
  console.log('  Removing ' + cyan(ownPackageName) + ' from devDependencies');
  delete appPackage.devDependencies[ownPackageName];

  Object.keys(ownPackage.dependencies).forEach(function (key) {
    console.log('  Adding ' + cyan(key) + ' to devDependencies');
    appPackage.devDependencies[key] = ownPackage.dependencies[key];
  });
  console.log();
  console.log(cyan('Updating the scripts'));
  delete appPackage.scripts['eject'];
  Object.keys(appPackage.scripts).forEach(function (key) {
    appPackage.scripts[key] = appPackage.scripts[key]
      .replace(/pell-assistants (\w+)/g, 'node scripts/$1.js');
    console.log(
      '  Replacing ' +
      cyan('"pell-assistants ' + key + '"') +
      ' with ' +
      cyan('"node scripts/' + key + '.js"')
    );
  });

  console.log();
  console.log(cyan('Configuring package.json'));

  Fs.writeFileSync(
    Path.join(appPath, 'package.json'),
    JSON.stringify(appPackage, null, 2)
  );
  console.log();

  console.log(cyan('Running npm install...'));
  RimrafSync(ownPath);
  SpawnSync('npm', ['install'], {stdio: 'inherit'});
  console.log(green('Ejected successfully!'));
  console.log();

})
