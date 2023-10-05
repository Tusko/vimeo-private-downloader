# Vimeo 비공개 동영상 다운로더

> 이 Repository는 [Vimeo Private Video Downloader](https://github.com/Tusko/vimeo-private-downloader)를 포크하여 만들어졌습니다.
간단한 번역 및 윈도우 사용자 기준으로 안내와, 변환을 위한 `vimeo-combine.bat` 파일을 추가하였습니다.
오역이 많습니다. 양해바랍니다.
~~사실 저 혼자 쓰려고 포크한거입니다.~~

Node.js 스크립트를 사용하면 [Vimeo](https://vimeo.com)에서 비공개 동영상을 다운로드할 수 있습니다.

## 요구사항
1. Node.js
시작하기 전에 [Node.js](https://nodejs.org/en/download/)를 설치했는지 확인해주세요.

확인하려면 터미널(cmd)에서 `node -v` 명령을 실행하세요. 예를 들어 `v10.11.0`이 표시됩니다. 에러가 발생하면 최신 [Node.js](https://nodejs.org/en/download/)를 설치해주세요.

2. ffmpeg
`ffmpeg`를 설치해주세요. [여기](https://ffmpeg.org/download.html)에서 다운로드할 수 있습니다.
`ffmpeg`는 비디오/오디오 segment(조각)을 결합하고 `mp4`로 변환하는데 사용됩니다.
확인하려면 터미널에서 `ffmpeg -version` 명령을 실행하세요. 예를 들어 `ffmpeg version 4.0.2`이 표시됩니다. 

## 다운로드

동영상을 다운받기 위해 다음 과정을 따라주세요.

1.  네트워크 탭에서 브라우저 개발자 도구를 엽니다(윈도우/리눅스의 경우 `F12`, 맥 OS의 경우 `CMD + Option + I`).
2.  동영상을 시작합니다.(또는 마우스를 동영상 위로 이동합니다)
3.  "네트워크" 탭에서 "master.json" 파일의 로드를 찾아 전체 URL을 복사합니다.
- 3.1. 경우에 따라 Vimeo에서 암호화된 동영상 데이터를 전송하는 경우가 있습니다.
- 해결방법
>1. 'query_string_ranges' 쿼리 파라미터를 제거
>2. `base64_init=1`을 추가

4.  `videojson.js` 파일에 `url`과 `name`(파일명으로 사용) 필드를 채웁니다.
5.  실행: `node index.js`(cmd) 또는 `npm run start`
6.  콘솔에 다음 메시지가 출력될때까지 기다리세요. `🌈 List finished`

## 결합 및 변환
저장된 비디오/오디오 segment(조각)은 parts 폴더에 저장됩니다.

1. 비디오/오디오 segment(조각)을 `mp4` 파일로 합치고 변환하려면 터미널에서 `sh vimeo-combine.sh` 또는 `npm run combine`을 실행하세요.
또는, (sh 실행 불가시) 윈도우에서  `vimeo-combine.bat`을 실행하세요.

- 1.1. `vimeo-combime.bat`이 작동하지 않다면, ffmpeg의 PATH를 설정해주시거나, `vimeo-combine.bat` 파일 위치로 ffmpeg.exe를 옮겨 실행시켜주세요.
2. converted 폴더에 `mp4` 파일이 생성됩니다.

새로운 영상을 결합/변환시 이전 비디오/오디오 segment를 삭제하는 것을 권장드립니다.(명령 실행시마다 convented 폴더 내부의 모든 파일이 변환됨)

## Docker 설정

저장소에는 Node 18이 설치된 Alpine 이미지를 사용하는 Dockerfile이 있습니다. 

다음과 같은 몇 가지 Makefile 명령이 추가되었습니다. 
- `make build`: `ffmpeg` OS 종속성을 설치하는 `FROM node:18-alpine` Docker 이미지를 빌드합니다.
- `make start`: `npm run start` entrypoint 실행
- `make convert`: `npm run convert` entrypoint 실행
- `make bash`: 실행 중인 컨테이너에서 sh 명령 실행

### (원본의) 기여자

기여자에게 특별한 감사를 전합니다:

[@ftitreefly](https://github.com/ftitreefly/) - 비디오/오디오 부분을 `mp4`로 병합하는 bash 스크립트 생성