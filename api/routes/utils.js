/**
 * Sanitizes values to ensure they are safe for SQL queries.
 * Converts `undefined` or an empty string `''` to `null`.
 * Handles both single values and arrays of values.
 * @param {any|Array<any>} values - The value or array of values to sanitize.
 * @returns {any|Array<any>} The sanitized value or array.
 */
const sanitize = (values) => {
  if (!Array.isArray(values)) {
    return (values === undefined || values === '') ? null : values;
  }
  return values.map(val => (val === undefined || val === '' ? null : val));
};

module.exports = {
  sanitize,
};