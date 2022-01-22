# The source of [www.nahcnuj.work](https://www.nahcnuj.work/)

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

```sh
make server-start
```

After executing the command above, open http://localhost:3000/ with your browser.
To stop and restart the server, and watch its log, use `server-stop`, `server-restart`, and `server-log` respectively instead of `server-start`.

## Dependencies

- [Uzu](https://modules.raku.org/dist/Uzu:cpan:SACOMO)
- [Dart Sass](https://sass-lang.com/dart-sass)
