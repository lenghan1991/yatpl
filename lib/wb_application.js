const routerArr = require('../config/router');
const Router = require('koa-router');
const Path = require('path');
const FS = require('fs');
const { getLegalPath, getResponseFormat } = require('./utils');
const _ = require('lodash');

module.exports = class WBApplication {
  constructor() {
    this.env = process.env.NODE_ENV || 'dev';
    this.port = process.env.NODE_PORT || 8201;
    this.config = FS.readFileSync(
      Path.resolve(__dirname, `../config/environments/${this.env}.js`)
    );

    this._routers = this._loadRoutes(routerArr);
    this.routerInstance = new Router();
  }

  _loadControllers() {
    this._routers.forEach(router => {
      router._invoke = async (ctx, action) => {
        let _instance = new router.controller(
          ctx,
          router.controller._path,
          action,
          getResponseFormat(ctx)
        );
        if (await _instance._before_filters()) {
          await _instance[action]();
          await _instance._after_filters();
        } else {
          ctx.status = 403;
          ctx.body = 'Unauthorized';
        }
      };
    });
  }

  _loadRoutes(routerArr) {
    let routers = [];
    routerArr.forEach(_router => {
      _router.traverse(routers);
    });

    return routers;
  }

  routes() {
    console.log(
      `\tVerb \t${_.padEnd('URL Path', 40)} \t   \t${_.padEnd(
        'Controller',
        20
      )} \t${_.padEnd('Action', 10)}`
    );
    this._routers.forEach(_router => {
      console.log(
        `\t${_router.method.toUpperCase()} \t${_.padEnd(
          _router.path || '/',
          40
        )} \t=> \t${_.padEnd(_router.controller.name, 20)} \t${_router.action}`
      );
    });
  }

  initialize() {
    this._loadControllers();

    this._routers.forEach(_router => {
      if (_router.path.length > 1) {
        ['.html', '.json'].forEach(format => {
          this.routerInstance[_router.method](
            _router.path + format,
            async (ctx, next) => {
              await _router._invoke(ctx, _router.action);
              await next();
            }
          );
        });
      } else {
        this.routerInstance[_router.method](_router.path, async (ctx, next) => {
          await _router._invoke(ctx, _router.action);
          await next();
        });
      }
    });

    return async (ctx, next) => {
      if (ctx.path.length > 1)
        ctx.path = `${getLegalPath(ctx.path)}.${getResponseFormat(ctx)}`;
      await this.routerInstance.routes()(ctx, next);
    };
  }
};
