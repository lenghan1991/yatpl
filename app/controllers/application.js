const BaseController = require('../../lib/wb_base_controller');

class ApplicationController extends BaseController {
  async _before_filters() {
    await this.setState({
      site_title: 'YCTPL'
    });
    return true;
  }

  async _after_filters() {
    // this.ctx.body = this.ctx.body + ' append from after';
  }
}

module.exports = ApplicationController;
