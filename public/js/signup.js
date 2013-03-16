$.validator.setDefaults(
    {
        submitHandler: function() {
            //TODO: implement loader logic
        },
        showErrors: function(map, list)
        {
            this.currentElements.parents('label:first, .controls:first').find('.error').remove();
            this.currentElements.parents('.control-group:first').removeClass('error');

            $.each(list, function(index, error)
            {
                var ee = $(error.element);
                var eep = ee.parents('label:first').length ? ee.parents('label:first') : ee.parents('.controls:first');

                ee.parents('.control-group:first').addClass('error');
                eep.find('.error').remove();
                eep.append('<p class="error help-block"><span class="label label-important">' + error.message + '</span></p>');
            });
        }
    });

$(function()
{
    // validate signup form on keyup and submit
    $("#signupForm").ajaxForm(function(data){
        $('#modal').find('.btn-primary').click(function(){
           window.location.href = '/';
        });
        if(data.isOK){
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

    $("#signupForm").validate({
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
            phone: "required",
            activity: "required",
            secretQuestion: "required",
            secretAnswer: "required",
            agree: "required"
        },
        messages: {
            cardNumber: "Введите номер Вашей карты",
            email: {
                required: "Введите адрес Вашей электронной почты",
                email: "Введите корректный адрес электронной почты"
            },
            PIN : {
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
            phone: "Введите номер телефона",
            activity: "Введите отрасль",
            secretQuestion: "Придумайте секретный вопрос",
            secretAnswer: "Введите ответ на секретный вопрос",
            agree: "Вы должны согласиться с условиями."
        }
    });
});