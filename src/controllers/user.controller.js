import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend ✅
  // validation - not empty ✅
  // check if user already exists: username, email  ✅
  // check for images, check for avatar  ✅
  // upload them to cloudinary, avatar ✅
  // create user object - create entry in db ✅
  // remove password and refresh token field from response ✅
  // check for user creation✅
  // return res ✅

  //GETTING USER DETAILS FROM THE FRONTEND
  const { password, email, username, fullname } = req.body;
  // console.log("email: ", email);


//VALIDATION - ANY FIELD SHOULD NOT BE EMPTY.
if ([password, email, username, fullname].some((field) => field?.trim === "")) {
  throw new ApiError(400, "All fields are required.");
}

// if (username === "") {    Aisay har field k liye likhna parega code jokay sahi nahi hai...
//   throw new ApiError
// }
const existedUser = User.findOne({
  $or: [{ username }, { email }],

  // The $or operator in MongoDB performs a logical OR operation on an array of conditions, selecting documents that satisfy at least one of those conditions. It's particularly useful when you want to query documents based on multiple criteria but only need to match one of them.
  // It searches for a document in the User collection where either the username matches a specific value or the email matches a specific value.
  // If a document matches either the username or the email, it's considered a match, and that document is returned.
  // If none of the conditions are met, the query returns null.
});

if (existedUser) {
  throw new ApiError(409, "User with this email and username already exists.");
}

const avatarLocalPath = req.files?.avatar[0]?.path;
const coverImageLocalPath = req.files?.coverImage[0]?.path;

if (!avatarLocalPath) {
  throw new ApiError(400, "Avatar file is required.");
}

const avatar = uploadOnCloudinary(avatarLocalPath);
const coverImage = uploadOnCloudinary(coverImageLocalPath);
if (!avatar) {
  throw new ApiError(400, "Avatar file is required.");
}

const user = await User.create({
  fullname,
  avatar: avatar.url,
  coverImage: coverImage?.url || "", // yaani k agar cover image dia hai to url nikaal lo nahi hai empty chordo/
  email,
  password,
  username: username.toLowecase(),
});
const createdUser = await User.findById(user._id).select(
  "-password -refreshToken"   // - ka matlab hai k ye ye field nahi bhejo ok.
)
if(!createdUser){
  throw new ApiError(500, "Something went wrong while registering the user")
}
return res.status(201).json(
  new ApiResponse(200,createdUser,"User registered successfully")
)
})



export { registerUser };
