$(document).ready(function () {
    $('#navId a').click(e => {
        e.preventDefault();
        $(this).tab('show');
    });
    $('#checks-ing input').click(function () {
        buildlist('ingredientes', 'SelectedValues')
    });
    $('#googleSignIn').click(function (e) {
        e.preventDefault();
        var width = 0;
        var height = 0;
        if (window.innerWidth <= window.innerHeight) {
            width = window.innerWidth * 0.90;
            height = (width * window.innerHeight / window.innerWidth) * 0.72;
        } else {
            var width = window.innerWidth * 0.30;
            // define the height in
            var height = window.innerHeight * 0.80;
        }
        // Ratio the hight to the width as the user screen ratio
        var google = window.open(this.href, 'newwindow', 'width=' + width + ', height=' + height + ', top=' + ((window.innerHeight - height) / 2) + ', left=' + ((window.innerWidth - width) / 2));
    });
    $('#calificaciones>input').change(function () {
        // over
        if ($(this).is(":checked")) {
            $(`#calificaciones>label>i`).removeClass("fa-star starSelected");
            $(`#calificaciones>label>i`).addClass("fa-star-o");
            var index = $(this).val()

            $(`#calificaciones>label:nth-child(${index})>i`).toggleClass("fa-star-o fa-star starSelected");
            for (let i = index - 1; i >= 0; i--) {
                $(`#calificaciones>label:nth-child(${i})>i`).toggleClass("fa-star-o fa-star starSelected");
            }
        }
    });
    if ($('#calificacion_usuario')) {
        var calificacion = parseInt($('#calificacion_usuario').text());
        for (let i = calificacion; i >= 0; i--) {
            $(`#rate${i}`).toggleClass("fa-star-o fa-star starSelectedPrev");
        }
    }
    var tarjetas = $('#tarjetaReceta .card')
    for (let i = 0; i < tarjetas.length; i++) {
        let stars = $(`#tarjetaReceta .card:eq(${i}) #id_tarjetaReceta`).text()


        let calPromAll = parseFloat($('#promedio_calificacion_' + stars).text());

        if (calPromAll % 1 > 0) {
            $(`#${stars}prom${parseInt(calPromAll)+1}`).toggleClass("fa-star-o fa-star fa fas fa-star-half-alt starSelectedPrev");
        }
        for (let i = parseInt(calPromAll); i >= 0; i--) {
            $(`#${stars}prom${i}`).toggleClass("fa-star-o fa-star starSelectedPrev");
        }

    }
    var calificacionProm = parseFloat($('#promedio_calificacion').text());
    if (calificacionProm % 1 > 0) {
        $(`#prom${parseInt(calificacionProm)+1}`).toggleClass("fa-star-o fa-star fa fas fa-star-half-alt starSelectedPrev");
    }
    for (let i = parseInt(calificacionProm); i >= 0; i--) {
        $(`#prom${i}`).toggleClass("fa-star-o fa-star starSelectedPrev");
    }
    var anterior = '';
    $('#key').on('keyup', function () {
        var key = $(this).val();
        var dataString = 'key=' + key;
        
        $.ajax({
            type: "POST",
            url: "/getIng",
            data: dataString,
            success: function (data) {
                //Escribimos las sugerencias que nos manda la consulta
                $('#suggestions').show().html(data);
                //Al hacer click en alguna de las sugerencias
                $('.suggest-element').on('click', function () {
                    //Obtenemos la id unica de la sugerencia pulsada
                    var id = $(this).attr('id');
                    var selected = $('#' + id).attr('data')
                    //Editamos el valor del input con data de la sugerencia pulsada
                    $('#key').val('');
                    //Hacemos desaparecer el resto de sugerencias
                    $('#suggestions').hide();
                    if (anterior == id) {
                        alert("Ya ha seleccionado ese ingrediente, por favor ingrese uno nuevo");
                    } else {
                        console.log(id);
                        buildCant(selected,id)
                    }
                    anterior = id;
                    return false;
                });
            }
        });
    });

    $('#listaCat').click(function () {
        console.log("show lista cat")
        $('#navCat').removeAttr('hidden');
    })

    $("#key").focusout(function () {
        $('#suggestions').fadeOut(1000);
    });

    $('#inputGroupFile01').change(function(e){
        $('#labelFile').text(e.target.files[0].name)
        archivo(e);
    })
});

function buildlist(listName, labelName) {

    var controls = document.getElementsByName(listName);
    var label = document.getElementsByName(labelName);
    label.value = '';
    for (var i = 0; i < controls.length; i++) {
        label.value += controls[i].value.toString() + ',';
    }
}

function buildCant(selected,id) {
    var select = $('<select>', {
        'html': `  <option value="KG">KG</option>
                    <option value="Gr">Gr</option>
                    <option value="MG">MG</option>
                    <option value="L">L</option>
                    <option value="ML">ML</option>`,
        'id': `sel-${id}-tipoCant`,
        'class': 'form-control',
        'name': `cantIng`,
        'required' : 'required'
    })
    var divVselect = $('<div>', {
        'class': 'col-6'
    })
    var option_select = divVselect.append(select);
    var input = $('<input>', {
        'type': 'number',
        'class': 'form-control',
        'name': `cantIng`,
        'required' : 'required',
        'min' : '1',
        'id': `cantidadIng-${id}`
    })
    var divVinput = $('<div>', {
        'class': 'col-6'
    })
    var div_input = divVinput.append(input);
    var div_row = $('<div>', {
        'class': 'row'
    })
    var div_row_appended = div_row.append(div_input, option_select)
    div_container = $('<div>', {
        'class': 'col-5'
    });
    var div_container_cantidad = div_container.append(div_row_appended)
    var input_cantidad = $('<div>', {
        'html': `<p>${selected}</p>`,
        'id': `sel-${id}`,
        'class': 'col-4 rounded checkbox'
    })

    var row_contenedor_total = $('<div>',{
        'class' : 'row d-flex justify-content-center'
    })
    var ingrediente_completo = row_contenedor_total.append(input_cantidad,div_container_cantidad);
    var nombre = $('<input>',{
        'value' : `${id}`,
        'name' : `ingredientesNom`,
        'hidden' : 'hidden'
    })
    $('#selecciones').append(nombre,ingrediente_completo);
}

function archivo(e) {
    // Creamos el objeto de la clase FileReader
    let reader = new FileReader();

    // Leemos el archivo subido y se lo pasamos a nuestro fileReader
    reader.readAsDataURL(e.target.files[0]);
    

    // Le decimos que cuando este listo ejecute el código interno
    reader.onload = function(){
        let image = $('<img>',{
            'src' : reader.result,
            'class' : 'rounded thumb'
        })
        $('#preview').empty();
        $('#preview').append(image);
    };
}