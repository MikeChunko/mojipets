/*
  Michael Chunko
  Dominick DiMaggio
  Marcus Simpkins
  Elijah Wendel
  CS 546A
  I pledge my honor that I have abided by the Stevens Honor System.
*/

// JS for signup.html

// String hasher courtesy of https://stackoverflow.com/a/15710692
hashCode = s => s.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)

if (document.getElementById("signupForm")) {
  // Then we know these elements exist
  const signupForm = document.getElementById("signupForm"),
        usernameInput = document.getElementById("usernameInput"),
        displaynameInput = document.getElementById("displaynameInput"),
        passwordInput = document.getElementById("passwordInput"),
        passwordRepeatInput = document.getElementById("passwordRepeatInput"),
        errorMsg = document.getElementById("errorMessage");

  signupForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Purge errors
    errorMsg.hidden = true;
    usernameInput.classList.remove("formError");
    displaynameInput.classList.remove("formError");
    passwordInput.classList.remove("formError");
    passwordRepeatInput.classList.remove("formError");

    const username = usernameInput.value,
          displayname = displaynameInput.value,
          password = passwordInput.value
    passwordRepeat = passwordRepeatInput.value;

    // Check for well-formedness of values
    if (username.trim().length == 0) {
      usernameInput.classList.add("formError");
      usernameInput.focus();
      errorMsg.innerHTML = "Please enter a username";
      errorMsg.hidden = false;
      return;
    }

    // TODO: Get user list from db
    const users = []
    const usernames = users.map(e => e.username);

    if (usernames.includes(username)) {
      usernameInput.classList.add("formError");
      usernameInput.focus();
      errorMsg.innerHTML = "This username is taken";
      errorMsg.hidden = false;
      return;
    }

    if (displayname.trim().length == 0) {
      displaynameInput.classList.add("formError");
      displaynameInput.focus();
      errorMsg.innerHTML = "Please enter a display name";
      errorMsg.hidden = false;
      return;
    }

    if (password.trim().length == 0) {
      passwordInput.classList.add("formError");
      passwordInput.focus();
      errorMsg.innerHTML = "Please enter a password";
      errorMsg.hidden = false;
      return;
    }

    if (password.length < 8) {
      passwordInput.classList.add("formError");
      passwordInput.focus();
      errorMsg.innerHTML = "Passwords must be at least 8 characters long";
      errorMsg.hidden = false;
      return;
    }

    if (password != passwordRepeat) {
      passwordRepeatInput.classList.add("formError");
      passwordRepeatInput.focus();
      errorMsg.innerHTML = "Passwords must match";
      errorMsg.hidden = false;
      return;
    }

    const hashedPassword = hashCode(password);

    // TODO: Send (username, displayname, hashedPassword) to the db to create a new user
    // TODO: Send the new user to their homepage
  })
}
