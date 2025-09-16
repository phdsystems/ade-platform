import http from "http"; import express from "express";
const app = express(); const PORT = process.env.PORT || 8000;
app.get("/health", (_req,res) => res.json({status:"ok"}));
http.createServer(app).listen(PORT, () => console.log(JSON.stringify({level:"INFO","msg":"listening","port":Number(PORT)})));
