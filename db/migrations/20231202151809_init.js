/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .createTable("profile", (table) => {
            table.increments("id").primary();
            table.string("first_name", 255).notNullable();
            table.string("last_name", 255);
            table.string("username", 255).notNullable();
            table.string("email", 255).notNullable();
            table.string("password", 255).notNullable();
            table.timestamps(true, true);
            table.unique(["username", "email"]);
            table.check("first_name <> ''");
            table.check("username <> ''");
            table.check("email <> ''");
            table.check("password <> ''");
        })
        .createTable("kanban_board", (table) => {
            table.increments("id").primary();
            table.integer("profile_id").unsigned().notNullable();
            table.string("title", 255).notNullable();
            table.string("description", 255);
            table.timestamps(true, true);
            table.foreign("profile_id").references("profile.id");
        })
        .createTable("kanban_column", (table) => {
            table.increments("id").primary();
            table.integer("board_id").unsigned().notNullable();
            table.string("title", 255).notNullable();
            table.string("description", 255);
            table.integer("position").unsigned().notNullable();
            table.timestamps(true, true);
            table.foreign("board_id").references("kanban_board.id");
            table.unique(["board_id", "position"]);
        })
        .createTable("kanban_card", (table) => {
            table.increments("id").primary();
            table.integer("column_id").unsigned().notNullable();
            table.string("title", 255).notNullable();
            table.string("description", 255);
            table.integer("position").unsigned().notNullable();
            table.timestamps(true, true);
            table.foreign("column_id").references("kanban_column.id");
            table.unique(["column_id", "position"]);
        })
        .then(() => {
            console.log("Migration complete");
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema
        .dropTableIfExists("kanban_card")
        .dropTableIfExists("kanban_column")
        .dropTableIfExists("kanban_board")
        .dropTableIfExists("profile")
        .then(() => {
            console.log("Migration rollback complete");
        });
};
