const Application = require("../app");
const router = require("express").Router();

class BaseRoutes {
    #app;
    #router;
    #mountUri;

    /**
     * @param {Application} app
     * @param {string} mountUri
     */
    constructor(app, mountUri) {
        this.#app = app;
        this.#router = router;
        this.#mountUri = mountUri;
    }

    get app() {
        return this.#app;
    }

    get mountUri() {
        return this.#mountUri;
    }

    get router() {
        return this.#router;
    }
}

module.exports = BaseRoutes;
