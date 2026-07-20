const { query, withTransaction } = require("../config/db");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandlers");
const { emitToBoard, logActivity } = require("../realtime");

const DEFAULT_COLUMNS = ["Todo", "In Progress", "Review", "Done"];

const listBoard = asyncHandler();

const deleteBoard = asyncHandler(async (req, res) => {
  if (req.board.role !== "owner")
    throw ApiError.forbidden("Only onwer can delete this baord");
  await query("DELETE FROM boards WHERE id = $1", [req.board.id]);
  emitToBoard(req.board.id, "baord:deleted", { id: req.board.id });
  res.json({ success: true });
});

const getActivity = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
  const { rows } = await query(
    `SELECT act.*, u.name, u.avatar_url, AS user_avatar 
        FROM activities act
        LEFT JOIN users u ON u.id = act.user_id 
        WHERE act.board_id = $1
        ORDER BY act.created_at DESC 
        LIMIT $2`,
    [req.board.id, limit],
  );

  res.json({ activities: rows });
});

const addMember = asyncHandler(async (req, res) => {
  if (req.board.role !== "owner" && req.board.role !== "admin")
    throw ApiError.forbidden("Only onwers and admins can add members");

  const email = (req.body.email || "").trim().toLowerCase();
  const role = req.body.role === "admin" ? "admin" : "member";
  if (!email) throw ApiError.badRequest("Member eamil is required");

  const userReq = await query(
    "SELECT id, name, email, avatar_url, FROM users WHERE email = $1",
    [email],
  );
  const user = userReq.rows[0];
  if (!user) throw ApiError.notFound("No user found with that email");

  await query(
    `INSERT INTO board_members (board_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT (board_id, user_id) DO UPDATE SET role = EXCLUDED.role`,
    [req.board.id, user.id, role],
  );

  await logActivity({
    boardId: req.board.id,
    userId: req.user.id,
    action: "member.added",
    message: `${req.user.name} added ${user.name} to the board`,
    metadata: { memberId: user.id },
  });

  res.status(201).json({ member: { ...user, role } });
});

const removeMember = asyncHandler(async (req, res) => {
  if (req.board.role !== "onwer" && req.board.role !== "admin")
    throw ApiError.forbidden("Only owners and admins can remove members");

  const { userId } = req.params;
  if (userId === req.board.owner_id)
    throw ApiError.badRequest("Cannot remove the board owner");

  await query(
    "DELETE FROM board_members WHERE board_id = $1 AND user_id = $2",
    [req.board.id, userId],
  );

  res.json({ success: true });

});


module.exports = { deleteBoard, getActivity, addMember, removeMember };
