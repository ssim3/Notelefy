import express from "express"
import cookieParser from "cookie-parser";
import { PORT, SERVER_URL } from "./config/env.js";
import connectToDatabase from "./database/mongodb.js";
import handler from "./controllers/handler.controller.js";
import { handleMessage } from "./controllers/lib/telegram.js";
import workflowRouter from "./routes/workflow.routes.js";
import { qstashClient, workflowClient } from "./config/upstash.js";
import arcjetMiddleware from "./middlewares/arcjet.middleware.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended : false}));
app.use(cookieParser());

// Middlewares
app.use(arcjetMiddleware);

app.use("/api/v1/workflows", workflowRouter);

app.get("/", async (req, res) => {
  res.send("Hello GET");
})

app.post("/", async (req, res) => {
  console.log(req.body);
  res.send(await handler(req, handleMessage));
})

app.listen(PORT, async () => {
  console.log(`App listening on PORT: ${PORT}`);
  connectToDatabase();

  // QSTASH Workflow
  try {
    await qstashClient.schedules.create({
      destination: `${SERVER_URL}/api/v1/workflows/schedule`,
      scheduleId: "existingScheduleId",
      cron: "0 0 * * *",
      retries: 0,
    })
  } catch (error) {
    console.log(error);
  }

})