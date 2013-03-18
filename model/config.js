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
        }
    };
};

