// provide a minimal api bridge for service health status.
// This will be consumed for another service in order to know the whole network status.
const Process = require('process');
const ReadPkgUp = require('read-pkg-up');
const Pkg = ReadPkgUp.sync().pkg;
const Internals = {};

Internals.stats = {};

Internals.stats.name = Pkg.name;

Internals.stats.version = Pkg.version;

Internals.stats.pell = Pkg.pell;

Internals.stats.pid = Process.pid;

Internals.stats.cpuFirstCheck = Process.hrtime();

Internals.stats.prevUsage = Process.cpuUsage();

Internals.stats.mem = () => Process.memoryUsage();

Internals.stats.cpu = () => {

    const secNSec2ms = function secNSec2ms(secNSec) {

        return Math.round((secNSec[0] * 1000) + (secNSec[1] / 1000000));
    };

    const intervalTime = secNSec2ms(process.hrtime(Internals.stats.cpuFirstCheck));
    const currentUsageDiff = Process.cpuUsage(Internals.stats.prevUsage);
    Internals.stats.prevUsage = currentUsageDiff;
    const userPercent = Number((((currentUsageDiff.user / 1000) / intervalTime) * 100).toFixed(2));
    const systemPercent = Number((((currentUsageDiff.system / 1000) / intervalTime) * 100).toFixed(2));

    return {
        userPercent,
        systemPercent
    };
};

const Health = function (server, options, next){
    // add route for checking
    // get data from process and maybe os.
    // add data from release
    server.route({
        method: 'GET',
        path: '/health',
        handler: function (request, reply) {

            return reply({
                name: Internals.stats.name,
                version: Internals.stats.version,
                pell: Internals.stats.pell,
                pid: Internals.stats.pid,
                cpu: Internals.stats.cpu(),
                mem: Internals.stats.mem()
            });
        }
    });

    return next();

};

Health.attributes = {
    name: 'client_health_service',
    version: '1.0.0'
};

module.exports = Health;
