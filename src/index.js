global.Promise = require("bluebird");
global.cluster = require("cluster");
global.statsd = require("./modules/datadog.js");
require("./modules/logger.js");
if(cluster.isMaster) require("./master.js");
else require("./worker.js");
