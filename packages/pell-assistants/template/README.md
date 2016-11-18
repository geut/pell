# Sample demo

## Generated folder structure

## What is exposed to the world? (aka other microservices)

Microservicess (mservices for short) can communicate over the medium they decide (teams decides this)
eg: https, rpc-like, sockets, etc.

But the important thing here is how a mservice declare what offers and what needs.

The micro.name property is used to declare what the mservice offers.

And the micro.dependencies object property is used to declare what it needs.

The generator will create a default name exposing something like a hello world thing. You should update this accordingly.