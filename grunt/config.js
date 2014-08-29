function mountFolder(connect, dir) {
    return connect.static(require('path').resolve(dir));
}
var lrSnippet = require('connect-livereload')();


/* mock server related */
function requireUncached(module) {
    try {
        delete require.cache[require.resolve(module)]
    } catch (e) {
        console.log(e);
    }
    return require(module)
}

module.exports = function(grunt) {

    var _ = grunt.util._,
        fs = require('fs');
    // configurable paths
    var pathConfig = {
        app: 'app',
        dist: 'dist',
        tmp: '.tmp',
        test: 'test',
        sass: 'app/styles',
        css: '.tmp/styles',
        js: 'app/scripts'
    };

    // load outside config blocks
    var configOpts = {};
    _.each(fs.readdirSync('grunt'), function(file) {
        if (!~['config.js', '_tasks.js'].indexOf(file)) {
            _.extend(configOpts, require('./' + file));
        }
    });
    var rewriteRules = _.map(['analytics', 'channels', 'dashboard', 'events', 'metrics', 'mq', 'report', 'subscribe'], function(mod) {
        return '^/' + mod + '/?.*$ /index.html';
    });

    // short task config defined here
    _.extend(configOpts, {
        paths: pathConfig,
        ngAnnotate: {
            options: {
                singleQuotes: true,
            }
        },
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= paths.dist %>/javascripts/**/*.js',
                        '<%= paths.dist %>/stylesheets/**/*.css',
                        '<%= paths.dist %>/images/**/*.{webp,gif,png,jpg,jpeg,ttf,otf}'
                    ]
                }
            }
        },
        requirejs: {
            dist: {
                options: {
                    optimize: 'uglify',
                    uglify: {
                        toplevel: true,
                        ascii_only: false,
                        beautify: false
                    },
                    preserveLicenseComments: true,
                    useStrict: false,
                    wrap: true
                }
            }
        },
        connect: {
            options: {
                port: 9000,
                hostname: '*'
            },
            server: {
                options: {
                    livereload: 35722,
                    middleware: function(connect) {
                        return [
                            function fakeDataMiddleware(req, res, next) {
                                _.each(requireUncached('../mock/config'), function(data, url) {
                                    var method = url.split(' ')[0];
                                    var path = new RegExp(url.split(' ')[1]);

                                    if (req.method === method && path.test(req.url)) {
                                        if (_.isFunction(data)) {
                                            data = data(req);
                                        }
                                        res.writeHead(200);
                                        res.end(JSON.stringify(data));
                                        // res.setHeader('Content-Type', 'application/json; charset=utf-8');
                                        return;
                                    }
                                });
                                next();
                            },
                            require('grunt-connect-proxy/lib/utils').proxyRequest,
                            lrSnippet,
                            require('connect-modrewrite')(rewriteRules),
                            mountFolder(connect, pathConfig.tmp),
                            mountFolder(connect, pathConfig.app)
                        ];
                    },
                    open: true,
                    useAvailablePort: true
                },
                /*{
                    context: '/api/v1',
                    host: 'muce3.apiary-mock.com',
                    changeOrigin: true
                }*/
                proxies: [{
                    context: '/api/v1',
                    host: '10.0.66.51',
                    port: 8080,
                    changeOrigin: true,
                    rewrite: {
                        '^/api/v1': '/muce3-webapp/api/v1'
                    }
                }, {
                    context: '/muce-webapp',
                    host: 'muce.corp.wandoujia.com',
                    changeOrigin: true,
                    headers: {
                        cookie: 'JSESSIONID=1qebhtxknrsw1u5jzn5evdgf0; c_cdid_null=b8617093439841909fe5ad22809e8e6b1c7dedb0; c_cdid_1531783=9325055806ba4687a2807b13188b8ac554eb51b7; c_cdid_7480662=5407c75cb4324b9c817037cb3d13a874c6bdf337; __utma=7461940.931621540.1404448786.1405399968.1405399973.13; __utmc=7461940; __utmz=7461940.1405399973.13.13.utmcsr=web|utmccn=(not%20set)|utmcmd=bbs.wandoujia.com/static/campaign/wdcoin/index.html; Hm_lvt_c680f6745efe87a8fabe78e376c4b5f9=1405379547,1405749704; Hm_lpvt_c680f6745efe87a8fabe78e376c4b5f9=1405749704; c_cdid_3260552=b8617093439841909fe5ad22809e8e6b1c7dedb0; name=gaohailang; _ga=GA1.2.931621540.1404448786; wdj_auth=_V3emFuemhpQHdhbmRvdWppYS5jb206MTQzNzQ0NzIyMjY1ODowYmNiM2I4YzVmOTJhYTc0ZGZjM2FjMzM1M2VhYjdiMA',
                        host: 'muce.corp.wandoujia.com'
                    }
                }]
            }
        }
    });

    grunt.initConfig(configOpts);

    return grunt;
};