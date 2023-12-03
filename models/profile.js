const Database = require("../db");
const { Knex } = require("knex");

class ProfileModel {
    static tableName = "profile";
    /**
     * @type {Database}
     */
    #db;

    /**
     * @param {Database} db
     */
    constructor(db) {
        this.#db = db;
    }

    /**
     * @returns {Knex.QueryBuilder<Profile, {}>}
     */
    get #table() {
        return this.#db.instance(ProfileModel.tableName);
    }

    /**
     * @param {string} email
     * @param {string} username
     * @returns {Promise<Profile>}
     */
    async SelectByEmailAndUsername(email, username) {
        return await this.#table
            .where({
                email,
                username,
            })
            .first();
    }

    /**
     * @param {string} username
     * @returns {Promise<Profile>}
     */
    async SelectByUsername(username) {
        return await this.#table
            .where({
                username,
            })
            .first();
    }

    /**
     * @param {string} id
     * @returns {Promise<Profile>}
     */
    async SelectById(id) {
        return await this.#table
            .where({
                id,
            })
            .first();
    }

    /**
     * @param {string} email
     * @param {string} username
     * @param {string} password
     * @param {string} first_name
     * @returns {Promise<Profile>}
     */
    async Insert(email, username, password, first_name) {
        const [profile] = await this.#table
            .insert({
                email,
                username,
                password,
                first_name,
            })
            .returning("*");
        return profile;
    }
}

module.exports = { ProfileModel };
