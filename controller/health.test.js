const { describe, test, expect } = require("@jest/globals");
const request = require("supertest");
const app = require("../app");
const config = require("../config");
const health = require("./health");

const basePath = `${config.BASE}${health.mountUri}`;

describe("Health API", () => {
    test("GET /health", async () => {
        const response = await request(app).get(basePath);
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe("OK");
    });
});
