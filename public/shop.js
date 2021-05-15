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
      petsTab = $('#pets-tab')
      toysTab = $('#toys-tab'),
      shopTitle = $('#shop-title'),
      shopPets = $('#shop-pets'),
      shopFood = $('#shop-food'),
      shopToys = $('#shop-toys')
      credits = $('#credits');

  if ($("#shop-window").attr("data-state") == "0") {
    foodTab.attr("data-clicked", "y");
    petsTab.attr("data-clicked", "n");
    toysTab.attr("data-clicked", "n");
    shopTitle.text("Food Items");
    shopFood.removeClass("hidden-div");
    shopPets.addClass("hidden-div");
    shopToys.addClass("hidden-div");
  } else if ($("#shop-window").attr("data-state") == "1") {
    petsTab.attr("data-clicked", "y");
    foodTab.attr("data-clicked", "n");
    toysTab.attr("data-clicked", "n");
    shopTitle.text("New Pets");
    shopPets.removeClass("hidden-div");
    shopFood.addClass("hidden-div");
    shopToys.addClass("hidden-div");
  } else {
    toysTab.attr("data-clicked", "y");
    foodTab.attr("data-clicked", "n");
    petsTab.attr("data-clicked", "n");
    shopTitle.text("Toy items");
    shopToys.removeClass("hidden-div");
    shopFood.addClass("hidden-div");
    shopPets.addClass("hidden-div");
  }

  foodTab.click(function(e) {
    foodTab.attr("data-clicked", "y");
    petsTab.attr("data-clicked", "n");
    toysTab.attr("data-clicked", "n");
    shopTitle.text("Food Items");
    shopFood.removeClass("hidden-div");
    shopPets.addClass("hidden-div");
    shopToys.addClass("hidden-div");
  });

  petsTab.click(function(e) {
    petsTab.attr("data-clicked", "y");
    foodTab.attr("data-clicked", "n");
    toysTab.attr("data-clicked", "n");
    shopTitle.text("New Pets");
    shopPets.removeClass("hidden-div");
    shopFood.addClass("hidden-div");
    shopToys.addClass("hidden-div");
  });

  toysTab.click(function(e) {
    toysTab.attr("data-clicked", "y");
    foodTab.attr("data-clicked", "n");
    petsTab.attr("data-clicked", "n");
    shopTitle.text("Toy items");
    shopToys.removeClass("hidden-div");
    shopFood.addClass("hidden-div");
    shopPets.addClass("hidden-div");
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

  function bindEventsToToy(toy) {
    $(toy).click(function(e) {
      e.preventDefault();

      var requestConfig = {
        method: "POST",
        url: "/api/store/toy/" + $($(toy).children()[0]).attr("id") + "/1"
      };

      $.ajax(requestConfig).then(function (res) {
        credits.text(`${res.newCredits} 💸`);
      }).fail(function(e) {
        // TODO: Display failures somehow
      });
    });
  }

  shopToys.children().each(function(i, toy) {
    bindEventsToToy(toy);
  });

  function bindEventsToPet(pet) {
    $(pet).click(function(e) {
      e.preventDefault();


      // Ensure the user can buy this pet
      let petPrice = parseInt($(pet).attr('data-price'))
      let numCredits =
          parseInt(credits.text().substring(0, credits.text().indexOf(" 💸")))
      if (petPrice <= numCredits) {
        var name = "";
        while (name != null && name.trim().length == 0) {
          name = prompt("Please enter a name for your new pet:", "");
        }

        // User pressed 'cancel'
        if (name == null)
          return;

        var requestConfig = {
          method: "POST",
          url: `/api/store/pet/${$($(pet).children()[0]).attr("id")}/${name}`
        };

        $.ajax(requestConfig).then(function (res) {
          credits.text(`${res.newCredits} 💸`);
        }).fail(function(e) {
          // TODO: Display failures somehow
        });
      }
    });
  }

  shopPets.children().each(function(i, pet) {
    bindEventsToPet(pet);
  });

})(window.jQuery);
