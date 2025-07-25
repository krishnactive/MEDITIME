import express from 'express'
import cors from "cors"
import 'dotenv/config'
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoutes.js';
import doctorRouter from './routes/doctorRoutes.js';
import userRouter from './routes/userRoutes.js';


// app config
const app = express();
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



app.get('/', (req, res)=>{
    res.send("api working")
})

app.listen(PORT, ()=>console.log(`Server started at ${PORT}`))