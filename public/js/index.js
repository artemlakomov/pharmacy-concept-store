$(function(){
    var app = Sammy('#content', function() {
        this.get('/', function() {
           console.log('/');
        });

        this.get('#/bonus', function() {
            console.log('bonus');
        });

        this.get('#/history', function() {
            console.log('history');
        });

        this.get('#/profile', function() {
            console.log('profile');
        });

        this.get('#/change-password', function() {
            console.log('change-password');
        });

        this.get('#/card-block', function() {
            console.log('block card');
        });

        this.get('#/card-replace', function() {
            console.log('replace card');
        });
    });

    // start the application
    app.run('/');
});