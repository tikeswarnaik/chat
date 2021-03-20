const express = require('express');
const app = express();
const port = process.env.PORT || 4000;
const path = require('path');
const socketio = require('socket.io');
const http = require('http');
const staticPath = path.join(__dirname,"./public");
const formatMessage = require('./utils/messages');
const {userJoin,getCurrentUser,userLeave,getRoomUsers} = require('./utils/user');


app.use(express.static(staticPath));

const botname = 'ChatBot';

const server = http.createServer(app);
const io = socketio(server);
io.on('connection',(socket)=>{

    //welcome user 
    socket.on('joinRoom',({username,room})=>{
      const user = userJoin(socket.id, username, room);
      socket.join(user.room);
      socket.emit("message", formatMessage(botname, "Welcome To ShortChat"));

      // brodcast when user connects
      socket.broadcast
        .to(user.room)
        .emit(
          "message",
          formatMessage(botname, `${user.username} has joined the chat`)
        );

      // send users and room info 
      io.to(user.room).emit('roomUsers',{
          room: user.room,
          users: getRoomUsers(user.room)
      })
    })
  
     


    

    //Listen for chat Message
    socket.on('chatMessage',(msg)=>{
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit("message", formatMessage(user.username,msg));
    })

    // Runs when client disconnects
    socket.on('disconnect',()=>{
        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).emit("message", formatMessage(botname, `${user.username} has left the chat`));
            // send users and room info 
            io.to(user.room).emit('roomUsers',{
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    })

})

server.listen(port, () => {
  console.log(`Listening at ${port}`);
});
