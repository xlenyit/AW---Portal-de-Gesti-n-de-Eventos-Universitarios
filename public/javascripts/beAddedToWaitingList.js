$("#changeStateButton.completo").on("click", function (e)  {
    e.preventDefault();

    const eventId = $(this).attr("name");
    const url = "/events/" + eventId + "/createInscriptionWaitingList" 
    $.ajax({
        url: url, 
        method: 'POST',
        success: function (data) {
            alert("Se ha unido a la lista de espera correctamente");
            location.reload();
        }
    });

})
