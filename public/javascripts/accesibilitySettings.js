// function changeFontSize(value){
        
//     $('body p').css('font-size', value + 'px')
//     const url = "/accessibility/fontSize/" + value;
//     $.ajax({
//         url: url, 
//         method: 'POST',
//         success: () => {
//             // location.reload();
//         }
//     });
// }
$(document).ready(function() {
    var savedSize = localStorage.getItem('fontSize');
    
    if (savedSize) {
        $('body').css('font-size', savedSize + 'px');
    }

    $('.changeFontSize').click(function() {
        var newSize = $(this).data('size'); 
        $('body').css('font-size', newSize + 'px');
        localStorage.setItem('fontSize', newSize); 
    });
});
