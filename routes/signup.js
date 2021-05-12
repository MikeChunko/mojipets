/*
  Michael Chunko
  Dominick DiMaggio
  Marcus Simpkins
  Elijah Wendel
  CS 546A
  I pledge my honor that I have abided by the Stevens Honor System.
*/

const express = require("express"),
      router = express.Router(),
      xss = require("xss"),
      data = require("../data"),
      userData = data.users;

router.get("/", async (req, res) => {
  // Logged-in users should never see the signup screen
  if (req.session.user)
    return res.redirect("/home");

  return res.render("mojipets/signup", {
    title: "MojiPets",
    css: "/public/site.css",
    error: ""
  })
});

router.post("/", async (req, res) => {
  // Input checking
  const uname = xss(req.body.usernameInput),
        dname = xss(req.body.displaynameInput),
        password = xss(req.body.passwordInput),
        passwordRepeat = xss(req.body.passwordRepeatInput);

  if (!uname || uname.trim().length == 0)
    return res.status(400).render("mojipets/signup", {
      title: "MojiPets",
      css: "/public/site.css",
      error: "Please enter a username"
    });

  if (!dname || dname.trim().length == 0)
    return res.status(400).render("mojipets/signup", {
      title: "MojiPets",
      css: "/public/site.css",
      error: "Please enter a display name"
    });

  if (!password || password.trim().length == 0 || password.length < 8)
    return res.status(400).render("mojipets/signup", {
      title: "MojiPets",
      css: "/public/site.css",
      error: "Please enter a password at least 8 characters long"
    });

  if (!passwordRepeat || password != passwordRepeat)
    return res.status(400).render("mojipets/signup", {
      title: "MojiPets",
      css: "/public/site.css",
      error: "Passwords must match"
    });

    // Create the user
    try {
      const users = await userData.getAllUsers();
      
      // Check for conflicting username
      for (let i = 0; i < users.length; i++)
        if (users[i].username.toLowerCase() == uname.toLowerCase())
          return res.status(400).render("mojipets/signup", {
            title: "MojiPets",
            css: "/public/site.css",
            error: "That username is taken"
          });

      const { passwordhash, ...user} = await userData.add({
        username: uname,
        displayname: dname,
        plaintextPassword: password
      });

      // If we've gotten this far in the try then the user has been created successfully
      // So log them in
      req.session.user = user;

      return res.redirect("/home");
    } catch (e) {  // Some error has occured in the db
      return res.status(500).render("mojipets/signup", {
        title: "MojiPets",
        css: "/public/site.css",
        error: "Could not create user with the given info"
      });
    }
})

module.exports = router;
