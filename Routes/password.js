//install ejs - html file to use it to render a forget password page => npm i ejs
//npm install nodemailer => send email
                                       /// <<===reset password ===>
const express = require("express");
const router = express.Router();
const user = require("../models/users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

//send reset password link to user
router.get("/forgot-password", (req, res) => {
  res.render("forgotPassword.ejs", {}); // using render to send html file
});

//اذا كنت بستخدم react ببعت res.json للفرونت ايند

// send email from front end to backend// take email from html form (methode post)
router.post("/forgot-password", async (req, res) => {
  const findUser = await user.findOne({ email: req.body.email });
  if (!findUser) {
    res.status(404).json({ message: "user not found" });
  }

  const secret = process.env.SECRET_KEY + findUser.password; //123456
  const token = jwt.sign({ email: findUser.email, id: findUser.id }, secret, {
    expiresIn: "10m",
  });
  console.log(secret);
  const link = `http://localhost:5000/password/forgot-password/${findUser.id}/${token}`;

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });

  let mailOptions = {
    from: process.env.EMAIL,
    to: findUser.email,
    subject: "Reset Password",
    html: `<h1>Welcome</h1><p>Open this below link to reset your password</p><p>${link}</p>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      res.status(500).json({message : "something went wrong"})
    } else {
      console.log("Email sent: " + info.response);
      res.render("sendEmail.ejs", {});
    }
  });

  
});

router.get("/forgot-password/:userId/:token", async (req, res) => {
  const findUser = await user.findOne({ _id: req.params.userId });
  if (!findUser) {
    res.status(404).json({ message: "user not found" });
  }
  const secret = process.env.SECRET_KEY + findUser.password;

  console.log(secret); //123456
  try {
    jwt.verify(req.params.token, secret);
    res.render("resetPassword.ejs", {});
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.post("/forgot-password/:userId/:token", async (req, res) => {
  let findUser = await user.findOne({ _id: req.params.userId });
  if (!findUser) {
    res.status(404).json({ message: "user not found" });
  }
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  findUser.password = hashedPassword; //5336882

  await findUser.save();
  res.render("successChange.ejs", {});
});

module.exports = router;
