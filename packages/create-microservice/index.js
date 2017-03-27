#!/usr/bin/env node

const Fs = require('fs');
const Path = require('path');
const Spawn = require('cross-spawn');
const Chalk = require('chalk');
const Semver = require('semver');
const Argv = require('minimist')(process.argv.slice(2));
const PathExists = require('path-exists');

/**
 * Arguments:
 *   --version - to print current version
 *   --verbose - to print logs while init
 *   --starter - to set the base nodes for the dht
 *   --assistants-version <alternative package>
 *     Example of valid values:
 *     - a specific npm version: "0.22.0-rc1"
 *     - a .tgz archive from any npm repo"
 */
var commands = Argv._;
if (commands.length === 0) {
  if (Argv.version) {
    console.log('create-microservice version: ' + require('./package.json').version);
    process.exit();
  }
  console.error(
    'Usage: create-microservice <project-directory> [--verbose] [--starter]'
  );
  process.exit(1);
}

createMicro(commands[0], Argv.verbose, Argv['assistants-version'], Argv['starter']);

function createMicro(name, verbose, version, starter) {
  var root = Path.resolve(name);
  var appName = Path.basename(root);

  checkMicroName(appName);

  if (!PathExists.sync(name)) {
    Fs.mkdirSync(root);
  } else if (!isSafeToCreateProjectIn(root)) {
    console.log('The directory `' + name + '` contains file(s) that could conflict. Aborting.');
    process.exit(1);
  }

  console.log(
    'Creating a new microservice in ' + root + '.'
  );
  console.log();

  var packageJson = {
    name: appName,
    version: '0.1.0',
    private: true,
  };
  Fs.writeFileSync(
    Path.join(root, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  var originalDirectory = process.cwd();
  process.chdir(root);

  console.log('Installing packages. This might take a couple minutes.');
  console.log('Installing pell-assistants from npm...');
  console.log();

  run(root, appName, version, verbose, originalDirectory, starter);
}

function run(root, appName, version, verbose, originalDirectory, starter) {
  var installPackage = getInstallPackage(version);
  var packageName = getPackageName(installPackage);
  var args = [
    'install',
    verbose && '--verbose',
    '--save',
    '--save-exact',
    installPackage,
  ].filter(function(e) { return e; });
  var proc = Spawn('npm', args, {stdio: 'inherit'});
  proc.on('close', function (code) {
    if (code !== 0) {
      console.error('`npm ' + args.join(' ') + '` failed');
      return;
    }

    checkNodeVersion(packageName);

    var scriptsPath = Path.resolve(
      process.cwd(),
      'node_modules',
      packageName,
      'scripts',
      'init.js'
    );
    var init = require(scriptsPath);
    init(root, appName, verbose, originalDirectory, starter);
  });
}

function getInstallPackage(version) {
  let packageToInstall = 'pell-assistants';
  const validSemver = Semver.valid(version);
  if (validSemver) {
    packageToInstall += '@' + validSemver;
  } else if (version) {
    // for tar.gz or alternative paths
    packageToInstall = version;
  }
  return packageToInstall;
}

// Extract package name from tarball url or Path.
function getPackageName(installPackage) {
  if (installPackage.indexOf('.tgz') > -1) {

    return installPackage.match(/^.+\/(.+?)(?:-\d+.+)?\.tgz$/)[1];
  } else if (installPackage.indexOf('@') > 0) {
    // Do not match @scope/ when stripping off @version or @tag
    return installPackage.charAt(0) + installPackage.substr(1).split('@')[0];
  }
  return installPackage;
}

function checkNodeVersion(packageName) {
  var packageJsonPath = Path.resolve(
    process.cwd(),
    'node_modules',
    packageName,
    'package.json'
  );
  var packageJson = require(packageJsonPath);
  if (!packageJson.engines || !packageJson.engines.node) {
    return;
  }

  if (!Semver.satisfies(process.version, packageJson.engines.node)) {
    console.error(
      Chalk.red(
        'You are currently running Node %s but create-microservice requires %s.' +
        ' Please use a supported version of Node.\n'
      ),
      process.version,
      packageJson.engines.node
    );
    process.exit(1);
  }
}

function checkMicroName(appName) {

  var dependencies = ['hapi', 'lab', 'good', 'good-console', 'good-squeeze', 'pell-assistants', 'psy'];
  var devDependencies = ['eslint-config-hapi', 'eslint-plugin-hapi'];
  var allDependencies = dependencies.concat(devDependencies).sort();

  if (allDependencies.indexOf(appName) >= 0) {
    console.error(
      Chalk.red(
        'We cannot create a project called `' + appName + '` because a dependency with the same name exists.\n' +
        'Due to the way npm works, the following names are not allowed:\n\n'
      ) +
      Chalk.cyan(
        allDependencies.map(function(depName) {
          return '  ' + depName;
        }).join('\n')
      ) +
      Chalk.red('\n\nPlease choose a different project name.')
    );
    process.exit(1);
  }
}

function isSafeToCreateProjectIn(root) {
  var validFiles = [
    '.DS_Store', 'Thumbs.db', '.git', '.gitignore', '.idea', 'README.md', 'LICENSE'
  ];
  return Fs.readdirSync(root)
    .every(function(file) {
      return validFiles.indexOf(file) >= 0;
    });
}
