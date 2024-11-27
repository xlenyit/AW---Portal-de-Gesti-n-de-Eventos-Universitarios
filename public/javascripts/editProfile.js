$("#editProfile").on("click", (e) => {
    e.preventDefault();

    // Convertir los <p> en inputs editables
    $('#userInfo p').each(function () {
        const oldVal = $(this).text().trim();
        const oldId = $(this).prev('label').attr('for');
        if (oldId == 'facultad') {
            const oldIdFac = $(this).attr('id');
            $(this).empty();
            $(this).append(`
                    <select id="${oldId}" name="${oldId}" class="w-100" >
                    <option hidden selected value="${oldIdFac}">${oldVal}</option>
                    </select>
                    `);

            $.ajax({
                url: '/users/getFacultades', // Ruta para obtener las facultades
                method: 'GET',
                success: function (data) {
                    data.facultades.forEach(function (facultad) {
                        const selected = oldVal === facultad.nombre ? 'selected' : '';
                        $('#facultad').append(`<option value="${facultad.id}" ${selected}>${facultad.nombre}</option>`);
                    });
                }
            });
        }
        else if (oldId == 'rol') {
            // const oldValue=$(this).val()
            // $('#divEventos').empty();
            // $(this).empty();
            // $(this).append(`
            //         <select id="${oldId}" name="${oldId}" class="w-100">
            //         <option value="0" ${oldVal == 'Asistente' ? 'selected' : ''}>Asistente</option>
            //         <option value="1" ${oldVal == 'Organizador' ? 'selected' : ''}>Organizador</option>
            //     </select>
            //     `);
        }
        else {
            $(this).empty();
            $(this).append(`<input type="text" class="form-control mb-2" id="${oldId}" name="${oldId}" value="${oldVal}" ></input>`)
        }
    });

    $('#editProfile').addClass('d-none');
    $('#saveProfile').removeClass('d-none');
});

$("#saveProfile").on("click", (e) => {
    e.preventDefault();
    const formData = $('#userInfo form').serialize();
    $.ajax({
        url: '/users/modifyUser',
        method: 'POST',
        data: formData,
        success: function (response, status, xhr) {
            const statusCode = xhr.status;
            
            switch (statusCode) {
                case 200:
                    alert('Perfil actualizado con éxito');
                    break;
                case 201:
                    alert('Email en uso por otro usuario');
                    break;
                case 202:
                    alert('Telefono en uso por otro usuario');
                    break;
            }
            

            //Recargar la página para mostrar los datos actualizados
            location.reload();
        }
    });
});
