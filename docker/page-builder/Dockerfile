FROM rakudo-star:2020.01-alpine

RUN apk add --update \
        git \
        su-exec

COPY META6.json .
RUN zef install --deps-only .

COPY bin/run-raku-script.sh /usr/local/bin/

ENTRYPOINT [ "run-raku-script.sh" ]
