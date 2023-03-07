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
  path.resolve(process.cwd(), "tridionMigrationData", "global_fields") || {};
/**
 * Create folders and files if they are not created
 */

if (!fs.existsSync(contentTypeFolderPath)) {
  mkdirp.sync(contentTypeFolderPath);
}

const sourceFolder =
  "/Users/saurav.upadhyay/Expert Service/Team Fury/migration-Tridion/utils/global_fields";

function ExtractAuthors() {
  successLogger(`export of global-fields completed`);
}

ExtractAuthors.prototype = {
  start: function () {
    // read the files in the source folder
    fs.readdir(sourceFolder, (err, files) => {
      if (err) throw err;

      // loop through the files and copy them to the destination folder
      files.forEach((file) => {
        const sourcePath = path.join(
          "/Users/saurav.upadhyay/Expert Service/Team Fury/migration-Tridion/utils/global_fields",
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
