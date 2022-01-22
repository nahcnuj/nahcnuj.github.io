FROM rakudo-star:2021.04-alpine

RUN apk add --update \
        git \
        shadow \
        su-exec

RUN useradd -m builder

COPY META6.json .
RUN zef --update --deps-only install .

COPY bin/entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT [ "entrypoint.sh" ]

COPY bin/rmd2mustache.raku bin/
RUN chmod +x bin/rmd2mustache.raku
CMD [ "bin/rmd2mustache.raku", "--help" ]
