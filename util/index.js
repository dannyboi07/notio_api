/**
 * @param {any} value
 * @returns {[number | null, boolean]}
 */
function parseInteger(value) {
    const parsed = parseInt(value, 10);
    const isValid = !isNaN(parsed) && parsed.toString() === value;
    return [isValid ? parsed : null, isValid];
}

module.exports = { parseInteger };
