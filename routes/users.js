const { Router } = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const { secretKey } = require("../bin/config");

// handle errors
const handleErrors = (err) => {
  const errors = { username: "", password: "" };

  // incorrect username
  if (err.message === "incorrect username") {
    errors.username = "That username is not registered";
  }
  // incorrect password
  if (err.message === "incorrect password") {
    errors.password = "That password is incorrect";
  }

  // duplicate error code
  if (err.code === 11000) {
    errors.username = "Username is already registered";
    return errors;
  }

  // validation errors
  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  return errors;
};

const maxAge = 3 * 24 * 60 * 60;

// create JWT
const createToken = (id) => {
  return jwt.sign({ id }, secretKey, {
    expiresIn: maxAge,
  });
};

const router = Router();

const User = require("../models/user");
const Book = require("../models/book");
const { requireAuth, requireAdmin } = require("../middleware/authenticate");

router.use(bodyParser.json());

router
  .route("/")
  /* GET users listing. */
  .get(requireAdmin, (_req, res, next) => {
    User.find({})
      .populate("books")
      .then(
        (users) => {
          console.log(users);
          res.render("adminRestricted/users", { users });
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  /* DELETE all users. */
  .delete((_req, res) => {
    User.remove({})
      .then(
        (response) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
        },
        (err) => handleErrors(err)
      )
      .catch((err) => handleErrors(err));
  });

router
  .route("/signup")
  .get((_req, res) => {
    res.render("signup");
  })
  .post(async (req, res) => {
    const { username, name, password } = req.body;
    try {
      const user = await User.create({ username, name, password });
      const token = createToken(user._id);
      res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
      res.status(201).json({ user: user._id });
    } catch (err) {
      const errors = handleErrors(err);
      res.status(400).json({ errors });
    }
  });

router
  .route("/login")
  .get((_req, res) => {
    res.render("login");
  })
  .post(async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await User.login(username, password);
      const token = createToken(user._id);
      res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
      res.status(200).json({ user: user._id });
    } catch (err) {
      const errors = handleErrors(err);
      res.status(400).json({ errors });
    }
  });

router.get("/logout", (_req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
});

router
  .route("/settings")
  .get((_req, res) => {
    res.render("settings");
  })
  .post(requireAuth, async (req, res) => {
    const password = req.body.password;
    try {
      const newPassword = await User.hashPassword(password);

      const token = req.cookies.jwt;
      const decoded = jwt.decode(token);

      const user = await User.findByIdAndUpdate(
        { _id: decoded.id },
        { $set: { password: newPassword } }
      );
      console.log("Successfully changed password for user ", user.username);
      res.status(200).json({ user: user._id, token });
      res.redirect("/");
    } catch (err) {
      const errors = handleErrors(err);
      res.status(400).json({ errors });
    }
    /**
    const token = req.cookies.jwt;
    const password = req.body.password;
    if (token) {
      jwt.verify(token, secretKey, async (err, decodedToken) => {
        if (err) {
          console.log(err.message);
          res.status(400).send(err.message);
          next();
        } else {
          const data = await User.findOne({ _id: decodedToken.id });
          if (data) {
            const newPassword = await User.hashPassword(password);
            const user = await User.findByIdAndUpdate({ _id: decodedToken.id }, { $set: { password: newPassword } });
            console.log(user);
            res.redirect("/");
          } else {
            res.redirect("/");
          }
        }
        next();
      });
    }
     **/
  });

router
  .route("/:userID")
  .post(requireAdmin, (req, res, next) => {
    User.findByIdAndUpdate(
      req.params.userID,
      {
        $set: req.body,
      },
      { new: true }
    )
      .then(
        (user) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(user);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete(requireAdmin, (req, res, next) => {
    User.findByIdAndRemove(req.params.userID)
      .then(
        (response) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

router.route("/add-book/:bookID").post(requireAuth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookID);
    console.log(book);
    if (book.featured) {
      const token = req.cookies.jwt;
      const decoded = jwt.decode(token);
      console.log({ user_id: decoded.id });
      const user = await User.findById(decoded.id);
      user.books.push(book);
      user.save();
      console.log(user);
      res.status(200).json({ user });
    } else {
      console.log("This book is not featured");
      res.status(400).json("This book is not featured");
    }
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
});

module.exports = router;
