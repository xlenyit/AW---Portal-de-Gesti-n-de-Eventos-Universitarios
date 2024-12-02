function changeFontSize(value, id){
      
    const url = "/accessibility/fontSize/" + value;
    $.ajax({
        url: url, 
        method: 'POST',
        success: function (data) {
            alert("Se ha eliminado de "+ data +" evento correctamente");
            location.reload();
        }
    });
}