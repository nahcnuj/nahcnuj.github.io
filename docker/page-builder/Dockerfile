FROM rakudo-star:2020.01-alpine

RUN apk add --update \
        git \
        su-exec

COPY bin/run-raku-script.sh /usr/local/bin/
COPY META6.json .
RUN zef install --deps-only .

ENTRYPOINT [ "run-raku-script.sh" ]
