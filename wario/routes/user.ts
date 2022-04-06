import express from "express";
import bcrypt from "bcrypt";

const router = express.Router();

// LOGIN
router.post("/login", (req, res, next) => {
   res.status(200).send("hello!").end();
});

export default router;