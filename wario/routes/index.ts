import express, { Request, Response, NextFunction } from "express";
import fetch from 'node-fetch';

const router = express.Router();

router.get("/search", (req, res, next) => {
    res.json({ docid: "Test", name: "Test", snippet: "<em>Test</em>" }).end();
});

router.get("/suggest", (req, res, next) => {
    res.json(["Test"]).end();
});

export default router;
