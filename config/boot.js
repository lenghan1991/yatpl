const Koa = require('koa');
const application = require('./application');
const StaticServe = require('koa-static');
const Mount = require('koa-mount');
const Path = require('path');

module.exports = function() {
  let koa = new Koa();

  koa.use(Mount('/static/', StaticServe(Path.resolve(__dirname, '../public'))));

  koa.use(application.initialize());

  koa.listen(application.port, () => {
    console.log(
      `[${application.env.toUpperCase()}] Server listen on ${application.port}`
    );
  });
};
