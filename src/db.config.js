import mongoose from "mongoose"

export const connectDb = (url) =>
{
mongoose
.connect(url)
.then(() => console.log("Database connected successfully"))
.catch((err) => console.log("Error connecting to Mongoose", err.message))
}