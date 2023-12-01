const express = require("express");
require("express-async-errors");
const cors = require("cors");
const middleware = require("./middleware");
const cookieParser = require("cookie-parser");

const healthController = require("./controller/health");
const authController = require("./controller/auth");
const kanbanController = require("./controller/kanban");
const Config = require("./config");
const Database = require("./db");

// app.use(
//     cors({
//         origin: "http://localhost:3000",
//         credentials: true,
//     }),
// );

// app.use(express.json());
// app.use(middleware.log);

// app.use(`${config.BASE}${healthController.mountUri}`, healthController.router);

// app.use(cookieParser());
// app.use(`${config.BASE}${kanbanController.mountUri}`, kanbanController.router);
// app.use(`${config.BASE}${authController.mountUri}`, authController.router);

// app.use(middleware.GlobalErrorHandler);

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
    static enviroments = {
        DEV: "development",
        PROD: "production",
        TEST: "test",
    };

    constructor() {
        this.#app = express();
        try {
            this.#config = new Config(process.env);
        } catch (error) {
            console.error(error);
            console.log("Exiting...");
            process.exit(1);
        }

        if (
            Object.values(Application.enviroments).some(
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
                    this.#config.ENV === Application.enviroments.PROD
                        ? this.#config.HOST
                        : `http://localhost:${this.#config.PORT}`,
                credentials: true,
            }),
        );

        this.#app.use(express.json());
        this.#app.use(middleware.log);

        this.#app.use(
            `${this.#config.BASE}${healthController.mountUri}`,
            healthController.router,
        );

        // this.#app.use(cookieParser());
        // this.#app.use(
        //     `${this.#config.BASE}${kanbanController.mountUri}`,
        //     kanbanController.router,
        // );
        // this.#app.use(
        //     `${this.#config.BASE}${authController.mountUri}`,
        //     authController.router,
        // );

        this.#app.use(middleware.GlobalErrorHandler);
    }

    start() {
        this.#app.listen(this.config.PORT, () => {
            console.log(`Server started on port ${this.config.PORT}`);
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
