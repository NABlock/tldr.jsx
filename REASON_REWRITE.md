# Rewriting Tldr.jsx to Reason

Of all the reasons I'm doing this the main one is maintainability. I have not
worked with Flow or RxJS in over 2 years (as the commit log seems to show), and
I don't have the headspace to freshen up my memory and bring both the tools and
my knowledge of them up to date.

Instead, I'm choosing to rewrite a program that I know how it works with a tool
that I'm heavily invested in, to ensure that I can maintain Tldr.jsx in the
foreseeable future.

This document will serve as a log of sorts for the rewrite, but I'd like to
also have a small spec come out of the process.

1. [What's Tldr.jsx doing anyway?](#whats-tldrjsx-doing-anyway)
   1. [Populating the Index](#populating-the-index)
   1. [Recording Analytics](#recording-analytics)
   1. [Random Welcome Messages](#random-welcome-messages)
2. [SPEC](#SPEC)
3. [Architecture](#architecture)

## What's Tldr.jsx doing anyway?

Tldr.jsx in essence is a glorified lookup table that renders markdown text in
the browser at runtime.

You can think of it as:

```js
{
  "linux/tar": "### Archiving utility that noone remembers args for...",  
  "macos/xcode-select": "### XCode Selection Utility ...",  
  ...more_commands
}
```

If you say you're looking for `macos/xcode-select`, it will retrieve the
Markdown text, and render it as HTML for you.

We call this lookup table the _Index_, and we call each entry in it a _Command_.

_Commands_ in turn are composed by a name, such as `tar`, and a platform, such
as `linux` or `macos`.

In this implementation, the index does not in fact include the contents of each
one of these commands, but instead it includes all the information necessary to
download them on demand.

We refer to those contents (and some more metadata) as _Pages_.

That is, we have that:

* A **Page** is the actual page displayed to the user, belonging to a **Command**.
* A **Command** is a combination of a command and a platform, pointing to a
  single **Page**.
* An **Index** is a collection of **Commands** used to figure out what **Pages**
  to fetch and display.

This can probably be extended to include pages within the index as well (to
provide better caching), but for the past 2 years it's been good enough so we'll
leave it at that.

The rest of what Tldr.jsx does is 3 orthogonal concerns:

* Populating the Index
* Recording Analytics
* Random Welcome Messages

#### Populating the Index

The first time the application starts, the Index tries to be read from a local
cache. This is an optimization to avoid a roundtrip to the publicly hosted
[index of
commands](https://github.com/tldr-pages/tldr-pages.github.io/blob/master/assets/index.json).

This index of commands is retrieved via HTTP, using the Github REST API for
fetching files:

```http
GET https://api.github.com/repos/tldr-pages/tldr-pages.github.io/contents/assets/index.json?ref=master

{
  "name": "index.json",
  "path": "assets/index.json",
  "sha": "2d052d79a1a553b6116ec0348f1311e85fe641f9",
  "size": 47574,
  "url": "https://api.github.com/repos/tldr-pages/tldr-pages.github.io/contents/assets/index.json?ref=master",
  "html_url": "https://github.com/tldr-pages/tldr-pages.github.io/blob/master/assets/index.json",
  "git_url": "https://api.github.com/repos/tldr-pages/tldr-pages.github.io/git/blobs/2d052d79a1a553b6116ec0348f1311e85fe641f9",
  "download_url": "https://raw.githubusercontent.com/tldr-pages/tldr-pages.github.io/master/assets/index.json",
  "type": "file",
  "content": "huge base64 encoded string here with the file contents",
  "encoding": "base64",
  "_links": {
    "self": "https://api.github.com/repos/tldr-pages/tldr-pages.github.io/contents/assets/index.json?ref=master",
    "git": "https://api.github.com/repos/tldr-pages/tldr-pages.github.io/git/blobs/2d052d79a1a553b6116ec0348f1311e85fe641f9",
    "html": "https://github.com/tldr-pages/tldr-pages.github.io/blob/master/assets/index.json"
  }
}
```

After that, it is parsed vanilla from JSON into a JS Object of shape:

```js
{
  commands: [
    { name: "tar", platform: [ "common" ] },
    { name: "apt", platform: [ "linux" ] },
  ],
}
```

If the population was successful, the index is written to cache.

> Note: the current implementation uses mutable module state as a cache. This is
> subpar and should be changed to use a persistent cache such as LocalStorage.


#### Recording Analytics

Don't worry, this isn't doing anything evil. Check the source if you want, you
can checksum it against what's on the website and it'll be the same.

Tldr.jsx essentially records on Mixpanel whatever you search for, and whether we
could not find what you were looking for. [Here is the code from the last
Javascript version of
it](https://github.com/ostera/tldr.jsx/blob/69e290e1ab9d82e4c779c143cddba4b3201d9a55/src/app.js#L58-L73).

This has been discussed publicly before (
[tldr-pages/tldr#948](https://github.com/tldr-pages/tldr/issues/948),
[tldr-pages/tldr#9808](https://github.com/tldr-pages/tldr/issues/980),
[tldr-pages/tldr#1071](https://github.com/tldr-pages/tldr/issues/1071)) and it
has been done with the sole purpose of optimizing the contribution time towards
the pages that need it the most (as per @agnivade's
[comment](https://github.com/tldr-pages/tldr/issues/948#issuecomment-232457052)).

This data is unfortunately private by default, but the @tldr-pages team will be
more than happy to share it if you [open an issue on their
repo](https://github.com/tldr-pages/tldr/issues/new).


#### Random Welcome Messages

The Random welcome message is just a small gimmick. It's just an array of
strings with the text "Welcome" in several languages (which I haven't fully
verified) that will be randomly accessed to display one.

## SPEC

```reason
type page = {
  contents: string
};

type command = {
  name: string,
  platform: string,
};

type platform = [ `MacOS | `Linux | `Windows | `SunOS | `Common ];

type index;

type io('a);

let make_index : () => io(index);

let lookup_by_name : index => string => option(command);

let page_for_command : command => io(page);
```

## Architecture

The rewritten project will have the following multipackage structure:

```
tldr
├── cli
├── github-lwt
├── github
├── mixpanel-lwt
├── mixpanel
├── model
├── native
└── web
```

* `tldr/cli` is a natively compiled version of the tool
* `tldr/github-lwt` is the Github API for the Lwt I/O backend
* `tldr/github` is the Github API datatypes and interfaces
* `tldr/mixpanel-lwt` is the Mixpanel API for the Lwt I/O backend
* `tldr/mixpanel` is the Mixpanel API datatypes and interfaces
* `tldr/model` defines precisely the datatypes needed, as specified in the [SPEC](#spec) section.
* `tldr/native` defines common modules for the native versions of the tool
* `tldr/web` the current web client rewritten to use the model

### `tldr/model`

### `tldr/cli`

### `tldr/github`

```ocaml
module Github = {
  module API = {
    type t = {base_url: string};

    let v3 = {base_url: "https://api.github.com/"};
  };

  module Repo = {
    type t = {
      owner: string,
      name: string,
    };

    let make : (~owner, ~name) => {owner, name};

    let file : (API.t, t, ~path:string) => option(File.t);
  };

  module File = {
    type t = {content: string};

    let make : (~content) => {content: content};

    let content : t => string;
  };
};
```

Originally I attempted to functorize over the I/O monad and the JSON type to
support combinations for both Native (Lwt+Yojson) and Web (Repromise+BsJson) but
the module-level programming seemed to take me down a strange path.

That is, every module would have to be parametrized with the IO/JSON types, but
also every module would have to redefine how to parse their respective
datatypes.

After trying out `atdgen`, I realized that the copying and modifying of
generated files was more trouble than writing the parsers twice. Specially
because regenerating the parsers would mean redoing the copying/modifications
in ways that I just don't want to remember and can't automate right now.

I settled for exposing common types for working with the Github API and having
an implementation that uses them in `tldr/github-lwt` and another one that uses
them in `tldr/web`.

### `tldr/native`

The native module includes the common code for building TLDR apps in native
environments. This code relies uses an OCaml Stdlib Hash Table for looking up
modules, and relies on `github-lwt` for fetching data.

It is not suitable for use on the web.

### `tldr/web`


## BuckleScript Notes

1. Setting up `menhir` and `ocamllex` is quite inelegant, since the hooks
   needed depend on my globally installed tools. I can live with it but
   unfortunately by default it will generate those files in my source folder,
   which conflicts with the `dune` build.

2. Actually, running `bsb` and `dune` in harmony on the same hybrid seems to be
   impossible.
