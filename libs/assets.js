var mkdirp = require("mkdirp"),
  path = require("path"),
  fs = require("fs"),
  guard = require("when/guard"),
  parallel = require("when/parallel"),
  when = require("when"),
  axios = require("axios");
const request = require("request");

// fileTypeFromStream = require("file-type");

var helper = require("../utils/helper");

var assetFolderPath = path.resolve(
    process.cwd(),
    "tridionMigrationData",
    "assets"
  ),
  assetMasterFolderPath = path.resolve(process.cwd(), "logs", "assets"),
  failedJSON =
    helper.readFile(path.join(assetMasterFolderPath, "tridion_failed.json")) ||
    {};

if (!fs.existsSync(assetFolderPath)) {
  mkdirp.sync(assetFolderPath);
  helper.writeFile(path.join(assetFolderPath, "assets.json"));
  mkdirp.sync(assetMasterFolderPath);
  helper.writeFile(path.join(assetMasterFolderPath, "tridion_failed.json"));
  helper.writeFile(path.join(assetMasterFolderPath, "url_master.json"));
  if (!fs.existsSync(path.join("tridionMigrationData", "data.json"))) {
    helper.writeFile(path.join("tridionMigrationData", "data.json"));
  }
}

//Reading a File
var assetData = helper.readFile(path.join(assetFolderPath, "assets.json"));
var assetMapping = helper.readFile(
  path.join(assetMasterFolderPath, "tridion_failed.json")
);
var assetURLMapping = helper.readFile(
  path.join(assetMasterFolderPath, "url_master.json")
);

function ExtractAssets() {}

ExtractAssets.prototype = {
  saveAsset: function (entries, retryCount) {
    var self = this;
    return when.promise(function (resolve, reject) {
      entries.sections.map(async (entry) => {
        // console.log(entry);
        var url = entry?.data?.image?.url;
        var name = entry?.data?.image?.alt
          .toLowerCase()
          .replace(/ /g, "_")
          .replace(/[^\w\s]/gi, "_");

        if (url !== undefined || name !== undefined) {
          var assetId = url
            .toLowerCase()
            .replace(/ /g, "_")
            .replace(/[^\w\s]/gi, "_");

          if (fs.existsSync(path.resolve(assetFolderPath, assetId))) {
            successLogger("asset already present " + "'" + assetId + "'");
            resolve(assetId);
          } else {
            try {
              function getFileTypeFromUrl(url) {
                return new Promise((resolve, reject) => {
                  request.head(url, (err, res) => {
                    try {
                      console.log("hey url");
                      const contentType = res.headers["content-type"];
                      const fileType = contentType.split("/")[1];
                      resolve(fileType);
                    } catch (err) {
                      console.log("error", err);
                      reject(err);
                    }
                  });
                });
              }
              getFileTypeFromUrl(url) // returns 'jpeg'
                .then((fileType) => console.log(fileType))
                .catch((err) => console.error(err));

              const response = await axios.get(url, {
                responseType: "arraybuffer",
              });
              mkdirp.sync(path.resolve(assetFolderPath, assetId));
              fs.writeFileSync(
                path.join(assetFolderPath, assetId, name),
                response.data
              );

              var stats = fs.lstatSync(path.join(assetFolderPath, assetId));
              // console.log(stats);
              assetData[assetId] = {
                uid: assetId,
                urlPath: `/assets/${assetId}`,
                status: true,
                file_size: `${stats.size}`,
                tag: "",
                filename: name,
                url: url,
                ACL: {
                  roles: [],
                  others: {
                    read: false,
                    create: false,
                    update: false,
                    delete: false,
                    sub_acl: {
                      read: false,
                      create: false,
                      update: false,
                      delete: false,
                      publish: false,
                    },
                  },
                },
                is_dir: false,
                parent_uid: null,
                _version: 1,
                title: name,
                // description: description,
                publish_details: [],
              };
              // to create JSON file of assets in same folder where it is downloaded
              const assetVersionInfoFile = path.resolve(
                assetFolderPath,
                assetId,
                `_contentstack_${assetId}.json`
              );
              //writing the json object in same created json file
              helper.writeFile(
                assetVersionInfoFile,
                JSON.stringify(assetData[assetId], null, 4)
              );
              assetMapping[assetId] = "";
              assetURLMapping[url] = "";
              if (failedJSON[assetId]) {
                delete failedJSON[assetId];
              }
              helper.writeFile(
                path.join(assetFolderPath),
                JSON.stringify(assetData, null, 4)
              );
              resolve(assetId);
            } catch (err) {
              failedJSON[assetId] = err;
              if (retryCount == 1) {
                failedJSON[assetId] = {
                  failedUid: assetId,
                  name: name,
                  url: url,
                  reason_for_error: err,
                };
                helper.writeFile(
                  path.join(assetMasterFolderPath, "tridion_failed.json"),
                  JSON.stringify(failedJSON, null, 4)
                ),
                  resolve(assetId);
              } else {
                self.saveAsset(entries, 1).then(function (results) {
                  resolve(assetId);
                });
              }
            }
          }
        }
      });
    });
  },
  getAsset: function (attachments) {
    var self = this;
    return when.promise(function (resolve, reject) {
      var _getAsset = [];
      for (var i = 0, total = attachments.length; i < total; i++) {
        // console.log(attachments);
        _getAsset.push(
          (function (data) {
            // console.log(data);
            return function () {
              return self.saveAsset(data, 0);
            };
          })(attachments[i])
        );
      }
      //bind the json object which we got from saveAssets in one Object
      var guardTask = guard.bind(null, guard.n(5));
      _getAsset = _getAsset.map(guardTask);
      var taskResults = parallel(_getAsset);
      taskResults
        .then(function (results) {
          helper.writeFile(
            path.join(assetFolderPath),
            JSON.stringify(assetData, null, 4)
          );
          helper.writeFile(
            path.join(assetMasterFolderPath),
            JSON.stringify(assetMapping, null, 4)
          );
          helper.writeFile(
            path.join(assetMasterFolderPath, "url_master.json"),
            JSON.stringify(assetURLMapping, null, 4)
          );
          helper.writeFile(
            path.join(assetMasterFolderPath, "tridion_failed.json"),
            JSON.stringify(failedJSON, null, 4)
          );
          resolve(results);
        })
        .catch(function (e) {
          console.log("failed to download assets: ", e);
          resolve();
        });
    });
  },
  getAllEntries: function () {
    var self = this;
    return when.promise(function (resolve, reject) {
      var allPremium = helper.readFile(
        "/Users/saurav.upadhyay/Expert Service/Team Fury/migration-Tridion/premium.json"
      );

      var entriesPremiumContent = allPremium.data.content;

      if (entriesPremiumContent) {
        if (entriesPremiumContent.length > 0) {
          if (!filePath) {
            self
              .getAsset(entriesPremiumContent)
              .then(function () {
                resolve();
              })
              .catch(function () {
                reject();
              });
          }
        } else {
          console.log("no assets found");
          resolve();
        }
      } else {
        console.log("no assets found");
        resolve();
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

module.exports = ExtractAssets;
