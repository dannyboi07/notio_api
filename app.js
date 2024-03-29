const express = require("express");
require("express-async-errors");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const Config = require("./config");
const Database = require("./db");

const RequestLogger = require("./middleware/log");

const HealthRoutes = require("./routes/health");
const AuthRoutes = require("./routes/auth");
const KanbanRoutes = require("./routes/kanban");

const GlobalErrorHandlerMiddleware = require("./middleware/error_handler");

class Application {
    /**
     * @type {express.Express}
     */
    #app;
    /**
     * @type {Config}
     */
    #config;
    /**
     * @type {Database}
     */
    #db;

    constructor() {
        this.#app = express();
        try {
            this.#config = new Config();
        } catch (error) {
            console.error(error);
            console.log("Exiting...");
            process.exit(1);
        }

        if (
            Object.values(Config.environments).some(
                (env) => env === this.#config.ENV,
            ) === false
        ) {
            console.error(
                `Invalid value for 'ENV' env var: '${this.#config.ENV}'!`,
            );
            console.log("Exiting...");
            process.exit(1);
        }

        this.#db = new Database(
            this.#config.DB_HOST,
            this.#config.DB_PORT,
            this.#config.DB_USER,
            this.#config.DB_PW,
            this.#config.DB_NAME,
            // false
        );

        this.#app.use(
            cors({
                origin:
                    this.#config.ENV === Config.environments.PROD
                        ? this.#config.HOST
                        : `http://localhost:${this.#config.PORT}`,
                credentials: true,
            }),
        );

        this.#app.use(express.json());
        this.#app.use(RequestLogger);

        this.#app.use(
            `${this.#config.BASE}${HealthRoutes.mountUri}`,
            new HealthRoutes().router,
        );

        this.#app.use(cookieParser());

        const kanbanRoutes = new KanbanRoutes(this);
        this.#app.use(
            `${this.#config.BASE}${kanbanRoutes.mountUri}`,
            kanbanRoutes.router,
        );

        const authRoutes = new AuthRoutes(this);
        this.#app.use(
            `${this.#config.BASE}${authRoutes.mountUri}`,
            authRoutes.router,
        );

        this.#app.use(GlobalErrorHandlerMiddleware);
    }

    start() {
        this.#app.listen(this.#config.PORT, () => {
            console.log(`Server started on port ${this.#config.PORT}`);
        });
    }

    /**
     * @returns {express.Express}
     */
    get instance() {
        return this.#app;
    }

    /**
     * @returns {Config}
     */
    get config() {
        return this.#config;
    }

    /**
     * @returns {Database}
     */
    get db() {
        return this.#db;
    }
}

module.exports = new Application();
