$.getJSON("/articles", function(data) {

  for (var i = 0; i < data.length; i++) {
 
    $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
  }
});

$(document).on("click", "p", function() {
    
    $("#notes").empty();
    var id = $(this).attr("data-id");
    
    $.ajax({
        method: "GET",
        url: "/articles/" + id
    })
    .done(function(data) {
        console.log(data);
        
        $("#notes").append("<h2>" + data.title + "</h2>");
        
        $("#notes").append("<input id='titlevalue' name='title' >");
        
        $("#notes").append("<textarea id= 'bodyvalue' name='body' ></textarea>");
        
        $("#notes").append("<button data-id='" + data._id + "' id='savenote'> Save </button>");
        
        if (data.note) {
            
            $("#titlevalue").val(data.note.title);
            
            $("#bodyvalue").val(data.note.body);
        }
    });
});

$(document).on("click", "#savenote", function() {
    
    var id = $(this).attr("data-id");
    
    $.ajax({
        method: "POST",
        url: "/articles/" + id,
        data: {
            title: $("#titlevalue").val(),
            body: $("#bodyvalue").val()
        }
    })
    .done(function (data) {
        console.log(data);
        
        $("#notes").empty();
    });
    
    $("#titlevalue").val("");
    $("#bodyvalue").val("");
});