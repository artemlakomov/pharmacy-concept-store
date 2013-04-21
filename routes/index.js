var mailer = require("../model/mailer");
var passport = require('passport');
var config = require('../model/config').init();
var storage = require('../model/storage');

exports.index = function (req, res) {
    storage.calculatePointsBalance(req.user.cardNumber, function (err, points) {
        res.render('index', {
            title: res.__('DashboardTitle') + ' - ' + res.__('DashboardSubtitle'),
            points: points,
            user: req.user,
            config: config
        });
    });
};

exports.dashboard = function (req, res) {
    storage.calculatePointsBalance(req.user.cardNumber, function (err, points) {
        res.send({
            points: points,
            suggestExtendedForm: !req.user.extended
        });
    });
};

exports.login = function (req, res) {
    res.render('login', {
        title: res.__('LoginTitle'),
        config: config
    });
};

exports.verifyCard = function (req, res) {
    storage.verifyCard(req.body.cardNumber, req.body.phone, res.__, function (err) {
        if (err) {
            res.err(res.__('LoginSignupCardVerificationError'), err.toString());
        } else {
            res.ok('OK');
        }
    });
};

exports.signup = function (req, res) {
    storage.verifyCard(req.query.cardNumber, req.query.phone, res.__, function (err, cust) {
        var error = err;
        var customer = cust;
        res.render('signup', {
            title: res.__('SignupTitle') + ' - ' + res.__('SignupSubtitle'),
            config: config,
            error: error,
            customer: customer
        });
    });
};

exports.signupComplete = function (req, res) {
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
        code: req.query.code ? req.query.code : '',
        config: config
    });
};

exports.activateComplete = function (req, res) {
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
                    /*storage.addCustomerTransaction(
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
                     ); */
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
        code: req.query.code ? req.query.code : '',
        config: config
    });
};

exports.forgotPasswordComplete = function (req, res) {
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
    storage.Transaction.find({ cardNumber: req.user.cardNumber }).sort('-date').execFind(function (err, data) {
        if (err) {
            res.err(res.__('ApiErrorTitle'), err.toString());
        } else {
            res.send(data);
        }
    });
};

exports.profile = function (req, res) {
    req.user.password = null;
    res.send(req.user);
};

exports.profileUpdate = function (req, res) {

    req.user.PIN = req.body.PIN;
    req.user.firstName = req.body.firstName;
    req.user.lastName = req.body.lastName;
    req.user.gender = req.body.gender;
    req.user.dateOfBirth = req.body.dateOfBirth;
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

exports.profileExtended = function (req, res) {
    res.send(req.user.extended ? req.user.extended : {});
};

exports.profileExtendedUpdate = function (req, res) {

    for (var i = 0; i < req.body.length; i++) {
        console.log(req.body[i]);
    }

    req.user.extended = JSON.stringify(req.body);
    req.user.save(function (err) {
        if (err) {
            res.err(res.__('ApiErrorTitle'), err.toString());
        } else {
            res.ok(res.__('CommonSuccess'), res.__('ProfileUpdateSuccess'));
            try {
                storage.addCustomerTransaction(
                    req.user.cardNumber,
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
};

exports.passwordChange = function (req, res) {
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

exports.blockCard = function (req, res) {
    mailer.sendBlockCardEmail(req.user, req, res, function (err, response) {
        if (err) {
            res.err(res.__('ApiErrorTitle'), err.toString());
        } else {
            res.ok(res.__('BlockCardSuccess'), res.__('BlockCardSuccessBody'));
        }
    });
};

exports.replaceCard = function (req, res) {
    mailer.sendReplaceCardEmail(req.user, req, res, function (err, response) {
        if (err) {
            res.err(res.__('ApiErrorTitle'), err.toString());
        } else {
            res.ok(res.__('ReplaceCardSuccess'), res.__('ReplaceCardSuccessBody'));
        }
    });
};

exports.content = function (req, res) {

    var pg = req.query.page;
    var doc = null;
    if (pg == 'terms') {
        doc = 'ContentTerms';
    }

    if (!doc) {
        res.status(404).send("Not found");
        return;
    }

    fs = require('fs')
    fs.readFile(res.__(doc + 'Body'), 'utf8', function (err, data) {
        if (err) console.error(err);
        res.render('content', {
            title: res.__(doc + 'Title'),
            body: data,
            config: config
        });
    });
};