#!/usr/local/bin/entrypoint.sh /usr/bin/env raku

my %*SUB-MAIN-OPTS =
  :named-anywhere
;
multi sub MAIN(
    Str $rmd-file where *.IO.f && *.IO.r,
    Str $dest-dir where *.IO.e.flip || *.IO.d && *.IO.w,
    :$langs!,
) {
    my $dest-file = $dest-dir.IO.add($rmd-file.IO.basename).extension('mustache');
    if ($dest-file.e && !$dest-file.w) {
        die "The file {$dest-file} is not writable.";
    }

    my @langs = $langs.split(/\s+/);
    my $mustache = convert-to-mustache($rmd-file.IO, @langs);

    $dest-file.spurt($mustache);
}

multi sub MAIN(
    Str $rmd-file where *.IO.f && *.IO.r,
    Str $dest-dir where *.IO.e.flip || *.IO.d && *.IO.w,
) {
    my $dest-file = $dest-dir.IO.add($rmd-file.IO.basename).extension('mustache');
    if ($dest-file.e && !$dest-file.w) {
        die "The file {$dest-file} is not writable.";
    }

    my $mustache = convert-to-mustache($rmd-file.IO);

    $dest-file.spurt($mustache);
}

sub USAGE {
    say qq:to/EOS/;
        Usage:
          {$*PROGRAM.basename} [OPTION] <rmd-file> <dest-dir>
        Convert R Markdown file into Mustache.

        <rmd-file> must be a readable file and <dest-dir> must be a writable directory.
        A basename of output file is the same as one of <rmd-file>, but its extension will be 'mustache'.

          --langs     content languages split by space
                      (example: "ja en")
        EOS
}

use Text::Markdown;
use YAMLish;

multi sub convert-to-mustache(
    IO $rmd-file,
    @langs,
) {
    my $rmd = $rmd-file.slurp;
    my @rmds = split-multiple-rmds($rmd);

    my %merged-yaml;
    my $content-part;
    for @rmds -> %parts {
        my $lang = shift @langs or last;

        my %yaml = load-yaml(%parts<yaml>);
        for %yaml.kv -> $key, $value {
            %merged-yaml{$key} = get-merged-value(%merged-yaml{$key}, $value, ($key ~~ /'_pages' $$/ ?? '' !! $lang));
        }

        if ($rmd-file.basename eq 'index.rmd') {
            my @files = $rmd-file.parent.dir>>.relative('rmd'.IO)>>.path>>.extension('')>>.path;
            %merged-yaml<_pages> = map { page => $_ }, @files.grep( ! *.ends-with('/index'));
        }

        $content-part = get-merged-value($content-part, convert-md-to-html(%parts<md>), $lang);
    }

    if (@langs) {
        note "Contents written in following language(s) are not found:\n  {@langs.join(', ')}";
    }

    my $yaml-part = save-yaml(%merged-yaml).subst(/...$/, "---");
    return qq:to/EOS/;
        {$yaml-part}
        {$content-part.chomp}
        EOS
}

multi sub convert-to-mustache(
    IO $rmd-file,
) {
    my $rmds = $rmd-file.slurp;
    my ($rmd) = split-multiple-rmds($rmds);
    return qq:to/EOS/;
        ---
        {$rmd<yaml>}
        ---
        {convert-md-to-html($rmd<md>)}
        EOS
}

multi sub get-merged-value(
    $prev-value where * ~~ Str|Any,
    Str $value,
    Str $lang,
    --> Str
) {
    my $wrapped-value = ''
        ~ ($lang.chars ?? "\{\{#lang_{$lang}}}" !! '')
        ~ $value
        ~ ($lang.chars ?? "\{\{/lang_{$lang}}}" !! '');
    return $prev-value ~~ Str ?? $prev-value !! '' ~ $wrapped-value;
}

multi sub get-merged-value(
    $prev-value where * ~~ Array|Any,
    Array $value,
    Str $lang,
    --> Array
) {
    my @new-values;

    for @$value -> $v {
        my $pv = $prev-value ~~ Array ?? @$prev-value.shift !! Any;
        @new-values.push(get-merged-value($pv, $v, $lang));
    }

    return @new-values;
}

multi sub get-merged-value(
    $prev-value where * ~~ Hash|Any,
    Hash $value,
    Str $lang,
    --> Hash
) {
    my %new-value;

    for %$value.kv -> $k, $v {
        my $pv = $prev-value ~~ Hash ?? %$prev-value{$k} !! Any;
        %new-value{$k} = get-merged-value($pv, $v, $lang);
    }

    return %new-value;
}

multi sub get-merged-value(
    $prev-value,
    $value,
    Str $lang,
) {
    note "{$prev-value.raku},\t{$value.raku}";
    warn "prev: {$prev-value.^name}\tvalue: {$value.^name}";
}

sub convert-md-to-html(
    Str $md,
    Int $heading-offset where { $heading-offset >= 0 } = 2,
) {
    return parse-markdown($md.subst(/^^\#/, '#' x ($heading-offset + 1), :g)).to-html;
}

sub split-multiple-rmds(
    Str $rmd
) {
    my @rmds;
    my ($discard, @parts) = $rmd.split(/'---'\n/)>>.chomp;
    while (@parts) {
        my $yaml = shift @parts;
        my $md = shift @parts;
        @rmds.push: %(
            yaml => $yaml,
            md   => $md,
        );
    }
    return @rmds;
}
