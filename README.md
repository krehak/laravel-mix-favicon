# Laravel Mix Favicon

**Laravel Mix extension to generate favicons and include them into the HTML from single PNG image.**

## Note

When mix hot is running, just add your file into `inputPath` (only PNG/JPG/SVG, recommended) which will generate favicons for your website and inject HTML into your blade, if enabled*. See options for more detail.

## Installation

Install the extension:

```sh
npm install laravel-mix-favicon
```

Or if you prefer yarn:

```sh
yarn add laravel-mix-favicon
```

Next require the extension inside your Laravel Mix config and call `favicon()` in your pipeline:

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
    debug: false
}
```

#### Option details

* `inputPath` (string). Your favicon data path. There will be temporaly saved generated JSON for injecting HTML code (if enabled*).
* `inputFile` (string). Files to watch. It is **not recommended** to change this option!
* `publicPath` (string). Your application's public path.
* `output` (string). Where generated files will be saved. Relative to the `publicPath`.
* `dataFile` (string). Temporary data file while generating HTML. It is **not recommended** to change this option!
* *`blade` (string or boolean). Path to blade file, where generated HTML code will be saved. This will overwrite whole file. _Note: set this option to `false` to disabled injecting HTML code._
* `reload` (boolean). Whenever to reload browser after success. _Note: this option has no effect if you are using [laravel-mix-blade-reload](https://www.npmjs.com/package/laravel-mix-blade-reload) extension._
* `debug` (boolean). Whenever to log extension events messages to the console.