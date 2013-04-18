$.validator.setDefaults(
    {
        submitHandler: function () {
            //TODO: implement loader logic
        },
        showErrors: function (map, list) {

            this.currentElements.next('.error').remove();

            $.each(list, function (index, error) {
                var ee = $(error.element);
                ee.next('.error').remove();
                ee.after('<p class="error help-block"><span class="label label-important">' + error.message + '</span></p>');
            });
        }
    });

$(function () {

    var app = Sammy('#content', function () {

        this.get('/', function () {
            $('.modal').modal('hide');
        });

        this.get('#signup-dialog', function () {
            $('.modal').modal('hide');
            $('#signup-dialog').modal('show');
        });

        this.get('#signup-no-card', function () {
            $('.modal').modal('hide');
            $('#signup-no-card').modal('show');
        });

        this.get('#signup-verify-card', function () {
            $('.modal').modal('hide');
            $('#signup-verify-card').modal('show');
        });
    });

    app.run('#/');

    var options = {
        beforeSubmit: function () {
            return $('#loginForm').valid();
        },
        success: function (data) {
            $('.modal').modal('hide');
            $('#modal').find('.btn-primary').click(function () {
                window.location.href = '/';
            });
            if (data.isOK) {
                window.location.href = '/';
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

    $("#loginForm").ajaxForm(options);

    $("#loginForm").validate({
        rules: {
            username: { required: true, email: true },
            password: "required"
        },
        messages: {
            username: "Введите адрес электронной почты",
            password: "Введите пароль"
        }
    });

    var verifyOptions = {
        beforeSubmit: function () {
            $('.form-signin').find('.error').remove();
            return $('#verifyForm').valid();
        },
        success: function (data) {
            if (data.isOK) {
                window.location.href = '/signup?cardNumber=' + $('#cardNumber').val() + '&phone=' + $('#phone').val();
            } else {
                $('.form-signin').append('<p class="error help-block"><span class="label label-important">' + data.message + '</span></p>');
            }
        }
    };

    $("#verifyForm").ajaxForm(verifyOptions);

    $("#verifyForm").validate({
        rules: {
            cardNumber: { required: true, number: true, maxlength : 13, minlength:13 },
            phone: { required: true, number: true, maxlength : 10, minlength:10 }
        },
        messages: {
            cardNumber: "Введите 13 цифр номера Вашей карты, расположенных под штрих-кодом на карте",
            phone: "Введите 10 цифр номера телефона, который Вы указывали при регистрации карты"
        }
    });
});