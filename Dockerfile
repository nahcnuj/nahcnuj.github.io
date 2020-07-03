FROM nahcnuj/alpine-sassc:3.6.1 AS sass-builder

WORKDIR /var/src

COPY bin/sass-compile.sh /usr/local/bin/sass-compile.sh

ENTRYPOINT [ "sass-compile.sh" ]
