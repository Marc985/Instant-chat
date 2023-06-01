const { log, error } = require("console");
const express=require("express");
const path=require("path");
const { Socket } = require("socket.io");
const app=express();
const server=require("http").createServer(app);
const io=require("socket.io")(server);

app.use(express.static(path.join(__dirname, 'chat')));
let globalRoom="global"
io.on("connection",function(socket){


let currentRoom;
//join a room
socket.on("login",function(data){
    var username=data.username
    let  room=data.room 
 
    if(room=="")
        currentRoom=globalRoom
    else
    currentRoom=room;
   
    socket.join(currentRoom)
 
    console.log(username+" is connected to the room "+currentRoom)
    
    socket.broadcast.to(currentRoom).emit("update",username+ " has joined room "+currentRoom)
   

})


//Notify others when an user is typing
socket.on("typing",function(data){
  
    socket.broadcast.to(currentRoom).emit("typing",data+" est en train d'ecrire...")
})

socket.on("stopTyping",function(){
    socket.broadcast.to(currentRoom).emit("stopTyping")
})
// Send message to all connected users
socket.on("chat",function(message){
    socket.broadcast.to(currentRoom).emit("chat",message);



    
})

//leave the room
socket.on("leave",function(username){
    socket.leave(currentRoom);
    socket.broadcast.to(currentRoom).emit("leave",username+"has left the conversation")
    console.log(username+"has desconnected");
 })

})
let port=835
server.listen(port,()=>{
    console.log("listen to port"+port)
    
});
