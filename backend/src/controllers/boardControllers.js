const { query, withTransaction } = require("../config/db");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandlers");
const { emitToBoard, logActivity } = require("../realtime");


const DEFAULT_COLUMNS = ["Todo", "In Progress", "Review", "Done"];
 
const listBoard = asyncHandler()