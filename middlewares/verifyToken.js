const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers.token;
  if (token) {
    try {
      let decoded = jwt.verify(token, process.env.SECRET_KEY); //فك التشفير
      req.user = decoded
    
      next();
    } catch {
      return res.status(401).send("invalid token");
    }
  } else {
    return res.status(401).send("no token provided");
  }
};



module.exports = verifyToken;
