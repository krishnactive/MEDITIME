import express from 'express'
import cors from "cors"
import 'dotenv/config'
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoutes.js';


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
//localhost:4000/api/admin/add-doctor



app.get('/', (req, res)=>{
    res.send("api working")
})

app.listen(PORT, ()=>console.log(`Server started at ${PORT}`))