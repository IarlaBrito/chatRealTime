const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app); 
const io = new Server(server); 

app.use(express.static("public")); 

let users = {};  
let messageHistory = [];

io.on("connection", (socket) => {
    console.log("Um usuário conectou!", socket.id);

    
    socket.on("set username", (username) => {
        users[socket.id] = username;
        io.emit("user list", Object.values(users)); 
        socket.emit("load history", messageHistory); 
        socket.broadcast.emit("server message", `${username} entrou no chat.`);
    });

    socket.on("chat message", (msg) => {
        const username = users[socket.id] || "Anônimo";
        const messageData = { username, msg };
        
        messageHistory.push(messageData); 
        if (messageHistory.length > 20) messageHistory.shift(); 

        io.emit("chat message", messageData); 
    });

    
    socket.on("disconnect", () => {
        const username = users[socket.id];
        delete users[socket.id]; 

        io.emit("user list", Object.values(users)); 
        if (username) {
            io.emit("server message", `${username} saiu do chat.`);
        }
    });
});

server.listen(3000, () => {  // Inicia o bunitu do garçon na porta 3000
    console.log("Servidor rodando em http://localhost:3000");
});
