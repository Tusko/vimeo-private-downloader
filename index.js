const fs = require("fs");
const url = require("url");
const https = require("https");
const log = (...args) => console.log("→", ...args);
const list = require("./videojson.js");

function loadVideo(num, cb) {
  let rawMasterUrl = new URL(list[num].url);
  let masterUrl = rawMasterUrl.toString();

  getJson(masterUrl, num, (err, json) => {
    if (err) {
      return cb(err);
    }

    const videoData = json.video
      .sort((v1, v2) => v1.avg_bitrate - v2.avg_bitrate)
      .pop();

    let audioData = {}
    if (json.audio !== null) {
      audioData = json.audio
        .sort((a1, a2) => a1.avg_bitrate - a2.avg_bitrate)
        .pop();
    }

    const videoBaseUrl = url.resolve(
      url.resolve(masterUrl, json.base_url),
      videoData.base_url
    );

    let audioBaseUrl = "";
    if (json.audio !== null) {
      audioBaseUrl = url.resolve(
        url.resolve(masterUrl, json.base_url),
        audioData.base_url
      );
    }

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

        if (json.audio !== null) {
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
      }
    );
  });
}

function processFile(type, baseUrl, initData, segments, filename, cb) {
  const file = filename.replace(/[^\w.]/gi, '-');
  const filePath = `./parts/${file}`;
  const downloadingFlag = `./parts/.${file}~`;

  if (fs.existsSync(downloadingFlag)) {
    log("⚠️", ` ${file} - ${type} 의 다운로드가 완료되지 않았습니다. 다시 시작합니다.`);
  } else if (fs.existsSync(filePath)) {
    log("⚠️", ` ${file} - ${type} 이/가 이미 존재합니다.`);
    cb();
  } else {
    fs.writeFileSync(downloadingFlag, '');
  }

  const segmentsUrl = segments.map(seg => {
    if (!seg.url) {
      throw new Error(`빈 URL이 있는 세그먼트를 발견했습니다: ${JSON.stringify(seg)}`);
    }
    return baseUrl + seg.url;
  });

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
    `${filename}의 ${type} segment를 다운중입니다. 진행도 : ${i}/${segmentsUrl.length}`
  );

  let req = https
    .get(segmentsUrl[i], res => {
      if (res.statusCode != 200) {
        cb(new Error(`url '${segmentsUrl[i]}'에서 segment 다운 도중 실패하였습니다. 상태: ${res.statusCode} ${res.statusMessage}`))
      }

      res.on("data", d => output.write(d));

      res.on("end", () =>
        combineSegments(type, i + 1, segmentsUrl, output, filename, downloadingFlag, cb)
      );
    })
    .on("error", e => {
      cb(e);
    });

  req.setTimeout(7000, function () {
    log("⚠️", '시간 초과. 재시도');
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
        return cb(`master.json 파일이 만료되었거나 손상되었습니다. 목록에서 업데이트하거나 제거해주세요.(` + n + ` 위치에서 깨짐)`);
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
