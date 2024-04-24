import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();

// Enable CORS for all origins
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ['GET', 'POST'],
    },
});

io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    if (!username) {
        return next(new Error("Invalid username"));
    }
    socket.username = username;
    socket.userId = uuidv4(); // Call uuidv4 function to generate unique ID
    next();
});

io.on("connection", async(socket) => {
    const users=[];
    for(let[id,socket]of io.of("/").sockets){
        users.push({
            userId:socket.userId,
            username:socket.username
        })
    }
    // all users event
    socket.emit("users",users);


    // Emit connected user details event
    socket.emit("session", { userId: socket.userId, username: socket.username });
// new user event
socket.broadcast.emit("user connected",{
    userId:socket.userId,
    username:socket.username,

})
// new message event
const messages=[]
socket.on("new message",(message)=>{
    socket.broadcast.emit("new message",{
        userId:socket.userId,
        username:socket.username,
        message})
})
});

const PORT = process.env.PORT || 4001;
httpServer.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
