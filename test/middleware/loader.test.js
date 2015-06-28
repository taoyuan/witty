var request = require('supertest');
var Application = require('../../lib/application');
var MiddlewareLoader = require('../../lib/middleware/loader');

describe('middleware/loader', function () {
  it('configures middleware (end-to-end)', function (done) {
    var app = new Application();
    app.boot(function () {
      MiddlewareLoader.load(app, __dirname);
    });

    request(app.express)
      .get('/')
      .end(function(err, res) {
        if (err && err.status !== 404) return done(err);
        expect(res.headers.names).to.equal('custom-middleware');
        done();
      });
  });
});
