// require("dotenv").config({ path: "./env" });
import dotenv from "dotenv";
// dot env ko ham esay bh import kar saktay hain, or inko experimental feature k through use kar saktay hain.
//  aap ko package.json wali file jakr scripts me dev k andar nodemon k baad ye paste karna hai ,
// -r dotenv/config --experimental-json-modules
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./env",
});

connectDB()
.then(() => {
  app.listen(process.env.PORT || 5000, () => {
    console.log(`App is listening on Port : ${process.env.PORT}`);
  });
})
.catch((err)=>{
    console.log("MongoDB connection failed ! : ",err);
})

// import { express } from "express";
//     app.on("error", (error) => {
// ;(async () => {
//   try {
//     await mongoose.connect(`${process.env.Database_URL}/${DB_NAME}`);
// const app = express();
//       console.log("ERR", error);
//       throw error;
//     });

//     app.listen(process.env.PORT, () => {
//       console.log(`App is listening on port ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.error("Error : ", error);
//     throw error;
//   }
// })();
