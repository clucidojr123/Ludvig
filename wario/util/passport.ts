import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { NativeError } from "mongoose";
import passport from "passport";
import passportLocal from "passport-local";
import User, { IUser } from "../models/user";

const LocalStrategy = passportLocal.Strategy;

passport.serializeUser<any, any>((_, user, done) => {
    done(undefined, user);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err: NativeError, user: IUser) => done(err, user));
});

// Local Strategy
passport.use(
    new LocalStrategy(
        { usernameField: "usernameLower" },
        async (username, password, done) => {
            // Find user with given username
            const user = await User.findOne({
                usernameLower: username.toLowerCase(),
            })

            if (!user) {
                return done(undefined, false, { message: "User not found." });
            }

            const result = await bcrypt.compare(password, user.password);

            if (result) {
                return done(undefined, user);
            } else {
                return done(undefined, false, {
                    message: "Invalid username or password.",
                });
            }
        }
    )
);

export const isAuthenticated = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ error: "Not logged in" });
};

export const isVerified = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser;
    if (!user.verified)
        res.status(401).json({
            error: "Must be verified to perform requested action",
        });
    else return next();
};

export default passport;
