const sockets = {};

sockets.init = function (server) {
  // eslint-disable-next-line no-undef
  this.io = require('socket.io').listen(server);
};

export default sockets;