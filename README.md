# The source of [www.nahcnuj.work](https://www.nahcnuj.work/)

[![HTML5 validator](https://github.com/nahcnuj/nahcnuj.github.io/actions/workflows/html5-check.yml/badge.svg?branch=source)](https://github.com/nahcnuj/nahcnuj.github.io/actions/workflows/html5-check.yml)

## Structure

```
├── bin     ... scripts
├── docker  ... Dockerfiles
├── i18n    ... dictionary for internationalization
├── pages   ... Mustache templates
├── public  ... static files
├── rmd     ... R Markdown source of articles
├── sass    ... SCSS stylesheets
└── themes  ... layout templates
```

## Build the site

```sh
make
```

To remove files generated under `build` directory before building, run `make rebuild`.

## Preview the site

Execute the following commands and open http://localhost:3000/ with your browser.

```sh
echo UID=$(id -u) >>.env
echo GID=$(id -g) >>.env
docker-compose up -d
```

## Dependencies

- [Uzu](https://modules.raku.org/dist/Uzu:cpan:SACOMO)
- [Dart Sass](https://sass-lang.com/dart-sass)
