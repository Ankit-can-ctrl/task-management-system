const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const formatAuthResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  token: generateToken(user._id),
});

const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("A user with this email already exists", 400);
  }

  const user = await User.create({ name, email, password });
  return formatAuthResponse(user);
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  return formatAuthResponse(user);
};

module.exports = { registerUser, loginUser };
