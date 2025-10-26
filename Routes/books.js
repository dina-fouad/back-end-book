const express = require("express");
const Joi = require("joi");
const book = require("../models/books");
const asyncHandler = require("express-async-handler"); // بدل استخدام try & catch
const verifyToken = require("../middlewares/verifyToken");
const review = require("../models/reviews");
const fs = require("fs");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const router = express.Router();

//save image url
const upload = multer({ dest: "uploads/" });

// إعداد Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// HTTP methods => get/post/put/delete:
// EndPoints

// get all books
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { minPrice, maxPrice } = req.query;
    let showBooks;
    if (minPrice && maxPrice) {
      showBooks = await book
        .find({ price: { $gte: minPrice, $lte: maxPrice } })
        .populate("author", ["-_id", "-updatedAt", "-createdAt", "-__v"]);
    } else {
      showBooks = await book
        .find()
        .populate("author", ["-_id", "-updatedAt", "-createdAt", "-__v"]);
    }

    res.send(showBooks);
    // .find().populate("author", ["_id" ,"name"]) //to show author info and show just id & name author
    // .sort({ price: 10 })
    // .select(`${req.query.title} ${req.query.description} -_id`); // نستخدم 1 اذا نريد الترتيب من اعلى للاقل ونستخدم -1 من الاقل للاعلى
    // .find({price : {$gte : req.query.minPrice , $lte : req.query.maxPrice }}).populate("author")
    // الاسعار بين رقمين
    //https://www.mongodb.com/docs/manual/reference/operator/query-comparison/
    // res.json(showBooks); // -_id يعني بدون ظهور الاي دي
  })
);

// get a specific book
router.get(
  "/:bookId",
  asyncHandler(async (req, res) => {
    const id = req.params.bookId;

    const findBook = await book.findById(id).populate("author"); // populate => to show author info
    const reviews = await review
      .find({ book: req.params.bookId })
      .populate("user", "-password -isAdmin -__v");
    if (!findBook) {
      return res.status(404).send({ message: "Book not found" });
    }
    res.send({
      book: findBook,
      reviews: reviews,
    });
  })
);

//create a new book/only admin
router.post(
  "/",
  verifyToken,
  upload.single("cover"),
  asyncHandler(async (req, res) => {
    if (!req.user.isAdmin) {
      return res
        .status(403)
        .send({ message: "this user not allowed , only admin" });
    }

    // رفع الصورة إلى Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "book_covers",
    });

    //  if(req.user.id !== req.body.user){
    //   return res.status(403).send({message : "this user not allowed "})
    //  }

    /// call validation function ==================================///
    const { error } = validationCreateBook(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    /////////////////////===============================================================//////

    //=======================بدل ما نحط اكتر من شرط لكل value --- رح نستخدم مكتبة joi==================================////

    // if(!req.body.title || req.body.title.length < 3){
    //    return res.status(400).send("the title should be more than 3 characters and the title is requiered")//حطينا return عشان ينقذ الشرط وما ينفذ الي
    // }

    // if(!req.body.description || req.body.description.length < 3){
    //    return res.status(400).send("the description should be more than 3 characters and the description is requiered")//حطينا return عشان ينقذ الشرط وما ينفذ الي
    // }

    //==========================================================================================================================///
    fs.unlinkSync(req.file.path);
    const newBook = new book({
      title: req.body.title,
      description: req.body.description,
      author: req.body.author,
      cover: result.secure_url, // الرابط من Cloudinary
      price: req.body.price,
    });
    await newBook.save();
    res.send(newBook);
  })
);

// update a book/only admin
router.put(
  "/:bookId",
  verifyToken,
  upload.single("cover"),
  asyncHandler(async (req, res) => {
    if (!req.user.isAdmin) {
      return res
        .status(403)
        .send({ message: "this user not allowed , only admin" });
    }
    const id = req.params.bookId;

    const { error } = validationUpadteBook(req.body);

    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    const updatBook = await book.findById(id);

    if (!updatBook) {
      return res.status(404).send("Book not found");
    }

    // رفع الصورة إلى Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "book_covers",
    });

    fs.unlinkSync(req.file.path);

    updatBook.title = req.body.title;
    updatBook.description = req.body.description;
    updatBook.author = req.body.author;
    updatBook.cover = result.secure_url
    updatBook.price = req.body.price;
    await updatBook.save();
    res.send(updatBook);
  })
);

// delete a book//only admin
router.delete(
  "/:bookId",
  verifyToken,
  asyncHandler(async (req, res) => {
    if (!req.user.isAdmin) {
      return res
        .status(403)
        .send({ message: "this user not allowed , only admin" });
    }
    const id = req.params.bookId;

    const bookFind = await book.findById(id);
    if (bookFind) {
      await book.findByIdAndDelete(id);
      return res.send("book has been deleted");
    } else {
      return res.status(404).send("book not found");
    }
  })
);

// create reviews
router.post("/:bookId/reviews", verifyToken, async (req, res) => {
  const bookId = await book.findById(req.params.bookId);
  if (!bookId) {
    return res.status(404).send({ message: "Book not found" });
  }
  const newReview = new review({
    body: req.body.body,
    user: req.user.id,
    book: req.params.bookId,
  });

  await newReview.save();
  res.send({ body: newReview.body });
});

//validation for create obj
function validationCreateBook(obj) {
  const schema = Joi.object({
    title: Joi.string()

      .min(3)
      .max(400)
      .required(),

    description: Joi.string()

      .min(3)
      .max(400)
      .required(),

    author: Joi.string()

      .min(3)
      .max(30)
      .required(),

    price: Joi.number()

      .min(0)
      .max(40)
      .required(),
  });

  return schema.validate(obj);
}

// validation for update obj
function validationUpadteBook(obj) {
  const schema = Joi.object({
    title: Joi.string()

      .min(3)
      .max(400),

    description: Joi.string()

      .min(3)
      .max(300),

    author: Joi.string()

      .min(3)
      .max(400),

    price: Joi.number()

      .min(0)
      .max(40),
  });

  return schema.validate(obj);
}
module.exports = router;
