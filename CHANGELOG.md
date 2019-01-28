# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.0.2] - 2019-01-28
### Fixed
- Only set `set-cookie` if truthy, this was always set before.
- Some TypeScript warnings.
- Use `event.query` for provides that are not AWS. (AWS uses `event.queryStringParameters`).

### Refactor
- Create on function for each provider instead of having a larger one.

## [3.0.1] - 2018-09-30
### Fixed
- Return response data nested in res object for Azure functions.

## [3.0.0] - 2018-09-29
### Added
- Added support for hapi 17 :tada:.

### Breaking
- No longer accepts a callback, a promise is returned instead.
- Works on nodejs 8.x and greater.

## [2.0.1] - 2018-09-25 

### Fixed
- Get first element if set-cookie's value is an array
Bell set's a cookie called `set-cookie` that has an array
as its value, this causes problem's for AWS lambda.

This is fixed by extracting the first value from the array
and just return the `set-cookie` value as a single value string.

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

[Unreleased]: https://github.com/drager/serverless-hapi/compare/v3.0.1...HEAD
[2.0.0]: https://github.com/drager/serverless-hapi/compare/v1.0.0...v2.0.0
[2.0.1]: https://github.com/drager/serverless-hapi/compare/v2.0.0...v2.0.1
[3.0.0]: https://github.com/drager/serverless-hapi/compare/v2.0.1...v3.0.0
[3.0.1]: https://github.com/drager/serverless-hapi/compare/v3.0.0...v3.0.1
[3.0.2]: https://github.com/drager/serverless-hapi/compare/v3.0.1...v3.0.2
