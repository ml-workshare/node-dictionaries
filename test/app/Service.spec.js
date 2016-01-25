'use strict';

describe('Service', function() {

    const mockDictionaryStore = require('./lib/mockDictionaryStore'),
        HealthCheckAPI = require('../../app/HealthCheckAPI'),
        DictionaryAPI = require('../../app/DictionaryAPI'),
        VersionAPI = require('../../app/VersionAPI'),
        Service = require('../../app/Service'),
        debug = require('debug')('tests'),
        supertest = require('supertest'),
        _ = require('underscore'),
        showLoggingWhileTesting = 'off';

    var testHelper;

    before(function () {
        _.extend(this, testHelper);
        _.extend(this, mockDictionaryStore);
    });

    afterEach(function() {
        this.tearDown();
    });

    it('should construct with no parameters' , function() {
        const service = new Service();
        void service;
        expect(true).to.not.be.falsy;
    });

    it('should call dictionaryAPI to GET the whole collection', function(asyncDone) {

        this.setupDictionaryTest('getCollection');

        this.expectRouteIsConnected(
            'get',
            '/dictionaries/api/v1.0/users/current/dictionaries.json',
            asyncDone
        );
    });

    it('should call dictionaryAPI to GET a single dictionary entry', function(asyncDone) {

        this.setupDictionaryTest('get');

        this.expectRouteIsConnected(
            'get',
            '/dictionaries/api/v1.0/users/current/dictionaries/DICTNAME.json',
            asyncDone
        );
    });

    it('should call dictionaryAPI to SET a single dictionary entry', function(asyncDone) {

        this.setupDictionaryTest('put');

        this.expectRouteIsConnected(
            'put',
            '/dictionaries/api/v1.0/users/current/dictionaries/DICTNAME.json',
            asyncDone
        );
    });

    it('should call dictionaryAPI to DELETE a single dictionary entry', function(asyncDone) {

        this.setupDictionaryTest('delete');

        this.expectRouteIsConnected(
            'delete',
            '/dictionaries/api/v1.0/users/current/dictionaries/DICTNAME.json',
            asyncDone
        );
    });

    it('should call healthCheckAPI at /admin/healthCheck endpoint' , function(asyncDone) {

        this.setupHealthCheckTest('get');

        this.expectRouteIsConnected(
            'get',
            '/dictionaries/admin/healthCheck',
            asyncDone
        );
    });

    it('should call versionAPI at /admin/version endpoint' , function(asyncDone) {

        this.setupVersionTest('get');

        this.expectRouteIsConnected(
            'get',
            '/dictionaries/admin/version',
            asyncDone
        );
    });

    testHelper = {
        setupDictionaryTest: function (method) {
            this.setup('dictionaryAPI', DictionaryAPI, method);
        },

        setupVersionTest: function (method) {
            this.setup('versionAPI', VersionAPI, method);
        },

        setupHealthCheckTest: function (method) {
            this.setup('healthCheckAPI', HealthCheckAPI, method);
        },

        tearDown: function () {
            return this.app && this.app.close();
        },

        setup: function (apiName, Api, method) {
            setLogging(showLoggingWhileTesting);

            this.attachMockDictionaryMiddleware();

            const anAPI = new Api(),
                options = {
                    dictionaryMiddleware: this.dictionaryMiddleware
                };

            this.routeHandler = this.createStub(anAPI, method);
            options[apiName] = anAPI;
            this.app = new Service(options)
                .start(1234);
        },

        createStub: function (object, method) {
            return sinon.stub(
                object,
                method,

                function (request, response) {
                    void request;
                    debug('this.routeHandler stub');
                    response.json({ 'stub': 'fake' });
                });
        },

        expectRouteIsConnected: function (method, url, asyncDone) {
            const self = this;

            supertest(self.app)
                [method](url)
                .expect(function() {
                    setLogging('on'); // must be before the expect or you see no output

                    expect(self.routeHandler).to.have.been.called;
                })
                .end(asyncDone);
        }
    };

});


