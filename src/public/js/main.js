$(document).ready(function () {
    $('#navId a').click(e => {
        e.preventDefault();
        $(this).tab('show');
    });
});