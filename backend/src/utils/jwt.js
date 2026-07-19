const jwt = require("jsonwebtoken")


// generating JWT token
const signToken = (playLoad) => jwt.sign(playLoad, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES || "7d"})

// verifying JWT token 
const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);


module.exports = {signToken, verifyToken};