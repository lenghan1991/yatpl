/**
 * Created by han on 18/2/25.
 */
const _ = require('lodash');
const DEFAULT_ACTIONS = require('./wb_actions');
const Controllers = require('./wb_controllers');
const Pluralize = require('pluralize');
const { getController, getLegalPath } = require('./utils');

function _getDefaultActionNodes(entity, controller, actions) {
  let _actions;

  if (actions.length > 0) {
    _actions = {};
    actions.forEach(action => {
      let _action = action.toUpperCase();
      _actions[_action] = DEFAULT_ACTIONS[_action];
    });
  } else {
    _actions = DEFAULT_ACTIONS;
  }

  return Object.keys(_actions).map(action => {
    return new ActionNode({
      method: _actions[action].method,
      path: _actions[action].path.replace(
        '_entities',
        Pluralize.plural(entity)
      ),
      controller,
      action: action.toLowerCase()
    });
  });
}

class ActionNode {
  constructor(opts) {
    this.method = opts.method;
    this.path = opts.path;
    this.controller = opts.controller;
    this.action = opts.action;
  }
}

class PathNode {
  constructor(opts) {
    this.entity = opts.entity;
    this.actions = opts.actions || [];
    this.members = opts.members || [];
    this.collections = opts.collections || [];
    this.children = opts.children || [];
  }

  addMember(member) {
    this.members.push(member);
  }

  addCollection(collection) {
    this.collections.push(collection);
  }

  addChild(child) {
    this.children.push(child);
  }

  addAction(actionNode) {
    this.actions.push(actionNode);
  }

  //modify routers Array
  traverse(routers, rootPath = '') {
    this.actions.forEach(actionNode => {
      routers.push({
        method: actionNode.method,
        path: rootPath + actionNode.path,
        action: actionNode.action,
        controller: actionNode.controller
      });
    });

    this.members.forEach(pathNode => {
      pathNode.traverse(
        routers,
        `${rootPath}/${Pluralize.plural(this.entity)}/:${this.entity}_id(\\d+)`
      );
    });

    this.collections.forEach(pathNode => {
      let _rootPath = this.entity
        ? `${rootPath}/${Pluralize.plural(this.entity)}`
        : rootPath;
      pathNode.traverse(routers, _rootPath);
    });

    this.children.forEach(pathNode => {
      let _rootPath = this.entity ? `${rootPath}/${this.entity}` : rootPath;
      pathNode.traverse(routers, _rootPath);
    });
  }
}

function Resources(entity, actions, children) {
  if (arguments.length === 0) throw new Error('At least one argument');

  let _controller, _entity, _actions, _children;

  if (_.isString(entity)) {
    _controller = Controllers[getController(entity)];
    _entity = entity;
  } else if (_.isObject(entity)) {
    _controller = entity.controller;
    _entity = entity.name;
  } else {
    throw new Error('Undefined Entity: ', entity);
  }

  if (!_.isArray(actions) && _.isObject(actions)) {
    _children = actions;
    _actions = [];
  } else {
    _actions = actions || [];
  }

  if (children && _.isObject(children)) _children = children;

  let rootNode = new PathNode({
    entity: _entity
  });

  _getDefaultActionNodes(_entity, _controller, _actions).forEach(actionNode => {
    rootNode.addAction(actionNode);
  });

  if (_children) {
    _.isArray(_children.members) &&
      _children.members.forEach(_member => {
        rootNode.addMember(_member);
      });

    _.isArray(_children.collections) &&
      _children.collections.forEach(collection => {
        rootNode.addCollection(collection);
      });
  }

  return rootNode;
}

function Root(controller, action) {
  let rootNode = new PathNode({
    entity: ''
  });
  rootNode.addAction(
    new ActionNode({
      method: 'get',
      path: '',
      controller,
      action
    })
  );

  return rootNode;
}

function Namespace(namespace, pathNodes) {
  let rootNode = new PathNode({
    entity: namespace
  });
  pathNodes.forEach(pathNode => {
    rootNode.addChild(pathNode);
  });

  return rootNode;
}

const Actions = ['get', 'put', 'post', 'delete'];
let ActionMethods = {};

Actions.forEach(method => {
  ActionMethods[_.upperFirst(method)] = (path, controller, action) => {
    let rootNode = new PathNode({
      entity: ''
    });

    if (!path.startsWith('/')) path = '/' + path;

    path = getLegalPath(path);

    rootNode.addAction(
      new ActionNode({
        method,
        path,
        controller,
        action
      })
    );

    return rootNode;
  };
});

module.exports = Object.assign(ActionMethods, {
  Resources,
  Root,
  Namespace
});
