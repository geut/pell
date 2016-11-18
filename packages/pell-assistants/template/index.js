// Create-microservice Example
// code business logic as a hapi module.
'use strict';

const Package = require('./package');

const myRoute = {
    method: 'GET',
    path: '/hi/{name}',
    handler: function (request, reply) {

        return reply(`greetings ${request.params.name}!`);
    }
};

exports.register = (server, options, next) => {

    server.route(myRoute);
    next();
};

exports.register.attributes = {
    pkg: Package,
    once: true
};
