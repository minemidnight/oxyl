global.Promise = require("bluebird");
global.cluster = require("cluster");
require("./misc/logger.js");
if(cluster.isMaster) require("./master.js");
else require("./worker.js");
