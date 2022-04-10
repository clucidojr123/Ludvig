import express from "express";
import bcrypt from "bcryptjs";
import passport, { isAuthenticated } from "../util/passport";
import User, { IUser } from "../models/user";

const router = express.Router();

// LOGIN
router.post("/login", (req, res, next) => {
   // Pass request information to passport
   passport.authenticate("local", function (err, user, info) {
       if (err) {
           return res.status(401).json({ error: err }).end();
       }
       if (!user) {
           return res.status(401).json({ error: info.message }).end();
       }
       req.login(user, function (err) {
           if (err) {
               return res.status(401).json({ error: err }).end();
           }
           return res.status(200).json({ message: `Logged in ${user.id}` }).end();
       });
   })(req, res, next);
});

// REGISTER
router.post("/register", async (req, res, next) => {
   let { email, username, password } = req.body;
   if (!email || !username || !password) {
       res.status(400).json({ error: "Missing arguments in request" }).end();
       return;
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

   return res.status(200).send("Success").end();
});

// VERIFY USER
router.post('/verify', async (req, res, next) => {
    try {
        if (req.body.key === "abracadabra") {
            await User.findOneAndUpdate({ email: req.body.email }, { verified: true });
            res.json({ status: "OK" }).end();
        } else {
            res.json({ status: "ERROR" }).end();
        }
    } catch (err) {
        res.json({ status: "ERROR" }).end();
        console.error(err);
    }
});

export default router;