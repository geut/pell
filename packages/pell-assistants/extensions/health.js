// provide a minimal api bridge for service health status.
// This will be consumed for another service in order to know the whole network status.
'use strict';

const Os = require('os');
const Process = require('process');
const ReadPkgUp = require('read-pkg-up');
const Pkg = ReadPkgUp.sync().pkg;
const Internals = {};

Internals.stats = {};

Internals.stats.name = Pkg.name;

Internals.stats.version = Pkg.version;

Internals.stats.pell = Pkg.pell;

Internals.stats.pid = Process.pid;

Internals.CPUs = Os.cpus().length;

Internals.MILLIS = 1e3;

Internals.MICRO = 1e6;

Internals.stats.lastSampleTime = Process.uptime() * Internals.MILLIS;

Internals.stats.prevUsage = undefined;

Internals.stats.mem = () => {
    const memStats = Process.memoryUsage();
    memStats.currentSampleTime = Date.now();
    return memStats;
};

Internals.stats.cpu = () => {

    const currentSampleTime = Date.now();
    const elapsedUptime = (currentSampleTime - Internals.stats.lastSampleTime) / Internals.MILLIS;
    const totalCpuTime = Internals.CPUs * elapsedUptime;
    // update lastSampleTime
    Internals.stats.lastSampleTime = currentSampleTime;
    const currentUsageDiff = Process.cpuUsage(Internals.stats.prevUsage);
    // update prevCpuUsage
    Internals.stats.prevUsage = currentUsageDiff;
    const user = (currentUsageDiff.user / Internals.MICRO).toFixed(1);
    const system = (currentUsageDiff.system / Internals.MICRO).toFixed(1);
    const userUsage = (user / totalCpuTime).toFixed(1);
    const systemUsage = (system / totalCpuTime).toFixed(1);
    return {
        user,
        userUsage,
        system,
        systemUsage,
        currentSampleTime
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
