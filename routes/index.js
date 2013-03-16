
/*
 * GET home page.
 */

exports.index = function(req, res){
    var model = require('../model/storage');
    var tc = new model.Customer({
        email: 'test@integritum.eu',
        password: '123',
        cardNumber : '0001-0001-0001-0001'
    });
    tc.save(function (err) {
        if (err)
            console.log(err);
    });
    console.log(tc);

    res.render('index', { title: 'Express' });
};

exports.login = function(req, res){
    res.render('login', {
        title : res.__('LoginTitle')
    });
};

exports.signup = function(req, res){
    res.render('signup',{
        title : res.__('SignupTitle') + ' - ' + res.__('SignupSubtitle')
    });
};

exports.signupComplete = function(req, res){
    res.send({
        isOK : true,
        title: res.__('SignupSuccessTitle'),
        message : res.__('SignupSuccessBody')
    });
};