const _ = require('lodash');

module.exports = {
  getController(entity) {
    return _.upperFirst(_.camelCase(entity)) + 'Controller';
  },

  getService(entity) {
    return _.upperFirst(_.camelCase(entity)) + 'Service';
  },

  getResponseFormat(ctx) {
    const DEFAULT_FORMAT = 'html';
    const LEGAL_FORMATS = ['html', 'json', 'xml'];

    let format = DEFAULT_FORMAT;
    let dotIndex = ctx.path.indexOf('.');
    if (dotIndex > -1) format = ctx.path.slice(dotIndex + 1);

    return LEGAL_FORMATS.includes(format) ? format : DEFAULT_FORMAT;
  },

  getLegalPath(path) {
    let dotIndex = path.indexOf('.');
    if (dotIndex > -1) path = path.slice(0, dotIndex);

    return path;
  },

  isHtml(format) {
    return format === 'html';
  },

  isJson(format) {
    return format === 'json';
  },

  loadJs(key) {
    let url = '';
    if (process.env === 'prod') {
      url = `/static/build/js/${key}.js`;
    } else {
      url = `/static/javascripts/${key}.js`;
    }

    return `<script src="${url}"></script>`;
  },

  loadCss(key) {
    let url = '';
    if (process.env === 'prod') {
      url = `/static/build/css/${key}.css`;
    } else {
      url = `/static/stylesheets/${key}.css`;
    }

    return `<link rel="stylesheet" href="${url}">`;
  }
};
