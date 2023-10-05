@echo off
setlocal enabledelayedexpansion

set "count=0"
for %%F in (.\parts\*.m4v) do set /a "count+=1"
set "current=0"

echo !count!개의 파일을 변환합니다.

for %%F in (.\parts\*.m4v) do (
    set /a "current+=1"
    echo !current!/!count! 번째 파일 변환 중: %%~nxF
    ffmpeg -y -v quiet -i "parts\%%~nF.m4a" -i "parts\%%~nF.m4v" -c copy "converted\%%~nF.mp4"
    if errorlevel 1 (
        echo 오류 발생, 변환 실패: %%~nxF
    ) else (
        echo !current!/!count! 번째 파일 변환이 완료되었습니다: %%~nxF
    )
)

echo 모든 파일 변환이 완료되었습니다!

endlocal