-- THis is a schema for postgresql

CREATE TABLE IF NOT EXISTS profile (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (username, email),
    CHECK (first_name <> ''),
    CHECK (username <> ''),
    CHECK (email <> ''),
    CHECK (password <> '')
);

CREATE TABLE IF NOT EXISTS kanban_board (
	id SERIAL PRIMARY KEY,
	profile_id INTEGER NOT NULL,
	title VARCHAR(255) NOT NULL,
	description VARCHAR(255),
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (profile_id) REFERENCES profile(id)
);

CREATE TABLE IF NOT EXISTS kanban_column (
	id SERIAL PRIMARY KEY,
	board_id INTEGER NOT NULL,
	title VARCHAR(255) NOT NULL,
	description VARCHAR(255),
	position INTEGER NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (board_id) REFERENCES kanban_board(id)
);

CREATE TABLE IF NOT EXISTS kanban_card (
	id SERIAL PRIMARY KEY,
	column_id INTEGER NOT NULL,
	title VARCHAR(255) NOT NULL,
	description VARCHAR(255),
	position INTEGER NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (column_id) REFERENCES kanban_column(id)
);
