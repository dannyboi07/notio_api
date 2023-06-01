const db = require("../db");
const { Knex } = require("knex");

/**
 * @returns {Knex.QueryBuilder<Profile, {}>}
 */
const Profile = () => db("profile");

module.exports = Profile;
