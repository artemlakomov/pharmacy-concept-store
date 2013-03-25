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

    // validate activation
    $("#loginForm").ajaxForm(function (data) {
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
    });

    $("#loginForm").validate({
        rules: {
            username: { required : true, email : true },
            password: "required"
        },
        messages: {
            username: "Введите адрес электронной почты",
            password: "Введите пароль"
        }
    });
});