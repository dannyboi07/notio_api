// generator functions for Joi schema error messages

const getStringRequired = (fieldName) => `${fieldName} is required`;
const getStringEmpty = (fieldName) => `${fieldName} cannot be empty`;
const getStringMinLen = (fieldName) =>
    `${fieldName} must have a minimum length of {#limit} characters`;
const getStringMaxLen = (fieldName) =>
    `${fieldName} can have a maximum of {#limit} characters`;
const getStringMustBeAlphaNum = (fieldName) =>
    `${fieldName} must only contain alpha-numeric characters`;

module.exports = {
    getStringRequired,
    getStringEmpty,
    getStringMinLen,
    getStringMaxLen,
    getStringMustBeAlphaNum,
};
