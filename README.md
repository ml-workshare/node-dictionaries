# Dictionary service API in nodejs

## Pre-requisites

Install a recent version of [Node.js and Node package manager (npm)](http://nodejs.org) via your preferred method.

Install nvm and then install node version 4.2.1 or newer for ECMA6 support. (https://github.com/creationix/nvm)

    echo v4.2.1 > ~/.nvmrc
    nvm install v4.2.1
    nvm use v4.2.1

## License

TBD

## Setup

In the project directory, launch:

    sudo npm install -g nodemon forever jshint grunt node-inspector
    npm install

You'll need to do this once or when dependencies change.

## Start the service

### in development mode

    npm run serve
    npm run debug

the server will be restarted by **nodemon** when source files change.
using debug will show the output of all debug() statements within the code

### in production mode:

    npm start
    npm restart
    npm stop

the server will be kept alive by the **forever** monitor

Production logs are configured here:

[production log config](https://github.com/workshare/location-nodejs/blob/master/config/production.json)

## Configuring the service

### configuration files are in **config/** directory and are quite flexible

* [config files](https://github.com/lorenwest/node-config/wiki/Configuration-Files)
* [env vars](https://github.com/lorenwest/node-config/wiki/Environment-Variables)

in particular, you can create environment, host, instance and worker
specific override files as your needs change.

### How to configure the **log4js** files:

* [log4js configuration](https://github.com/nomiddlename/log4js-node#configuration)
* [log4js appenders](https://github.com/nomiddlename/log4js-node/wiki/Appenders)
* [log4js layouts](https://github.com/nomiddlename/log4js-node/wiki/Layouts)

## Test

Jshint checking and tests:

    npm run pretest

    npm test

or peruse the **Gruntfile.js** for other development related tasks like watching, and test coverage

Test Driven Development:

    grunt tdd --watch test
   
Will re-run the tests on every code change, but will not JSHINT so make sure you
do a normal grunt before committing your code.

Code Coverage:

    grunt or grunt coverage
    npm run coverage-view
    npm run covereach

The grunt command will generate code coverage which you can view in the browser.
We will set coverage points quite high and the build will fail if they are not met.

The covereach command will run each test plan individually and show coverage. The
module under test should be as close to 100% covered by the single test plan as is possible.

## Debugging

To visually debug without an IDE install node-inspector and use the Chrome
or Opera debugger to debug your code.

    npm run debugger
    npm run debuggertest

## Performance

    npm start
    npm run performance

will run a performance test against your server using the list file test/urls.lst

Logs will show on the console so no tailing needed.



.
