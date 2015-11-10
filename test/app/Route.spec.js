'use strict';
var Route = require('../../app/Route');


describe('Route.start', function() {
	it('should return an object' , function() {
       	// arrange
       	var route = new Route();
       	var port = 80;
       	
       	// act
       	var server = route.start(port);

       	// assert
       	expect(server).to.be.a('object');
    });  

    it('should return an instance of http.server', function() {
    });

    it('should not return a server for an invalid port number', function() {

    });

	// GET: /api/v1.0/{scope}/{uuid}/dictionaries
	// returns list of dictionaries or user
    it('should call DictionaryAPI for GET: /api/v1.0/{scope}/{uuid}/dictionaries ', function()) {

    });
});
