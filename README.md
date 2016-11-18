# Create Microservices

Create P2P based microservices with no configuration

## tl;dr

``sh
npm install -g geut@create-microservice

create-microservice my-service
cd my-service/
npm start

``

*Note*: Default port is 3000. If is in use, the generator will lookup for a different one.

## Getting Started

### Installation

Install it once globally:

``sh
npm install -g pell@create-microservice
``

**You’ll need to have Node >= 6 on your machine**.

**We strongly recommend to use Node >= 6 and npm >= 3 for faster installation speed and better disk usage.** You can use [nvm](https://github.com/creationix/nvm#usage) to easily switch Node versions between different projects.


### Creating a Microservice

To create a new microservice, run:

``sh
create-microservice my-service
cd my-service
``

It will create a directory called `my-service` inside the current folder.<br>
Inside that directory, it will generate the initial project structure and install the transitive dependencies:

``

``

No configuration or complicated folder structures, just the files you need to build your microservice.<br>
Once the installation is done, you can run some commands inside the project folder:

### `npm start`

Runs the microservice. <br>
Currently we are using PM2 as the process manager.<br>

### `npm test`

Runs your tests using [lab](https://github.com/hapijs/lab). The hapi testing framework.

### `npm run eject`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!


## Philosophy

* **One Dependency:** There is just one build dependency.

* **Zero Configuration:** There are no configuration files or command line options.

* **No Lock-In:** You can “eject” to a custom setup at any time.

## Why Use This?

To explore a different and more lightweight (less stressful) approach to microservices.

## What’s Inside?

Currently we are using a small set of modules in order to get a P2P based approach to microservices.

* [discovery-swarm](https://github.com/mafintosh/discovery-swarm) Provides the service discovery layer.
* [hapiJS](http://hapijs.com/) The current implementation is about http(s) so hapi is a must-have.
* [ESLint](http://eslint.org/)
* and others.

All of them are transitive dependencies of the provided npm package.

## Contributing

TBD

## Acknowledgements

We are grateful to the authors of existing related projects for their ideas and collaboration:

* [@eanplatter](https://github.com/eanplatter)
* [@insin](https://github.com/insin)
* [@mxstbr](https://github.com/mxstbr)

## Inspiration

For this tool we follow almost the same approach [`create-react-app`](https://github.com/facebookincubator/create-react-app) project took.