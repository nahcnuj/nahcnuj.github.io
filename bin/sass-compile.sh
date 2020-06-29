#!/usr/bin/env sh
mkdir -p css && \
find -name '*.scss' \
    | grep -v '.*/_.*\.scss$' \
    | sed -e 's,^\./sass/\(.*\)\.scss,sass/\1.scss css/\1.css,' \
    | xargs -n2 sassc
