const config = require("./config.json");
const fs = require("fs");
const audioconcat = require("audioconcat");
const { exec } = require("child_process");

// Convert all audios to single audio file
function convertAllToOne() {
  const audioFiles = [];
  const videoFile = fs.createWriteStream(`${config.OUTPUT_FILE_NAME}.txt`);

  for (var i = 1; i <= config.LAST_FILE; i++) {
    videoFile.write(
      `file 'file:D:/Projects/discovery-plus-audio-downloader/temp/video/video-${i}.mp4'\n`
    );
    audioFiles.push(`temp/audio/audio-${i}.aac`);
  }

  const isAudioExist = fs.existsSync(`temp/audio`);
  // if (isAudioExist) {
  if (false) {
    fs.unlinkSync(`${config.OUTPUT_FILE_NAME}.aac`);
    audioconcat(audioFiles)
      .concat(`${config.OUTPUT_FILE_NAME}.aac`)
      .on("start", function (command) {
        console.log("ffmpeg process started:", command);
      })
      .on("error", function (err, stdout, stderr) {
        console.error("Error:", err);
        console.error("ffmpeg stderr:", stderr);
      })
      .on("end", function (output) {
        fs.rmSync("temp/audio", { recursive: true, force: true });
        console.error("Audio created in:", output);
      });
  }

  const isvideoExist = fs.existsSync(`temp/video`);
  if (isvideoExist) {
    try {
      fs.unlinkSync(`${config.OUTPUT_FILE_NAME}.mp4`);
    } catch (err) {}
    const cmd = `ffmpeg -f concat -safe 0 -i ${config.OUTPUT_FILE_NAME}.txt -c copy ${config.OUTPUT_FILE_NAME}.mp4`;
    console.log(cmd);
    // exec(cmd, function (err, stdout, stderr) {
    //   console.log(stdout);
    //   if (err) console.log(err);
    //   else {
    //     // fs.unlinkSync(`${config.OUTPUT_FILE_NAME}.txt`);
    //     // fs.rmSync("temp/video", { recursive: true, force: true });
    //     console.log("Video created!");
    //   }
    // });
  }
}

convertAllToOne();
