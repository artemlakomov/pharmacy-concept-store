var config = require("./config").init();
var nodemailer = require("nodemailer");
var kiwi = require('kiwi');
var path = require('path');

exports.sendActivationEmail = function (customer, req, res, next) {
    var template = new kiwi.Template().loadAndRender('./views/mail/signup-confirmation.kiwi',
        { customer : customer, baseUrl : req.baseUrl},
        function onRendered(err, rendered) {

        var smtpTransport = nodemailer.createTransport("SMTP", config.smtp);

        var mailOptions = {
            from: config.from,
            to: customer.email,
            subject: res.__('SignupWelcomeMailTitle'),
            text: "Please refer to HTML version of this email",
            html: rendered.toString()
        }

        console.log(mailOptions);

        smtpTransport.sendMail(mailOptions, function (err, response) {
            if (err)console.log(err);
            smtpTransport.close();
            if (next)next(err, response);
        });
    });
}