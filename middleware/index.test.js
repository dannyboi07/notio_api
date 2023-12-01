const { describe, test, expect, beforeAll } = require("@jest/globals");
const request = require("supertest");
const express = require("express");
const app = express();
const {
    InputValidation,
    GlobalErrorHandler,
    AuthMiddleware,
} = require("./index");
const { CreateProfile: CreateProfileReqSchema } = require("../schema/profile");
const {
    getStringRequired,
    // getStringEmpty,
    getStringMinLen,
    // getStringMaxLen,
    getStringMustBeAlphaNum,
} = require("../schema/messages");

const registerApiRoute = "/register";
const authApiRoute = "/test";

const stringRequired = (fieldName) => getStringRequired(fieldName);
// const stringEmpty = (fieldName) => getStringEmpty(fieldName);
const stringMinLen = (fieldName, limit) =>
    getStringMinLen(fieldName).replace("{#limit}", limit);
// const stringMaxLen = (fieldName, limit) =>
//     getStringMaxLen(fieldName).replace("{#limit}", limit);
const stringMustBeAlphaNum = (fieldName) => getStringMustBeAlphaNum(fieldName);

describe("Middleware - InputValidation", () => {
    beforeAll(() => {
        app.use(express.json());
        app.post(
            registerApiRoute,
            InputValidation(CreateProfileReqSchema),
            (req, res) => {
                res.status(200).json({ message: "OK" });
            },
        );
        app.use(GlobalErrorHandler);
    });

    test("InputValidation", async () => {
        const response = await request(app).post(registerApiRoute).send({
            username: "test",
            password: "test",
            email: "test@gmail.com",
            first_name: "test",
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("OK");
    });

    test("InputValidation - missing username", async () => {
        const response = await request(app).post(registerApiRoute).send({
            password: "test",
            email: "test@test.com",
            first_name: "test",
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe(stringRequired("Username"));
    });

    test("InputValidation - short username", async () => {
        const response = await request(app).post(registerApiRoute).send({
            username: "te",
            password: "test",
            email: "test@test.com",
            first_name: "test",
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe(stringMinLen("Username", 3));
    });

    test("InputValidation - invalid username", async () => {
        const response = await request(app).post(registerApiRoute).send({
            username: "test@",
            password: "test",
            email: "test@test.com",
            first_name: "test",
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe(stringMustBeAlphaNum("Username"));
    });
});

// describe("Middleware - AuthMiddleware", () => {
//     beforeAll(() => {
//         app.use(express.json());
//         // AuthMiddleware's causing the test server to hang & throw TCPSERVERWRAP|TCPWRAP
//         app.get(authApiRoute, AuthMiddleware, (req, res) => {
//             res.status(200).json({ message: "OK" });
//         });
//         app.use(GlobalErrorHandler);
//     });

//     test("AuthMiddleware", async (done) => {
//         request(app)
//             .get(authApiRoute)
//             .then((response) => {
//                 expect(response.statusCode).toBe(401);
//                 expect(response.body.message).toBe("Missing access token");
//                 done();
//             })
//             .catch((err) => {
//                 console.error(err);
//                 done();
//             });
//         const response = await request(app).get(authApiRoute);
//         expect(response.statusCode).toBe(401);
//         expect(response.body.message).toBe("Missing access token");
//         done();
//     });
// });
