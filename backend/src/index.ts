import dotenv from "dotenv";
import express from "express";
import http from "http";
import cors from "cors";
import { WebSocketServer } from "ws";

import chatRouter from "./routes/chat.js";
import { handleConnection } from "./controllers/socketController.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const wss = new WebSocketServer({ server });

app.get("/", (req, res) => {
    res.send("Hello World");
});

wss.on("connection", (ws) => {
    handleConnection(ws);
});


app.use("/chat", chatRouter);

server.listen(8000, () => {
    console.log("Server is running on port 8000");
});