var chai = require('chai');

chai.use(require('chai-connect-middleware'));
chai.use(require('chai-witty-helpers'));

global.expect = chai.expect;
