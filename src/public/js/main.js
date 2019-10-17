$(document).ready(function () {
    $('#navId a').click(e => {
        e.preventDefault();
        $(this).tab('show');
    });
    $('#checks-ing input').click(function(){
        buildlist('ingredientes','SelectedValues')
    })
});

function buildlist(listName,labelName){
    console.log("se crea la lista")
    var controls = document.getElementsByName(listName);
    var label = document.getElementsByName(labelName);
    label.value = '';
    for(var i=0;i<controls.length;i++){
       label.value += controls[i].value.toString()+',';
    }
  }