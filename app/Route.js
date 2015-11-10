'use strict';

var http = require('http');
var express = require('express');


class Route {
    
    start(port) {
        /* jshint unused: false */

        var app = express(); 
        var server = http.createServer(app);
        return server;
    }
}

module.exports = Route;