import { connectDb } from "./src/db.config.js";
import cors from 'cors'
import dotenv from "dotenv";
import express from "express";
import userRouter from "./src/routes/user.js"
import authRouter from "./src/routes/auth.js"
import propertyRouter from "./src/routes/property.js"

dotenv.config();
const app = express();
app.use(express.json())

let corsOptions = { 
    origin : ['http://localhost:5173',"https://betahouse.vercel.app/", 'http://localhost:5174', 'http://localhost:3000'], 
  } 
app.use(cors(corsOptions)); //these are the cors allowed origin

const port = process.env.PORT
const dbUrl = process.env.MONGODB_URL
console.log(port);
console.log(dbUrl);
console.log("Server started");

// connect to DB
connectDb(dbUrl)

app.get('/', (req, res) => {
  res.send('BetaHouse Backend');
});

// Routes
app.use("/api/auth", authRouter)
app.use("/api", userRouter)
app.use("/api/property", propertyRouter)

app.listen(port, (req, res) => {
    console.log(`Server listening on port ${port}`);
})