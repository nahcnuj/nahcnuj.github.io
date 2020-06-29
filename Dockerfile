FROM nahcnuj/alpine-sassc:3.6.1 AS sass-builder

WORKDIR /var/src

COPY bin/sass-compile.sh /usr/local/bin/sass-compile.sh
COPY sass/ ./sass/

RUN sass-compile.sh

ENTRYPOINT [ "sass-compile.sh" ]


FROM nahcnuj/alpine-uzu:1.0.0 AS html-builder

WORKDIR /var/src

COPY config.yml .
COPY i18n/      ./i18n/
COPY pages/     ./pages/
COPY partials/  ./partials/
COPY public/    ./public/
COPY themes/    ./themes/

COPY --from=sass-builder /var/src/css/ ./public/css/

EXPOSE 3000
STOPSIGNAL SIGKILL

ENTRYPOINT [ "uzu" ]
CMD [ "build" ]
