const router = require("express").Router();

class HealthRoutes {
    #router;
    static mountUri = "/health";

    constructor() {
        this.#router = router;

        this.#router.get("/", (req, res) => {
            res.status(200).send("OK");
        });
    }

    get router() {
        return this.#router;
    }
}

module.exports = HealthRoutes;
