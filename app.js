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
        console.log("Log in: " + username + " / " + password);
        return done(null, { username: "dummy"});
        /*User.findOne({ username: username }, function(err, user) {
         if (err) { return done(err); }
         if (!user) {
         return done(null, false, { message: 'Incorrect username.' });
         }
         if (!user.validPassword(password)) {
         return done(null, false, { message: 'Incorrect password.' });
         }
         return done(null, user);
         });*/
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.username);
});

passport.deserializeUser(function (id, done) {
    done(null, { username: "dummy"});
    /*User.findById(id, function(err, user) {
     done(err, user);
     });*/
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
        if(port != '80') req.baseUrl += ':' + port;

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
app.post('/login',
    passport.authenticate('local', { successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true })
);

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});


