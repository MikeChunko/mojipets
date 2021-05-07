/** global vars  **/
const _container = $('#center-container');

let _user = null // the currently logged in user.

let _pets = []; // pets to be rendered
let _items = []; // items (food or toys) that the pets will chase

let _looper = null; // for loop iteration

/** setup and start animation **/
function startAnimation() {
  // run frame function every 5 ms
  clearInterval(_looper);
  _looper = setInterval(frame, 5);

  /** ANIMATION HELPER FUNCTIONS **/
  // calculate when a point is within range of another point
  const within = (n, a, b) => a + n >= b && a - n <= b // a is within n of b
  const withinRange = (n, pt, target) =>
    within(n, pt.pos.x, target.pos.x) && within(n, pt.pos.y, target.pos.y);
  // set a pet's target, so it will chase after the target in future frames.
  const setTarget = (pet, target) => {
    // find new delta
    pet.delta.x = target.pos.x - pet.pos.x
    pet.delta.y = target.pos.y - pet.pos.y
    // unit vectorizaiton of delta
    let mag = Math.sqrt(pet.delta.x ** 2 + pet.delta.y ** 2)
    pet.delta.x /= mag
    pet.delta.y /= mag
    // Set targetting data in the pet and in the target
    pet.target = target
    target.targetedBy = pet
  }
  // find the closest un-targetted target to a given pet
  const findClosestTarget = (pet, targets) => {
    let closest = null
    for (var target of targets) if (!target.targetedBy) {
      let vecToTarget = { // vector from the pet to the target
        x: target.pos.x - pet.pos.x,
        y: target.pos.y - pet.pos.y
      }
      // calculate distance and update if closer than current closest
      let dist = Math.sqrt(vecToTarget.x ** 2 + vecToTarget.y ** 2)
      if (!closest || dist < closest.dist) closest = {
        dist: dist,
        target: target
      }
    }
    return !closest ? null : closest.target
  }

  /** ANIMATION LOGIC PER-FRAME **/
  // TODO: 🐛 when the food item is placed, it's not always the closest pet that
  //          tries to eat it.
  function frame() {
    // pets without a target should pair up with targets without a pet
    if (_items.some(i => !i.targetedBy) && _pets.some(p => !p.target)) {
      while (_items.some(i => !i.targetedBy)) {
        let pet = _pets.find(p => !p.target)
        let target = findClosestTarget(pet, _items)
        if (pet && target) setTarget(pet, target)
      }
    }
    // pets that are close enough to their target should consume the target
    if (_pets.some(pet => pet.target && withinRange(5, pet, pet.target))) {
      for (var pet of _pets) if (pet.target && withinRange(5, pet, pet.target)) {
        // stop rotation & snap to target
        pet.node.css({
          transform: 'rotate(0deg)',
          top: `${pet.target.pos.y}px`,
          left: `${pet.target.pos.x}px`
        })
        // remove target from DOM
        $(`#${pet.target.id}`).remove()

        // remove target from foodlist and from pet's targeting info
        _items.splice(_items.indexOf(pet.target), 1)

        // TODO: 🐛 debug this
        // use ajax to inform server of this interaction
        if (pet.target.type == 'food' && pet.target.data)
          $.post(`/api/user/pet/${pet.data._id}/interactions/feed`,
                 { id: pet.target.data })
        else if (pet.target.type == 'toy')
          $.post(`/api/user/pet/${pet.data._id}/interactions/fetch`)

        // if new targets are available, pick a new target
        pet.target = null
        let newTarget = findClosestTarget(pet, _items)
        if (newTarget) setTarget(pet, newTarget)
      }
    }
    // pets that need to move closer to their targets should move closer
    if (_pets.some(pet => pet.target && !withinRange(5, pet, pet.target))) {
      for (var pet of _pets) if (pet.target && !withinRange(5, pet, pet.target)) {
        // move pet towards target
        pet.pos.x += pet.delta.x; pet.pos.y += pet.delta.y;
        pet.node.css({
          top: `${pet.pos.y}px`,
          left: `${pet.pos.x}px`
        })
        // compute rotation for next frame
        if (pet.rot.direction == 'L' && pet.rot.degrees == -15)
          pet.rot.direction = 'R'
        if (pet.rot.direction == 'R' && pet.rot.degrees == 15)
          pet.rot.direction = 'L'
        if (pet.rot.direction == 'L') pet.rot.degrees--;
        if (pet.rot.direction == 'R') pet.rot.degrees++;
        // set rotation
        pet.node.css({ transform: `rotate(${pet.rot.degrees}deg)` })
      }
    }
  }
}

/** Proof of concept click-to-place **/
function startClickToPlace() {
  // TODO: place food or toy contextually
  // TODO: subtract correct val so obj is placed in center of mouse
  _container.click((event) => {
    let pt = {
      x: event.offsetX - 25,
      y: event.offsetY - 25
    };

    // create html node for item
    let placedItem = $(`<img src="/public/resources/food/meat_on_bone.svg"
                             id="item${_items.length}" class="item"/>`)
    placedItem.css({
      left: `${pt.x}px`,
      top: `${pt.y}px`
    })
    _container.append(placedItem);

    // update info and add item to list
    _items.push({
      id: placedItem.attr('id'),
      type: 'food', // TODO: place food or toy contextually
      data: null, // TODO: if it's food, add the id here
      pos: pt,
      targetedBy: null
    })
  })
}

/** gets the user's pets from the db and renders them **/
async function renderPets() {
  let data = await $.get(`/api/user/${_user._id}/pets?alive=true`)

  for (var petData of data) {
    // pick a random point
    // TODO: make it so that pets don't spawn on top of each other
    let pt = { // TODO: use a more accurate area than between 1 & 100
      x: Math.floor((Math.random() * 100) + 1),
      y: Math.floor((Math.random() * 100) + 1)
    }

    // create html node for item
    let petNode = $(`<img src="${petData.emoji.img}" id="pet${_pets.length}"
                          class="pet" />`)
    petNode.css({
      left: `${pt.x}px`,
      top: `${pt.y}px`
    })
    _container.append(petNode);

    // add pet to list
    _pets.push({
      id: petNode.attr('id'),
      // vars for animation
      pos: pt,
      delta: { x: 0, y: 0 },
      rot: { degrees: 0, direction: 'L' }, // rotation
      target: null,
      node: petNode,
      data: petData
    })
  }
}

/** UI Functions **/

(function ($) {
  const petShop = $('#pet-shop'),
        favoritePets = $("#favorite-pets-ul");

  // Create form and submit it
  petShop.click(function (e) {
    e.preventDefault();
    $('<form>', {
      action: '/shop',
      method: 'POST'
    }).append($('<input>', {
      type: 'hidden',
      name: 'shopType',
      value: "true"
    })).appendTo('body').submit();
  });

  allPetsHandler();

  favoritePets.children().each(function(i, pet) {
    bindEventsToPet($(pet).find(".pet-container")[0]);
    favoriteHandler($(pet).find(".unfavorite-icon"), false);
  });
})(window.jQuery);

// Sets up the link to reset the center div
function returnHandler() {
  $("#return").click(function (e) {
    e.preventDefault();
    $("#replaceable-container").hide();
    $("#center-container").show();
  });
}

function allPetsHandler() {
  $(".all-pets-link").click(function (e) {
    e.preventDefault();

    var requestConfig = {
      method: "GET",
      url: "/home/pets"
    };

    $.ajax(requestConfig).then(function (res) {

      $("#replaceable-container").show();
      $("#center-container").hide();

      const parsed = $.parseHTML(res)[0];

      // Replace contents
      $("#replaceable-container").replaceWith(parsed);

      // Bind click handlers to the pets
      $("#replaceable-container").find("div > input").each(function(i, pet) {
        bindEventsToPet(pet);
      });

      // Bind (un)favorite handlers
      $("#replaceable-container").find("div > img").each(function(i, icon) {
        // Switch icon class if the pet is favorited already
        // Defaults to assuming the pet is unfavorited so no need for an else
        if (_user.favoritePets.includes($(icon).attr("data-id"))) {
          $(icon).removeClass("favorite-icon");
          $(icon).addClass("unfavorite-icon");
        }

        favoriteHandler(icon, $(icon).attr("class").indexOf("unfavorite-icon") != 0);
      });

      // Return link now exists
      returnHandler();

      // Graveyard link now exists
      graveyardHandler();
    }).fail(function (e) {
      // TODO: Show an error somehow
    });
  });
}

function graveyardHandler() {
  $("#graveyard").click(function (e) {
    e.preventDefault();

    var requestConfig = {
      method: "GET",
      url: "/home/graveyard"
    };

    $.ajax(requestConfig).then(function (res) {
      $("#replaceable-container").show();
      $("#center-container").hide();

      const parsed = $.parseHTML(res)[0];

      // Replace contents
      $("#replaceable-container").replaceWith(parsed);

      // Bind click handlers to the pets
      $("#replaceable-container").find("div > input").each(function(i, pet) {
        bindEventsToPet(pet);
      });

      // Bind (un)favorite handlers
      $("#replaceable-container").find("div > img").each(function(i, icon) {
        // Switch icon class if the pet is favorited already
        // Defaults to assuming the pet is unfavorited so no need for an else
        if (_user.favoritePets.includes($(icon).attr("data-id"))) {
          $(icon).removeClass("favorite-icon");
          $(icon).addClass("unfavorite-icon");
        }

        favoriteHandler(icon, $(icon).attr("class").indexOf("unfavorite-icon") != 0);
      });

      // Return link now exists
      returnHandler();

      // All pets link now exists
      allPetsHandler();
    }).fail(function (e) {
      // TODO: Show an error somehow
    });
  })
}

// Set up the handler for clicking on a pet
function bindEventsToPet(pet) {
  $(pet).click(function (e) {
    e.preventDefault();

    var requestConfig = {
      method: "GET",
      url: "/home/pets/" + $(pet).attr("data-id")
    };

    $.ajax(requestConfig).then(function (res) {
      $("#replaceable-container").show();
      $("#center-container").hide();

      // Replace contents
      $("#replaceable-container").replaceWith($.parseHTML(res)[0]);

      // Return link now exists
      returnHandler();
    }).fail(function (e) {
      // TODO: Show an error somehow
    });
  })
}

function favoriteHandler(icon, b) {
  $(icon).click(function (e) {
    e.preventDefault();

    var requestConfig = {
      method: b ? "POST" : "DELETE",
      url: `/api/user/${_user._id}/favoritePets/${$(icon).attr("data-id")}`
    };

    $.ajax(requestConfig).then(function (res) {
      // Switch to favorite icon
      $(icon).removeClass(b ? "favorite-icon" : "unfavorite-icon");
      $(icon).addClass(b ? "unfavorite-icon" : "favorite-icon");
      $(icon).unbind();
      favoriteHandler(icon, !b);

      // Re-render list of favorites
      updateFavoritePets();
    }).fail(function (e) {
      // TODO: Show an error somehow
    });
  });
}

function updateFavoritePets() {
  // Re-render favorite pets
  var requestConfig = {
    method: "GET",
    url: "/home/favorite-pets"
  };

  $.ajax(requestConfig).then(function (res) {
    // Used to keep scroll position
    scrollPos = $("#favorite-pets-ul").scrollTop();

    $("#favorite-pets-ul").replaceWith($.parseHTML(res)[0]);

    $("#favorite-pets-ul").scrollTop(scrollPos)

    $("#favorite-pets-ul").children().each(function(i, pet) {
      bindEventsToPet($(pet).find(".pet-container")[0]);
      favoriteHandler($(pet).find(".unfavorite-icon"), false);
    });
  }).fail(function (e) {
    // TODO: Show an error somehow
  });
}

/** Entrypoint! Should be run onload in homepage **/
async function start() {
  _user = await $.get('/api/user')
  renderPets()
  startClickToPlace()
  startAnimation()
}
