$('.mark-read-btn').on("click", (e) => {
    e.preventDefault();
    const formData = $('#userInfo form').serialize();
    const url = "/markAsRead/" + $('#notificationId').val()
    console.log(url)
    $.ajax({
        url: url,
        method: 'POST',
        data: formData,
        success: function (data) {

            

            //Recargar la página para mostrar los datos actualizados
            location.reload();
        }
    });
});
