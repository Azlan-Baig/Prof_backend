import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
// get user details from frontend ✅
// validation - not empty ✅
// check if user already exists: username, email  ✅
// check for images, check for avatar  ✅
// upload them to cloudinary, avatar ✅
// create user object - create entry in db ✅
// remove password and refresh token field from response ✅
// check for user creation✅
// return res ✅

const registerUser = asyncHandler(async (req, res) => {
  //GETTING USER DETAILS FROM THE FRONTEND
  const { password, email, username, fullname } = req.body;
  // console.log("email: ", email);

  //VALIDATION - ANY FIELD SHOULD NOT BE EMPTY.
  if (
    [password, email, username, fullname].some((field) => field?.trim === "")
  ) {
    throw new ApiError(400, "All fields are required.");
  }

  // if (username === "") {    Aisay har field k liye likhna parega code jokay sahi nahi hai...
  //   throw new ApiError
  // }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],

    // The $or operator in MongoDB performs a logical OR operation on an array of conditions, selecting documents that satisfy at least one of those conditions. It's particularly useful when you want to query documents based on multiple criteria but only need to match one of them.
    // It searches for a document in the User collection where either the username matches a specific value or the email matches a specific value.
    // If a document matches either the username or the email, it's considered a match, and that document is returned.
    // If none of the conditions are met, the query returns null.
  });

  if (existedUser) {
    throw new ApiError(
      409,
      "User with this email and username already exists."
    );
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // let avatarLocalPath;
  // if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
  //     avatarLocalPath = req.files.avatar[0].path
  // }

  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  //  let coverImageLocalPath;
  //   if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
  //       coverImageLocalPath = req.files.coverImage[0].path
  // }

  console.log(req.files);
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required.");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  console.log(avatar);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required to upload on cloudinary.");
  }
  // console.log(User);f
  const user = await User.create({
    fullname,
    avatar: avatar.url ,// Check if avatar is defined and contains the url property
    coverImage:coverImage.url || "", // Check if coverImage is defined and contains the url property
    email,
    password,
    username: username.toLowerCase(), // Use toLowerCase() instead of toLowercase()
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken" // - ka matlab hai k ye ye field nahi bhejo ok.
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

export { registerUser };
