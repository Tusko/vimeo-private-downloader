const fs = require("fs");
const url = require("url");
const https = require("https");
const log = (...args) => console.log("→", ...args);
const list = require("./videojson.js");
const promises = [];

list.forEach((el, i) => {
  if (!el.name && !el.url) return;

  promises.push(loadVideo(i));
});

Promise.all(promises).then(function(values) {
  log("🌈", ` List finished`);
});

function loadVideo(num) {
  let masterUrl = list[num].url;
  if (!masterUrl.endsWith("?base64_init=1")) {
    masterUrl += "?base64_init=1";
  }

  return new Promise(resolve => {
    getJson(masterUrl, (err, json) => {
      if (err) {
        log("⚠️", ` ${err}`);
      }

      const videoData = json.video
        .sort((v1, v2) => v1.avg_bitrate - v2.avg_bitrate)
        .pop();
      const audioData = json.audio
        .sort((a1, a2) => a1.avg_bitrate - a2.avg_bitrate)
        .pop();

      const videoBaseUrl = url.resolve(
        url.resolve(masterUrl, json.base_url),
        videoData.base_url
      );
      const audioBaseUrl = url.resolve(
        url.resolve(masterUrl, json.base_url),
        audioData.base_url
      );

      processFile(
        "video",
        videoBaseUrl,
        videoData.init_segment,
        videoData.segments,
        list[num].name + ".m4v",
        err => {
          if (err) {
            log("⚠️", ` ${err}`);
          }

          processFile(
            "audio",
            audioBaseUrl,
            audioData.init_segment,
            audioData.segments,
            list[num].name + ".m4a",
            err => {
              if (err) {
                log("⚠️", ` ${err}`);
              }

              resolve(num + 1);
            }
          );
        }
      );
    });
  });
}

function processFile(type, baseUrl, initData, segments, filename, cb) {
  if (fs.existsSync(filename)) {
    log("⚠️", ` ${filename} - ${type} already exists`);
    cb();
  }

  const segmentsUrl = segments.map(seg => baseUrl + seg.url);

  const initBuffer = Buffer.from(initData, "base64");
  fs.writeFileSync(filename, initBuffer);

  const output = fs.createWriteStream(filename, {
    flags: "a"
  });

  combineSegments(type, 0, segmentsUrl, output, filename, err => {
    if (err) {
      log("⚠️", ` ${err}`);
    }

    output.end();
    cb();
  });
}

function combineSegments(type, i, segmentsUrl, output, filename, cb) {
  if (i >= segmentsUrl.length) {
    log("🏁", ` ${filename} - ${type} done`);
    return cb();
  }

  log(
    "📦",
    type === "video" ? "📹" : "🎧",
    `Downloading ${type} segment ${i}/${segmentsUrl.length} of ${filename}`
  );

  https
    .get(segmentsUrl[i], res => {
      res.on("data", d => output.write(d));

      res.on("end", () =>
        combineSegments(type, i + 1, segmentsUrl, output, filename, cb)
      );
    })
    .on("error", e => {
      cb(e);
    });
}

function getJson(url, cb) {
  let data = "";

  https
    .get(url, res => {
      res.on("data", d => (data += d));

      res.on("end", () => cb(null, JSON.parse(data)));
    })
    .on("error", e => {
      cb(e);
    });
}
