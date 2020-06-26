FROM nahcnuj/alpine-sassc:3.6.1 AS sass-builder

WORKDIR /var/src

COPY sass/   ./

RUN find -name '*.scss' \
        | sed -e 's,\(.*\)\.scss,\1.scss \1.css,' \
        | xargs -n2 sassc

FROM nahcnuj/alpine-uzu:1.0.0

WORKDIR /var/src

COPY config.yml .
COPY i18n/      ./i18n/
COPY pages/     ./pages/
COPY partials/  ./partials/
COPY public/    ./public/
COPY themes/    ./themes/

COPY --from=sass-builder /var/src/*.css ./public/css/

EXPOSE 3000
STOPSIGNAL SIGKILL

ENTRYPOINT [ "uzu" ]
CMD [ "build" ]
