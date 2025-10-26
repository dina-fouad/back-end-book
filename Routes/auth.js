//hash password => npm i bcryptjs
// to get token => npm i jsonwebtoken
const express = require("express");
const router = express.Router();
const Joi = require("joi");
const user = require("../models/users");
const bcrypt = require("bcryptjs"); //تشفير الباسوورد
const jwt = require("jsonwebtoken");
const passwordComplexity = require('joi-password-complexity');

// register a new user
router.post("/register", async (req, res) => {
  const { error } = validationRegisterUser(req.body);
  if (error) {
    return res.status(400).json({msg : error.details[0].message});
  }

  let user1 = await user.findOne({ email: req.body.email }); // برجع يا اما null او obj
  console.log(user1);
  if (user1) {
    return res.status(400).send({ message: "this email is already exists" });
  } // بدور على الايميل في قاعردة البيانات اذا لقاها true واذا ما لقاها الجواب null يعتي false
  // وضع unique في validation لعدم تكرار الايميل لا يكفي وحده

  // تشفير الباسورد
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  try {
    const newUser = await new user({
      email: req.body.email,
      username: req.body.username,
      password: hashedPassword,
    });

    const token = jwt.sign({id : newUser._id , isAdmin : newUser.isAdmin}, process.env.SECRET_KEY);
    console.log(token)

    const result = await newUser.save();
    const { password, ...other } = result._doc; /// لارسال البيانات بدون الباسووورد مع token
    res.send({ ...other, token });

    //     res.send({
    //   id: result._id,
    //   email: result.email,
    //   username: result.username,
    //   token
    // });
  } catch (error) {
    res.status(500).send(error);
  }
});

//login method
router.post("/login", async (req, res) => {// تم استخدام post عشان اقدر ابعت داتا بالbody 
  const { error } = validationLoginUser(req.body);
  if (error) {
    return res.status(400).send(error);
  }

  let findUser = await user.findOne({ email: req.body.email });
  let isCorrectPassword = await bcrypt.compare(req.body.password , findUser.password)// فك التشفير ومقارنة الباسورد الي انبعت مع الباسوورد الي مخزن بقاعدة البيانات


    if(!isCorrectPassword){
         return res.status(400).send({ message: "Invalid password or email" });
    }

  if (!findUser) {
    return res.status(400).send({ message: "Invalid password or email" });
  }

//https://jwt.io/  => for see the decoded token
 let token = jwt.sign({id : findUser._id , isAdmin : findUser.isAdmin} , process.env.SECRET_KEY)
//     {
//     expiresIn : "30d" // هذا التوكن صالح لمدة 30 يوم وبقدر ما احطه
//  })// create a new token// get two params : payload & secret key


//يتم عمل التوكن من 3 اقسام : الثاني تشفير الاي دي واليوزرنيم والثالث تشفير كلمة سيكرت كي
// يمكن رؤية ذلك عبر الموقع الذي في الاعلى


  res.send({
    email : findUser.email,
    username : findUser.username,
    token
  });
});

// validation register user
function validationRegisterUser(obj) {
  const schema = Joi.object({
    email: Joi.string().max(300).min(2).trim().email().required(),

    username: Joi.string().trim().min(3).max(400).required(),

    password: passwordComplexity().required(),

 
  });

  return schema.validate(obj);
}

// validation Login user
function validationLoginUser(obj) {
  const schema = Joi.object({
    email: Joi.string().max(300).min(2).trim().email().required(),

    password: passwordComplexity().required(),
  });

  return schema.validate(obj);
}

module.exports = router;
