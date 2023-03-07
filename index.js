"use strict";

var sequence = require("when/sequence");
// global.config = require("./config");
global.errorLogger = require("./utils/logger.js")("error").error;
global.successLogger = require("./utils/logger.js")("success").log;
global.warnLogger = require("./utils/logger.js")("warn").log;

var modulesList = ["contenttype", "globalfields", "card", "quotes", "premium"];

var _export = [];
global.filePath = undefined;

// Module List for Entries
for (var i = 0, total = modulesList.length; i < total; i++) {
  var ModuleExport = require("./libs/" + modulesList[i] + ".js");
  var moduleExport = new ModuleExport();
  _export.push(
    (function (moduleExport) {
      return function () {
        return moduleExport.start();
      };
    })(moduleExport)
  );
}

var taskResults = sequence(_export);

taskResults
  .then(async function (results) {
    successLogger(
      "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nData exporting has been completed"
    );
  })
  .catch(function (error) {
    errorLogger(error);
  });
