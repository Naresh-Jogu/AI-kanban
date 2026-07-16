CREATE EXTENTION IF NOT EXISTS "pgcrypto" 

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()

);


CREATE TABLE IF NOT EXISTS boards(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#6366f1',
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()

);

CREATE TABLE IF NOT EXISTS board_members (
    board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (board_id, user_id)


);

CREATE TABLE IF NOT EXISTS columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    position DOUBLE PRECISION NOT NULL DEFAULT 1000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
)



CREATE TABLE IF NOT EXISTS tasks (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
     coumn_id UUID NOT NULL REFERENCES column(id) ON DELETE CASCADE,
     tilte TEXT NOT NULL,
     description TEXT,
     priority TEXT NOT NULL DEFAULT 'medium',
     due_date TIMESTAMPTZ,
     assignee_id UUID REFERENCES user(id) ON DELETE SET NULL,
     position DOUBLE PRECISION  NOT NULL DEFAULT 1000,
     created_by UUID REFERENCES user(id) ON DELETE SET NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT now()



);


CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID NOT NULL REFERENCES board(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

);

CREATE INDEX IF NOT EXISTS idx_boards_owner     ON boards(owner_id),
CREATE INDEX IF NOT EXISTS idx_columns_board    ON columns(board_id),
CREATE INDEX IF NOT EXISTS idx_tasks_board      ON tasks(board_id),
CREATE INDEX IF NOT EXISTS idx_tasks_column     ON tasks(column_id),
CREATE INDEX IF NOT EXISTS idx_tasks_asignee    ON tasks(asignee_id),
CREATE INDEX IF NOT EXISTS idx_members_user     ON baord(user_id),
CREATE INDEX IF NOT EXISTS idx_activities_board ON activities(baord_id, created_at DESC),


