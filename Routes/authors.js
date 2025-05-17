const express = require("express");
const router = express.Router();
const Joi = require("joi");
const author = require("../models/authors");
const verifyToken = require("../middlewares/verifyToken")

//show all authors
router.get("/", async (req, res) => {
  try {
    const authors = await author.find();
    res.send(authors);
  } catch (error) {
    return res.status(500).send(error);
  }
});

// get a specific auther
router.get("/:authorId", async (req, res) => {
  const id = req.params.authorId;

  try {
    const oneAuthor = await author.findById(id);
    if (!oneAuthor) {
      return res.status(404).send("author not found");
    }

    res.send(oneAuthor);
  } catch (error) {
    return res.status(500).send(error);
  }
});

//create a new author/only admin
router.post("/", verifyToken ,async (req, res) => {
   if(!req.user.isAdmin){
    return res.status(403).send({message : "this user not allowed , only admin"})
  }

  const { error } = validationCreateAuthor(req.body);
  if (error) {
    return res.status(404).send(error.details[0].message);
  }

  try {
    const newAuthor = new author({
      name: req.body.name,
      nationality: req.body.nationality,
      image: req.body.image,
    });

    await newAuthor.save();

    res.send(newAuthor);
  } catch (error) {
    return res.status(500).send(error);
  }
});

// update a book/only admin
router.put("/:authorId", verifyToken,async (req, res) => {

    if(!req.user.isAdmin){
    return res.status(403).send({message : "this user not allowed , only admin"})
  }

  const id = req.params.authorId;

  try {
    const updateAuthor = await author.findById(id);

    if (!updateAuthor) {
      return res.status(404).send("author is not found");
    }

    const { error } = validationUpdateAuthor(req.body);
    if (error) {
      return res.status(404).send(error.details[0].message);
    }

    updateAuthor.name = req.body.name;
    updateAuthor.nationality = req.body.nationality;
    updateAuthor.image = req.body.image;
    updateAuthor.save();
    res.send(updateAuthor);
  } catch (error) {
    return res.status(500).send(error);
  }
});

// delete a book/only admin
router.delete("/:authorId",verifyToken, async (req, res) => {
     if(!req.user.isAdmin){
    return res.status(403).send({message : "this user not allowed , only admin"})
  }
  const id = req.params.authorId;
  try {
    const deleteAuthor = await author.findById(id);

    if (!deleteAuthor) {
      return res.status(404).send("author is not found");
    }

    await author.findByIdAndDelete(id);
    res.send("author has been deleted");
  } catch (error) {
    return res.status(500).send(error);
  }
});

function validationCreateAuthor(obj) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(40).required(),
    nationality: Joi.string().min(3).max(40).required(),
    image: Joi.string().min(3).max(40),
  });

  return schema.validate(obj);
}

function validationUpdateAuthor(obj) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(40),
    nationality: Joi.string().min(3).max(40),
    image: Joi.string().min(3).max(40),
  });

  return schema.validate(obj);
}

module.exports = router;
