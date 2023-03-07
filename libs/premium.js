var mkdirp = require("mkdirp"),
  path = require("path"),
  fs = require("fs"),
  when = require("when");

var helper = require("../utils/helper");

var entryFolderPath = path.join(
  process.cwd(),
  "tridionMigrationData",
  "entries",
  "premium"
);

if (!fs.existsSync(entryFolderPath)) {
  mkdirp.sync(entryFolderPath);
  helper.writeFile(path.join(entryFolderPath, "en-us.json"));
} else {
  helper.writeFile(path.join(entryFolderPath, "en-us.json"));
}

var premiumTitle = "";
var premiumDescription = "";
var premiumUid = "";
var premiumImage = "";
var demoNotification = "";
var readMoreArray = [];
var blockArray = [];

function ExtractPremium() {}

ExtractPremium.prototype = {
  featuredImageMapping: function (entryid, entry, englishEntryDetails) {
    var assetsId = helper.readFile(
      "/Users/saurav.upadhyay/Expert Service/Team Fury/migration-Tridion/premium.json"
    );

    var assetName =
      englishEntryDetails?.travelling_in_premium_comfort_class?.image;

    Object.keys(assetsId).forEach((key) => {
      if (assetName === key) {
        englishEntryDetails[entryid]["image"] = assetsId[key];
      }
    });
  },

  saveEntry: function (entriesContent) {
    var self = this;
    return when.promise(function (resolve, reject) {
      var englishEntryDetails = helper.readFile(
        path.join(entryFolderPath, "en-us.json")
      );

      entriesContent.map((entries) => {
        const block = [];
        const readMore = [];

        entries?.sections.map((entry) => {
          if (entry.type === "title" && entry.value.startsWith("Travelling")) {
            premiumUid = `${entry.value
              .toLowerCase()
              .replace(/ /g, "_")
              .replace(/[^\w\s]/gi, "_")}`;
            premiumTitle = entry.value;
          }
          if (entry.type === "description") {
            premiumDescription = entry.value;
          }
          if (entry.type === "herobanner") {
            premiumImage = entry?.data?.image?.url
              .toLowerCase()
              .replace(/ /g, "_")
              .replace(/[^\w\s]/gi, "_");
          }
          if (entry.type === "notification") {
            demoNotification = {
              title: entry?.data?.title,
              description: entry?.data?.text,
            };
          }
          switch (entry.type) {
            case "card":
              block.push({
                uid: `${entry.data.title
                  .toLowerCase()
                  .replace(/ /g, "_")
                  .replace(/[^\w\s]/gi, "_")}_${entry?.data?.variant
                  .toLowerCase()
                  .replace(/ /g, "_")
                  .replace(/[^\w\s]/gi, "_")}`,
                _content_type_uid: "card",
              });
              break;
            case "quote":
              block.push({
                uid: `${entry.data.title
                  .toLowerCase()
                  .replace(/ /g, "_")
                  .replace(/[^\w\s]/gi, "_")}`,
                _content_type_uid: "quotes",
              });
              break;
          }

          if (entry?.subSections !== undefined) {
            entry?.subSections.map((read) => {
              if (read.type === "card") {
                readMore.push({
                  uid: `${read.data.title
                    .toLowerCase()
                    .replace(/ /g, "_")
                    .replace(/[^\w\s]/gi, "_")}`,
                  _content_type_uid: "card",
                });
              }
            });
          }

          const blockArray = [];
          if (readMore.length > 0) {
            readMoreArray.push(...readMore);
          }
          if (block.length > 0) {
            blockArray.push(...block);
            if (premiumUid) {
              englishEntryDetails[premiumUid] = {
                uid: premiumUid,
                title: premiumTitle,
                description: premiumDescription,
                notification: demoNotification,
                block: blockArray,
                read_more: readMoreArray,
                // image: premiumImage,
              };
            }
          }
        });
      });
      helper.writeFile(
        path.join(entryFolderPath, "en-us.json"),
        JSON.stringify(englishEntryDetails, null, 4)
      );
      successLogger(`exported entry successfully of premium`);
      resolve();
    });
  },
  getAllEntries: function () {
    var self = this;
    return when.promise(function (resolve, reject) {
      var allPremium = helper.readFile(
        "/Users/saurav.upadhyay/Expert Service/Team Fury/csmig 9.55.23 PM/tridion/premium.json"
      );
      var entriesContent = allPremium.data.content;

      if (entriesContent) {
        if (!filePath) {
          self
            .saveEntry(entriesContent)
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
