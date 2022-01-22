FROM rakudo-star:2021.04-alpine

RUN adduser -D builder

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
