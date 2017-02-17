// discover dependent service using dht
// after this process is ok service can operate.
'use strict';

const Crypto = require('crypto');
const ReadPkgUp = require('read-pkg-up');
const Pkg = ReadPkgUp.sync().pkg;
const FindKey = require('lodash.findkey');

/***** */
const Internals = {};

Internals.defaults = {
    id: Crypto.createHash('sha1').update(Pkg.pell.name).digest().toString(),
    healthChannel: Crypto.createHash('sha1').update('first_aid:status:health:*').digest().toString(),
    depSet: new Set(),
    depMap: new Map(),
    discovered: new Map()
};

const Discovery = function (server, options, next){

    // NOTE: emit logs using the request/server logs hapi built-ins
    server.app.swarm.on('connection', (connection, info) => {

        console.log(`${Pkg.pell.name} :: connection info >> ${info}`);
        console.log(`${Pkg.pell.name} :: info id >> ${info.id.toString()}`);
        const filter = Array.from(Internals.defaults.depSet).filter((item) => {

            return item.toString() === info.id.toString();
        });

        console.log(`${Pkg.pell.name} :: filter >> ${filter}`);

        if (info.initiator && Internals.defaults.depSet.has(info.id.toString())){

            console.log(`${Pkg.pell.name} :: new dep founded!`);
            // update discovered services map
            const key = FindKey(Pkg.pell.dependencies, info.id.toString());
            Internals.defaults.depMap.set(key, info.id);
            Internals.defaults.discovered.set(info.id.toString(), { host: info.host, port: info.port });
            server.app.discovered = Internals.defaults.discovered;
            console.log(`${Pkg.pell.name} :: server.app.discovered >> ${server.app.discovered}`);
        }
    });

    // I think its not necessary because we are already passing the id when starting the swarm
    //server.app.swarm.join(options.id); // can be any id/name/hash

    // everybody must join to the health channel
    server.app.swarm.join(options.healthChannel);

    if (Pkg.pell.dependencies){
        // join the channel you want to
        // channel -1---n- pellservice
        Object.keys(Pkg.pell.dependencies).forEach((key) => {

            const dep = Pkg.pell.dependencies[key];
            console.log(`${Pkg.pell.name} dep key >> ${key}`);
            const hash = dep;
            server.app.swarm.join(hash);
            console.log(`${Pkg.pell.name} :: requesting dep: ${hash.toString('hex')}`);
            Internals.defaults.depSet.add(new Buffer(hash).toString());
            Internals.defaults.depMap.set(key, new Buffer(hash).toString());
        });
        console.log(Internals.defaults.depSet);
    }

    server.app.depMap = Internals.defaults.depMap;

    server.app.swarm.once('listening', () => {

        console.log('Swarm listening');
    });

    next();
};


Discovery.attributes = {
    name: 'client_discovery_service',
    version: '1.0.0',
    dependencies: ['client_swarm_service']
};

module.exports = Discovery;
