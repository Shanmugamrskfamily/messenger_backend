import  express  from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from 'cors'
import dotenv from 'dotenv'
import { dbconnection } from "./config/dataBase.js";
import { UserRouter } from "./Routes/UserRouter.js";
import { isAuthorized } from "./middleware/isAuthorised.js";
import { ChatRouter } from "./Routes/ChatRouter.js";
import { MessageRoute } from "./Routes/MessageRouter.js";

//configuration .env files
dotenv.config();


//assign app to express server
const app=express();
app.use(cors());
app.use(express.json());


//database connection
dbconnection();

const PORT=process.env.PORT;

//ROUTES
app.use("/api",UserRouter);
app.use("/chat",isAuthorized,ChatRouter);
app.use("/message",isAuthorized,MessageRoute);

app.get("/",(req,res)=>{
    res.status(200).send("server working");
})





// Object to track online users
const onlineUsers = {};

const httpServer = createServer(app);
const io = new Server(httpServer, { 
    cors:{
        origin:"*",

    },
    pingTimeout:60000
 });

 io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("setup",(user)=>{
        socket.join(user.data.id);
        onlineUsers[user.data.id] = socket.id; // Add user to online users
        socket.emit("connected");
        // Emit online users to the newly connected user
    socket.emit("onlineUsers", Object.keys(onlineUsers));
    console.log(Object.keys(onlineUsers))


    });

    

    socket.on("join chat",(room)=>{
        console.log(room)
        socket.join(room)

    });

    socket.on("new message",(newMessage)=>{
     const chat=newMessage._id;
     if(!chat){
        socket.emit("error", { message: "Chat ID is not defined in the new message" });
        return;
        
     }
    
     socket.broadcast.to(chat).emit("message received",newMessage)
        
    });
     // Handle typing event
     socket.on("typing", (data) => {
        const { chatId, isTyping } = data;
        socket.broadcast.to(chatId).emit("typing", { userId: socket.id, isTyping });
    });
    // Example: Listen for a "disconnect" event
    socket.on("disconnect", () => {
        console.log("User disconnected");
        // Remove user from online users
        const userId = Object.keys(onlineUsers).find(key => onlineUsers[key] === socket.id);
        if (userId) {
            delete onlineUsers[userId];
        }
    });
});
  
  // Start the HTTP server
httpServer.listen(PORT, () => {
    console.log("Server running on ", PORT);
});