import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import passport from "passport";
import passportLocal from "passport-local";
import User from "../models/user";

const LocalStrategy = passportLocal.Strategy;

passport.serializeUser<any, any>((_, user, done) => {
    done(undefined, user);
});

passport.deserializeUser(async (user, done) => {
    if (!user) {
        done(new Error("no user"), null)
    } else {
        // @ts-ignore
        done(undefined, user);
    }
    // User.findById(id, (err: NativeError, user: IUser) => done(err, user));
});

// Local Strategy
passport.use(
    new LocalStrategy(
        { usernameField: "email" },
        async (email, password, done) => {
            // Find user with given username
            const user = await User.findOne({
                email: email.toLowerCase(),
            });

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
    res.status(401).json({ error: true, message: "not logged in" }).end();
};

export const isVerified = (req: Request, res: Response, next: NextFunction) => {
    // const user = req.user as IUser;
    // if (!user.verified)
    //     res.status(401).json({
    //         error: true,
    //         message: "must be verified to perform requested action",
    //     }).end();
    // else return next();
    return next();
};

export default passport;
