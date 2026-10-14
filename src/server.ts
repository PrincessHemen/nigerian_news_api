import express from 'express'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = 3001

//API starting 
app.get("/api", (req, res) => {
    res.send("hello world, Princess here 👋🏾. The News API is working, thanks for visiting.")
})

app.use(function (req, res) {
    res.status(404).json({error: "Not Found!"})
})

app.use((err: any, req: any, res: any, next: any) => {
    const statusCode = err.statusCode || 500
    const message = err.message || "Internal Server Error"
    return res.status(statusCode).json({error: message})
})

app.listen(PORT, async () => {
    console.log(`listening on port ${PORT}`)
})