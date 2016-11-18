// Create a p2p/dns-multicast swarm

const SwarmFactory = require('discovery-swarm');
const DetectPort = require('detect-port');

const Internals = {};

// TODO: check this, defaults are not working as expected when using as plugins

Internals.defaults = {
    dns: {
        domain: ''
    },
    dht: {
        bootstrap: ['localhost:20001'],
        interval: 5
    },
    hash: false,
    port: 10000,
    maxConnections: 10
};

const Swarm = function (server, options = Internals.defaults, next){

    server.app.swarm = SwarmFactory(options);
    DetectPort(options.port, ( err, altPort ) => {

        let port = options.port;
        if (options.port !== altPort){
            console.log(`Port options.port is being used. Trying with: ${altPort}`);
            port = altPort;
        }
        server.app.swarm.listen(port);
    });

    next();
};


Swarm.attributes = {
    name: 'client_swarm_service',
    version: '1.0.0',
    once: true
};

module.exports = Swarm;
