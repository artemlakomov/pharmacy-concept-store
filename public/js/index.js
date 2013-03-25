$(function(){
    var app = Sammy('#content', function() {
        this.get('/', function() {
           app.swap('<!-- ko template : { name : \'dashboard\' } --><!-- /ko -->');
           ko.applyBindings({}, document.getElementById('content'));
        });

        this.get('#/bonus', function() {
            this.load('/bonus', { json : true }).then(function(data){
                app.swap('<!-- ko template : { name : \'bonus\' } --><!-- /ko -->');
                ko.applyBindings(new BonusViewModel(app, data), document.getElementById('content'));
            });
        });

        this.get('#/history', function() {
            this.load('/history', { json : true }).then(function(data){
                app.swap('<!-- ko template : { name : \'history\', afterRender : init } --><!-- /ko -->');
                ko.applyBindings(new HistoryViewModel(app, data), document.getElementById('content'));
            });
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

    ko.bindingHandlers.dateString = {
        update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
            var value = valueAccessor(),
                allBindings = allBindingsAccessor();
            var valueUnwrapped = new Date(ko.utils.unwrapObservable(value));
            var pattern = allBindings.datePattern || 'MM/dd/yyyy';
            $(element).text(valueUnwrapped.toString(pattern));
        }
    }
});

function BonusViewModel(app, data){
    var self = this;
    self.app = app;
    self.data = data;
    self.data.balance = self.data.earned - self.data.spent;
}

function HistoryViewModel(app, data){
    var self = this;
    self.app = app;
    self.data = data;

    self.init = function(){
          $('#historyTable').dataTable();
    }
}