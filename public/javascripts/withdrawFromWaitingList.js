$("#changeStateButton.enEspera").on("click", function (e)  {
    e.preventDefault();

    const eventId = $(this).attr("name");
    const url = "/events/" + eventId + "/deleteInscriptionWaitingList" 
    $.ajax({
        url: url, 
        method: 'POST',
        success: function (data) { 
            alert("Se ha desapuntado de la lista de espera del evento correctamente");
            location.reload();
        }
    });

})