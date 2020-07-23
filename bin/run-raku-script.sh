#!/usr/bin/env sh

if [ ! -z ${LOCAL_UID} -o ! -z ${LOCAL_GID} ]; then
    USER_ID=${LOCAL_UID:-1000}
    GROUP_ID=${LOCAL_GID:-1000}

    addgroup -S -g $GROUP_ID user
    adduser -S -u $USER_ID -G user user
    export HOME=/home/user
    SU='su-exec user'
fi

${SU} raku "$@"
