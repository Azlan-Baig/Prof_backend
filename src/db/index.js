import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    //mongoose ki achi baat ye hai k ye aapko object return karta hai.
    //  yaani k menay isko variable me save kar k iska response save karlia hai mongoose.connect ka
    const ConnectionInstance = await mongoose.connect(
      `${process.env.Database_URL}/${DB_NAME}`
    );
    console.log(
      `\n MongoDb Connected : !! DB Host: ${ConnectionInstance.connection.host}`
    //   connection.host isliye kartay hain k mujhy pata rahe k me konse host par connect huraha hun, wo testing ka hai ya deployment ka, ya ksi or ka 
    );
  } catch (error) {
    console.log("MONGODB Connection Error", error);
    // iski jaga throw bh kar saktay hain..
    process.exit(1);
  }
};

export default connectDB