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
})(window.jQuery);