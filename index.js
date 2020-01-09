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
        let config = {
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
            }
        };

        this.options = Object.assign({
            inputPath: 'resources/favicon',
            inputFile: '*.{jpg,png,svg}',
            publicPath: 'public',
            output: 'img/favicon',
            dataFile: 'data/faviconData.json',
            blade: 'resources/views/layout/favicon.blade.php',
            reload: false,
            debug: false,
            configPath: './realfavicongenerator-config.json'
        }, options || {});

        if(fs.existsSync(this.options.configPath)) {
            let fileConfig = fs.readFileSync(this.options.configPath);

            try {
                config = this.mergeDeep(config, JSON.parse(fileConfig) || {});
            } catch(e) {
                this.error(`RealFaviconGenerator config file is damaged! (${e})`);
            }
        } else {
            fs.writeFileSync(this.options.configPath, JSON.stringify(config, null, 1), { flag: 'w' });

            this.log('Config file created successfully!');
        }

        this.options.config = config;
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
        let config = this.options.config;

        this.mkdir(path.dirname(dataFilePath));
        this.clearDir(destinationPath);

        config.masterPicture = _path;
        config.dest = destinationPath;
        config.iconsPath = this.options.output;
        config.markupFile = dataFilePath;

        self.log('Favicon is generating, wait a moment, please...');

        realFavicon.generateFavicon(config, () => {
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

    isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    }

    mergeDeep(target, ...sources) {
        if(!sources.length) return target;

        const source = sources.shift();

        if(this.isObject(target) && this.isObject(source)) {
            for(const key in source) {
                if(this.isObject(source[key])) {
                    if(!target[key]) {
                        Object.assign(target, { [key]: {} });
                    }

                    this.mergeDeep(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }

        return target;
    }

}

mix.extend('favicon', new Favicon());