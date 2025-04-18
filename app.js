import express from "express"
import cookieParser from "cookie-parser";
import { PORT } from "./config/env.js";
import connectToDatabase from "./database/mongodb.js";
import handler from "./controllers/handler.controller.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended : false}));
app.use(cookieParser());

app.get("/", async (req, res) => {
  res.send("Hello GET");
})

app.post("/", async (req, res) => {
  res.send(await handler(req));
})

app.listen(PORT, async () => {
  console.log(`App listening on PORT: ${PORT}`);
  connectToDatabase();
})