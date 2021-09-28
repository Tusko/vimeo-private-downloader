const fs = require("fs");
const url = require("url");
const https = require("https");
const log = (...args) => console.log("→", ...args);
const list = require("./videojson.js");

function loadVideo(num, cb) {
  let rawMasterUrl = new URL(list[num].url);
  rawMasterUrl.searchParams.delete('query_string_ranges');
  rawMasterUrl.searchParams.set('base64_init', 1);

  let masterUrl = rawMasterUrl.toString();

  getJson(masterUrl, num, (err, json) => {
    if (err) {
      return cb(err);
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
          cb(err);
        }

        processFile(
          "audio",
          audioBaseUrl,
          audioData.init_segment,
          audioData.segments,
          list[num].name + ".m4a",
          err => {
            if (err) {
              cb(err);
            }

            cb(null, num + 1);
          }
        );
      }
    );
  });
}

function processFile(type, baseUrl, initData, segments, filename, cb) {
  const file = filename.replace(/[^\w.]/gi, '-');
  const filePath = `./parts/${file}`;
  const downloadingFlag = `./parts/.${file}~`;

  if (fs.existsSync(downloadingFlag)) {
    log("⚠️", ` ${file} - ${type} is incomplete, restarting the download`);
  } else if (fs.existsSync(filePath)) {
    log("⚠️", ` ${file} - ${type} already exists`);
    cb();
  } else {
    fs.writeFileSync(downloadingFlag, '');
  }

  const segmentsUrl = segments.map(seg => baseUrl + seg.url);

  const initBuffer = Buffer.from(initData, "base64");
  fs.writeFileSync(filePath, initBuffer);

  const output = fs.createWriteStream(filePath, {
    flags: "a"
  });

  combineSegments(type, 0, segmentsUrl, output, filePath, downloadingFlag, err => {
    if (err) {
      log("⚠️", ` ${err}`);
    }

    output.end();
    cb();
  });
}

function combineSegments(type, i, segmentsUrl, output, filename, downloadingFlag, cb) {
  if (i >= segmentsUrl.length) {
    if (fs.existsSync(downloadingFlag)) {
      fs.unlinkSync(downloadingFlag);
    }
    log("🏁", ` ${filename} - ${type} done`);
    return cb();
  }

  log(
    "📦",
    type === "video" ? "📹" : "🎧",
    `Downloading ${type} segment ${i}/${segmentsUrl.length} of ${filename}`
  );

  let req = https
    .get(segmentsUrl[i], res => {
      res.on("data", d => output.write(d));

      res.on("end", () =>
        combineSegments(type, i + 1, segmentsUrl, output, filename, downloadingFlag, cb)
      );
    })
    .on("error", e => {
      cb(e);
    });

  req.setTimeout(7000, function () {
    log("⚠️", 'Timeout. Retrying');
    combineSegments(type, i, segmentsUrl, output, filename, downloadingFlag, cb);
  });
}

function getJson(url, n, cb) {
  let data = "";

  https
    .get(url, res => {
      if (res.statusMessage.toLowerCase() !== 'gone') {
        res.on("data", d => (data += d));
        res.on("end", () => cb(null, JSON.parse(data)));
      } else {
        return cb(`The master.json file is expired or crushed. Please update or remove it from the sequence (broken on ` + n + ` position)`);
      }
    })
    .on("error", e => {
      return cb(e);
    });
}

function initJs(n = 0) {
  if (!list[n] || (!list[n].name && !list[n].url)) return;

  loadVideo(n, (err, num) => {
    if (err) {
      log("⚠️", ` ${err}`);
    }

    if (list[num]) {
      initJs(num);
    }
  });
}

initJs();
