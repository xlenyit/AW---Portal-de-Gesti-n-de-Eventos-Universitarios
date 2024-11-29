function removeUserFromEvent(userId, eventId){
    const url = "/events/" + eventId + "/deleteInscription/" + userId;
    $.ajax({
        url: url, 
        method: 'POST',
        success: function (data) {
            alert("Se ha eliminado de "+ data +" evento correctamente");
            location.reload();
        }
    });

}

function removeUsersFromEvent(users, eventId){
    let jsonUsers = JSON.parse(users);
    
    jsonUsers.forEach((user) => {
        removeUserFromEvent(user.id, eventId);
    });
    
}