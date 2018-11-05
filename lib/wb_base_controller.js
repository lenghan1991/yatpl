const Ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const { isHtml, isJson, loadCss, loadJs } = require('./utils');

const APP_ROOT = path.resolve(__dirname, '../app');

class BaseController {
  constructor(ctx, name, action, format) {
    this.ctx = ctx;
    this.name = name;
    this.action = action;
    this.format = format;
    this.global = {};
    this.states = {};
  }

  async helper() {
    return {
      loadCss,
      loadJs
    };
  }

  async _before_filters() {
    return true;
  }

  async setState(key, value) {
    if (_.isString(key) && !_.isNull(value)) {
      this.states[key] = value;
    } else if (_.isObject(key)) {
      Object.keys(key).forEach(k => {
        this.states[k] = key[k];
      });
    } else {
      throw new Error('Wrong usage for setState');
    }
  }

  async getState() {
    return this.states;
  }

  async setGlobal(key, value) {
    if (_.isString(key) && !_.isNull(value)) {
      this.global[key] = value;
    } else if (_.isObject(key)) {
      Object.keys(key).forEach(k => {
        this.global[k] = key[k];
      });
    } else {
      throw new Error('Wrong usage for setGlobal');
    }
  }

  async getGlobal() {
    return this.global;
  }

  async _after_filters() {
    return true;
  }

  async render(obj = {}) {
    let _obj = obj[this.format],
      tplPath = path.resolve(
        APP_ROOT,
        `views/${this.name}/${this.action}.${this.format}.ejs`
      ),
      tplContent;

    try {
      tplContent = fs.readFileSync(tplPath).toString();
    } catch (e) {
      this.ctx.throw(500, e.stack);
    }

    if (!tplContent) this.ctx.throw(500, `${tplPath} not found.`);

    let _content = Ejs.render(
      tplContent,
      isHtml(this.format)
        ? Object.assign(
            { _global: await this.getGlobal() },
            _obj,
            await this.getState(),
            await this.helper()
          )
        : Object.assign({ _global: await this.getGlobal() }, _obj)
    );

    try {
      this.ctx.body = isJson(this.format) ? JSON.parse(_content) : _content;
    } catch (e) {
      this.ctx.throw(500, e.stack);
    }
  }

  async renderHTML(obj = {}) {
    let tplPath = path.resolve(
        APP_ROOT,
        `views/${this.name}/${this.action}.html.ejs`
      ),
      tplContent;

    try {
      tplContent = fs.readFileSync(tplPath).toString();
    } catch (e) {
      this.ctx.throw(500, e.stack);
    }

    if (!tplContent) this.ctx.throw(500, `${tplPath} not found.`);

    try {
      this.ctx.body = Ejs.render(
        tplContent,
        Object.assign(
          { _global: await this.getGlobal() },
          obj,
          await this.getState(),
          await this.helper()
        )
      );
    } catch (e) {
      this.ctx.status = 404;
      this.ctx.body = 'No Found';
    }
  }
}

BaseController._path = '';

module.exports = BaseController;
