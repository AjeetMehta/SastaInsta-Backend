var express = require("express");
var mongoose = require("mongoose");
var cors = require("cors");
var nodemailer = require("nodemailer");
var sendgridTransport = require("nodemailer-sendgrid-transport");
var app = express();
// mongoose.connect(
//   "mongodb://localhost/insta",
//   { useNewUrlParser: true },
//   { useUnifiedTopology: true }
// );

mongoose.connect(
  "mongodb+srv://AjeetMehta:ajeet1234@cluster0.2zavz.mongodb.net/insta?retryWrites=true&w=majority",
  { useNewUrlParser: true }
);

var userRoute = require("./routes/user");
var postRoute = require("./routes/post");

app.use(cors());
app.use(express.urlencoded());
app.use(express.json());
app.use("/users", userRoute);
app.use("/posts", postRoute);

// var transport = nodemailer.createTransport({
//   service: "Gmail",
//   auth: {
//     user: "ajeet2000mehta@gmail.com",
//     pass: "ajeet@1234",
//   },
// });

// var mailOptions = {
//   from: "noreply@gmail.com",
//   to: "ajeet2000mehta@gmail.com",
//   subject: "Email Confirmation",
//   html: `<b>Press</b><a href:http://localhost:5000/req.userId></a><b>to verify mail </b>`,
// };

// transport.sendMail(mailOptions, function (error, response) {
//   if (error) console.log(error);
//   else console.log("Message Sent");
// });

if (process.env.NODE_ENV == "production") {
  app.use(express.static("client/build"));
  const path = require("path");
  app.get("*", function (req, res) {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}
const port = process.env.PORT || 5000;
app.listen(port, function () {
  console.log("Our Insta_Clone app is running");
});
