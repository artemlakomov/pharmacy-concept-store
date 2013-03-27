var mailer = require("../model/mailer");
var passport = require('passport');
var config = require('../model/config').init();

exports.index = function (req, res) {
    var points = 100;
    res.render('index', {
        title: res.__('DashboardTitle') + ' - ' + res.__('DashboardSubtitle'),
        points: points
    });
};

exports.login = function (req, res) {
    res.render('login', {
        title: res.__('LoginTitle')
    });
};

exports.signup = function (req, res) {
    res.render('signup', {
        title: res.__('SignupTitle') + ' - ' + res.__('SignupSubtitle')
    });
};

exports.signupComplete = function (req, res) {

    var storage = require('../model/storage');
    var tc = new storage.Customer(req.body);

    if (!tc.contactByEmail) tc.contactByEmail = false;
    if (!tc.contactBySMS) tc.contactBySMS = false;

    storage.Customer.findOne({
        $or: [
            { cardNumber: tc.cardNumber.toLowerCase() },
            { email: tc.email.toLowerCase() }
        ]}, function (err, cust) {

        if (cust != null) {
            res.err(res.__('SignupErrorTitle'), res.__('SignupCustomerExists'));
            return;
        }

        tc.email = tc.email.toLowerCase();
        tc.cardNumber = tc.cardNumber.toLowerCase();
        tc.activationCode = require('../model/randomstring').generate();

        tc.save(function (err) {
            if (err) {
                res.err(res.__('SignupErrorTitle'), err.toString());
            } else {
                mailer.sendActivationEmail(tc, req, res, function (err, response) {
                    if (err) {
                        res.err(res.__('SignupErrorTitle'), err.toString());
                    } else {
                        res.ok(res.__('SignupSuccessTitle'), res.__('SignupSuccessBody'));
                    }
                });
            }
        });
    });
};

exports.activate = function (req, res) {
    res.render('activate', {
        title: res.__('ActivateTitle') + ' - ' + res.__('ActivateSubtitle'),
        code: req.query.code ? req.query.code : ''
    });
};

exports.activateComplete = function (req, res) {

    var storage = require('../model/storage');

    storage.Customer.findOne({ activationCode: req.body.code }, function (err, cust) {

        if (!cust) {
            res.err(res.__('ActivateErrorTitle'), res.__('ActivateErrorIncorrectCode'));
            return;
        }

        cust.activationCode = null;
        cust.save(function (err) {
            if (err) {
                res.err(res.__('ActivateErrorTitle'), err.toString());
            } else {
                res.ok(res.__('ActivateSuccessTitle'), res.__('ActivateSuccessBody'));
                try {
                    storage.addCustomerTransaction(
                        cust.cardNumber,
                        '',
                        res.__('ActivateWelcomeBonus'),
                        0,
                        config.welcomePointsBonus,
                        new Date(),
                        function (err) {
                            if (err) console.error(err);
                            else {
                                mailer.sendWelcomeBonusEmail(cust, req, res, function (err) {
                                    if (err) console.error(err);
                                });
                            }
                        }
                    );
                }
                catch (e) {
                    console.error(e);
                }
            }
        });
    });
};

exports.forgotPassword = function (req, res) {
    res.render('forgot-password', {
        title: res.__('ForgotPasswordTitle') + ' - ' + res.__('ForgotPasswordSubtitle'),
        code: req.query.code ? req.query.code : ''
    });
};

exports.forgotPasswordComplete = function (req, res) {
    var storage = require('../model/storage');
    storage.Customer.findOne({ activationCode: null, email: req.body.email.toLowerCase() }, function (err, cust) {

        if (!cust) {
            res.err(res.__('ForgotPasswordErrorTitle'), res.__('ForgotPasswordErrorNotFound'));
            return;
        }

        cust.password = require('../model/randomstring').generate(7);

        cust.save(function (err) {
            if (err) {
                res.err(res.__('ForgotPasswordErrorTitle'), err.toString());
            } else {
                mailer.sendPasswordEmail(cust, req, res, function (err, response) {
                    if (err) {
                        res.err(res.__('ForgotPasswordErrorTitle'), err.toString());
                    } else {
                        res.ok(res.__('ForgotPasswordSuccessTitle'), res.__('ForgotPasswordSuccessBody'));
                    }
                });
            }
        });

    });
}

/************** API routes **********************/
exports.transaction = function (req, res) {
    if (config.ip.indexOf(req.ip) == -1) {
        res.send(403, 'Forbidden');
        return;
    }

    var storage = require('../model/storage');
    var t = new storage.Transaction(req.body);
    t.save(function (err) {
        if (err) {
            res.err(res.__('ApiErrorTitle'), err.toString());
        } else {
            res.ok("API", "OK");
        }
    });
};

/************** User account routes *********************/
exports.bonus = function (req, res) {
    var storage = require('../model/storage');
    storage.Transaction.find({ cardNumber: req.user.cardNumber }, function (err, data) {
        if (err) {
            res.err(res.__('ApiErrorTitle'), err.toString());
        } else {
            var result = { earned: 0, spent: 0 };
            data.forEach(function (item) {
                if (item.points > 0) result.earned += item.points;
                if (item.points < 0) result.spent += Math.abs(item.points);
            });
            res.send(result);
        }
    });
};

exports.history = function (req, res) {
    var storage = require('../model/storage');
    storage.Transaction.find({ cardNumber: req.user.cardNumber }).sort('-date').execFind(function (err, data) {
        if (err) {
            res.err(res.__('ApiErrorTitle'), err.toString());
        } else {
            res.send(data);
        }
    });
};

exports.profile = function (req, res) {
    res.send(req.user);
};

exports.profileUpdate = function (req, res) {

    req.user.PIN = req.body.PIN;
    req.user.firstName = req.body.firstName;
    req.user.lastName = req.body.lastName;
    req.user.gender = req.body.gender;
    req.user.dateOfBirth = req.body.dateOfBirth;
    console.log(req.user.dateOfBirth);
    req.user.city = req.body.city;
    req.user.address = req.body.address;
    req.user.phone = req.body.phone;
    req.user.activity = req.body.activity;
    req.user.secretQuestion = req.body.secretQuestion;
    req.user.secretAnswer = req.body.secretAnswer;
    req.user.contactByEmail = req.body.contactByEmail ? req.body.contactByEmail : false;
    req.user.contactBySMS = req.body.contactBySMS ? req.body.contactBySMS : false;

    req.user.save(function (err) {
        if (err) {
            res.err(res.__('ApiErrorTitle'), err.toString());
        } else {
            res.ok(res.__('CommonSuccess'), res.__('ProfileUpdateSuccess'));
        }
    });

};

exports.profileUpdate = function (req, res) {
    if (req.user.password != req.body.current) {
        res.err(res.__('PasswordError'), res.__('PasswordWrongCurrent'));
        return;
    }

    if (!req.body.new || req.body.new != req.body.confirm) {
        res.err(res.__('PasswordError'), res.__('PasswordWrongNew'));
        return;
    }

    req.user.password = req.body.new;

    req.user.save(function (err) {
        if (err) {
            res.err(res.__('ApiErrorTitle'), err.toString());
        } else {
            mailer.sendPasswordEmail(req.user, req, res, function (err, response) {
                if (err) {
                    res.err(res.__('PasswordError'), err.toString());
                } else {
                    res.ok(res.__('PasswordSuccess'), res.__('ForgotPasswordSuccessBody'));
                }
            });
        }
    });

}