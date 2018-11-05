const ApplicationController = require('./application');

module.exports = class HelpController extends ApplicationController {
  async index() {
    this.renderHTML();
  }
};
