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

$(function () {

    var monthNames = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    var now = new Date();

    var dobDay = $('select[name=dobDay]');
    for (var i = 1; i <= 31; i++) {
        dobDay.append('<option value="' + i + '">' + i + '</option>');
    }

    var dobMonth = $('select[name=dobMonth]');
    for (var i = 1; i <= 12; i++) {
        dobMonth.append('<option value="' + i + '">' + monthNames[i - 1] + '</option>');
    }

    var year = now.getFullYear();
    var dobYear = $('select[name=dobYear]');
    for (var i = year; i >= (year - 90); i--) {
        dobYear.append('<option value="' + i + '">' + i + '</option>');
    }

    var sq = $('select[name=secretQuestion]');
    for(var i = 0; i < questions.length; i++){
        sq.append('<option value="' + i + '">' + questions[i] + '</option>');
    }

    var a = $('select[name=activity]');
    for(var i = 0; i < activities.length; i++){
        a.append('<option value="' + i + '">' + activities[i] + '</option>');
    }

    jQuery.validator.addMethod("dob", function (value, element) {
        var dob = new Date(dobYear.val() + '-' + dobMonth.val() + '-' + dobDay.val());
        $('input[name=dateOfBirth]').val(dobYear.val() + '-' + dobMonth.val() + '-' + dobDay.val());
        return dobDay.val() && dobMonth.val() && dobYear.val() && dob;
    }, "Укажите дату рождения");

    var options = {
        beforeSubmit: function () {
            return $('#signupForm').valid();
        },
        success: function (data) {
            $('#modal').find('.btn-primary').click(function () {
                window.location.href = '/';
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

    $("#signupForm").ajaxForm(options);

    $("#signupForm").validate({
        rules: {
            cardNumber: {
                required: true,
                minlength: 13,
                maxlength: 13
            },
            email: {
                required: true,
                email: true
            },
            password: {
                required: true,
                minlength: 3
            },
            confirmPassword: {
                required: true,
                equalTo: "#password"
            },
            firstName: "required",
            lastName: "required",
            city: "required",
            address: "required",
            phone: {
                required : true,
                number : true,
                minlength: 10,
                maxlength: 10
            },
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

            password: {
                required: "Введите пароль",
                minlength: "Пароль должен быть длиннее 3 символов"
            },
            confirmPassword: {
                required: "Введите пароль",
                equalTo: "Пароли должны совпадать"
            },
            city: "Введите название города",
            address: "Введите адрес",
            phone: "Введите 10 цифр телефонного номера, например ",
            activity: "Введите отрасль",
            secretQuestion: "Придумайте секретный вопрос",
            secretAnswer: "Введите ответ на секретный вопрос",
            agree: "Вы должны согласиться с условиями."
        }
    });
});