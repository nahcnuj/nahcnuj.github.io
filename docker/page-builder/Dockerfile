FROM rakudo-star:2021.04-alpine

RUN apk add --update \
        git \
        su-exec

COPY META6.json .
RUN zef --update --deps-only install .

COPY bin/run-raku-script.sh /usr/local/bin/

ENTRYPOINT [ "run-raku-script.sh" ]
