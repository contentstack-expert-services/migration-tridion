var mkdirp = require("mkdirp"),
  path = require("path"),
  fs = require("fs"),
  when = require("when");

var helper = require("../utils/helper.js");

var entryFolderPath = path.join(
  process.cwd(),
  "tridionMigrationData",
  "entries",
  "quotes"
);

if (!fs.existsSync(entryFolderPath)) {
  mkdirp.sync(entryFolderPath);
  helper.writeFile(path.join(entryFolderPath, "en-us.json"));
} else {
  helper.writeFile(path.join(entryFolderPath, "en-us.json"));
}

function ExtractPremium() {}

ExtractPremium.prototype = {
  saveEntry: function (entriesPremiumContent) {
    var self = this;
    return when.promise(function (resolve, reject) {
      var cardEntryDetails = helper.readFile(
        path.join(entryFolderPath, "en-us.json")
      );

      entriesPremiumContent.map((entries) => {
        entries?.sections.map((entry) => {
          if (entry.type === "quote") {
            var uid = `${entry.data.title
              .toLowerCase()
              .replace(/ /g, "_")
              .replace(/[^\w\s]/gi, "_")}`;
            cardEntryDetails[uid] = {
              locale: "en-us",
              uid: uid,
              title: `${entry.data.title}`,
            };
          }
        });
      });

      helper.writeFile(
        path.join(entryFolderPath, "en-us.json"),
        JSON.stringify(cardEntryDetails, null, 4)
      );
      successLogger(`exported entry successfully of quotes`);
      resolve();
    });
  },
  getAllEntries: function () {
    var self = this;
    return when.promise(function (resolve, reject) {
      var allPremium = helper.readFile(
        "/Users/saurav.upadhyay/Expert Service/Team Fury/csmig 9.55.23 PM/tridion/premium.json"
      );

      var entriesPremiumContent = allPremium.data.content;

      if (entriesPremiumContent) {
        if (!filePath) {
          self
            .saveEntry(entriesPremiumContent)
            .then(function () {
              resolve();
            })
            .catch(function () {
              reject();
            });
        }
      }
    });
  },
  start: function () {
    var self = this;
    return when.promise(function (resolve, reject) {
      self
        .getAllEntries()
        .then(function () {
          resolve();
        })
        .catch(function () {
          reject();
        });
    });
  },
};

module.exports = ExtractPremium;
