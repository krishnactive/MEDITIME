import express from 'express'
import cors from "cors"
import 'dotenv/config'


// app config
const app = express();
const PORT = process.env.PORT||4000

//middlewares
app.use(express.json())
app.use(cors());


// api end points

app.get('/', (req, res)=>{
    res.send("api working")
})

app.listen(PORT, ()=>console.log(`Server started at ${PORT}`))