$("#changeStateButton.noInscrito").on("click", function (e)  {
    e.preventDefault();

    const eventId = $(this).attr("name");
    const url = "/events/" + eventId + "/createInscription" 
    console.log("aasas",$(this), eventId, url)
    $.ajax({
        url: url, 
        method: 'POST',
        success: function (data) {
            alert("Se ha inscrito correctamente");
        }
    });

})
