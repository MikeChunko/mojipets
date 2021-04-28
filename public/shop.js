/*
  Michael Chunko
  Dominick DiMaggio
  Marcus Simpkins
  Elijah Wendel
  CS 546A
  I pledge my honor that I have abided by the Stevens Honor System.
*/

(function($) {
  var foodTab = $('#food-tab'),
      petsTab = $('#pets-tab'),
      shopTitle = $('#shop-title'),
      shopPets = $('#shop-pets'),
      shopFood = $('#shop-food');

  foodTab.click(function(e) {
    foodTab.attr("clicked", "y");
    petsTab.attr("clicked", "n");
    shopTitle.text("Food Items");
    shopFood.removeClass("hidden-div");
    shopPets.addClass("hidden-div");
  });

  petsTab.click(function(e) {
    petsTab.attr("clicked", "y");
    foodTab.attr("clicked", "n");
    shopTitle.text("New Pets");
    shopPets.removeClass("hidden-div");
    shopFood.addClass("hidden-div");
  });

})(window.jQuery);