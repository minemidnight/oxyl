global.Promise = require("bluebird");
global.cluster = require("cluster");
global.statsd = require("./misc/datadog.js");
require("./misc/logger.js");
if(cluster.isMaster) require("./master.js");
else require("./worker.js");
