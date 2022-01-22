FROM rakudo-star:2021.04-alpine

RUN apk add --update \
        git \
        shadow \
        su-exec

RUN useradd -m builder
WORKDIR /home/builder

COPY bin/entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

COPY META6.json .
RUN zef --update --deps-only install .

COPY bin/rmd2mustache.raku /usr/local/bin/
RUN chmod +x /usr/local/bin/rmd2mustache.raku
ENTRYPOINT [ "rmd2mustache.raku" ]
CMD [ "--help" ]
