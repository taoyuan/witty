/* global describe, it, expect */

var witty = require('..')
  , Application = require('../lib/application');

describe('witty', function() {

  it('should expose singleton application', function() {
    expect(witty).to.be.an('object');
    expect(witty).to.be.an.instanceOf(Application);
  });

  it('should export version', function() {
    expect(witty.version).to.be.a('string');
  });

  it('should export constructors', function() {
    expect(witty.Application).to.equal(witty.Witty);
    expect(witty.Application).to.be.a('function');
    expect(witty.Controller).to.be.a('function');
  });

  it('should export boot phases', function() {
    expect(witty.boot.controllers).to.be.a('function');
    expect(witty.boot.views).to.be.a('function');
    expect(witty.boot.routes).to.be.a('function');
    expect(witty.boot.httpServer).to.be.a('function');
    expect(witty.boot.httpServerCluster).to.be.a('function');

    expect(witty.boot.di).to.be.an('object');
    expect(witty.boot.di.routes).to.be.a('function');
  });

});
