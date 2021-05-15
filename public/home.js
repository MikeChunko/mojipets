/** global vars  **/
const _container = $('#center-container');

let _user = null // the currently logged in user.

let _pets = []; // pets to be rendered
let _items = []; // items (food or toys) that the pets will chase
let _selecteditem = null // item that the user has selected

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
  // finds the closest available (pet, target) pair
  const findClosestPair = (pets, targets) => {
    let closest = null
    for (var target of targets) if (!target.targetedBy) {
      for (var pet of pets) if (!pet.target) {
        let vecToTarget = { // vector from the pet to the target
          x: target.pos.x - pet.pos.x,
          y: target.pos.y - pet.pos.y
        }
        // calculate distance and update if closer than current closest
        let dist = Math.sqrt(vecToTarget.x ** 2 + vecToTarget.y ** 2)
        if (!closest || dist < closest.dist) closest = {
          dist: dist,
          pet: pet,
          target: target
        }
      }
    }
    if (!closest) throw 'No available pair found'
    else return closest
    return !closest ? null : closest
  }

  /** ANIMATION LOGIC PER-FRAME **/
  async function frame() {
    // pets without a target should pair up with targets without a pet
    if (_items.some(i => !i.targetedBy) && _pets.some(p => !p.target)) {
      while (_items.some(i => !i.targetedBy)) {
        try {
          let { pet, target } = findClosestPair(_pets, _items)
          if (pet && target) setTarget(pet, target)
        }
        catch (_) { break }
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
        pet.label.css({
          top: `${pet.target.pos.y - 20}px`,
          left: `${pet.target.pos.x}px`
        })
        // remove target from DOM
        $(`#${pet.target.id}`).remove()

        // use ajax to inform server of this interaction
        if (pet.target.type == 'food' && pet.target.data)
          $.post(`/api/user/pet/${pet.data._id}/interactions/feed`,
                 { 'food.id': pet.target.data }).then(async function (_) {
                  _user = await $.get('/api/user');
                  $("#credits").text(`${_user.credits} 💸`);
                 });
        else if (pet.target.type == 'toy')
          $.post(`/api/user/pet/${pet.data._id}/interactions/fetch`).then(async function (_) {
            _user = await $.get('/api/user');
            $("#credits").text(`${_user.credits} 💸`);
          });

        // remove target from foodlist and from pet's targeting info
        _items.splice(_items.indexOf(pet.target), 1)
        pet.target = null
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
        pet.label.css({
          top: `${pet.pos.y - 20}px`,
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
  _container.click((event) => {
    // Can't place anything if nothing is selected
    if (_selecteditem == null) return

      // can't place anything if there's no items left
      if ($(_selecteditem.node).children('p').eq(0).text() === '0')
        return

    // inform the api that the user is trying to use the item
    if (_selecteditem.type == 'food') {
      $.post(`/api/user/${_user._id}/foods/${_selecteditem.data}`)
        .then(amt => {
          updateInventory();
        })
        .fail(() => {
          updateInventory();
        })
    } else {
      $.post(`/api/user/${_user._id}/toys/${_selecteditem.data}`)
        .then(amt => {
          updateToys(); // TODO: updateToys??
        })
        .fail(() => {
          updateToys(); // TODO: updateToys??
        })
    }

    let pt = {
      x: event.offsetX - 25,
      y: event.offsetY - 25
    };

    // create html node for item
    let placedItem =
        $(`<img alt="${_selecteditem.alt}" src="${_selecteditem.img}"
                id="item${_items.length}" class="item"/>`)
    placedItem.css({
      left: `${pt.x}px`,
      top: `${pt.y}px`
    })
    placedItem.click((event) => { event.stopPropagation() })
    _container.append(placedItem);

    // update info and add item to list
    _items.push({
      id: placedItem.attr('id'),
      type: _selecteditem.type, // either 'food' or 'toy'
      data: _selecteditem.data, // objectid if food, -1 if toy
      pos: pt,
      targetedBy: null
    })
  })
}

/** gets the user's pets from the db and renders them **/
async function renderPets() {
  let data = await $.get(`/api/user/${_user._id}/pets?alive=true`)

  for (var petData of data) {
    let dims = { // dimensions of window
      width: $('#center-container').width() - 100,
      height: parseFloat($('#center-container').css('padding-bottom')
                         .slice(0,-2)) - 100 // assumes units are px
    }

    // pick a random point
    let pt = {
      x: Math.floor((Math.random() * dims.width) + 25),
      y: Math.floor((Math.random() * dims.height) + 25)
    }

    // create html nodes for item and label
    let petNode = $(`<img alt="${petData.emoji.name}" src="${petData.emoji.img}"
                          id="pet${_pets.length}" class="pet" />`),
        labelNode = $(`<div class="petlabel" data-id="pet${_pets.length}">
                         ${petData.name}
                       </div>`)
    petNode.css({
      left: `${pt.x}px`,
      top: `${pt.y}px`
    })
    labelNode.css({
      left: `${pt.x}px`,
      top: `${pt.y - 20}px`
    })
    petNode.click((event) => { event.stopPropagation() })
    labelNode.click((event) => { event.stopPropagation() })
    _container.append(labelNode); _container.append(petNode);

    // add pet to list
    _pets.push({
      id: petNode.attr('id'),
      // vars for animation
      pos: pt,
      delta: { x: 0, y: 0 },
      rot: { degrees: 0, direction: 'L' }, // rotation
      target: null,
      node: petNode,
      label: labelNode,
      data: petData
    })
  }
}

/** UI Functions **/

(function ($) {
  const petShop = $('#pet-shop'),
        foodShop = $("#item-shop"),
        toyShop = $("#toy-shop"),
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
      value: "1"
    })).appendTo('body').submit();
  });

  // Create form and submit it
  foodShop.click(function (e) {
    e.preventDefault();
    $('<form>', {
      action: '/shop',
      method: 'POST'
    }).append($('<input>', {
      type: 'hidden',
      name: 'shopType',
      value: "0"
    })).appendTo('body').submit();
  });

  // Create form and submit it
  toyShop.click(function (e) {
    e.preventDefault();
    $('<form>', {
      action: '/shop',
      method: 'POST'
    }).append($('<input>', {
      type: 'hidden',
      name: 'shopType',
      value: "2"
    })).appendTo('body').submit();
  });

  allPetsHandler();

  favoritePets.children().each(function(i, pet) {
    bindEventsToPet($(pet).find(".pet-container")[0]);
    favoriteHandler($(pet).find(".unfavorite-icon"), false);
  });

  inventoryHandler();

  toysHandler();

  addFriendsHandler();

  $("#friends-ul").children().each(function(i, friend) {
    friendDeleteHandler(friend);
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

      // Bind (un)favorite handlers
      $("#replaceable-container").find("div > img").each(function(i, icon) {
        // Try to exclude non-icons
        if ($(icon).attr("data-id")) {
          // Switch icon class if the pet is favorited already
          // Defaults to assuming the pet is unfavorited so no need for an else
          if (_user.favoritePets.includes($(icon).attr("data-id"))) {
            $(icon).removeClass("favorite-icon");
            $(icon).addClass("unfavorite-icon");
          }

          favoriteHandler(icon, $(icon).attr("class").indexOf("unfavorite-icon") != 0);
        }
      });

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

    $.ajax(requestConfig).then(async function (res) {
      // Switch to favorite icon
      $(icon).removeClass(b ? "favorite-icon" : "unfavorite-icon");
      $(icon).addClass(b ? "unfavorite-icon" : "favorite-icon");
      $(icon).unbind();
      favoriteHandler(icon, !b);

      // Update the user object
      _user = await $.get('/api/user');

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

    $("#favorite-pets-ul").scrollTop(scrollPos);

    $("#favorite-pets-ul").children().each(function(i, pet) {
      bindEventsToPet($(pet).find(".pet-container")[0]);
      favoriteHandler($(pet).find(".unfavorite-icon"), false);
    });
  }).fail(function (e) {
    // TODO: Show an error somehow
  });
}

function updateInventory() {
  // Re-render favorite pets
  var requestConfig = {
    method: "GET",
    url: "/home/inventory"
  };

  $.ajax(requestConfig).then(function (res) {
    // Used to keep scroll position
    scrollPos = $("#inventory-ul").scrollTop();

    // Used for remembering which item was clicked
    clicked = $($("[data-clicked|='y'")[0]).attr("data-id");

    // Last of this item was used
    if ($($(`[data-id|='${clicked}']`)[0]).find("p")[0].innerHTML == "1")
      _selecteditem = null;

    $("#inventory-ul").replaceWith($.parseHTML(res)[0]);

    $("#inventory-ul").scrollTop(scrollPos);

    // "Click" the item again
    $($(`[data-id|='${clicked}']`)[0]).attr("data-clicked", "y");

    inventoryHandler();
  }).fail(function (e) {
    // TODO: Show an error somehow
  });
}

function updateToys() {
  // Re-render favorite pets
  var requestConfig = {
    method: "GET",
    url: "/home/toys"
  };

  $.ajax(requestConfig).then(function (res) {
    // Used to keep scroll position
    scrollPos = $("#toys-ul").scrollTop();

    // Used for remembering which item was clicked
    clicked = $($("[data-clicked|='y'")[0]).attr("data-id");

    // Last of this item was used
    if ($($(`[data-id|='${clicked}']`)[0]).find("p")[0].innerHTML == "1")
      _selecteditem = null;

    $("#toys-ul").replaceWith($.parseHTML(res)[0]);

    $("#toys-ul").scrollTop(scrollPos);

    // "Click" the item again
    $($(`[data-id|='${clicked}']`)[0]).attr("data-clicked", "y");

    toysHandler();
  }).fail(function (e) {
    // TODO: Show an error somehow
  });
}

function inventoryHandler() {
  $($(".inventory-ul").find(".emoji-container")).each(function (i, food) {
    $(food).click(function (e) {
      e.preventDefault();

      // "Un-click" everyting else
      $($(".inventory-ul").find(".emoji-container")).each(function (i, food) {
        $(food).attr("data-clicked", "n");
      });

      $($(".toys-ul").find(".emoji-container")).each(function (i, toy) {
        $(toy).attr("data-clicked", "n");
      });

      // "Click" the selected item
      $(food).attr("data-clicked", "y");

      _selecteditem = {
        type: 'food',
        data: $(food).attr('data-id'),
        img: $(food).children('input').eq(0).attr('src'),
        alt: $(food).children('input').eq(0).attr('alt'),
        node: food
      }
    });
  });
}

function toysHandler() {
  $($(".toys-ul").find(".emoji-container")).each(function (i, toy) {
    $(toy).click(function (e) {
      e.preventDefault();

      // "Un-click" everyting else
      $($(".inventory-ul").find(".emoji-container")).each(function (i, food) {
        $(food).attr("data-clicked", "n");
      });

      $($(".toys-ul").find(".emoji-container")).each(function (i, toy) {
        $(toy).attr("data-clicked", "n");
      });

      // "Click" the selected item
      $(toy).attr("data-clicked", "y");

      _selecteditem = {
        type: 'toy',
        data: $(toy).attr('data-id'),
        img: $(toy).children('input').eq(0).attr('src'),
        alt: $(toy).children('input').eq(0).attr('alt'),
        node: toy
      }
    });
  });
}

function addFriendsHandler() {
  $("#addFriendForm").submit(async function (e) {
    e.preventDefault();

    // Purge errors
    $("#addFriendText").removeClass("formError");
    $("#formErrorMessage").hide();

    var uname = $("#addFriendText").val();

    // Check for well-formedness
    if (!uname || typeof(uname) != "string" || uname.trim().length == 0) {
      $("#addFriendText").addClass("formError");
      $("#formErrorMessage").show();
      $("#formErrorMessage").text("Enter a non-empty username");
      return;
    }

    // Check if the user exists
    users = await $.get("/api/user/all");
    var user = users.find((user, i) => {
      if (user.username.toLowerCase() == uname.toLowerCase())
        return user;
    })

    if (!user) {
      $("#addFriendText").addClass("formError");
      $("#formErrorMessage").show();
      $("#formErrorMessage").text(`Username ${uname} does not exist`);
      return;
    }

    // Add the friend
    var requestConfig = {
      method: "POST",
      url: `api/user/${_user._id}/friends/${user._id.toString()}`
    };

    $.ajax(requestConfig).then(function (res) {
      updateFriends();
    }).fail(function (e) {
      $("#addFriendText").addClass("formError");
      $("#formErrorMessage").show();
      $("#formErrorMessage").text(`Could not add friend`);
    });
  });
}

function updateFriends() {
  // Update the friends list
  var requestConfig = {
    method: "GET",
    url: "/home/friends"
  };

  $.ajax(requestConfig).then(function (res) {
    // Used to keep scroll position
    scrollPos = $("#friends-ul").scrollTop();

    $("#friends-ul").replaceWith($.parseHTML(res)[0]);

    $("#friends-ul").scrollTop(scrollPos);

    $("#friends-ul").children().each(function(i, friend) {
      friendDeleteHandler(friend);
    });
  }).fail(function (e) {
    // TODO: Show an error somehow
  });
}

function friendDeleteHandler(friend) {
  var deleteForm = $($(friend).find(".delete")[0])
  deleteForm.submit(async function (e) {
    e.preventDefault();

    // Removethe friend
    var requestConfig = {
      method: "DELETE",
      url: `api/user/${_user._id}/friends/${$(deleteForm).attr("data-id")}`
    };

    $.ajax(requestConfig).then(function (res) {
      updateFriends();
    }).fail(function (e) {
      // TODO: Show an error somehow
    });

  })
}

/** Entrypoint! Should be run onload in homepage **/
async function start() {
  _user = await $.get('/api/user')
  renderPets()
  startClickToPlace()
  startAnimation()
}
