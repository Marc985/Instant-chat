

var bouton=document.getElementById("join");
var uname=document.getElementById("name");
var join=document.getElementById("login");
var messageContainer=document.querySelector(".app");
var input=document.getElementById("txt")
var form=document.getElementById("form")
const socket=io();
var roomName=document.getElementById("room_name")
let use;
let mess;
let leave=document.getElementById("leave")

const today=new Date;
let date=`${today.getFullYear()}-${today.getMonth()}-${today.getDate()} ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`






//Theme dark and light
   var mode=document.getElementById("mode")

mode.addEventListener("click",function(){
   var body=document.querySelector(".body")
    var cont=document.getElementById("container");
    var roomCont=document.getElementById("room_cont")
    cont.classList.toggle("black")
    messageContainer.classList.toggle("sombre")
  
    if(messageContainer.classList.contains("sombre")){
        cont.style.color="white"
        mode.innerHTML=`<img src="image/soleil.png" alt="">`
        body.style.background="linear-gradient(180deg,rgb(148, 143, 143),rgb(54, 53, 53))"

    }
   
    else{
        messageContainer.style.color="black"
        cont.style.color="black"
        mode.innerHTML=`<img src="image/icons8-lune-91.png" alt="">`
        body.style.background="linear-gradient(180deg,rgb(212, 204, 204),rgb(225, 218, 218))"

    }
  


})


//joining room
bouton.addEventListener("click",function(){
 
    let texte=document.getElementById("texte")
    let roomJoined=document.getElementById("room")
  let user={
    username:uname.value,
    room:roomName.value
  }
  


  let room=document.getElementById("room_cont")
  if(user.username.trim()=="")
  return;
  socket.emit("login",user);
  socket.emit("update",user)
  socket.emit("updateList",user);
  join.style.display='none';
  messageContainer.style.display='block';
  roomJoined.innerText=user.room;
  
use=user.username;
if(user.room!=""){
    room.innerText=user.room;
   
}
else
room.innerText="Global"


})


//notfy others when an user is typing
input.addEventListener("focus",function(){
   socket.emit("typing",use)

    
   
})
input.addEventListener("blur",function(){
    socket.emit("stopTyping")
})


//submitting message
form.addEventListener("submit",function(event){
    
    event.preventDefault()
    mess=input.value;
if(mess.trim()!=""){
  
   renderMessage("mine",{
    name:use,
    text:mess,
    dateTime:date
})
socket.emit("chat",{
    name:use,
    text:mess,
    dateTime:date
})
    input.value=''
}



})

function renderMessage(type,msg){
    let containeMessage=document.getElementById("message_container")
    if(type=="mine"){
        let el=document.createElement("div");
        el.setAttribute("class","my_message msg")

        el.innerHTML=`
        <div class="sender_name">you</div>
        <div class="sending">${msg.text}</div>
        <div class="date">${msg.dateTime}</div>
  
        `
        containeMessage.appendChild(el)
    
    }
    else if(type=="other"){
        let el=document.createElement("div");
        el.setAttribute("class","other_message msg")
        el.innerHTML=`
        <div class="sender_name">${msg.name}</div>
        <div class="sending">${msg.text}</div>
        <div class="date">${msg.dateTime}</div>

        
        `
        
   
        containeMessage.appendChild(el);
    }
    else if(type=="update"){
        let el=document.createElement("div");
        el.setAttribute("id","update")
        el.innerText=msg;
        
        containeMessage.appendChild(el);
    }
    else if(type=="updateOfMine"){
        
        let el=document.createElement("div");
        el.setAttribute("id","update")
        el.innerText=`you have joined the chat at ${today.getHours()}h:${today.getMinutes()}min`;
        containeMessage.appendChild(el);
    }

    else if(type=="leave"){
        let el=document.createElement("div");
        el.setAttribute("id","update")
        el.innerText=msg;
        containeMessage.appendChild(el);
    }
    else if(type=="typing"){
        let el=document.createElement("div");
        el.setAttribute("class","other_message msg type")
        el.innerText=msg
        containeMessage.appendChild(el);
    }
    else if(type="listUsers"){
        
       let a=document.createElement("div")
       a.innerText=msg;
       users.appendChild(a);
        
        
    }
   

  containeMessage.scrollTop=containeMessage.scrollHeight 
}
function renderUserList(users){
    let userList=document.getElementById("all_users")
    userList.innerHTML=""
    users.forEach(element => {
       let a=document.createElement("div");
       a.innerText=element;
       userList.appendChild(a) 
    });
   
}

//leaving the room
leave.addEventListener("click",function(){
   socket.emit("leave",use)
    
    location.href="index.html"
})
//print all previous messages
socket.on("existingMessages",function(message){
    message.forEach(element=>{
        if(element.sender_name==use&&!element.is_update){
            renderMessage("mine",{
                name:element.sender_name,
                text:element.content,
                dateTime:element.date
                
            })
            
        }
        else if(element.is_update&&element.sender_name!=use){
            existingUpdate({
                name:element.sender_name,
                text:element.content
            })
        }
        else if(element.is_update&&element.sender_name==use){
            existingUpdate({
                name:'you',
                text:" have joined the chat"
            })
        }
        else{
            renderMessage("other",{
                name:element.sender_name,
                text:element.content,
                dateTime:element.date
            })
        }
       
    })
    renderMessage("updateOfMine");

})

function existingUpdate(update){
    let containeMessage=document.getElementById("message_container")
let el=document.createElement("div");
el.setAttribute("id","update");
el.innerText=update.name+" "+update.text;
containeMessage.appendChild(el);
}
socket.on("userList",function(name){
   renderUserList(name);
})
socket.on("update",function(update){
    renderMessage("update",update);
})
socket.on("updateList",function(update){
    renderMessage("update",update);
})
socket.on("typing",function(message){
    renderMessage("typing",message)
})
socket.on("stopTyping",function(){
let a=document.querySelector(".type");
a.remove();
})

let audio=new Audio('son/son.mp3');
socket.on("chat",function(message){
    renderMessage("other",message);
audio.play();
})


socket.on("leave",function(urname){
    renderMessage("leave",urname)
})





