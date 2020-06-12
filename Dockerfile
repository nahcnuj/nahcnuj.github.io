FROM nahcnuj/alpine-uzu:1.0.0

WORKDIR /var/src

COPY config.yml .
COPY i18n/      ./i18n/
COPY pages/     ./pages/
COPY partials/  ./partials/
COPY public/    ./public/
COPY themes/    ./themes/

EXPOSE 3000
STOPSIGNAL SIGKILL

ENTRYPOINT [ "uzu" ]
CMD [ "build" ]
