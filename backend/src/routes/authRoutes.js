const express = require("express");
const { register, login, me } = require("../controllers/authControllers");
const { requireAuth } = require("../middleware/auth");


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/me", requireAuth, me);


module.exports = router;  

