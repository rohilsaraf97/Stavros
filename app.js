// jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");
const ejs = require("ejs");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PW,
  },
});

mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs", "partials");
var getdate = function () {
  let options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  today = new Date();
  return today.toLocaleDateString("en-US", options);
};

const blogschema = new mongoose.Schema({
  posttitle: {
    type: String,
    required: true,
  },
  postbody: {
    type: String,
    required: true,
  },
  fname: {
    type: String,
    required: true,
  },
  lname: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
});

const donorschema = new mongoose.Schema({
  fname: {
    type: String,
    required: true,
  },
  lname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  country: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zip: {
    type: String,
    required: true,
  },
  cardtype: {
    type: String,
    required: true,
  },
  cname: {
    type: String,
    required: true,
  },
  cno: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  exp: {
    type: String,
    required: true,
  },
  cvv: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
});

const Post = mongoose.model("Post", blogschema);
const Checkout = mongoose.model("Checkout", donorschema);
const post1 = new Post({
  posttitle:
    "In necessary things, unity. in doubtful things, liberty. In all things, charity.",
  postbody:
    "But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure?",
  fname: "Phineas",
  lname: "Flynn",
  date: getdate(),
});
const post2 = new Post({
  posttitle: "When life give you lemons",
  postbody:
    "If life was fair, I’d have everything. This is almost the story of every person. Now imagine if life was actually a bed of roses, every other person would be ruling, no one would know the meaning of fight, and winning without fighting is tasteless. Undoubtedly, ‘Life is not a bed of roses’ but that does not mean we can’t make it a bed of roses. Similar is the meaning of this topic ‘If Life gives you lemons, make lemonade’. This topic depicts a hopeful and optimistic attitude towards life.When dealing with difficulties, every man thinks he is the most unlucky but little he know that every individual has to face problem in some course of life. Every problem contains a solution too, right? And in this case, the only thing that rejuvenates man, makes him courageous and empowers him to face the challenge valiantly is hope. Alexander pop has rightly said ‘Hope springs eternal in human breast’. It is human nature to always find opportunity in adversity. I am playing a game and fail to pass the level, the only thing that does not let me become pessimist is hope that I have many chances left and this hope continues till the last chance. So is with man’s life. He tries to bring golden opportunities out of life even in face of misfortunes until the upheaval is gone. Human history is full of such adventures in which physical, mental and geographical hindrance failed to impede the ways of courageous and dedicated people on the path of success. Such individuals laughed in the face of adversities and defeated the demons of negativity, failure, and stagnation for they knew if there are obstructions in life so are the panacea to overcome these obstructions. Socio-Economic, political, scientific and technological development emphatically praises man’s abilities in turning lemons into lemonades. This proverb asks you to find positive in everything even when life is not going your way and we have examples of so many optimistic people to follow in this matter.",
  fname: "Phil",
  lname: "Dunphy",
  date: getdate(),
});

const defaultblogs = [post1, post2];

app.get("/", function (req, res) {
  res.render("index");
});
app.get("/blog", function (req, res) {
  Post.find({}, function (err, found) {
    if (!err) {
      if (found.length === 0) {
        Post.insertMany(defaultblogs, function (err) {
          if (!err) {
            console.log("successfully inserted default blogs");
          }
        });
        res.redirect("/blog");
      } else {
        res.render("blog", {
          posts: found,
          date: getdate(),
        });
      }
    }
  });
});
app.get("/about", function (req, res) {
  res.render("about");
});
app.get("/checkout", function (req, res) {
  res.render("checkout");
});
app.get("/succes", function (req, res) {
  res.render("succes");
});

app.get("/compose", function (req, res) {
  res.render("compose", {
    date: getdate(),
  });
});

app.get("/donations", function (req, res) {
  let totalamount = {};
  Checkout.aggregate(
    [{ $group: { _id: null, total: { $sum: "$amount" } } }],
    function (err, result) {
      if (!err) {
        totalamount = result[0];
      }
    }
  );

  Checkout.find({}, function (err, found) {
    if (!err) {
      res.render("donations", {
        donations: found,
        totalamount: totalamount,
      });
    }
  });
});
app.get("/post/:postid", function (req, res) {
  Post.findById(req.params.postid, function (err, found) {
    if (!err) {
      res.render("post", {
        post: found,
      });
    }
  });
});
//thishishsihsishishishishsihsi time pass
app.post("/checkout", function (req, res) {
  const donorinfo = new Checkout({
    fname: req.body.firstName,
    lname: req.body.lastName,
    email: req.body.email,
    country: req.body.stt,
    state: req.body.state,
    zip: req.body.zip,
    cardtype: req.body.paymentMethod,
    cname: req.body.cname,
    cno: req.body.cno,
    amount: req.body.amount,
    exp: req.body.exp,
    cvv: req.body.cvv,
    date: getdate(),
  });
  donorinfo.save();
  console.log(__dirname);
  ejs.renderFile(
    __dirname + "/views/mail.ejs",
    { name: req.body.firstName, amount: req.body.amount },
    function (err, data) {
      if (err) {
        console.log(err);
      } else {
        var mailOptions = {
          from: process.env.ADMIN_EMAIL,
          to: req.body.email,
          subject: "Thankyou for your Donation!",
          html: data,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
      }

      res.redirect("/succes");
    }
  );
});
app.post("/succes", function (req, res) {
  res.redirect("/");
});

app.post("/compose", function (req, res) {
  const post = new Post({
    posttitle: req.body.blogtitle,
    postbody: req.body.blogbody,
    fname: req.body.fname,
    lname: req.body.lname,
    date: getdate(),
  });
  post.save();
  res.redirect("/blog");
});

app.listen(3000, function () {
  console.log("Server is running on port 3000");
});
