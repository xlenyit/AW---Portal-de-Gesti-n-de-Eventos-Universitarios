$('.mark-read-btn').on("click", (e) => {
    e.preventDefault();
    const formData = $('#userInfo form').serialize();
    const url = "/markAsRead/" + $('#notificationId').val()
    $.ajax({
        url: url,
        method: 'POST',
        data: formData,
        success: function (data) {
            location.reload();
        }
    });
});
