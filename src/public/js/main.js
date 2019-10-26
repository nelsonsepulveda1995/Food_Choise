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
        
        
        let calPromAll = parseFloat($('#promedio_calificacion_'+stars).text());
        
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
});

function buildlist(listName, labelName) {
    
    var controls = document.getElementsByName(listName);
    var label = document.getElementsByName(labelName);
    label.value = '';
    for (var i = 0; i < controls.length; i++) {
        label.value += controls[i].value.toString() + ',';
    }
}