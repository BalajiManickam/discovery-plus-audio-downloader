const config = require("./config.json");
const fs = require("fs");
const audioconcat = require("audioconcat");

// Convert all audios to single audio file
function convertAllToOne() {
  const files = [];
  for (var i = 1; i <= config.LAST_FILE; i++) {
    files.push(`temp/audio-${i}.aac`);
  }
  audioconcat(files)
    .concat(`${config.OUTPUT_FILE_NAME}.aac`)
    .on("start", function (command) {
      console.log("ffmpeg process started:", command);
    })
    .on("error", function (err, stdout, stderr) {
      console.error("Error:", err);
      console.error("ffmpeg stderr:", stderr);
    })
    .on("end", function (output) {
      fs.rmSync("temp", { recursive: true, force: true });
      console.error("Audio created in:", output);
    });
}

convertAllToOne();
