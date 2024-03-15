import mongoose, { Schema } from "mongoose";
import { Jwt } from "jsonwebtoken";
import bcrypt from "bcrypt";
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // Cloudinary URL.
      required: true,
    },
    coverImage: {
      type: String, // Cloudinary URL.
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required "],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // ye isiliyee kia hai userschema me jab bh koi filed me changes hungey to wo pw khud ba khud har new generate kardeta hai is se ye condition lag gaye hai agar modify nahi hua hai to next() k zariye agly middleware par chalay jao..
  this.password = bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password); // pehlay wala pw matlab jo pw user enter karega. x
};

userSchema.methods.generateAccessToken = () => {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn : ACCESS_TOKEN_EXPIRY
    }
  );
};
userSchema.methods.generateRefreshToken = () => {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn : REFRESH_TOKEN_EXPIRY
    }
  );
};
export const User = mongoose.model("User", userSchema);
