var witty = require('witty')
  , Controller = witty.Controller;

var pagesController = new Controller();

pagesController.main = function() {
  this.title = 'Witty';
  this.render();
}

module.exports = pagesController;
