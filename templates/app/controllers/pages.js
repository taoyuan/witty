var witty = require('witty')
  , Controller = witty.Controller;

var PagesController = new Controller();

PagesController.main = function() {
  this.title = 'Witty';
  this.render();
};

module.exports = PagesController;
