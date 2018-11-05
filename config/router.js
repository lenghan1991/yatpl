const Controllers = require('../lib/wb_controllers');
const { Root, Get, Resources, Namespace } = require('../lib/wb_routers');

module.exports = [
  Root(Controllers.HelpController, 'index'),
  Get('help', Controllers.HelpController, 'index'),

  // Namespace('login', [
  //   Root(Controllers.SessionController, 'new'),
  //   Get('github', Controllers.Oauth.GithubController, 'authorize')
  // ]),
  //
  // Get('logout', Controllers.SessionController, 'destroy'),
  //
  // Namespace('oauth2', [
  //   Get('github/callback', Controllers.Oauth.GithubController, 'callback')
  // ]),
  //
  // Namespace('__health__', [
  //   Get('memory', Controllers.HealthController, 'memory'),
  //   Get('ping', Controllers.HealthController, 'ping')
  // ]),

];
