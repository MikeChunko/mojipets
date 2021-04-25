function start() {
    console.log('testing!')
}

/** global vars  **/
const _container = document.getElementById('container');

let _pets = []; // pets to be rendered
let _items = []; // items (food or toys) that the pets will chase

let _looper = null; // for loop iteration

/** setup and start animation **/
function setupPetAnimation() {
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
    let mag = Math.sqrt(pet.delta.x**2 + pet.delta.y**2)
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
      let dist = Math.sqrt(vecToTarget.x**2 + vecToTarget.y**2)
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
        pet.node.style.transform = 'rotate(0deg)';
        pet.node.style.top = `${pet.target.pos.y}px`
        pet.node.style.left = `${pet.target.pos.x}px`
        // remove target from DOM
        var targetNode = document.getElementById(pet.target.id);
        targetNode.parentNode.removeChild(targetNode);
        // remove target from foodlist and from pet's targeting info
        _items.splice(_items.indexOf(pet.target), 1)
        pet.target = null;
        // if new targets are available, pick a new target
        let newTarget = findClosestTarget(pet, _items)
        if (newTarget) setTarget(pet, newTarget)
      }
    }
    // pets that need to move closer to their targets should move closer
    if (_pets.some(pet => pet.target && !withinRange(5, pet, pet.target))) { 
      for (var pet of _pets) if (pet.target && !withinRange(5, pet, pet.target)) {
        // move pet towards target
        pet.pos.x += pet.delta.x; pet.pos.y += pet.delta.y;
        pet.node.style.top = `${pet.pos.y}px`
        pet.node.style.left = `${pet.pos.x}px`
        // compute rotation for next frame
        if (pet.rot.direction == 'L' && pet.rot.degrees == -15)
          pet.rot.direction = 'R'
        if (pet.rot.direction == 'R' && pet.rot.degrees == 15)
          pet.rot.direction = 'L'
        if (pet.rot.direction == 'L') pet.rot.degrees--;
        if (pet.rot.direction == 'R') pet.rot.degrees++;
        // set rotation
        pet.node.style.transform = `rotate(${pet.rot.degrees}deg)`;
      }
    }
  }
}

/** Proof of concept click-to-place **/
function setupClickToPlace() {
    // TODO: place food or toy contextually
  _container.addEventListener('click', event => {
    let pt = {
      x: event.offsetX-25,
      y: event.offsetY-25
    };
    
    // create html node for item
    let placedItem = document.createElement('div');
    placedItem.classList.add('item');
    placedItem.id = `item${_items.length}`
    placedItem.style.left = `${pt.x}px`;
    placedItem.style.top = `${pt.y}px`;
    container.appendChild(placedItem);

    // update info and add item to list
   _items.push({
      id: placedItem.id,
      type: 'food', // TODO: place food or toy contextually
      data: null, // TODO: info from db about this food
      pos: pt,
      targetedBy: null
    })

    console.log(`X: ${pt.x}, Y: ${pt.y}`)
  })
}
