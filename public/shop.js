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
      credits = $('#credits');

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

  function bindEventsToFood(food) {
    $(food).click(function(e) {
      e.preventDefault();

      var requestConfig = {
        method: "POST",
        url: "/api/store/food/" + $($(food).children()[0]).attr("id") + "/1"
      };

      $.ajax(requestConfig).then(function (res) {
        credits.text(`${res.newCredits} 💸`);
      }).fail(function(e) {
        // TODO: Display failures somehow
      });
    });
  }

  shopFood.children().each(function(i, food) {
    bindEventsToFood(food);
  });

  function bindEventsToPet(pet) {
    $(pet).click(function(e) {
      e.preventDefault();

      var requestConfig = {
        method: "POST",
        url: "/api/store/pet/" + $($(pet).children()[0]).attr("id") + "/" + "smelly animal"
      };

      $.ajax(requestConfig).then(function (res) {
        credits.text(`${res.newCredits} 💸`);
      }).fail(function(e) {
        // TODO: Display failures somehow
      });
    });
  }

  shopPets.children().each(function(i, pet) {
    bindEventsToPet(pet);
  });

})(window.jQuery);