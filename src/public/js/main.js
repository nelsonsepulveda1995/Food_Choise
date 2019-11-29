var mensajes = 0;
$(document).ready(function () {
    $('.select2').select2({
        width: '100%'
    });

    $('#selectBusqueda_ing').select2({
        placeholder: "Seleccione un ingrediente...",
        allowClear: true,
        width: '100%'
    });

    $('#selectBusqueda_cat').select2({
        placeholder: "Seleccione una categoría...",
        allowClear: true,
        width: '100%'
    });
    $('.select2-search__field').css('width', '150%');

    $("#inputGroupFile01").change(function(){
        var archivoruta= $("#inputGroupFile01").val();
        var extpermitidas= /(.jpg|.png|.jpeg|.JPG|.PNG|.JPEG)$/i;
        if(!extpermitidas.exec(archivoruta)){
            alert("Los tipos de imagen admitidos son: jpg ,png y jpeg");
            $("#inputGroupFile01").val("");
            return false;
        }
        var fileSize = this.files[0].size;

	    if(fileSize > 5242880){
		    alert('El archivo no debe superar los 5MB');
		    this.value = '';
            this.files[0].name = '';
            return false;
	    }
    })

    $('#navId a').click(e => {
        e.preventDefault();
        $(this).tab('show');
    });
    $('#checks-ing input').click(function () {
        buildlist('ingredientes', 'SelectedValues')
    });
    $('.googleSignIn').click(function (e) {
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
    calificate()
    var anterior = '';
    var contadorIng = 1
    $('#key').change(function () {
        if ($(this).val() != 0) {
            var value = $(this).val().split('|');
            var id = value[0]
            var selected = value[1]
            $('#key').val('');
            if ($('[name = "ingredientesNom"]')) {
                var flag = 0
                $('[name = "ingredientesNom"]').each(function (index, element) {
                    if (anterior == id || $(this).val() == id) {
                        flag = 1;
                    } 
                });
                if (flag == 0) {
                    buildCant(selected, id)
                    accionBorrar(mensajes)
                }else{
                    alert("Ya ha seleccionado ese ingrediente, por favor ingrese uno nuevo");
                }
            }else{
                if (anterior == id) {
                    alert("Ya ha seleccionado ese ingrediente, por favor ingrese uno nuevo");
                } else {
                    buildCant(selected, id)
                    accionBorrar(mensajes)
                }
            }
            
            anterior = id;
            console.log(contadorIng)

            var orig = parseInt($('#contadorIngre').val())
            console.log("contador de ingredientes")
            console.log(orig)
            if (!isNaN(orig)) {
                $('#contadorIngre').val(orig + contadorIng);
                console.log("no es NaN")
                console.log(orig+contadorIng)
            }else{
                $('#contadorIngre').val(contadorIng);
                console.log("es NaN")
                console.log(contadorIng)
            }
            return false;
        }
    });
    var contadorCat = 0;
    var IngCounter = 0;
    var anterior = '';
    $('#selectBusqueda_cat, #selectBusqueda_ing').on('change', function () {
        if ($(this).val() != 0) {
            var esto = $(this);
            if ($(this).attr('id') == 'selectBusqueda_cat') {
                console.log("contador Cat sube")
                contadorCat++;
                $('#contadorCat').val(contadorCat);
            }else if ($(this).attr('id') == 'selectBusqueda_ing') {
                console.log("contador Ing sube")
                IngCounter++;
                $('#contadorIng').val(IngCounter);
            }
            $('.select2-selection__choice__remove').click(function () {
                if (esto.attr('id') == 'selectBusqueda_cat') {
                    console.log("contador Cat baja (antes sube)")
                    contadorCat= contadorCat-2;
                    $('#contadorCat').val(contadorCat);
                }else if (esto.attr('id') == 'selectBusqueda_ing') {
                    console.log("contador ing baja (antes sube)")
                    IngCounter= IngCounter-2;
                    $('#contadorIng').val(IngCounter);
                }
            });
            console.log("cat: "+contadorCat)
            console.log("ing: "+IngCounter)
            return false;
        }
    });
    accionBorrar(mensajes);
    $('#listaCat').click(function () {
        $('#navCat').removeAttr('hidden');
    })

    $('#inputGroupFile01').change(function (e) {
        $('#labelFile').text(e.target.files[0].name)
        archivo(e);
    })

    $('#formBusqueda').submit(function (e) {
        var accion = $("#tipoBusqueda").val();
        console.log(accion)
        if (accion == 2 || accion == 3) {
            $(this).attr('action', `/busqueda/H`);
        }else{
            $(this).attr('action', `/busqueda/${accion}`);
        }
    });
    $('#tipoBusqueda').change(function () {
        var accion = $("#tipoBusqueda").val();
        if (accion != 1) {
            $('#inputBusqueda').hide();
            $('#divSelecting').show();
            $('#divSelectcat').show();
        } else {
            $('#divSelectcat').hide();
            $('#divSelecting').hide();
            $('#inputBusqueda').show();
        }
    })

    $('#ordenamiento').change(function () {
        var loader = $('<div>', {
            id: 'loaderImage',
            class: 'mx-auto mt-5'
        })
        var dataString = 'key=' + $(this).val()
        $('#tarjetaReceta').empty();
        $('#tarjetaReceta').append(loader)
        var numAl = Math.floor((Math.random() * 10) + 1);
        var cImageSrc = `/js/images/sprites${numAl}.png`
        new imageLoader(cImageSrc, 'startAnimation()');
        $.ajax({
            type: "GET",
            url: "/orderBy",
            data: dataString,
            success: function (data) {
                $('#tarjetaReceta').html(data)
                calificate();
                stopAnimation();
            }
        });
    });
    $('#ordenamientoBus').change(function () {
        var loader = $('<div>', {
            id: 'loaderImage',
            class: 'mx-auto mt-5'
        })
        var idRecetas = $('input[name = idRecetas]')
        var arrayRecetas = []
        for (let i = 0; i < idRecetas.length; i++) {
            const element = idRecetas[i];
            arrayRecetas.push(element.getAttribute('value'))
        }
        var dataString = 'key=' + $(this).val() + '&arrayRecetas=' + arrayRecetas
        $('#tarjetaReceta').empty();
        $('#tarjetaReceta').append(loader)
        var numAl = Math.floor((Math.random() * 10) + 1);
        var cImageSrc = `/js/images/sprites${numAl}.png`
        new imageLoader(cImageSrc, 'startAnimation()');
        $.ajax({
            type: "GET",
            url: "/orderBy",
            data: dataString,
            success: function (data) {
                $('#tarjetaReceta').html(data)
                calificate();
                stopAnimation();
            }
        });
    });
});

function accionBorrar(mensajes) {
    console.log("llamada funcion accionBorrar")
    $('.borrar').click(function () {
        console.log("intento borrar un ingrediente")
        var id = $(this).attr('id')
        var contador = parseInt($('#contadorIngre').val())
        contador--;
        $(`#ing-all-${id}`).remove()
        $('#contadorIngre').val(contador)
        if (contador <= 1) {
            if (mensajes == 0) {
                alert("Si modifica la receta sin que ésta posea un minimo de UN (1) ingrediente, no se modificarán los ingredientes que ingresó anteriormente")
                mensajes = 1;
            }
        }
    })
}

function calificate() {
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
}

function buildlist(listName, labelName) {

    var controls = document.getElementsByName(listName);
    var label = document.getElementsByName(labelName);
    label.value = '';
    for (var i = 0; i < controls.length; i++) {
        label.value += controls[i].value.toString() + ',';
    }
}

function buildBusqueda(selected, id) {
    var nombre = $('<input>', {
        'value': `${selected}`,
        'name': `busqueda`,
        'hidden': 'hidden'
    })
    var input_cantidad = $('<div>', {
        'html': `<p>${selected}</p>`,
        'id': `sel-${id}`,
        'class': 'rounded checkbox'
    })
    $('#formBusqueda').append(nombre);
    $('#seleccionesBusqueda').append(input_cantidad)
}

function buildCant(selected, id) {
    var select = $('<select>', {
        'html': `  <option value="KG">KG</option>
                    <option value="Gr">Gr</option>
                    <option value="MG">MG</option>
                    <option value="L">L</option>
                    <option value="ML">ML</option>`,
        'id': `sel-${id}-tipoCant`,
        'class': 'form-control',
        'name': `cantIng`,
        'required': 'required'
    })
    var divVselect = $('<div>', {
        'class': 'col-6'
    })
    var option_select = divVselect.append(select);
    var input = $('<input>', {
        'type': 'number',
        'class': 'form-control',
        'name': `cantIng`,
        'required': 'required',
        'min': '1',
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

    var row_contenedor_total = $('<div>', {
        'class': 'row d-flex justify-content-center',
        'id': `ing-all-${id}`
    })
    var nombre = $('<input>', {
        'value': `${id}`,
        'name': `ingredientesNom`,
        'hidden': 'hidden'
    })
    var botonBorrar = $('<button>',{
        'type' :"button",
        'class' :"btn btn-outline-danger borrar", 
        'id' :`${id}`,
        'html' : 'x'
    })
    var ingrediente_completo = row_contenedor_total.append(botonBorrar, input_cantidad, div_container_cantidad, nombre);
    $('#selecciones').append(ingrediente_completo);
}

function archivo(e) {
    // Creamos el objeto de la clase FileReader
    let reader = new FileReader();

    // Leemos el archivo subido y se lo pasamos a nuestro fileReader
    reader.readAsDataURL(e.target.files[0]);


    // Le decimos que cuando este listo ejecute el código interno
    reader.onload = function () {
        let image = $('<img>', {
            'src': reader.result,
            'class': 'rounded img-receta'
        })
        $('#preview').empty();
        $('#preview').append(image);
    };

}