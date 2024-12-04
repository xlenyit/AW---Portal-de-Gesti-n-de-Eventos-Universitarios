$("#changeStateButton.noInscrito").on("click", function (e)  {
    e.preventDefault();

    const eventId = $(this).attr("name");
    const url = "/events/" + eventId + "/createInscription" 
    $.ajax({
        url: url, 
        method: 'POST',
        success: function (data) {
            alert("Se ha apuntado correctamente");
            location.reload();
        }
    });

})
