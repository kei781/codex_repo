function safeJsonParse(maybeJsonText, fallbackValue = null) {
  try {
    return JSON.parse(maybeJsonText);
  } catch (error) {
    return fallbackValue;
  }
}

module.exports = {
  safeJsonParse,
};
