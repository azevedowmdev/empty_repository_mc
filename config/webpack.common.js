const path = require("path");
const webpack = require("webpack");

const ROOT_DIR = path.resolve(__dirname, "../");
const STORE_DIR = path.resolve(ROOT_DIR, "src");

const config = {
    entry: {
        index: ["@babel/polyfill", path.join(STORE_DIR, "index-store")],
        checkout: path.join(STORE_DIR, "index-checkout"),
        orderplaced: path.join(
            STORE_DIR,
            "index-orderplaced"
        )
    },
    resolve: {
        modules: ["node_modules"],
        extensions: [".js", ".css", ".scss"],
        alias: {
            stylesheets: path.join(ROOT_DIR, "src/assets/stylesheets"),
            javascripts: path.join(ROOT_DIR, "src/assets/javascripts"),
            images: path.join(ROOT_DIR, "src/assets/images")
        }
    },
    module: {
        rules: [
            {
                // js
                test: /\.js$/,
                use: "babel-loader",
                exclude: [path.resolve(ROOT_DIR, "node_modules")]
            },
            // images
            {
                test: /\.(png|ico|gif|svg|jpe?g)(\?[a-z0-9]+)?$/,
                use: "url-loader"
            },
            // fonts
            { test: /\.(woff|woff2|eot|ttf|otf)$/, use: ["url-loader"] }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV)
            }
        })
    ],
    output: {
        jsonpFunction: `webpackJsonp_corebiz`
    }
};

module.exports = config;
