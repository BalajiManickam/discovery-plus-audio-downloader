const config = require("./config.json");
const axios = require("axios");
const fs = require("fs");

// Form full files
function formAllFiles() {
  const video = {
    apiCalls: [[]],
    fileLocations: [[]],
  };
  const audio = {
    apiCalls: [[]],
    fileLocations: [[]],
  };

  // To split chuck files
  var audioCount = 1;
  var videoCount = 1;

  for (var i = 1; i <= config.LAST_FILE; i++) {
    const videoFileName = `video-${i}`;
    const isVideoNotExist = !fs.existsSync(`temp/video/${videoFileName}.mp4`);
    if (isVideoNotExist) {
      console.log(`temp/video/${videoFileName}`);
      const videoURL = `${config.VIDEO_URL}/${videoFileName}.ts`;
      const videoApi = axios({
        method: "get",
        url: videoURL,
        responseType: "stream",
      });

      if (videoCount <= 10) {
        videoCount++;
      } else {
        videoCount = 1;
        video.apiCalls.push([]);
        video.fileLocations.push([]);
      }

      video.apiCalls[video.apiCalls.length - 1].push(videoApi);
      video.fileLocations[video.fileLocations.length - 1].push(videoFileName);
    }

    const audioFileName = `audio-${i}`;
    const isAudioNotExist = !fs.existsSync(`temp/audio/${audioFileName}.aac`);
    if (isAudioNotExist) {
      console.log(`temp/audio/${audioFileName}`);
      const audioURL = `${config.AUDIO_URL}/${audioFileName}.aac`;
      const audioApi = axios({
        method: "get",
        url: audioURL,
        responseType: "stream",
      });

      if (audioCount <= 10) {
        audioCount++;
      } else {
        audioCount = 1;
        audio.apiCalls.push([]);
        audio.fileLocations.push([]);
      }

      audio.apiCalls[audio.apiCalls.length - 1].push(audioApi);
      audio.fileLocations[audio.fileLocations.length - 1].push(audioFileName);
    }
  }

  return {
    video,
    audio,
  };
}

// Receive full audios
async function bulkCall({ video, audio }) {
  fs.mkdir("./temp/video", { recursive: true }, (err) => {
    if (err) throw err;
  });
  fs.mkdir("./temp/audio", { recursive: true }, (err) => {
    if (err) throw err;
  });
  try {
    video.apiCalls.map(async (api, i) => {
      try {
        const results = await Promise.all(api);
        results.forEach((r, j) => {
          r.data.pipe(
            fs.createWriteStream(
              `temp/video/${video.fileLocations[i][j]}.mp4`,
              {
                encoding: "utf-8",
              }
            )
          );
        });
      } catch (err) {
        return console.error(err);
      }
    });

    audio.apiCalls.map(async (api, i) => {
      try {
        const results = await Promise.all(api);
        results.forEach((r, j) => {
          r.data.pipe(
            fs.createWriteStream(`temp/audio/${audio.fileLocations[i][j]}.aac`)
          );
        });
      } catch (err) {
        return console.error(err);
      }
    });
  } catch (err) {
    return console.error(err);
  }
}

const start = async () => {
  const files = formAllFiles();
  bulkCall(files);
};

start();
