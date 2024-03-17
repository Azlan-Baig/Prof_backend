import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);

app.use(express.static("public"));
app.use(cookieParser());

import userRouter from "./routes/user.routes.js";
// Ab dekho hamnay app.use isiliye likha k ye hamnay route import kia hai to app.get nahi kar saktay, han agar saara kaam me me user.routes me hai baanaata to wahaan me app.use karta, par jab ab sab cheezein separate kardi hain to isko as a middleware use karna parega

app.use("/api/v1/users", userRouter);
export { app };
