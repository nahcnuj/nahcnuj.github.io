FROM rakudo-star:2020.01-alpine

RUN apk --update add \
    curl \
    git

RUN zef install Uzu

WORKDIR /var/src

COPY config.yml .
COPY i18n/      ./i18n/
COPY pages/     ./pages/
COPY partials/  ./partials/
COPY public/    ./public/
COPY themes/    ./themes/

CMD [ "uzu", "build" ]
