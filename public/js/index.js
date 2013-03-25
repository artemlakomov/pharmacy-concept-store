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
            this.load('/profile', { json : true }).then(function(data){
                app.swap('<!-- ko template : { name : \'profile\', afterRender : init } --><!-- /ko -->');
                ko.applyBindings(new ProfileViewModel(app, data), document.getElementById('content'));
            });
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

function ProfileViewModel(app, data){
    var self = this;
    self.app = app;
    data.date = new Date(data.dateOfBirth);
    self.data = ko.observable(data)();

    self.init = function(){
        var monthNames = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
        var now = new Date();

        var dobDay = $('select[name=dobDay]');
        for (var i = 1; i <= 31; i++) {
            dobDay.append('<option value="' + i + '">' + i + '</option>');
        }
        dobDay.val(self.data.date.getDate());

        var dobMonth = $('select[name=dobMonth]');
        for (var i = 1; i <= 12; i++) {
            dobMonth.append('<option value="' + i + '">' + monthNames[i - 1] + '</option>');
        }
        dobMonth.val(self.data.date.getMonth());

        var year = now.getFullYear();
        var dobYear = $('select[name=dobYear]');
        for (var i = year; i >= (year - 90); i--) {
            dobYear.append('<option value="' + i + '">' + i + '</option>');
        }
        dobYear.val(self.data.date.getFullYear());

        if(self.data.gender == 'M' || !self.data.gender){
            $('input[value=M]').attr('checked', 'checked');
        } else {
            $('input[value=F]').attr('checked', 'checked');
        }

        jQuery.validator.addMethod("dob", function (value, element) {
            var dob = new Date(dobYear.val() + '-' + dobMonth.val() + '-' + dobDay.val());
            $('input[name=dateOfBirth]').val(dobYear.val() + '-' + dobMonth.val() + '-' + dobDay.val());
            return dobDay.val() && dobMonth.val() && dobYear.val() && dob;
        }, "Укажите дату рождения");

        var options = {
            beforeSubmit:  function(){
                return $('#profileForm').valid();
            },
            success: function (data) {
                $('#modal').find('.btn-primary').click(function () {
                    self.app.setLocation('/');
                });
                if (data.isOK) {
                    self.app.setLocation('/');
                } else {
                    $('#modal').find('.close').show();
                    $('#modal').find('button[data-dismiss="modal"]').show();
                    $('#modal').find('.btn-primary').hide();

                    $('#modal').find('h3').html(data.title);
                    $('#modal').find('.modal-body').html(data.message);

                    $('#modal').modal('show');
                }
            }
        };
        $("#profileForm").ajaxForm(options);

        $("#profileForm").validate({
            rules: {
                cardNumber: "required",
                email: {
                    required: true,
                    email: true
                },
                PIN: {
                    required: true,
                    number: true,
                    maxlength: 4
                },
                firstName: "required",
                lastName: "required",
                city: "required",
                address: "required",
                phone: "required",
                activity: "required",
                secretQuestion: "required",
                secretAnswer: "required",
                agree: "required",
                dobDay: { dob: true},
                dobMonth: { dob: true},
                dobYear: { dob: true}
            },
            messages: {
                cardNumber: "Введите номер Вашей карты",
                email: {
                    required: "Введите адрес Вашей электронной почты",
                    email: "Введите корректный адрес электронной почты"
                },
                PIN: {
                    required: "Введите 4 цифры PIN-кода",
                    number: "Введите 4 цифры PIN-кода",
                    maxlength: "Введите 4 цифры PIN-кода"
                },
                firstName: "Введите Ваше имя",
                lastName: "Введите Вашу фамилию",
                city: "Введите название города",
                address: "Введите адрес",
                phone: "Введите номер телефона",
                activity: "Введите отрасль",
                secretQuestion: "Придумайте секретный вопрос",
                secretAnswer: "Введите ответ на секретный вопрос",
                agree: "Вы должны согласиться с условиями."
            }
        });
    };
}

$.validator.setDefaults(
    {
        submitHandler: function () {
            //TODO: implement loader logic
        },
        showErrors: function (map, list) {
            this.currentElements.parents('label:first, .controls:first').find('.error').remove();
            this.currentElements.parents('.control-group:first').removeClass('error');

            $.each(list, function (index, error) {
                var ee = $(error.element);
                var eep = ee.parents('label:first').length ? ee.parents('label:first') : ee.parents('.controls:first');

                ee.parents('.control-group:first').addClass('error');
                eep.find('.error').remove();
                eep.append('<p class="error help-block"><span class="label label-important">' + error.message + '</span></p>');
            });
        }
    });
