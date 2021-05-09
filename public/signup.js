/*
  Michael Chunko
  Dominick DiMaggio
  Marcus Simpkins
  Elijah Wendel
  CS 546A
  I pledge my honor that I have abided by the Stevens Honor System.
*/

// JS for signup.handlebars

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
    if (!username || username.trim().length == 0) {
      usernameInput.classList.add("formError");
      usernameInput.focus();
      errorMsg.innerHTML = "Please enter a username";
      errorMsg.hidden = false;
      return;
    }

    if (!displayname || displayname.trim().length == 0) {
      displaynameInput.classList.add("formError");
      displaynameInput.focus();
      errorMsg.innerHTML = "Please enter a display name";
      errorMsg.hidden = false;
      return;
    }

    if (!password || password.trim().length == 0) {
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

    if (!passwordRepeat || password != passwordRepeat) {
      passwordRepeatInput.classList.add("formError");
      passwordRepeatInput.focus();
      errorMsg.innerHTML = "Passwords must match";
      errorMsg.hidden = false;
      return;
    }

    // Submit form to the server to check the username
    // And create the user if it succeeds
    $(this).unbind("submit").submit();
  })
}
