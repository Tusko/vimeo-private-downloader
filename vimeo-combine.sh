# A candy bash for combine videos
# code by ftitreefly
# 2020-03-22
ls parts/*.m4v | sed 's/.m4v//g;s/parts\///g;s/"/\\"/g;' | \
awk '{printf("echo Runing Task %d - \"%s.mp4\"\n", NR,$0)}{m4a="parts/"$0".m4a";m4v="parts/"$0".m4v";mp4="converted/"$0".mp4"; printf("ffmpeg -y -loglevel quiet -i \"%s\" -i \"%s\" -c copy \"%s\"\n", m4a, m4v, mp4) }' \
> combine.sh

chmod +x combine.sh

./combine.sh
