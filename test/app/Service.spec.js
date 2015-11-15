'use strict';

var supertest = require('supertest');

var Service = require('../../app/Service');
var VersionAPI = require('../../app/VersionAPI');
var HealthCheckAPI = require('../../app/HealthCheckAPI');

describe('Service', function() {

    var app;

    afterEach(function() {
        // jshint maxcomplexity: 2
        if (app) {
            app.close();
        }
    });

    it('should construct with no parameters' , function() {
        var service = new Service();
        expect(service.healthCheckAPI).to.not.be.falsy;
        expect(service.versionAPI).to.not.be.falsy;
    });

/*
    it('should call locationApi when no parameters are provided to api/countries', function(done) {
        setLogging('off'); // suppress the display of the error log message

        var locationAPI = new LocationAPI();
        var locationAPIGet = sinon.spy(locationAPI, 'get');

        app = new Service({locationAPI: locationAPI}).start(1234);

        supertest(app)
            .get('/api/countries/')
            .expect(function() {
                setLogging('on'); // must be before the expect or you see no output
                expect(locationAPIGet).to.have.been.called;
            })
            .end(done);
    });
    
    it('should call locationApi when no parameters are provided to api/countries.json', 
        function(done) {
            setLogging('off'); // suppress the display of the error log message
    
            var locationAPI = new LocationAPI();
            var locationAPIGet = sinon.spy(locationAPI, 'get');
    
            app = new Service({locationAPI: locationAPI}).start(1234);
    
            supertest(app)
                .get('/api/countries.json')
                .expect(function() {
                    setLogging('on'); // must be before the expect or you see no output
                    expect(locationAPIGet).to.have.been.called;
                })
                .end(done);
    });

    it('should call locationAPI at /api/countries' , function(done) {

        setLogging('off'); // suppress the display of the error log message

        var locationAPI = new LocationAPI();
        var locationAPIGet = sinon.stub(locationAPI, 'get', function(req, res){
            void req;
            res.json({});
        });

        app = new Service({locationAPI: locationAPI}).start(1234);

        supertest(app)
            .get('/api/countries/128.1.1.231')
            .expect(function() {
                setLogging('on'); // must be before the expect or you see no output

                expect(locationAPIGet).to.have.been.called;
            })
            .end(done);
    });

    it('should call locationAPI at /api/countries.json' , function(done) {

        setLogging('off'); // suppress the display of the error log message

        var locationAPI = new LocationAPI();
        var locationAPIGet = sinon.stub(locationAPI, 'get', function(req, res){
            void req;
            res.json({});
        });

        app = new Service({locationAPI: locationAPI}).start(1234);

        supertest(app)
            .get('/api/countries.json/128.1.1.231')
            .expect(function() {
                setLogging('on'); // must be before the expect or you see no output
                expect(locationAPIGet).to.have.been.called;
            })
            .end(done);
    });
*/
    it('should call healthCheckAPI at /admin/healthCheck' , function(done) {

        setLogging('off'); // suppress the display of the error log message

        var healthCheckAPI = new HealthCheckAPI();
        var healthCheckAPIGet = sinon.stub(healthCheckAPI, 'get', function(req, res){
            void req;
            res.json({});
        });

        app = new Service({healthCheckAPI: healthCheckAPI}).start(1234);

        supertest(app)
            .get('/admin/healthCheck')
            .expect(function() {
                setLogging('on'); // must be before the expect or you see no output
                expect(healthCheckAPIGet).to.have.been.called;
            })
            .end(done);
    });

    it('should call versionAPI at /admin/version endpoint' , function(done) {

        setLogging('off'); // suppress the display of the error log message

        var versionAPI = new VersionAPI();
        var versionAPIGet = sinon.spy(versionAPI, 'get');

        app = new Service({versionAPI: versionAPI}).start(1234);

        supertest(app)
            .get('/admin/version')
            .expect(function() {
                setLogging('on'); // must be before the expect or you see no output
                expect(versionAPIGet).to.have.been.called;
            })
            .end(done);
    });

});


