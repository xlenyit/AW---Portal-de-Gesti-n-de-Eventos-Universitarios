function changeFontSize(value){
      
    const url = "/accessibility/fontSize/" + value;
    $.ajax({
        url: url, 
        method: 'POST',
        success: () => {
            alert("Se ha eliminado de "+ 1 +" evento correctamente");
            location.reload();
        }
    });
}
