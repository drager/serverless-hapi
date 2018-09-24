# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - 2018-09-24
### Added
Now headers and query parameters are passed through
so, for example Bell can work that send the `location`
header and at second stage sends a query parameter with
a `code`.

Some settings has also been added, such as if the headers
should be filtered (content-encoding and transfer-encoding)
as well as an option if the body should be stringified or not.
Both options default to true: `{filterHeaders: true, stringifyBody: true}`.

Added a new example showing of usage of Bell.

[Unreleased]: https://github.com/drager/serverless-hapi/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/drager/serverless-hapi/compare/v1.0.0...v2.0.0
