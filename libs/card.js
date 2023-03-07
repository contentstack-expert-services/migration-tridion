var mkdirp = require("mkdirp"),
  path = require("path"),
  fs = require("fs"),
  when = require("when");

var helper = require("../utils/helper.js");

var entryFolderPath = path.join(
  process.cwd(),
  "tridionMigrationData",
  "entries",
  "card"
);

if (!fs.existsSync(entryFolderPath)) {
  mkdirp.sync(entryFolderPath);
  helper.writeFile(path.join(entryFolderPath, "en-us.json"));
} else {
  helper.writeFile(path.join(entryFolderPath, "en-us.json"));
}

function ExtractPremium() {}

ExtractPremium.prototype = {
  featuredImageMapping: function (entryid, entry, englishEntryDetails) {
    var assetsId = helper.readFile(
      "/Users/saurav.upadhyay/Expert Service/Team Fury/migration-Tridion/premium.json"
    );
    var assetName = entry?.data?.image?.url
      .toLowerCase()
      .replace(/ /g, "_")
      .replace(/[^\w\s]/gi, "_");

    Object.keys(assetsId).forEach((key) => {
      if (assetName === key) {
        englishEntryDetails[entryid]["image"] = assetsId[key];
      }
    });
  },
  saveEntry: function (entriesPremiumContent) {
    var self = this;
    return when.promise(function (resolve, reject) {
      var cardEntryDetails = helper.readFile(
        path.join(entryFolderPath, "en-us.json")
      );

      entriesPremiumContent.map((entries) => {
        entries?.sections.map((entry) => {
          if (entry.type === "card") {
            var uid = `${entry.data.title
              .toLowerCase()
              .replace(/ /g, "_")
              .replace(/[^\w\s]/gi, "_")}_${entry?.data?.variant
              .toLowerCase()
              .replace(/ /g, "_")
              .replace(/[^\w\s]/gi, "_")}`;
            cardEntryDetails[uid] = {
              locale: "en-us",
              uid: uid,
              title: `${entry.data.title} - ${entry?.data?.variant}`,
              description: entry?.value ?? "",
              link: {
                href: entry?.data?.link?.url ?? "",
                title: entry?.data?.link?.text ?? "",
              },
            };
            self.featuredImageMapping(uid, entry, cardEntryDetails);
          } else {
            if (entry?.subSections !== undefined)
              entry?.subSections.map((subEntry) => {
                var uid = `${subEntry.data.title
                  .toLowerCase()
                  .replace(/ /g, "_")
                  .replace(/[^\w\s]/gi, "_")}`;
                cardEntryDetails[uid] = {
                  locale: "en-us",
                  uid: uid,
                  title: `${subEntry.data.title}`,
                  description: subEntry?.value ?? "",
                  link: {
                    href: subEntry?.data?.link?.url ?? "",
                    title: subEntry?.data?.link?.eventValue ?? "",
                  },
                };
                self.featuredImageMapping(uid, subEntry, cardEntryDetails);
              });
          }
        });
      });

      helper.writeFile(
        path.join(entryFolderPath, "en-us.json"),
        JSON.stringify(cardEntryDetails, null, 4)
      );
      successLogger(`exported entry successfully of card`);
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
