$(document).ready(function() {
    setInterval(function() {
        $.get("/ss", function(data) {
            console.log(data);
            $("#screen").attr('src', data);
        });
    },250);
});