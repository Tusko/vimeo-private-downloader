$Message = "File:"
(Get-ChildItem ".\parts\" -Filter "*.m4v").BaseName | ForEach-Object -Parallel {
    "$using:Message $_"
    ffmpeg -y -v quiet -i "parts\$_.m4a" -i "parts\$_.m4v" -c copy "converted\$_.mp4"
} -ThrottleLimit 4
