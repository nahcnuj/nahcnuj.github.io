FROM nahcnuj/alpine-sassc:3.6.1 AS sass-builder

WORKDIR /var/src

COPY bin/sass-compile.sh /usr/local/bin/sass-compile.sh

ENTRYPOINT [ "sass-compile.sh" ]


FROM nahcnuj/alpine-uzu:1.0.0 AS html-builder

WORKDIR /var/src

EXPOSE 3000
STOPSIGNAL SIGKILL

ENTRYPOINT [ "uzu" ]
CMD [ "build" ]
