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
});

function buildlist(listName, labelName) {
    console.log("se crea la lista")
    var controls = document.getElementsByName(listName);
    var label = document.getElementsByName(labelName);
    label.value = '';
    for (var i = 0; i < controls.length; i++) {
        label.value += controls[i].value.toString() + ',';
    }
}