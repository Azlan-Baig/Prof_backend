import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import jwt from "jsonwebtoken";
// get user details from frontend ✅
// validation - not empty ✅
// check if user already exists: username, email  ✅
// check for images, check for avatar  ✅
// upload them to cloudinary, avatar ✅
// create user object - create entry in db ✅
// remove password and refresh token field from response ✅
// check for user creation✅
// return res ✅

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); //Database me save karnay k liye hai ye..

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};
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

  // check if user already exists: username, email
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
  // check for images, check for avatar

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

  // console.log(req.files);
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required.");
  }
  // upload them to cloudinary, avatar

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  // console.log(avatar);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required to upload on cloudinary.");
  }
  // console.log(User);
  // create user object - create entry in db

  const user = await User.create({
    fullname,
    avatar: avatar.url, // Check if avatar is defined and contains the url property
    coverImage: coverImage.url || "", // Check if coverImage is defined and contains the url property
    email,
    password,
    username: username.toLowerCase(), // Use toLowerCase() instead of toLowercase()
  });
  // remove password and refresh token field from response

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken" // - ka matlab hai k ye ye field nahi bhejo ok.
  );
  // check for user creation

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  console.log(createdUser);
  // return res

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data ✅
  // username or email ✅
  // find the user ✅
  // password check ✅
  // access and refresh token ✅
  // send cookie ✅

  // req body -> data
  const { email, password, username } = req.body;

  // username or email
  if (!(username || email)) {
    throw new ApiError(400, "username and email is required");
  }

  // find the user ✅
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // password check ✅

  const isPasswordValid = await user.isPasswordCorrect(password); //yedirectly jakr save honay se pehlay user.model.js me check ho jayega.
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password.");
  }

  // Access and refresh Token ✅
  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id // is say menay jo user banaya hai us user ka access mil gaya, ye method jo menay bilkul top par banaya thaa or usmey jo user thaa usme model k koi bh field nahi thii to yahan ye jo user pass karaya hai parameters me ye uppar wala user hai jisme model ki saari fields hain.
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken" // dekho me chahta to direct user he bhej sakta thaa jo menay upparlia thaa but yahan par menay ek naya varibale banaya q k me kuch field bhejna nahi chahta or us user me model ki saari fields hain is waja se menay ye loggedIn user banaya or jo remove karna thaa wo remove kardiaa...
  );

  //Wesay cookis to frontEnd walay bh modify kar saktey hain lekin is say huta ye hai k cookies modify karnay ka acces sirf server side par huta hai...

  // Send cookis  ✅
  const options = {
    secure: true,
    httpOnly: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          // wesay ye bhejna ek acchii practice to nahi par hu sakta hai k user apnay local store me cookies save karna chah raha ho ya mobile app bana raha ho to isilie.
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true, //matlab k jab bh database se refreshToken ki value ayegey wo new ayegey naa ki puraaney.
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefereshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confPassword } = req.body;

  // if (!(newPassword === confPassword)) {
  //   throw new ApiError()
  // }

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed succesfully."));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully."));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;
  //Advice : Agar koi file update karwaa rahe hain to uska alag controller or end points  rakhna chahiye ziaada acha rehta hai, ziaada tar production level me alag rakha jaata ha, jaisay k user agar apney image update karna chahta hai to usko wahein apney image ave karay naa k user me warna poora ka poora user update hojayega or network congestion huga.
  if (!(fullname || email)) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        email: email,
        fullname: fullname,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details changed successfully"));
});
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  //TODO: delete old image - assignment

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is missing");
  }

  //TODO: delete old image - assignment

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params; //Matlab aap body se nahi uskey URl se nikaal logay username

  if (!username?.trim()) {
    throw new ApiError(400, "username is missing");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: { //FrontEnd walay k liye k wo button pat dekh sakay subscribe ya ha nahi
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "channel does not exists");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully")
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
};
