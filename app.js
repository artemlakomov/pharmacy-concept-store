/**
 * Module dependencies.
 */

var express = require('express')
    , routes = require('./routes')
    , kiwi = require('kiwi')
    , http = require('http')
    , path = require('path')
    , passport = require('passport')
    , localStrategy = require('passport-local').Strategy
    , i18n = require("i18n");

passport.use(new localStrategy(
    function (username, password, done) {
        var storage = require('./model/storage');
        storage.Customer.findOne(
            {$and: [
                { email: username.toLowerCase()} ,
                { password: password },
                { activationCode: null}
            ]},
            function (err, cust) {
                if (err || !cust) return done(null, false, { type : 'ERR_INCORRECT_PASSWORD' });
                return done(null, cust);
            });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.email);
});

passport.deserializeUser(function (id, done) {
    var storage = require('./model/storage');
    storage.Customer.findOne({ email: id},
        function (err, cust) {
            done(err, cust);
        }
    );
});

var app = express();

i18n.configure({
    locales: ['ru'],
    defaultLocale: 'ru',
    cookie: 'lang',
    directory: './lang',
    updateFiles: false,
    extension: '.json'
});

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('view engine', 'kiwi');
    app.set('views', 'views');
    app.engine('kiwi', function (filename, options, callback) {
        kiwi.__express(filename, options, function (err, rendered) {
            if (err) console.error(err);
            var content = rendered ? rendered.toString() : '';
            callback(err, content);
        });
    });
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('2hH3lLkohj6#'));
    app.use(express.session({ secret: '2hH3lLkohj6#345gjh3hh2' }));
    app.use(passport.initialize());
    app.use(passport.session());

    // default: using 'accept-language' header to guess language settings
    app.use(i18n.init);

    // binding template helpers to request (Credits to https://github.com/enyo #12)
    app.use(function (req, res, next) {
        res.locals.__ = res.__ = function () {
            return i18n.__.apply(req, arguments);
        };
        res.locals.__n = res.__n = function () {
            return i18n.__n.apply(req, arguments);
        };
        // do not forget this, otherwise your app will hang
        next();
    });

    app.use(function (req, res, next) {
        res.err = function (title, message) {
            res.send({
                isOK: false,
                title: title,
                message: message
            });
        };

        res.ok = function (title, message) {
            res.send({
                isOK: true,
                title: title,
                message: message
            });
        };

        var port = app.get('port');
        req.baseUrl = req.protocol + '://' + req.host;
        if (port != '80') req.baseUrl += ':' + port;

        next();
    });

    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
    app.use(express.errorHandler());
});

app.get('/', passport.authorize('local', { failureRedirect: '/login' }), routes.index);

app.get('/signup', routes.signup);
app.post('/signup', routes.signupComplete);

app.get('/login', routes.login);
app.post('/login', function(req, res) {
    passport.authenticate('local', function(err, user, info) {

        console.log(err);
        console.log(user);
        console.log(info);

        if (err) {
            res.err(res.__('LoginError'), err.toString());
            return;
        }

        if (!user) {
            res.err(res.__('LoginError'), res.__('LoginIncorrectCredentials'));
            return;
        }

        req.logIn(user, function(err) {
            if (err) {
                res.err(res.__('LoginError'), err.toString());
                return;
            }
            res.ok(res.__('LoginSuccess'), res.__('LoginSuccessRedirect'));
        });
    })(req, res);
});

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

app.get('/activate', routes.activate);
app.post('/activate', routes.activateComplete);

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});


