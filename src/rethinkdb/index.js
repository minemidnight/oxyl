const cluster = require("cluster");
const { database } = require("../../config");
const rethinkdbdash = require("rethinkdbdash");
const r = rethinkdbdash(Object.assign(database, { silent: true })); // eslint-disable-line id-length

if(cluster.isMaster) module.exports = require("./setup")(r);
else module.exports = require("./main")(r);
