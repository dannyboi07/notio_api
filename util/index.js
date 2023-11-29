/**
 * @param {any} value
 * @returns {[number, boolean]}
 */
function parseInteger(value) {
    const parsed = parseInt(value, 10);
    return [parsed, isNaN(parsed) && parsed.toString() === value];
}

export { parseInteger };
