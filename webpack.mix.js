let mix = require('laravel-mix');

mix.js('src/app.js', 'dist').setPublicPath('dist').vue({
    extractVueStyles: true,
    globalVueStyles: false
});