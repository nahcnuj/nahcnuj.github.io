#!/usr/bin/env sh

DRYRUN_FLAG=''
args=`getopt dr $*`
set -- ${args}

for opt; do
    case ${opt} in
        -d) DRYRUN_FLAG='--dryrun'; shift ;;
        -r) RECURSIVE_FLAG='--recursive'; shift ;;
        --) shift; break ;;
    esac
done

[ -z "$1" ] && echo No file given. >&2 && exit 1
[ ! -e "$1" ] && echo $1 is not found. >&2 && exit 1
[ -d "$1" -a ! "${RECURSIVE_FLAG}" ] && echo Need -r to upload files in directory recursively. >&2 && exit 1

aws s3 cp --profile s3uploader ${DRYRUN_FLAG} ${RECURSIVE_FLAG} "$1" s3://img.nahcnuj.work/
