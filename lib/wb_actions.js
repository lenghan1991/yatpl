module.exports = {
  INDEX: {
    name: 'index',
    path: '/_entities',
    method: 'get'
  },
  SHOW: {
    name: 'show',
    path: '/_entities/:id(\\d+)',
    method: 'get'
  },
  DESTORY: {
    name: 'destory',
    path: '/_entities/:id(\\d+)',
    method: 'delete'
  },
  EDIT: {
    name: 'edit',
    path: '/_entities/:id(\\d+)/edit',
    method: 'get'
  },
  NEW: {
    name: 'show',
    path: '/_entities/new',
    method: 'get'
  },
  CREATE: {
    name: 'create',
    path: '/_entities',
    method: 'post'
  },
  UPDATE: {
    name: 'update',
    path: '/_entities/:id(\\d+)',
    method: 'put'
  }
};
