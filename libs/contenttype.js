/**
 * External module Dependencies.
 */
var mkdirp = require("mkdirp"),
  path = require("path"),
  fs = require("fs");

/**
 * Internal module Dependencies .
 */

var contentTypeFolderPath =
  path.resolve(process.cwd(), "tridionMigrationData", "content_types") || {};
/**
 * Create folders and files if they are not created
 */

if (!fs.existsSync(contentTypeFolderPath)) {
  mkdirp.sync(contentTypeFolderPath);
}

const sourceFolder =
  "/Users/saurav.upadhyay/Expert Service/Team Fury/migration-Tridion/utils/content_types";

function ExtractAuthors() {
  successLogger(`export of content-type completed`);
}

ExtractAuthors.prototype = {
  start: function () {
    // read the files in the source folder
    fs.readdir(sourceFolder, (err, files) => {
      if (err) throw err;

      // loop through the files and copy them to the destination folder
      files.forEach((file) => {
        const sourcePath = path.join(
          "/Users/saurav.upadhyay/Expert Service/Team Fury/migration-Tridion/utils/content_types",
          file
        );
        const destinationPath = path.join(contentTypeFolderPath, file);

        // copy the file
        fs.copyFileSync(sourcePath, destinationPath);
      });
    });
  },
};

module.exports = ExtractAuthors;
