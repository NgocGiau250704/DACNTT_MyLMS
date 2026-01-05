// const Joi = require('joi');
import Joi from 'joi';

// const jwt = require("jsonwebtoken");
import jwt from "jsonwebtoken";

const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; 
  if (!token) return res.sendStatus(401); 

  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(403).json({ message: "Forbidden" });
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden you don't have permission" });
    }
    next();
  };
};

const signupValidation = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('admin', 'instructor', 'student').default('student'),
    resetToken: Joi.string().optional(),
    resetTokenExpiry: Joi.date().optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "Bad Request", details: error.details });
  }
  next();
};


// module.exports = {signupValidation, authenticateJWT, authorizeRoles};
export {signupValidation, authenticateJWT, authorizeRoles};
