const path = require("path");
const { config: dotenvConfig } = require("dotenv");
const { parseInteger } = require("../util");

class ConfigException extends Error {
    constructor(message) {
        super(message);
        this.name = "ConfigException";
    }
}

class Config {
    // All the properties are read-only
    #ENV;
    #HOST;
    #PORT;
    #BASE;
    #DB_HOST;
    #DB_NAME;
    #DB_PORT;
    #DB_USER;
    #DB_PW;
    #PW_SALT_RND;
    #ACCESS_TOKEN_SECRET;
    #REFRESH_TOKEN_SECRET;

    constructor(envpath = "../.env") {
        const { parsed: config, error } = dotenvConfig({
            path: path.resolve(__dirname, envpath),
        });
        if (error) {
            throw new ConfigException(error.message);
        }
        this.#ENV = config.ENV;
        this.#HOST = config.HOST;
        const [PORT, portIsNum] = parseInteger(config.PORT);
        if (!portIsNum) {
            throw new ConfigException(
                "'PORT' env var's value is not a number!",
            );
        }
        this.#PORT = PORT;
        this.#BASE = config.BASE_URI;

        this.#DB_HOST = config.DB_HOST;
        this.#DB_NAME = config.DB_NAME;
        const [DB_PORT, dbPortIsNum] = parseInteger(config.DB_PORT);
        if (!dbPortIsNum) {
            throw new ConfigException(
                "'DB_PORT' env var's value is not a number!",
            );
        }
        this.#DB_PORT = DB_PORT;
        this.#DB_USER = config.DB_USER;
        this.#DB_PW = config.DB_PW;

        const [PW_SALT_RND, isNumber] = parseInteger(config.PW_SALT_RND);
        if (!isNumber) {
            throw new ConfigException(
                "'PW_SALT_RND' env var's value is not a number!",
            );
        }
        this.#PW_SALT_RND = PW_SALT_RND;
        this.#ACCESS_TOKEN_SECRET = config.ACCESS_TOKEN_SECRET;
        this.#REFRESH_TOKEN_SECRET = config.REFRESH_TOKEN_SECRET;
    }

    /**
     * @returns {string} The environment
     */
    get ENV() {
        return this.#ENV;
    }

    /**
     * @returns {string} The hostname
     */
    get HOST() {
        return this.#HOST;
    }

    /**
     * @returns {number} The port number
     */
    get PORT() {
        return this.#PORT;
    }

    /**
     * @returns {string} The base URI
     */
    get BASE() {
        return this.#BASE;
    }

    /**
     * @returns {string} The database hostname
     */
    get DB_HOST() {
        return this.#DB_HOST;
    }

    /**
     * @returns {string} The database name
     */
    get DB_NAME() {
        return this.#DB_NAME;
    }

    /**
     * @returns {number} The database port number
     */
    get DB_PORT() {
        return this.#DB_PORT;
    }

    /**
     * @returns {string} The database username
     */
    get DB_USER() {
        return this.#DB_USER;
    }

    /**
     * @returns {string} The database password
     */
    get DB_PW() {
        return this.#DB_PW;
    }

    /**
     * @returns {number} The password salt rounds
     */
    get PW_SALT_RND() {
        return this.#PW_SALT_RND;
    }

    /**
     * @returns {string} The access token secret
     */
    get ACCESS_TOKEN_SECRET() {
        return this.#ACCESS_TOKEN_SECRET;
    }

    /**
     * @returns {string} The refresh token secret
     */
    get REFRESH_TOKEN_SECRET() {
        return this.#REFRESH_TOKEN_SECRET;
    }
}

module.exports = Config;
