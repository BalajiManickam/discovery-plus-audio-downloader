const config = require("./config.json");
const axios = require("axios");
const fs = require("fs");

// Form full files
function formAllFiles() {
  const promiseCalls = [[]];
  const fileLocations = [[]];
  var j = 1; // To split chuck files
  for (var i = 1; i <= config.LAST_FILE; i++) {
    const fileName = `audio-${i}`;
    const url = `${config.URL}/${fileName}.aac`;
    const api = axios({
      method: "get",
      url,
      responseType: "stream",
    });
    if (j <= 10) {
      j++;
    } else {
      j = 1;
      promiseCalls.push([]);
      fileLocations.push([]);
    }
    promiseCalls[promiseCalls.length - 1].push(api);
    fileLocations[fileLocations.length - 1].push(fileName);
  }
  return {
    promiseCalls,
    fileLocations,
  };
}

// Receive full audios
async function bulkAudioCall({ promiseCalls, fileLocations }) {
  fs.mkdir("./temp", { recursive: true }, (err) => {
    if (err) throw err;
  });
  try {
    promiseCalls.map(async (api, i) => {
      try {
        const results = await Promise.all(api);
        results.forEach((r, j) => {
          r.data.pipe(fs.createWriteStream(`temp/${fileLocations[i][j]}.aac`));
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
  await bulkAudioCall(files);
};

start();
