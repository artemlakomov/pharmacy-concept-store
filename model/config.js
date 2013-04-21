exports.init = function () {
    //from: 'info@pharm-concept.com.ua',
    return {
        from: 'mailer@integritum.eu',
        smtp: {
            service: "GMail",
            auth: {
                user: "mailer@integritum.eu",
                pass: "21SbLD#81"
            }
        },
        ip: ['127.0.0.1','77.91.167.57'],
        welcomePointsBonus : 300,
        managerEmail : 'manager@integritum.eu',
        public: 'http://pharm-concept.com.ua',
        //mongo: 'mongodb://localhost/test'
        mongo: 'mongodb://nodejitsu:d12c4399bdd812032f140c64fb844a90@linus.mongohq.com:10016/nodejitsudb5664132360'
    };
};

