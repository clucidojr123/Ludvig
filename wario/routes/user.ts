import express from "express";
import bcrypt from "bcrypt";
import passport, { isAuthenticated } from "../util/passport";
import User, { IUser } from "../models/user";

const router = express.Router();

// LOGIN
router.post("/login", (req, res, next) => {
   // Pass request information to passport
   passport.authenticate("local", function (err, user, info) {
       if (err) {
           return res.status(401).json({ error: err });
       }
       if (!user) {
           return res.status(401).json({ error: info.message });
       }
       req.login(user, function (err) {
           if (err) {
               return res.status(401).json({ error: err });
           }
           return res.status(200).json({ message: `Logged in ${user.id}` });
       });
   })(req, res, next);
});

// REGISTER
router.post("/register", async (req, res, next) => {
   let { email, username, password } = req.body;
   if (!email || !username || !password) {
       res.status(400).json({ error: "Missing arguments in request" });
       return next();
   }

   email = (email as string).toLowerCase();
   const usernameLower = (username as string).toLowerCase();

   const hashedPassword = await bcrypt.hash(password, 10);

   const user = new User({
       email,
       username,
       usernameLower,
       password: hashedPassword,
   });

   await user.save();

   return next();
});

export default router;