module.exports = string => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&", "g");
