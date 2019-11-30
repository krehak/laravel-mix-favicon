const mix = require('laravel-mix');
const chokidar = require('chokidar');
const fs = require('fs');
const realFavicon = require('gulp-real-favicon');
const shell = require('shelljs');

class Favicon {

    name() {
        return 'favicon';
    }

    dependencies() {
        return ['chokidar', 'gulp-real-favicon', 'shelljs'];
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
            debug: false,
            bgColor: '#ffffff'
        }, options || {});
    }

    boot() {
        let self = this;
        let sourcePath = this.options.inputPath + '/' + this.options.inputFile;

        this.mkdir(this.options.inputPath);

        chokidar.watch(sourcePath, {
            ignoreInitial: false
        }).on('add', (_path) => {
            self.generateFavicon(_path);
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

    generateFavicon(_path) {
        let self = this;
        let dataFilePath = this.options.inputPath + '/' + this.options.dataFile;
        let destinationPath = this.options.publicPath + '/' + this.options.output;

        this.mkdir(path.dirname(dataFilePath));
        this.clearDir(destinationPath);

        self.log('Favicon is generating, wait a moment, please...');

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
                    backgroundColor: this.options.bgColor,
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
                    themeColor: this.options.bgColor,
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
                self.mkdir(path.dirname(self.options.blade));

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

    mkdir(directory) {
        if(!fs.existsSync(directory)) {
            shell.mkdir('-p', directory);
        }
    }

    clearDir(directory) {
        if(fs.existsSync(directory)) {
            fs.readdir(directory, (err, files) => {
                if(err) throw err;

                for(let file of files) {
                    fs.unlink(path.join(directory, file), err => {
                        if(err) throw err;
                    });
                }
            });
        }
    }

}

mix.extend('favicon', new Favicon());