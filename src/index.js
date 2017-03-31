global.cluster = require("cluster");
console.log("hello world");
if(cluster.isMaster()) require("./master.js");
else require("./worker.js");
