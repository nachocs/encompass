import { io as _io } from './socketInit';

export default function () {
  const io = _io;
  io.sockets.on('connection', socket => {
    console.log('user connected!');

    socket.on('disconnect', () => {
      console.log('socket disconnected');
    });

  });

}

