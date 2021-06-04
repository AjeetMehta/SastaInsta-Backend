var express = require("express");
var people = require("../models/userdata");
var jwt = require("jsonwebtoken");
var app = express.Router();
var bcrypt = require("bcrypt");
var saltRounds = 10;
var config = "qwertyuiopasdfghjklzxcvbnm1234567890";
var VerifyToken = require("../middleware/verify");
var nodemailer = require("nodemailer");
var sendgridTransport = require("nodemailer-sendgrid-transport");
var crypto = require("crypto");
var blog = require("../models/postdata");

var transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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",
    },
  })
);

app.get("/mypost", VerifyToken.verifyToken, function (req, res) {
  people.findById(req.userId, function (err, found) {
    if (err) res.status(400).send(err);
    else res.send(found);
  });
});

app.post("/register", function (req, res) {
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    var name = req.body.name;
    var email = req.body.email;
    var photo = req.body.url;
    var password = hash;
    var item = { name: name, photo: photo, email: email, password: password };
    people.create(item, function (err, new_customer) {
      if (err) res.status(400).send(err);
      else {
        transporter.sendMail({
          to: email,
          from: "2018ugcs076@nitjsr.ac.in",
          subject: "Registration successful",
          html: "<h1>Welcome to SantaInsta</h1>",
        });
        res.send({ message: "Registration Successful" });
      }
    });
  });
});

app.post("/login", VerifyToken.isLoggedIn, function (req, res) {
  var email = req.body.email;
  var password = req.body.password;

  people.findOne({ email: email }, function (err, found) {
    if (!found) res.status(400).send({ error: "Email is not registered" });
    else {
      bcrypt.compare(password, found.password, function (err, result) {
        if (result == true) {
          console.log("Logged In");
          const token = jwt.sign({ _id: found._id }, config, {
            expiresIn: 86400,
          });
          res.send({ token: token });
        } else res.send({ error: "Wrong Password" });
      });
    }
  });
});

app.post("/reset", function (req, res) {
  crypto.randomBytes(32, function (err, toki) {
    if (err) console.log(err);
    else {
      const token = toki.toString("hex");
      people.findOne({ email: req.body.email }, function (error, found) {
        if (!found)
          res.status(400).send({ error: "User does not exist with this mail" });
        else {
          found.resetPasswordToken = token;
          found.resetPasswordExpires = Date.now() + 3600000;
          found.save();
          transporter.sendMail({
            to: found.email,
            from: "2018ugcs076@nitjsr.ac.in",
            subject: "Password-Reset",
            html: `<p>You requested for password reset</p>
                <h5>CLick here <a href="http://localhost:3000/reset-password/${token}">Link</a></h5>`,
          });
          res
            .status(200)
            .send({ message: "Link is send to ur mail for reset Password" });
        }
      });
    }
  });
});

app.post("/reset-password", function (req, res) {
  const senttoken = req.body.token;
  people.findOne(
    {
      resetPasswordToken: senttoken,
      resetPasswordExpires: { $gt: Date.now() },
    },
    function (error, found) {
      if (error) res.status(400).send({ error: "Try Again! Session Expired" });
      else {
        bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
          found.password = hash;
          found.resetPasswordToken = undefined;
          found.resetPasswordExpires = undefined;
          found.save();
          res.status(200).send({ message: "Successfully Updated Ur Password" });
        });
      }
    }
  );
});

app.get("/dusrekaprofile/:id", function (req, res) {
  blog
    .find({ author: req.params.id })
    .populate("author")
    .exec(function (error, found) {
      // console.log(found[0].author.name);
      res.send(found);
    });
});

app.put("/follow/:id", VerifyToken.verifyToken, function (req, res) {
  people.findById(req.params.id, function (err, found) {
    if (err) res.send(err);
    else {
      found.follower.push(req.userId);
      found.save();
      people.findById(req.userId, function (err, founder) {
        if (err) res.send(err);
        else {
          founder.following.push(req.params.id);
          founder.save();
        }
      });
      res.send(found);
    }
  });
});

app.put("/unfollow/:id", VerifyToken.verifyToken, function (req, res) {
  people.findById(req.params.id, function (err, found) {
    if (err) res.send(err);
    else {
      var index = found.follower.findIndex((ele) => ele._id == req.userId);
      if (index !== -1) found.follower.splice(index, 1);
      // found.updateOne({ $pull: { follower: req.userId } });
      found.save();
      people.findById(req.userId, function (err, founder) {
        if (err) res.send(err);
        else {
          var index = founder.following.findIndex(
            (ele) => ele._id == req.params.id
          );
          if (index !== -1) founder.following.splice(index, 1);
          // founder.updateOne({ $pull: { following: req.params.id } });
          founder.save();
        }
      });
      res.send(found);
    }
  });
});

// app.put("/:id", function (req, res) {
//   people.findByIdAndUpdate(
//     req.params.id,
//     req.body,
//     { new: true },
//     function (err, updated_user) {
//       if (err) res.status(400).send(err);
//       else {
//         console.log("updated");
//         res.send(updated_user);
//       }
//     }
//   );
// });

// app.delete("/:id", function (req, res) {
//   people.findByIdAndRemove(req.params.id, function (err, deleted_user) {
//     if (err) res.status(400).send(err);
//     else {
//       console.log("deleted");
//       res.send(deleted_user);
//     }
//   });
// });

app.post("/verifykro", VerifyToken.verifyToken, function (req, res) {
  people.findById(req.userId, function (err, payagaya) {
    res.send(payagaya);
  });
});

app.get("*", (req, res) => {
  res.status(404).send("404 NOTHING TO SEE HERE...");
});

module.exports = app;
