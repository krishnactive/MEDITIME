import express from 'express'
import cors from "cors"
import 'dotenv/config'
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoutes.js';
import doctorRouter from './routes/doctorRoutes.js';
import userRouter from './routes/userRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import { Server } from 'socket.io';
import http from 'http';

const defaultSocketOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://meditime-sigma.vercel.app",
  "https://meditime-admin-dr.vercel.app",
];
const extraOrigins = (process.env.CLIENT_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const socketCorsOrigins = [...new Set([...defaultSocketOrigins, ...extraOrigins])];

// app config
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: socketCorsOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = process.env.PORT||4000
connectDB();
connectCloudinary();

//middlewares
app.use(express.json())
app.use(cors());


// api end points
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userRouter);
//localhost:4000/api/admin/add-doctor

// AI routes
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportRoutes);



app.get('/', (req, res)=>{
    res.send("api working")
})

// Socket.io for video calling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', async (roomId, userId) => {
    await socket.join(roomId);
    socket.data.videoRoomId = roomId;
    socket.data.peerUserId = userId;
    // Notify peers already in the room so they initiate the PeerJS call to this user
    socket.to(roomId).emit('user-connected', userId);
  });

  socket.on('send-message', (roomId, message) => {
    socket.to(roomId).emit('receive-message', message);
  });

  socket.on('screen-share-toggle', (roomId, isSharing) => {
    socket.to(roomId).emit('remote-screen-share-toggle', isSharing);
  });

  socket.on('disconnect', () => {
    const { videoRoomId, peerUserId } = socket.data;
    if (videoRoomId && peerUserId) {
      socket.to(videoRoomId).emit('user-disconnected', peerUserId);
    }
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, ()=>console.log(`Server started at ${PORT}`))