var express = require("express");
var blog = require("../models/postdata");
var app = express.Router();
var VerifyToken = require("../middleware/verify");
var people = require("../models/userdata");

// app.get("/mypost", VerifyToken.verifyToken, function (req, res) {
//   blog
//     .find({ author: req.userId })
//     .populate("author")
//     .exec(function (err, found) {
//       if (err) res.status(400).send(err);
//       else res.send(found);
//     });
// });

app.post("/create", VerifyToken.verifyToken, function (req, res) {
  var title = req.body.title;
  var image = req.body.url;
  var author;
  people.findById(req.userId, function (err, found) {
    if (err) res.status(400).send("Something went wrong");
    else author = found;
    var item = { title: title, image: image, author: author };
    if (!title || !image || !author)
      return res.status(400).send({ error: "Enter all fields" });
    else {
      blog.create(item, function (err, new_item) {
        if (err) res.status(400).send(err);
        else {
          console.log("Item posted");
          res.send(new_item);
        }
      });
    }
  });
});

app.put("/create/:id", VerifyToken.verifyToken, function (req, res) {
  blog.findById(req.params.id, function (err, found) {
    if (req.userId == found.author._id) {
      found.title = req.body.title;
      found.image = req.body.url;
      found.author = req.userId;
      found.save();
    }
  });
  res.send(found);
});

app.get("/allpost", function (req, res) {
  blog
    .find({})
    .populate("author")
    .populate("comments.author")
    .exec(function (err, payagaya) {
      if (err) {
        console.log(err);
        res.status(400).send(err);
      } else {
        res.send(payagaya);
      }
    });
});

// app.get("/:naampost", function (req, res) {
//   blog.findById(req.params.naampost, function (err, payagaya) {
//     if (err) res.status(400).send(err);
//     else if (payagaya.length === 0)
//       res.status(400).send(req.params.naamsabzi.toUpperCase() + " Not Found");
//     else res.send(payagaya);
//   });
// });

// app.put("/:id", VerifyToken.verifyToken, function (req, res) {
//   console.log("Hello");
//   blog.findById(req.params.id, function (err, found) {
//     if (found != undefined && req.userId == found.author) {
//       blog.findByIdAndUpdate(
//         req.params.id,
//         req.body,
//         { new: true },
//         function (err, updated_item) {
//           if (err) res.status(400).send(err);
//           else {
//             console.log("updated");
//             res.send(updated_item);
//           }
//         }
//       );
//     } else res.status(404).send("U dont have permission to do this");
//   });
// });

app.delete("/:id", VerifyToken.verifyToken, function (req, res) {
  blog.findById(req.params.id, function (err, found) {
    if (req.userId == found.author._id) {
      blog.findByIdAndRemove(req.params.id, function (err, deleted_item) {
        console.log("deleted");
      });
    } else res.send({ error: "U dont have permission to do this" });
  });
});

app.put("/likes/:id", VerifyToken.verifyToken, function (req, res) {
  blog.findById(req.params.id, function (err, payagaya) {
    if (err) res.send(err);
    else {
      var index = payagaya.likes.findIndex((ele) => ele._id == req.userId);
      if (index !== -1) payagaya.likes.splice(index, 1);
      else payagaya.likes.push(req.userId);
      payagaya.save();
      res.send(payagaya);
    }
  });
});

app.put(
  "/comments/:id([0-9a-f]{24})",
  VerifyToken.verifyToken,
  function (req, res) {
    const item = {
      text: req.body.text,
      author: req.userId,
    };
    blog
      .findById(req.params.id)
      .populate("comments.author")
      .exec(function (err, result) {
        if (err) res.status(400).send({ error: err });
        else {
          result.comments.push(item);
          result.save();
          res.send(result);
        }
      });
  }
);

app.get("*", (req, res) => {
  res.status(404).send("404 NOTHING TO SEE HERE...");
});

module.exports = app;
