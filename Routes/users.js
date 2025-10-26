const express = require("express");
const router = express.Router();
const Joi = require("joi");
const user = require("../models/users");
const bcrypt = require("bcryptjs");
const verifyToken = require("../middlewares/verifyToken");
const passwordComplexity = require('joi-password-complexity')

// update user
router.put("/:id", verifyToken, async (req, res) => {
  if (req.user.id !== req.params.id && !req.user.isAdmin) {
    return res.status(403).send(" you are not allowed to update");
  } //forbidden

  const { error } = validationUpdateUser(req.body);
  if (error) {
    return res.status(400).send(error);
  }

  try {
    let findUser = await user.findById(req.params.id);

    const hashePassword = await bcrypt.hash(req.body.password, 10);

    findUser.username = req.body.username;
    findUser.password = hashePassword;
    findUser.email = req.body.email;
    await findUser.save();

    res.send({
      username: findUser.username,
      email: findUser.email,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// get all users// by admin only
router.get("/", verifyToken, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).send({ message: "you are not allowed, only Admin" });
  }

  try {
    const getAllUsers = await user.find();
    let users = getAllUsers.map((u) => {
      return {
        id: u._id,
        email: u.email,
        username: u.username,
        updateTime: u.updatedAt,
        createTime: u.createdAt,
      };
    });

    res.send(users);
  } catch (error) {
    return res.status(500).send(error);
  }
});

// get a specific user // by admin only
router.get("/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  if (!req.user.isAdmin) {
    return res.status(403).send({
      message: "you are not allowed , only Admin",
    });
  }
  try {
    const findUser = await user.findById(id);
    if(!findUser){
        return res.status(404).send("user not found")
    }
    res.send({
      id: findUser._id,
      email: findUser.email,
      username: findUser.username,
      updateTime: findUser.updatedAt,
      createTime: findUser.createdAt,
    });
  } catch (error) {
    return res.status(500).send(error);
  }
});

//delete user
router.delete("/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  if (!req.user.isAdmin) {
    return res.status(403).send({
      message: "you are not allowed to delete this user , only Admin",
    });
  }

  let userFind = await user.findById(id);
  if (!userFind) {
    return res.status(404).send("user not found");
  }

  try {
    const deleteUser = await user.findByIdAndDelete(id);

    res.send(`the user of ${deleteUser.username} has been deleted`);
  } catch (error) {
    return res.status(500).send(error);
  }
});

// validation update user
function validationUpdateUser(obj) {
  const schema = Joi.object({
    email: Joi.string().max(300).min(2).trim().email(),
    username: Joi.string().trim().min(3).max(400),
    password: passwordComplexity().require(),
  });

  return schema.validate(obj);
}
module.exports = router;
