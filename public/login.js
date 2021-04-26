/*
  Michael Chunko
  Dominick DiMaggio
  Marcus Simpkins
  Elijah Wendel
  CS 546A
  I pledge my honor that I have abided by the Stevens Honor System.
*/

// JS for login.html

if (document.getElementById("loginForm")) {
  // Then we know these elements exist
  const loginForm = document.getElementById("loginForm"),
        usernameInput = document.getElementById("usernameInput"),
        passwordInput = document.getElementById("passwordInput"),
        errorMsg = document.getElementById("errorMessage");

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Purge errors
    errorMsg.hidden = true;
    usernameInput.classList.remove("formError");
    passwordInput.classList.remove("formError");

    const username = usernameInput.value,
          password = passwordInput.value;

    // Check for well-formedness of values
    if (username.trim().length == 0) {
      usernameInput.classList.add("formError");
      usernameInput.focus();
      errorMsg.innerHTML = "Please enter a username";
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
      errorMsg.innerHTML = "Passwords are at least 8 characters long";
      errorMsg.hidden = false;
      return;
    }

    // TODO: Use bcrypt
    const hashedPassword = hashCode(password);

    // TODO: Send (username, hashedPassword) to the db to check if the combo exists
    // TODO: If so, great! Send a GET request for homepage with the username as the body
    // TODO: Else, display an error to the user

    // ! Debug testing of jquery
    /*$.get("/", function (data, status) {
      console.log(`${data}`);
    });*/

    // ! For now lets pretend the user logs in correctly.
    $(this).unbind("submit").submit();
  })
}
