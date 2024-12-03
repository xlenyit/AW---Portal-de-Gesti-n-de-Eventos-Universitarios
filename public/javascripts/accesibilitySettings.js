function changeFontSize(value){
      
    const url = "/accessibility/fontSize/" + value;
    $.ajax({
        url: url, 
        method: 'POST',
        success: () => {
            location.reload();
        }
    });
}
