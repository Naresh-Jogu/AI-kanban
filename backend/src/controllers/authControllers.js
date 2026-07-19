const bcrypt  = require("bcryptjs")
const asyncHandler = require("../utils/asyncHandlers")
const ApiError = require("../utils/ApiError")
const { query } = require("../config/db")
const { signToken } = require("../utils/jwt")



const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const publicUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    avatar_url: user.avatar_url,
    created_at: user.created_at,
});

const register = asyncHandler( async (req, res) => {
    const name = (req.body.name || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const { password } = req.body;

    if (!name) throw ApiError.badRequest("Name is required");
    if (!EMAIL_RE.test(email)) throw ApiError.badRequest("Valid email is required");
    if (!password || password.length < 6) throw ApiError.badRequest("Password must be atleast 6 characters");

    const existing = await query("SELECT id FROM users WHERE email = $1", [email]);
    
    if (existing.rows.length) throw ApiError.conflict("Email is already registered");

    const password_hash = await bcrypt.hash(password, 10);

    const { rows } =  await query(`INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, avatar_url, created_at`, [name, email, password_hash]);

    const user = rows[0];

    const token = signToken({
        id: user.id,
        email: user.email,
        name: user.name,
    })

    res.status(201).json({user: publicUser(user), token})

})




const login = asyncHandler( async (req, res) => {
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body

    if (!email || !password) throw ApiError.badRequest("Email password are required");
    
    const { rows } = await query("SELECT * FROM users WHERE email = $1", [email]);

    const user = rows[0];

    if (!user) throw ApiError.unauthourized("Invalid email or password");

    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) throw ApiError.unauthourized("Invalid email or password");

    const token = signToken({
        id: user.id,
        email: user.email,
        name: user.name,
    })
    
    res.json({user: publicUser(user), token});
});


const me = asyncHandler(async (req, res) => {
    const { rows } = await query("SELECT id, name, email, avatar_url, created_at FROM users WHERE id = $1", [req.user.id]);

    if (!rows.length) throw ApiError.notFound("user not found");

    res.json({user: rows[0]});
})


module.exports = {register, login, me}; 