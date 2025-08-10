import dotenv from "dotenv";
import express from "express";
import http from "http";
import cors from "cors";
import { WebSocketServer } from "ws";

import chatRouter from "./routes/chat.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const wss = new WebSocketServer({ server });

app.get("/", (req, res) => {
    res.send("Hello World");
});


app.use("/chat", chatRouter);

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});