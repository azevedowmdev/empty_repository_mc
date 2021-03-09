const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const autoprefixer = require("autoprefixer");
const merge = require("webpack-merge");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const LiveReloadPlugin = require("webpack-livereload-plugin");
const md5File = require("md5-file");
const ProgressBarPlugin = require("progress-bar-webpack-plugin");
const BrowserSyncPlugin = require("browser-sync-webpack-plugin");
const common = require("./webpack.common.js");
const pkgjson = require("../package.json");

const ROOT_DIR = path.resolve(__dirname, "../");
const DIST_DIR = path.resolve(ROOT_DIR, "dist");

const NAME_PROJECT =
    process.env.NODE_ENV == "homolog"
        ? `homolog-${pkgjson.storeName}`
        : pkgjson.storeName;

LiveReloadPlugin.prototype.done = function done(stats) {
    this.fileHashes = this.fileHashes || {};

    const fileHashes = {};
    for (let file of Object.keys(stats.compilation.assets)) {
        fileHashes[file] = md5File.sync(
            stats.compilation.assets[file].existsAt
        );
    }

    const toInclude = Object.keys(fileHashes).filter((file) => {
        if (this.ignore && file.match(this.ignore)) {
            return false;
        }
        return (
            !(file in this.fileHashes) ||
            this.fileHashes[file] !== fileHashes[file]
        );
    });

    if (this.isRunning && toInclude.length) {
        this.fileHashes = fileHashes;
        console.log("Live Reload: Reloading " + toInclude.join(", "));
        setTimeout(
            function onTimeout() {
                this.server.notifyClients(toInclude);
            }.bind(this)
        );
    }
};

const liveReload = new LiveReloadPlugin({
    key: fs.readFileSync(path.resolve(__dirname, "./files/server.key")),
    cert: fs.readFileSync(path.resolve(__dirname, "./files/server.crt")),
    hostname: "localhost",
    protocol: "https",
    port: 3001,
    appendScriptTag: true,
});

function recursiveIssuer(m) {
    if (m.issuer) {
        return recursiveIssuer(m.issuer);
    } else if (m.name) {
        return m.name;
    } else {
        return false;
    }
}

const plugins = [
    new ProgressBarPlugin({
        format: "Build [:bar] :percent (:elapsed seconds)",
        clear: false,
    }),
    new MiniCssExtractPlugin({
        // filename: "[name]" == "index" ? "teste.css" : `[name].css`,
        moduleFilename: ({ name }) => {
            if (name == "index") {
                return `${name.replace("index", `${NAME_PROJECT}`)}.css`;
            }
            if (name == "checkout") {
                return `${name.replace(
                    "checkout",
                    `checkout${pkgjson.vtexCheckout}`
                )}-custom.css`;
            }
            if (name == "orderplaced") {
                return `${name.replace(
                    "orderplaced",
                    `checkout-confirmation${pkgjson.vtexCheckoutConfirmation}`
                )}-custom.css`;
            }
        },

        chunkFilename: `${NAME_PROJECT}-vendor.css`,
    }),
    liveReload,
];

process.argv.indexOf("--charles") < 1 &&
    plugins.push(
        new BrowserSyncPlugin(
            {
                open: "external",
                https: true,
                ui: false,
                host: `${pkgjson.name}.vtexlocal.com.br`,
                startpath: "/admin/login/",
                browser:
                    process.argv.indexOf("--browser") > 0
                        ? process.argv[process.argv.indexOf("--browser") + 1]
                        : "",
                proxy: `https://${pkgjson.name}.vtexcommercestable.com.br`,
                serveStatic: [
                    {
                        route: ["/arquivos", "/files"],
                        dir: [DIST_DIR],
                    },
                ],
            },
            {
                reload: false,
            }
        )
    );

const config = {
    mode: "development", //
    devtool: "eval",
    output: {
        path: DIST_DIR,
        publicPath: "/dist/",
        filename: (chunkData) => {
            if (chunkData.chunk.name === "index") {
                return `${NAME_PROJECT}.min.js`;
            }
            if (chunkData.chunk.name === "checkout") {
                return `checkout${pkgjson.vtexCheckout}-custom.js`;
            }
            if (chunkData.chunk.name === "orderplaced") {
                return `checkout-confirmation${pkgjson.vtexCheckoutConfirmation}-custom.js`;
            }
        },
    },
    module: {
        rules: [
            // sass
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    "css-hot-loader",
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: true,
                        },
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            plugins: [autoprefixer("last 4 version")],
                            sourceMap: true,
                            includePaths: [
                                path.resolve(
                                    __dirname,
                                    "../node_modules/compass-mixins/lib"
                                ),
                            ],
                        },
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: true,
                            sassOptions: {
                                includePaths: [
                                    path.resolve(
                                        __dirname,
                                        "../node_modules/compass-mixins/lib"
                                    ),
                                ],
                            },
                        },
                    },
                    // resources loader
                    {
                        loader: "sass-resources-loader",
                        options: {
                            resources: [
                                path.resolve(
                                    __dirname,
                                    "../src/assets/stylesheets/_theme.scss"
                                ),
                            ],
                        },
                    },
                ],
            },
        ],
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                default: false,
                vendors: false,
                vendor: {
                    test: /[\\/](node_modules|assets)[\\/]/,
                    name: "vendor",
                    filename: `${NAME_PROJECT}-vendor.min.js`,
                    chunks: "all",
                },
                indexStyles: {
                    name: "index",
                    test: (m, c, entry = "index") =>
                        m.constructor.name === "CssModule" &&
                        recursiveIssuer(m) === entry,
                    chunks: "all",
                    enforce: true,
                },
                checkoutStyles: {
                    name: "checkout",
                    test: (m, c, entry = "checkout") =>
                        m.constructor.name === "CssModule" &&
                        recursiveIssuer(m) === entry,
                    chunks: "all",
                    enforce: true,
                },
                orderplacedStyles: {
                    name: "orderplaced",
                    test: (m, c, entry = "orderplaced") =>
                        m.constructor.name === "CssModule" &&
                        recursiveIssuer(m) === entry,
                    chunks: "all",
                    enforce: true,
                },
            },
        },
    },
    externals: {
        $: "jQuery",
        jquery: "jQuery",
        "window.jquery": "jQuery",
    },
    plugins: plugins,
};

module.exports = merge(common, config);
