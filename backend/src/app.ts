import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/auth.router.js";

dotenv.config();

const app = express();

const corsOptions ={
  origin:['http://localhost:5173'], 
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200
}

app.use(express.json());
app.use(cors(corsOptions));

app.use("/auth", authRouter);

export default app;
