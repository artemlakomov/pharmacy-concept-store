var mailer = require("../model/mailer");

exports.index = function (req, res) {
    res.render('index', { title: 'Express' });
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

    storage.Customer.findOne({
        $or: [
            { cardNumber: tc.cardNumber },
            { email: tc.email }
        ]}, function (err, cust) {

        if (cust != null) {
            res.err(res.__('SignupErrorTitle'), res.__('SignupCustomerExists'));
            return;
        }

        tc.activationCode = require('../model/randomstring').generate();

        tc.save(function (err) {
            if (err) {
                res.err(res.__('SignupErrorTitle'), err.toString());
            } else {
                mailer.sendActivationEmail(tc, req, res, function(err, response){
                    if(err){
                        res.err(res.__('SignupErrorTitle'), err.toString());
                    } else {
                        res.ok(res.__('SignupSuccessTitle'), res.__('SignupSuccessBody'));
                    }
                });
            }
        });
    });
};