FROM rakudo-star@sha256:7582bde23313a17fe3f6c1959b46bbc3622432a8780530c2c4a2d7f5816e70df

RUN apk add --update \
        git \
        su-exec

COPY META6.json .
RUN zef install --deps-only .

COPY bin/run-raku-script.sh /usr/local/bin/

ENTRYPOINT [ "run-raku-script.sh" ]
