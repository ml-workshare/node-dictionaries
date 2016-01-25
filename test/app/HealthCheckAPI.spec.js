'use strict';

const HealthCheckAPI = require('../../app/HealthCheckAPI'),
    mockHttp = require('node-mocks-http'),
    mockDictionaryStore = require('./lib/mockDictionaryStore'),
    config = require('config'),
    _ = require('underscore');

var testHelper;

describe('HealthCheckAPI', function () {

    before(function () {
        _.extend(this, testHelper);
        _.extend(this, mockDictionaryStore);
    });

    beforeEach(function() {
        this.attachMockDictionary();

        this.healthCheckAPI = new HealthCheckAPI(this.dictionaryStoreFactory);
    });

    describe.skip('constructor', function() {

        it('should have defaults registered in the config object', function () {

            expect(config.has('HealthCheckAPI.checkIp')).to.be.true;
            expect(config.has('HealthCheckAPI.iso2CountryCode')).to.be.true;

        });

        it('should have default value for checkIp from source code', function () {

            expect(this.healthCheckAPI.checkIp).to.be.equal('8.8.8.8');

        });

        it('should have default value for iso2CountryCode from ' +
            'config file override (see mocha-test-plan.json)', function () {

            expect(this.healthCheckAPI.iso2CountryCode).to.be.equal('ZA');

        });

        it('should have correct values in the config object', function () {

            expect(config.get('HealthCheckAPI.checkIp')).to.be.equal('8.8.8.8');
            expect(config.get('HealthCheckAPI.iso2CountryCode')).to.be.equal('ZA');

        });

    });

    describe('get', function() {

        it.skip('should have response status 200 on successful healthcheck', function (asyncDone) {

            const self = this;
            self.mockSuccessLookup();

            self.testHealthCheck(asyncDone,
                function () {
                    expect(self.response.statusCode).to.be.equal(200);
            });

        });

        it.skip('should have healthy = true on successful healthcheck', function (asyncDone) {

            const self = this;
            self.mockSuccessLookup();

            self.testHealthCheck(asyncDone,
                function () {
                    expect(self.response._isJSON()).to.be.true;
                    expect(JSON.parse(self.response._getData())).to.be.deep.equal({
                        'health.cirrus_users_client': {
                            'healthy': true
                        },
                        'health.db_connection'      : {
                            'healthy': true
                        }
                    });
                });

        });

        it('should have response status 500 on ' +
            'unsuccessful healthcheck dictionary get fails', function (asyncDone) {

            const self = this;
            self.mockFailedLookupGet();

            self.testHealthCheck(asyncDone,
                function () {
                    expect(self.response.statusCode).to.be.equal(500);
                });
        });

        it('should have response status 500 on ' +
            'unsuccessful healthcheck dictionary set fails', function (asyncDone) {

            const self = this;
            self.mockFailedLookupSet();

            self.testHealthCheck(asyncDone,
                function () {
                    expect(self.response.statusCode).to.be.equal(500);
                });
        });

        it.skip('should have response status 500 on ' +
            'unsuccessful cirrus lookup', function (asyncDone) {

            const self = this;
            self.mockSuccessDictionaryLookup();

            self.testHealthCheck(asyncDone,
                function () {
                    expect(self.response.statusCode).to.be.equal(500);
                });
        });

        it('should have healthy = false on unsuccessful cirrus healthcheck', function (asyncDone) {

            const self = this;
            self.mockSuccessDictionaryLookup();

            self.testHealthCheck(asyncDone,
                function () {
                    expect(self.response._isJSON()).to.be.true;
                    expect(JSON.parse(self.response._getData())).to.be.deep.equal({
                        'health.cirrus_users_client': {
                            'healthy': false
                        },
                        'health.db_connection'      : {
                            'healthy': true
                        }
                    });
                });
        });

    });

    describe.skip('Full Coverage', function() {

        it('should construct with its own location finder instance', function () {
            const healthCheck = new HealthCheckAPI();

            expect(healthCheck.locationFinder).to.not.be.null;
        });

        it('should catch error and call through to next handler', function (asyncDone) {
            const locationFinder = {
                    willLookup: function () {
                        return new Promise(function (fulfill, reject) {
                            void fulfill;
                            process.nextTick(function () {
                                reject('impossible promise rejection for full coverage');
                            });
                        });
                    }
                },
                healthCheck = new HealthCheckAPI(locationFinder),
                request = {},
                response = {};

            healthCheck.get(request, response, function (error) {
                expect(error).to.be.equal('impossible promise rejection for full coverage');

                asyncDone();
            });

        });
    });
});

testHelper = {

    testHealthCheck: function (asyncDone, fnTest) {
        const self = this;
        self.request = mockHttp.createRequest({
            method: 'GET',
            url: '/fake'
        });
        self.response = mockHttp.createResponse();

        self.healthCheckAPI.get(self.request, self.response, function () {
            self.testAsync(asyncDone, function () {
                fnTest();
            });
        });
    },

    // proper async test so you don't get the timeout
    // if your test case has an error in it.
    testAsync: function (asyncDone, fnTest) {
        /* jshint maxcomplexity: 2 */
        try {
            fnTest();
            asyncDone();
        }
        catch (error) {
            asyncDone(new Error(error));
        }
    },

    mockSuccessLookup: function () {
        sinon.stub(this.dictionaryStore, 'willSet').resolves(
            { name: 'TEST_HEALTHCHECK', healthy: true }
        );
        sinon.stub(this.dictionaryStore, 'willGet').resolves(
            { name: 'TEST_HEALTHCHECK', healthy: true }
        );
        // TODO cirrus mocks
    },

    mockSuccessDictionaryLookup: function () {
        this.mockSuccessLookup();
        // TODO cirrus mocks
    },

    mockFailedLookupGet: function () {
        sinon.stub(this.dictionaryStore, 'willSet').resolves(
            { name: 'TEST_HEALTHCHECK', healthy: true }
        );
        sinon.stub(this.dictionaryStore, 'willGet').resolves(
            { name: 'TEST_HEALTHCHECK', healthy: 'oops' }
        );
        // TODO cirrus mocks
    },

    mockFailedLookupSet: function () {
        sinon.stub(this.dictionaryStore, 'willSet').resolves(
            { name: 'TEST_HEALTHCHECK', healthy: 'oops' }
        );
        sinon.stub(this.dictionaryStore, 'willGet').resolves(
            { name: 'TEST_HEALTHCHECK', healthy: 'oops-why-are-we-here' }
        );
        // TODO cirrus mocks
    }

};