# Laravel Mix Favicon

**Laravel Mix extension to generate favicon and insert HTML code into your Blade file from a single PNG/JPG/SVG image using [RealFaviconGenerator](https://realfavicongenerator.net/).**

## Note

When mix is running (`npm run hot`, e.g.), just paste your image file into the `inputPath` path (only PNG/JPG/SVG) which will generate favicon for your website and insert HTML code into your Blade file, if enabled*. See options for more info.

## Installation

Install the extension:

```sh
npm install laravel-mix-favicon
```

Or if you prefer yarn:

```sh
yarn add laravel-mix-favicon
```

Require the extension inside your Laravel Mix config and call `favicon()` in your pipeline:

```js
// webpack.mix.js
const mix = require('laravel-mix');
require('laravel-mix-favicon');

mix.js('resources/js/app.js', 'public/js')
    .sass('resources/sass/app.scss', 'public/css')
    .favicon();
```

## Options

#### Default options

If nothing is passed to the extension inside your Laravel Mix config, the following options will be used:

```js
{
    inputPath: 'resources/favicon',
    inputFile: '*.{jpg,png,svg}',
    publicPath: 'public',
    output: 'img/favicon',
    dataFile: 'data/faviconData.json',
    blade: 'resources/views/layout/favicon.blade.php',
    reload: false,
    debug: false,
    configPath: './realfavicongenerator-config.json',
    cleaner: {
        use: true,
        path: null,
        timestamp: true
    }
}
```

#### Option details

* `inputPath` (string). Your favicon data path. Generated JSON for inserting HTML code (if `blade` option enabled) will be temporarily saved here.
* `inputFile` (string). Files to watch. It is **not recommended** to change this option!
* `publicPath` (string). Your application's public path.
* `output` (string). Where generated favicon will be saved. Relative to the `publicPath` option.
* `dataFile` (string). Temporary data file while generating HTML. Relative to the `inputPath` option. It is **not recommended** to change this option!
* `blade` (string or boolean). Path to blade file, where generated HTML code will be inserted. This will overwrite whole file. _Note: set this option to `false` to disabled auto-inserting HTML code._
* `reload` (boolean). Whenever to reload browser after success. _Note: this option has no effect if you are using [laravel-mix-blade-reload](https://www.npmjs.com/package/laravel-mix-blade-reload) extension._
* `debug` (boolean). Whenever to log extension events messages to the console.
* `configPath` (string). File path to your [RealFaviconGenerator](https://realfavicongenerator.net/) config.
* `cleaner` (object). What to do with input file after favicon is generated. See below for more details.

#### Option - Cleaner (object)

* `use` (boolean). Whenever to use cleaner after favicon is generated.
* `path` (string or null). Use "string" as path relative to the `inputPath` option. Use null to automatically remove source file.
* `timestamp` (boolean). Whenever to add timestamp as postfix to the source file before save (valid only if the `cleaner.path` option is provided as a string).

### New in version 0.2.2

You can now use `cleaner` option.

### New in version 0.2.0

Laravel Mix Favicon now creates JSON file `realfavicongenerator-config.json` in the root folder with options such as `themeColor`, `pictureAspect`, `scalingAlgorithm` and more. This file will be created after first run. After updating this file you have to re-run your mix to take an effect.
