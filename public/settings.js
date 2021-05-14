/*
  Michael Chunko
  Dominick DiMaggio
  Marcus Simpkins
  Elijah Wendel
  CS 546A
  I pledge my honor that I have abided by the Stevens Honor System.
*/

(function($) {
  $("#privacyForm input").on("change", function(e) {
    e.preventDefault();

    var requestConfig = {
      method: "POST",
      url: "/api/user/privacy",
      data: { level: $("input[name=privacy]:checked", "#privacyForm").val()}
    }

    $.ajax(requestConfig);
  })

  $("#dnameForm").submit(function (e) {
    e.preventDefault();

    // Purge errors
    $("#dnameInput").removeClass("formError");
    $("#formErrorMessage").hide()

    var dname = $("#dnameInput").val();

    // Check for well-formedness
    if (!dname || typeof(dname) != "string" || dname.trim().length == 0) {
      $("#dnameInput").addClass("formError");
      $("#formErrorMessage").show();
      $("#formErrorMessage").text("Enter a non-empty display name");
      return;
    }

    var requestConfig = {
      method: "POST",
      url: "api/user/displayname",
      data: { displayname: dname }
    }

    $.ajax(requestConfig);
  })
})(window.jQuery);