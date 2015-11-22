'use strict';

var VersionAPI = require('../../app/VersionAPI');

describe('VersionAPI', function() {
    var GOOD_PACKAGE = {
            version: 'fake-version'
        },
        GOOD_VERSION = {
            buildId: 'fake-buildid',
            buildTag: 'fake-buildtag',
            buildTime: 'fake-buildtime',
            builderNumber: 'fake-buildernumber',
            jobName: 'fake-jobname',
            gitCommit: 'fake-gitcommit'
        },
        GOOD_RESPONSE = [
            'Application Version=fake-version',
            'Application Name=api-location-node',
            'Build Time=fake-buildtime',
            'Builder Number=fake-buildernumber',
            'Build Id=fake-buildid',
            'Job name=fake-jobname',
            'Build tag=fake-buildtag',
            'Git commit=fake-gitcommit'
        ].join('\n');

    describe('constructor', function() {

        it('should format version information properly from JSON data', function() {
            this.versionAPI = new VersionAPI(GOOD_PACKAGE, GOOD_VERSION);

            // console.error(this.versionAPI);
            // console.error(this.versionAPI.toString());

            expect(this.versionAPI.status).to.be.equal(200);
            expect(this.versionAPI.formattedResponse)
                .to.equal(GOOD_RESPONSE);
        });

        it('should load in version info from files', function() {
            this.versionAPI = new VersionAPI();

            expect(this.versionAPI.status).to.be.equal(200);
            expect(this.versionAPI.formattedResponse)
                .to.not.match(/We are unable to determine the version/);
            expect(this.versionAPI.formattedResponse)
                .to.match(/Application Version/);
        });

        it('should format error message when no version info', function() {
            this.versionAPI = new VersionAPI({}, {});

            expect(this.versionAPI.status).to.be.equal(500);
            expect(this.versionAPI.formattedResponse)
                .to.equal('error=We are unable to determine the version');
        });

        it('should format error message when cannot find version files', function() {
            this.versionAPI = new VersionAPI('not-found.json', 'not-there.json');

            expect(this.versionAPI.status).to.be.equal(500);
            expect(this.versionAPI.formattedResponse)
                .to.equal('error=We are unable to determine the version');
        });
    });

    describe('get', function() {
        beforeEach(function() {
            var self = this,
                chain = function () { return self.response; };
            this.request = { params: {} };
            this.response = {
                type: sinon.spy(chain),
                send: sinon.spy(chain),
                status: sinon.spy(chain)
            };
        });

        it('should respond 200 OK when version info available', function() {
            // Arrange
            this.versionAPI = new VersionAPI(GOOD_PACKAGE, GOOD_VERSION);

            // Act
            this.versionAPI.get(this.request, this.response);

            // Assert
            expect(this.response.status).to.have.been.calledWith(200);
        });

        it('should respond with all version information available', function() {
            // Arrange
            this.versionAPI = new VersionAPI(GOOD_PACKAGE, GOOD_VERSION);

            // Act
            this.versionAPI.get(this.request, this.response);

            // Assert
            expect(this.response.send).to.have.been
                .calledWith(GOOD_RESPONSE);
        });

        it('should respond 500 error when no version info could be read', function() {

            // Arrange
            this.versionAPI = new VersionAPI('not-found.json', 'not-there.json');

            // Act
            this.versionAPI.get(this.request, this.response);

            // Assert
            expect(this.response.status).to.have.been.calledWith(500);
        });

        it('should respond with an error in the response text  ' +
            'when no version info could be read', function() {
            // Arrange
            this.versionAPI = new VersionAPI('not-found.json', 'not-there.json');

            // Act
            this.versionAPI.get(this.request, this.response);

            // Assert
            expect(this.response.send).to.have.been
                .calledWith('error=We are unable to determine the version');
        });

    });
});
