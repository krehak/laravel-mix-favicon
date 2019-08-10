const mix = require('laravel-mix');
const chokidar = require('chokidar');
const fs = require('fs');
const realFavicon = require('gulp-real-favicon');

class Favicon {

    name() {
        return 'favicon';
    }

    dependencies() {
        return ['chokidar', 'gulp-real-favicon'];
    }

    register(options) {
        this.options = Object.assign({
            inputPath: 'resources/favicon',
            inputFile: '*.{jpg,png,svg}',
            publicPath: 'public',
            output: 'img/favicon',
            dataFile: 'data/faviconData.json',
            blade: 'resources/views/layout/favicon.blade.php',
            reload: false,
            debug: false
        }, options || {});
    }

    boot() {
        let self = this;
        let sourcePath = this.options.inputPath + '/' + this.options.inputFile;

        fs.mkdir(path.dirname(sourcePath), {
            recursive: true
        }, (err) => {
            if(err) throw err;
        });

        chokidar.watch(sourcePath, {
            ignoreInitial: false
        }).on('add', (_path) => {
            self.generate_favicon(_path);
        });
    }

    webpackConfig(webpackConfig) {
        this.webpackOriginalAfterCallback = webpackConfig.devServer.after;

        let self = this;

        this.log('webpack config updated');
        webpackConfig.devServer.after = (app, server) => {
            self.after(app, server);
        };
    }

    after(app, server) {
        if(typeof this.webpackOriginalAfterCallback === 'function') {
            this.webpackOriginalAfterCallback(app, server);
        }

        this.serverHandler = server;
        this.log('webpack server handler attached');
    }

    reload() {
        if(this.options.reload === true && typeof mix.bladeReload !== 'function' && typeof this.serverHandler !== 'undefined') {
            this.serverHandler.sockWrite(this.serverHandler.sockets, "content-changed");
        }

        return void(8);
    }

    generate_favicon(_path) {
        let self = this;
        let dataFilePath = this.options.inputPath + '/' + this.options.dataFile;
        let destinationPath = this.options.publicPath + '/' + this.options.output;

        fs.mkdir(path.dirname(dataFilePath), {
            recursive: true
        }, (err) => {
            if(err) throw err;
        });

        self.log('Favicon is generating, please, wait a moment...');

        realFavicon.generateFavicon({
            masterPicture: _path,
            dest: destinationPath,
            iconsPath: this.options.output,
            design: {
                ios: {
                    pictureAspect: 'noChange',
                    assets: {
                        ios6AndPriorIcons: false,
                        ios7AndLaterIcons: false,
                        precomposedIcons: false,
                        declareOnlyDefaultIcon: true
                    }
                },
                desktopBrowser: {},
                windows: {
                    pictureAspect: 'noChange',
                    backgroundColor: '#ffffff',
                    onConflict: 'override',
                    assets: {
                        windows80Ie10Tile: false,
                        windows10Ie11EdgeTiles: {
                            small: false,
                            medium: true,
                            big: false,
                            rectangle: false
                        }
                    }
                },
                androidChrome: {
                    pictureAspect: 'noChange',
                    themeColor: '#ffffff',
                    manifest: {
                        display: 'standalone',
                        orientation: 'notSet',
                        onConflict: 'override',
                        declared: true
                    },
                    assets: {
                        legacyIcon: false,
                        lowResolutionIcons: false
                    }
                }
            },
            settings: {
                scalingAlgorithm: 'Mitchell',
                errorOnImageTooSmall: false,
                readmeFile: false,
                htmlCodeFile: false,
                usePathAsIs: false
            },
            markupFile: dataFilePath
        }, () => {
            if(self.options.blade !== false && self.options.blade !== null) {
                fs.mkdir(path.dirname(self.options.blade), {
                    recursive: true
                }, (err) => {
                    if(err) throw err;
                });

                let html = JSON.parse(
                    fs.readFileSync(dataFilePath)
                ).favicon.html_code;

                fs.writeFile(path.normalize(self.options.blade), html, (err) => {
                    if(err) {
                        self.error(err);
                    } else {
                        fs.unlinkSync(_path);
                        fs.unlinkSync(dataFilePath);
                        self.log('Favicon was generated! [HTML in: ' + self.options.blade + ']');
                        self.reload();
                    }
                });
            } else {
                fs.unlinkSync(_path);
                fs.unlinkSync(dataFilePath);
                self.log('Favicon was generated! [without injecting HTML]');
            }
        });
    }

    log(message) {
        if(this.options.debug === true) {
            console.log('laravel-mix-' + this.name() + ': ' + message);
        }
    }

    error(message) {
        console.error('laravel-mix-' + this.name() + ': ' + message);
    }

}

mix.extend('favicon', new Favicon());