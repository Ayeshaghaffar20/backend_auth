import express from "express"
import cors from "cors"
import "dotenv/config"
import chalk from "chalk"
import cookieParser from "cookie-parser"
import mongoose from "mongoose"
import connectDB from "./db/db.js"
import authRouter from "./routes/authRoutes.js"
import userRouter from "./routes/userRoutes.js"

const app = express()

const port = process.env.PORT || 3000


// Mongodb connection
connectDB()

const allowedOrigin = ['http://localhost:5173', 'https://mern-auth-ten-delta.vercel.app']

app.use(express.json())
app.use(express.urlencoded({ extended: true })); // ✅ For form data
app.use(cookieParser())
app.use(cors({ origin: allowedOrigin, credentials: true }))

app.get('/', (req, res) => {
    res.send("hello from server 5000")
})
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)




app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);

})


