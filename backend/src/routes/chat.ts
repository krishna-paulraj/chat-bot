import express from "express";
import { chat, chatStream } from "../models/chat.js";
const router = express.Router();

// Legacy routes (keeping for backward compatibility)
router.get("/", async (req, res) => {
    const chatResponse: string = await chat("Explain how AI works in a few words");
    res.json({ "chat": chatResponse });
});

router.post("/", async (req, res) => {
    chatStream(req.body.message);
    const chatResponse: string = await chat(req.body.message);
    res.json({ "chat": chatResponse });
});

router.post("/create", async (req, res) => {
    const chatResponse: string = await chat(req.body.message);
    res.json({ "chat": chatResponse });
});

export default router;