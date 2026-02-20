import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./router";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", router);

app.use(errorHandler);

app.get("/healthcheck", (req, res) => {
  res.sendStatus(200);
});

export default app;
