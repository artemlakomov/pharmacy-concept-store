$(function () {
    var app = Sammy('#content', function () {
        this.get('#/', function () {
            this.load('/dashboard', { json: true }).then(function (data) {
                app.swap('<div data-bind="template : { name : \'dashboard\' }"></div>');
                ko.applyBindings(data, document.getElementById('content'));
            });
        });

        this.get('#/bonus', function () {
            this.load('/bonus', { json: true }).then(function (data) {
                app.swap('<div data-bind="template : { name : \'bonus\' }"></div>');
                ko.applyBindings(new BonusViewModel(app, data), document.getElementById('content'));
            });
        });

        this.get('#/history', function () {
            this.load('/history', { json: true }).then(function (data) {
                app.swap('<div data-bind="template : { name : \'history\', afterRender : init }"></div>');
                ko.applyBindings(new HistoryViewModel(app, data), document.getElementById('content'));
            });
        });

        this.get('#/profile', function () {
            this.load('/profile', { json: true }).then(function (data) {
                app.swap('<div data-bind="template : { name : \'profile\', afterRender : init }"></div>');
                ko.applyBindings(new ProfileViewModel(app, data), document.getElementById('content'));
            });
        });

        this.get('#/profile-extended', function () {
            this.load('/profile-extended', { json: true }).then(function (data) {
                app.swap('<div data-bind="template : { name : \'profile-extended\', afterRender : init }"></div>');
                ko.applyBindings(new ProfileExViewModel(app, data), document.getElementById('content'));
            });
        });

        this.get('#/change-password', function () {
            app.swap('<div data-bind="template : { name : \'password\', afterRender : init }"></div>');
            ko.applyBindings(new PasswordViewModel(app), document.getElementById('content'));
        });

        this.get('#/card-block', function () {
            app.swap('<div data-bind="template : { name : \'block-card\', afterRender : init }"></div>');
            ko.applyBindings(new BlockCardViewModel(app), document.getElementById('content'));
        });

        this.get('#/card-replace', function () {
            app.swap('<div data-bind="template : { name : \'replace-card\', afterRender : init }"></div>');
            ko.applyBindings(new ReplaceCardViewModel(app), document.getElementById('content'));
        });
    });

    // start the application
    app.run('#/');

    ko.bindingHandlers.dateString = {
        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var value = valueAccessor(),
                allBindings = allBindingsAccessor();
            var valueUnwrapped = parseISO8601(ko.utils.unwrapObservable(value));
            var pattern = allBindings.datePattern || 'MM/dd/yyyy';
            $(element).text(valueUnwrapped.toString(pattern));
        }
    }
});

function BonusViewModel(app, data) {
    var self = this;
    self.app = app;
    self.data = data;
    self.data.balance = self.data.earned - self.data.spent;
}

function HistoryViewModel(app, data) {
    var self = this;
    self.app = app;
    self.data = data;

    self.init = function () {
        $('#historyTable').dataTable({
            oLanguage: {
                sUrl: "/theme/scripts/DataTables/localization/ru.txt"
            }
        });
    }
}

function ProfileViewModel(app, data) {
    var self = this;
    self.app = app;
    data.date = parseISO8601(data.dateOfBirth);

    self.data = ko.observable(data)();

    self.init = function () {

        $('input[name=contactByEmail]').attr('checked', self.data.contactByEmail);
        $('input[name=contactBySMS]').attr('checked', self.data.contactBySMS);

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
        dobMonth.val(self.data.date.getMonth() + 1);

        var year = now.getFullYear();
        var dobYear = $('select[name=dobYear]');
        for (var i = year; i >= (year - 90); i--) {
            dobYear.append('<option value="' + i + '">' + i + '</option>');
        }
        dobYear.val(self.data.date.getFullYear());

        if (self.data.gender == 'M' || !self.data.gender) {
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
            beforeSubmit: function () {
                return $('#profileForm').valid();
            },
            success: function (data) {
                $('#modal').find('.btn-primary').click(function () {
                    self.app.setLocation('#/');
                });
                if (data.isOK) {
                    self.app.setLocation('#/');
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

function ProfileExViewModel(app, data) {
    var self = this;
    self.app = app;

    self.optionsNumberOfPeople = ko.observableArray([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    data.kids = ko.observableArray(data.kids ? data.kids : []);
    if (data.kids.length == 0) {
        for (var i = 0; i < 5; i++) {
            data.kids.push({ id: i, age: ''});
        }
    }
    data.medicines = ko.observableArray(data.medicines ? data.medicines : []);

    self.data = ko.observable(data)();

    self.init = function () {

        jQuery.validator.addMethod("med", function (value, element) {
            return ($('input.med:checked').length > 0);
        }, "Выберите хотя бы какие-то препараты");

        var ml = '';
        for (var i = 0; i < medicines.length; i++) {
            ml += '<div class="control-group">';
            var med = medicines[i];
            ml += '<h4>' + med.name + '</h4>';
            if (med.items && med.items.length > 0) {
                for (var j = 0; j < med.items.length; j++) {
                    ml += '<label class="checkbox"><input type="checkbox" name="medicines" class="checkbox med" value="' + med.name + '-' + med.items[j] + '" /> ' + med.items[j] + '</label>';
                }

            } else {
                ml += '<label class="checkbox"><input type="checkbox" name="medicines" class="checkbox med" value="' + med.name + '" /> ' + med.name + '</label>';
            }
            if (med.other) {
                ml += '<input class="span12" name="' + med.name + ' (прочее)" type="text"/>';
            }
            ml += '</div>';
        }
        $('#medicines').html(ml);
        $('#medicines').find("input[type=checkbox]").uniform();

        $('#medicinesTrigger').click(function () {
            $('#medicinesModal').modal('show');
            return false;
        });

        ml = '';
        for (var i = 0; i < services.length; i++) {

            ml += '<div class="control-group">';
            ml += '<label class="checkbox span6"><input type="checkbox" name="services" class="checkbox" value="' + services[i] + '" /> ' + services[i] + ' (как часто)</label>';
            ml += '<input class="span6" type="text" name="' + services[i] + ' (как часто)"/>';
            ml += '</div>';

        }

        $('#services').html(ml);
        $('#services').find("input[type=checkbox]").uniform();

        ml = '';
        for (var i = 0; i < cosmetology.length; i++) {

            ml += '<div class="control-group">';
            ml += '<label class="checkbox"><input type="checkbox" name="cosmetology" class="checkbox" value="' + cosmetology[i] + '" /> ' + cosmetology[i] + '</label>';
            ml += '</div>';

        }

        $('#cosmetology').html(ml);
        $('#cosmetology').find("input[type=checkbox]").uniform();

        $('#privacy').find("input[type=checkbox]").uniform();

        var options = {
            beforeSubmit: function () {
                if (!$('#profileExForm').valid()) return false;
                return true;
            },
            success: function (data) {
                $('#modal').find('.btn-primary').click(function () {
                    self.app.setLocation('#/');
                });
                if (data.isOK) {
                    self.app.setLocation('#/');
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
        $("#profileExForm").ajaxForm(options);

        $("#profileExForm").validate({
            rules: {
                numberOfPeople: "required",
                healthStatus: "required",
                stores: "required",
                financeStatus: "required",
                hobby: "required",
                sports: "required",
                agree: "required",
                medicinesTrigger: { med: true }
            },
            messages: {
                agree: "Вы должны согласиться с условиями."
            }
        });
    };
}

function parseISO8601(dateStringInRange) {
    var isoExp = /^\s*(\d{4})-(\d\d)-(\d\d)\s*$/,
        date = new Date(NaN), month,
        parts = isoExp.exec(dateStringInRange.split('T')[0]);

    if (parts) {
        month = +parts[2];
        date.setFullYear(parts[1], month - 1, parts[3]);
        if (month != date.getMonth() + 1) {
            date.setTime(NaN);
        }
    }
    return date;
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

function PasswordViewModel(app) {
    var self = this;
    self.app = app;
    self.data = ko.observable({
        current: '',
        nevv: '',
        confirm: ''
    });

    self.init = function () {
        var options = {
            beforeSubmit: function () {
                return $('#passwordForm').valid();
            },
            success: function (data) {
                $('#modal').find('.btn-primary').click(function () {
                    self.app.setLocation('#/');
                    $('#modal').modal('hide');
                });
                if (data.isOK) {
                    $('#modal').find('.close').hide();
                    $('#modal').find('button[data-dismiss="modal"]').hide();
                    $('#modal').find('.btn-primary').show();
                } else {
                    $('#modal').find('.close').show();
                    $('#modal').find('button[data-dismiss="modal"]').show();
                    $('#modal').find('.btn-primary').hide();
                }

                $('#modal').find('h3').html(data.title);
                $('#modal').find('.modal-body').html(data.message);

                $('#modal').modal('show');
            }
        };
        $("#passwordForm").ajaxForm(options);

        $("#passwordForm").validate({
            rules: {
                current: "required",
                nevv: {
                    required: true,
                    minlength: 3
                },
                confirm: {
                    required: true,
                    equalTo: "#new"
                }
            },
            messages: {
                current: "Введите текущий пароль",
                nevv: {
                    required: "Введите новый пароль",
                    minlength: "Пароль должен быть длиннее 3 символов"
                },
                confirm: {
                    required: "Введите подтверждение пароля",
                    equalTo: "Пароли должны совпадать"
                }
            }
        });
    };
}

function BlockCardViewModel(app) {
    var self = this;
    self.app = app;

    self.init = function () {
        $('#button-block-card').click(function () {
            $.post('/block-card', function (data) {
                $('#modal').find('.btn-primary').click(function () {
                    self.app.setLocation('#/');
                    $('#modal').modal('hide');
                });
                if (data.isOK) {
                    $('#modal').find('.close').hide();
                    $('#modal').find('button[data-dismiss="modal"]').hide();
                    $('#modal').find('.btn-primary').show();
                } else {
                    $('#modal').find('.close').show();
                    $('#modal').find('button[data-dismiss="modal"]').show();
                    $('#modal').find('.btn-primary').hide();
                }

                $('#modal').find('h3').html(data.title);
                $('#modal').find('.modal-body').html(data.message);

                $('#modal').modal('show');
            });
        });

        $('#button-block-cancel').click(function () {
            self.app.setLocation('#/')
        });
    };
}

function ReplaceCardViewModel(app) {
    var self = this;
    self.app = app;

    self.init = function () {
        $('#button-replace-card').click(function () {
            $.post('/replace-card', function (data) {
                $('#modal').find('.btn-primary').click(function () {
                    self.app.setLocation('#/');
                    $('#modal').modal('hide');
                });
                if (data.isOK) {
                    $('#modal').find('.close').hide();
                    $('#modal').find('button[data-dismiss="modal"]').hide();
                    $('#modal').find('.btn-primary').show();
                } else {
                    $('#modal').find('.close').show();
                    $('#modal').find('button[data-dismiss="modal"]').show();
                    $('#modal').find('.btn-primary').hide();
                }

                $('#modal').find('h3').html(data.title);
                $('#modal').find('.modal-body').html(data.message);

                $('#modal').modal('show');
            });
        });

        $('#button-replace-cancel').click(function () {
            self.app.setLocation('#/')
        });
    };
}