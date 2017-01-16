'use strict';

const Fs = require('fs-extra');
const Path = require('path');
const Spawn = require('cross-spawn');
const PathExists = require('path-exists');
const Chalk = require('chalk');

const Internals = {};
// TODO: start pm2 with a pm2 config file
Internals.defaults = {
    start: (serviceName) => `psy start -n ${serviceName} -- node server.js`,
    test: 'lab -t 85',
    coverage: 'lab -r html -o coverage.html'
};

module.exports = function (appPath, appName, verbose, originalDirectory) {

    const ownPackageName = require(Path.join(__dirname, '..', 'package.json')).name;
    const ownPath = Path.join(appPath, 'node_modules', ownPackageName);
    const appPackage = require(Path.join(appPath, 'package.json'));

    // Copy over some of the devDependencies
    appPackage.dependencies = appPackage.dependencies || {};
    appPackage.devDependencies = appPackage.devDependencies || {};

    // Setup the script rules
    appPackage.scripts = {
        'start': Internals.defaults.start(appName),
        'test': Internals.defaults.test,
        'coverage': Internals.defaults.coverage,
        'eject': 'pell-assistants eject'
    };

    // Setup pell microservice metadata
    // name is what this exposed to the world, same goes for deps
    // name is required.
    // name > mservice:company:offer
    appPackage.pell = {
        name: 'mservice:geut:world'
    };

    // Update the pkg
    Fs.writeFileSync(
        Path.join(appPath, 'package.json'),
        JSON.stringify(appPackage, null, 2)
    );


    const readmeExists = PathExists.sync(Path.join(appPath, 'README.md'));
    if (readmeExists) {
        Fs.renameSync(Path.join(appPath, 'README.md'), Path.join(appPath, 'README.old.md'));
    }


    // Copy the files for the user
    Fs.copySync(Path.join(ownPath, 'template'), appPath);

    // Rename gitignore after the fact to prevent npm from renaming it to .npmignore
    // See: https://github.com/npm/npm/issues/1862
    Fs.move(Path.join(appPath, 'gitignore'), Path.join(appPath, '.gitignore'), [], (err) => {
        if (err) {
            // Append if there's already a `.gitignore` file there
            if (err.code === 'EEXIST') {
                const data = Fs.readFileSync(Path.join(appPath, 'gitignore'));
                Fs.appendFileSync(Path.join(appPath, '.gitignore'), data);
                Fs.unlinkSync(Path.join(appPath, 'gitignore'));
            } else {
                throw err;
            }
        }
    });

    // Run another npm install for react and react-dom
    console.log('Installing dependencies from npm...');
    console.log();
    // TODO: having to do two npm installs is bad, can we avoid it?
    const dependencies = ['hapi', 'lab', 'good', 'good-console', 'good-squeeze', 'pell-assistants', 'pm2'];
    const args = [
        'install',
        '--save',
        verbose && '--verbose'
    ]
    .concat(dependencies)
    .filter((e) => { return e; });

    const proc = Spawn('npm', args, { stdio: 'inherit' });
    proc.on('close', (code) => {
        if (code !== 0) {
            console.error('`npm ' + args.join(' ') + '` failed');
            return;
        }

        // Display the most elegant way to cd.
        // This needs to handle an undefined originalDirectory for
        // backward compatibility with old global-cli's.
        let cdpath;
        if (originalDirectory && Path.join(originalDirectory, appName) === appPath) {
            cdpath = appName;
        }
        else {
            cdpath = appPath;
        }

        console.log();
        console.log('Success! Microservice ' + appName + ' created at ' + appPath);
        console.log('Inside that directory, you can run several commands:');
        console.log();
        console.log(Chalk.cyan('  npm start'));
        console.log('    Starts the microservice.');
        console.log();
        console.log(Chalk.cyan('  npm test'));
        console.log('    Starts the test lab.');
        console.log();
        console.log(Chalk.cyan('  npm run coverage'));
        console.log('    Shows the current code coverage.');
        console.log();
        console.log(Chalk.cyan('  npm run eject'));
        console.log('    Removes this tool and copies build dependencies, configuration files');
        console.log('    and extensions into the app directory. If you do this, you can’t go back!');
        console.log();
        console.log('We suggest that you begin by typing:');
        console.log();
        console.log(Chalk.cyan('  cd'), cdpath);
        console.log('  ' + Chalk.cyan('npm start'));
        if (readmeExists) {
            console.log();
            console.log(Chalk.yellow('You had a `README.md` file, we renamed it to `README.old.md`'));
        }
        console.log();
        console.log('Happy hacking!');
    });
};
