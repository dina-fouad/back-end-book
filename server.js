//installation : 1- npm init // 2- npm install express // 3- npm install mongoose
//for running code => npx nodemon server.js
// using joi libtary for validation  => npm install joi
// secret links  => npm i dotenv + make a file .env
const express = require("express");

// init app
const app = express();



// its important to read the body
app.use(express.json()); //JSON من body
// reset passowrd middleware
app.use(express.urlencoded({extended : false}))// عشان البيانات الي في الفورم ما رح يفهمها الاكسبرس بستخدم مدلوير




// secret file & private key
const dotenv = require("dotenv")
dotenv.config()

// connection between express & mongodb (with database)
const mongoose = require("mongoose");
mongoose
  .connect(
    process.env.MONGO_URL  //يجب وضعه في ملف .env في حال رفع المشروع على github رح يكون مبين للكل فيجب اخفائه في .env    =>npm i dotenv
  )
  .then(() => {
    console.log("connect with mongodb");
  })
  .catch((error) => {
    console.log("connection faild" ,error);
  });


//Routes
const booksBath = require("./Routes/books");
const authorBath = require("./Routes/authors");
const usersBath = require("./Routes/users")
const authBath = require("./Routes/auth")
const passwordPath = require("./Routes/password")
const imagesPath = require('./Routes/image')



const logger = require("./middlewares/logger");
const {errHandler404 , errHandler500} = require("./middlewares/errors")




//عمل middleware باستخدام next ويجب وضعها باول شيء في middleware 
app.use(logger)// للانتقال الى middleware التي تليها
              //
              //  next middleware => 

//Routes/middleware
app.use("/password" , passwordPath)
app.use("/api/auth" , authBath)
app.use("/api/users" , usersBath)
app.use("/api/books", booksBath);
app.use("/api/images", imagesPath);
app.use("/api/authors", authorBath);// في حال وجود خطأ يتم ارسالها الى error handler middlewares


// error handler middleware // دايما لازم تكون بعد routes/// ترتيب middlewares مهم جدا
app.use(errHandler404);

app.use(errHandler500)



// runnig server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`The app is listening on port ${PORT}`);
});
