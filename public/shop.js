/*
  Michael Chunko
  Dominick DiMaggio
  Marcus Simpkins
  Elijah Wendel
  CS 546A
  I pledge my honor that I have abided by the Stevens Honor System.
*/

(function($) {

  var foodTab = $('#food-tab');
  var petsTab = $('#pets-tab');
  var shopTitle = $('#shop-title');

  $(foodTab).click(function(e) {
    // TODO: Ajax request to food route
    $(foodTab).attr("clicked", "y");
    $(petsTab).attr("clicked", "n");
    $(shopTitle).text("Food Items");
  });

  $(petsTab).click(function(e) {
    // TODO: Ajax request to pets route
    $(petsTab).attr("clicked", "y");
    $(foodTab).attr("clicked", "n");
    $(shopTitle).text("New Pets");
  });

})(window.jQuery);