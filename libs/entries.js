/**
 * External module Dependencies.
 */

var mkdirp = require("mkdirp"),
  path = require("path"),
  fs = require("fs"),
  when = require("when");

const { JSDOM } = require("jsdom");
const { htmlToJson } = require("@contentstack/json-rte-serializer");

/**
 * Internal module Dependencies .
 */

var helper = require("../../../../util/helper.js");

var entryFolderPath = path.join(
  process.cwd(),
  "tridionMigrationData",
  "entries",
  "phil_product_training"
);

if (!fs.existsSync(entryFolderPath)) {
  mkdirp.sync(entryFolderPath);
  helper.writeFile(path.join(entryFolderPath, "en-us.json"));
} else {
  helper.writeFile(path.join(entryFolderPath, "en-us.json"));
}

function ExtractEntries() {}

ExtractEntries.prototype = {
  featuredImageMapping: function (entryid, entry, englishEntryDetails) {
    var assetsId = helper.readFile(
      path.join(process.cwd(), "tridionMigrationData/assets/english.json")
    );
    var assetName = `english_kaust_${entry.ID}`;

    Object.keys(assetsId).forEach((key) => {
      if (assetName === key) {
        englishEntryDetails[entryid]["publishingpageimage"] = assetsId[key];
      }
    });
  },
  saveEntry: function (entries) {
    console.log(entries.Content);
    var self = this;
    return when.promise(function (resolve, reject) {
      var englishEntryDetails = helper.readFile(
        path.join(entryFolderPath, "en-us.json")
      );
      var uid = entries.Title.toLowerCase().replace(/ /g, "_");
      //   console.log(uid);
      // for HTML RTE to JSON RTE convert
      const dom = new JSDOM(
        "<p> A magical snow globe, light-up aquarium, and lots of motion keep baby entertained! Music, lights and sounds play when baby bats the blue whale. You can switch to the long-play setting for up to 20 minutes of music, lights and motion, or keep things quieter with nature sounds alone. And when it’s time for rest, the toy bar removes and calming vibrations help baby relax in the comfort of a large, cushy seat <br /><br />Weight Limit: 25 lbs. (11.3 kg)<br /><br /><strong>Developmental Guidelines:</strong><br />Use from birth until baby is able to sit upright unassisted.br /><br /><strong>Better for Baby...</strong><br /><br /><em>Promotes Comfort and Security:</em><br /></p><ul><li>Calming vibrations, deluxe seat and gentle bouncing motion soothe baby.</li><li style='list-style: none'><br /><br /><em>Encourages Developing Motor Skills:</em><br /></li><li>Enhances eye-hand coordination with hanging toys to reach, bat and grasp.</li><li style='list-style: none'><br />								<br />								<em>Stimulates the Senses</em>								<br />							</li>							<li>Listening to music and sounds stimulates auditory sense.</li>							<li>Colorful animals, lights and moving activities foster visual development.								<br />								<br />								<strong>Better for Mom...</strong><br /><br /></li><li>Removable toy bar offers easy access to baby.</li><li>Machine-washable seat pad.</li></ul>"
      );
      let htmlDoc = dom.window.document.querySelector("body");
      const jsonValue = htmlToJson(htmlDoc);
      const event = new Date(entries?.Content?.Content?.date);
      //   console.log(event.toISOString());
      englishEntryDetails[uid] = {
        locale: "en-us",
        _version: 1,
        _in_progress: false,
        uid: uid,
        url: `/tridion/${uid}`,
        title: entries?.Content?.Content?.title,
        description: jsonValue,
        date: event.toISOString(),
        image: "",
      };
      //   console.log(englishEntryDetails);
      helper.writeFile(
        path.join(entryFolderPath, "en-us.json"),
        JSON.stringify(englishEntryDetails, null, 4)
      );
      successLogger(`exported entry successfully in english language`);
      resolve();
    });
  },
  getAllEntries: function () {
    var self = this;
    return when.promise(function (resolve, reject) {
      var alldata = helper.readFile(
        "/Users/saurav.upadhyay/Expert Service/Team Fury/migration-Tridion/premium.json"
      );
      var entriesData = alldata.Item.Data;
      if (entriesData) {
        // console.log(entriesData);
        if (!filePath) {
          self
            .saveEntry(entriesData)
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

module.exports = ExtractEntries;

//https://xyproblem.info/ xyproblem
