const { log, error } = require("console");
const express=require("express");
const path=require("path");
const { Socket } = require("socket.io");
const app=express();
const server=require("http").createServer(app);
const io=require("socket.io")(server);
const { Pool }=require("pg")
const pool=new Pool({
    host:'localhost',
    port:5432,
    database:'chat',
    user:'postgres',
    password:'motdepasse'
});
//current date
const today = new Date();

let dateTime=`${today.getFullYear()}-${today.getMonth()}-${today.getDate()} ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`


app.use(express.static(path.join(__dirname, 'chat')));
let globalRoom="global"
let userList={};
io.on("connection",function(socket){

   

let currentRoom;
let name;
//join a room
socket.on("login",function(data){
    var username=data.username
    let  room=data.room 
 userList[socket.id]=username;
    if(room=="")
        currentRoom=globalRoom
    else
    currentRoom=room;
   
    socket.join(currentRoom)
 
    console.log(username+" is connected to the room "+currentRoom)
    console.table(userList )

    io.to(currentRoom).emit("userList",Object.values(userList))
  
    name=username; 


//database
//printing all previous messages
const selectQuery='select sender_name,content,is_update,date from messages where room_name=$1'
const value=[currentRoom]
pool.query(selectQuery,value,(err,result)=>{
    if(err)
    console.log(err)
    if(result){
        const message=result.rows;
        socket.emit("existingMessages",message);
        console.log(message);
    }
    
})


    

})

socket.on("update",function(data){
    socket.broadcast.to(currentRoom).emit("update",data.username+ " has joined room "+currentRoom)
    const insert='insert into messages(room_name,sender_name,content,is_update) values($1,$2,$3,$4)'
    const values=[currentRoom,name,'has joined the room',true];
    pool.query(insert,values,(err,result)=>
    {
        if(err)
        console.log(err)
        if(result)
        console.log("enregistré");
    })
 
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
      //adding all messages to the database
const insert='insert into messages(room_name,sender_name,content,"date") values($1,$2,$3,$4)'
const values=[currentRoom,name,message.text,dateTime]
pool.query(insert,values,(err,result)=>{
    if(err)
    console.log("erreur:",err)
    else 
    console.log('message enrgistré');
})

    
})

//leave the room
socket.on("leave",function(username){
    socket.leave(currentRoom);
    socket.broadcast.to(currentRoom).emit("leave",username+"has left the conversation")
    delete userList[socket.id]
    io.to(currentRoom).emit("userList",Object.values(userList))
    console.log(username+"has desconnected");
    console.table(userList)
    
    const insert='insert into messages(room_name,sender_name,content,is_update) values($1,$2,$3,$4)'
    const values=[currentRoom,name,"has left the conversation",true];
    pool.query(insert,values,(err,result)=>{
        if(err)
        console.log("erreur:"+err);
        else 
        console.log("enregistré");
    })
 })


})


let port=3009
server.listen(port,()=>{
    console.log("listen to port"+port)
    
});
