const authService = require("../services/authService");
const asyncHandler = require("../middleware/asyncHandler");

const registerUser = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  res.status(201).json(result);
});

const loginUser = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  res.status(200).json(result);
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
  });
});

module.exports = { registerUser, loginUser, getMe };
