const { describe, expect, test } = require("@jest/globals");
const { parseInteger } = require(".");

describe("parseInteger(num)", () => {
    test("should return parsed integer and false if value is integer", () => {
        const [parsed, isValid] = parseInteger("123");
        expect(parsed).toBe(123);
        expect(isValid).toBe(true);
    });

    test("should return parsed integer and true if value is not integer (1)", () => {
        const [parsed, isValid] = parseInteger("123.123");
        expect(parsed).toBe(null);
        expect(isValid).toBe(false);
    });

	test("should return parsed integer and true if value is not integer (2)", () => {
        const [parsed, isValid] = parseInteger("123abc");
        expect(parsed).toBe(null);
        expect(isValid).toBe(false);
    });

	test("should return parsed integer and true if value is not integer (3)", () => {
        const [parsed, isValid] = parseInteger("abc123");
        expect(parsed).toBe(null);
        expect(isValid).toBe(false);
    });
});
