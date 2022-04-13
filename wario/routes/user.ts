import express from "express";
import bcrypt from "bcryptjs";
import passport, { isAuthenticated } from "../util/passport";
import User, { IUser } from "../models/user";
import { sendVerifyEmail, sendTestEmail } from "../util/email";
import { verifyToken } from "../util/token";

const router = express.Router();

// GET SESSION USER
router.get("/get-session", isAuthenticated, (req, res) => {
    const user = req.user as IUser;
    res.status(200).json(user).end();
});

router.get("/test-email", async (req, res) => {
    await sendTestEmail("clucidojr123@gmail.com");
    res.status(200).end();
});

// LOGIN
router.post("/login", (req, res, next) => {
    // Pass request information to passport
    passport.authenticate("local", function (err, user, info) {
        if (err) {
            return res.status(401).json({ error: true, message: JSON.stringify(err) }).end();
        }
        if (!user) {
            return res.status(401).json({ error: true, message: info.message }).end();
        }
        req.login(user, function (err) {
            if (err) {
                return res.status(401).json({ error: true, message: JSON.stringify(err) }).end();
            }
            return res.status(200).json({ name: user.name }).end();
        });
    })(req, res, next);
});

// LOGOUT
router.post("/logout", (req, res) => {
    req.logout();
    res.status(200).json({}).end();
});

// SIGN UP
router.post("/signup", async (req, res, next) => {
    let { email, name, password } = req.body;
    if (!email || !name || !password) {
        res.status(400)
            .json({ error: true, message: "Missing arguments in request" })
            .end();
        return;
    }
    try {
        email = (email as string).toLowerCase();
        const nameLower = (name as string).toLowerCase();

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            email,
            name,
            nameLower,
            password: hashedPassword,
        });

        await user.save();
        await sendVerifyEmail(user);

        res.status(200).json({}).end();
    } catch (err) {
        res.status(400)
            .json({ error: true, message: "Something bad happened" })
            .end();
        console.error(err);
    }
});

// VERIFY USER
router.get("/verify", async (req, res, next) => {
    try {
        if (!req.query.id || !req.query.key) {
            res.status(400)
                .json({ error: true, message: "Missing query params" })
                .end();
        }

        const user = await User.findById(req.query.id);
        if (!user) {
            res.status(400)
                .json({ error: true, message: "User not found" })
                .end();
            return next();
        }

        const payload = verifyToken(user, req.query.key as string);

        if (!payload) {
            res.status(400)
                .json({ error: true, message: "Key is invalid or expired" })
                .end();
            return next();
        }

        user.verified = true;
        await user.save();

        res.status(200).json({}).end();
        return next();
    } catch (err) {
        res.status(400)
            .json({ error: true, message: "Something bad happened" })
            .end();
        console.error(err);
    }
});

export default router;
