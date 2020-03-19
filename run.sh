# A candy bash for combine videos
# cody by ftitreefly
# 2020-03-19
ls *.m4a *.m4v | sed 's/.m4a//g;s/.m4v//g' | uniq | \
awk '{print "echo Runing Task "NR" - " $0}{m4a=$0".m4a";m4v=$0".m4v";mp4=$0".mp4"; printf("ffmpeg -y -loglevel quiet -i \"%s\" -i \"%s\" -c copy \"%s\"\n", m4a, m4v, mp4) }' \
> combine.sh

chmod +x combine.sh

./combine.sh
