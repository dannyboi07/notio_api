const Database = require("../db");

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
     * @param {string} email
     * @param {string} username
     * @returns {Promise<Profile>}
     */
    async selectByEmailAndUsername(email, username) {
        return await this.#db
            .instance(ProfileModel.tableName)
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
    async selectByUsername(username) {
        return await this.#db
            .instance(ProfileModel.tableName)
            .where({
                username,
            })
            .first();
    }

    /**
     * @param {string} id
     * @returns {Promise<Profile>}
     */
    async selectById(id) {
        return await this.#db
            .instance(ProfileModel.tableName)
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
    async insertProfile(email, username, password, first_name) {
        const [profile] = await this.#db
            .instance(ProfileModel.tableName)
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
