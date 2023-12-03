const router = require("express").Router();

class BaseRoutes {
    #router;
    #mountUri;

    /**
     * @param {string} mountUri
     */
    constructor(mountUri) {
        this.#router = router;
        this.#mountUri = mountUri;
    }

    get mountUri() {
        return this.#mountUri;
    }

    get router() {
        return this.#router;
    }
}

module.exports = BaseRoutes;
