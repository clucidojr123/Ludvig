import { Document, Schema, model } from "mongoose";
import sharedb from "sharedb/lib/client";
import express from "express";

export interface IConnection extends Document {
    name: string;
    connection: sharedb.Connection;
}

const connectionSchema = new Schema<IConnection>(
    {
        name: {
            type: String,
            required: true,
        },
        connection: {
            type: Object,
            required: true,
        },
        // activeStreams: {
        //     type: [Object],
        //     required: true,
        // },
    },
    { timestamps: true }
);

export const Connection = model<IConnection>("connection", connectionSchema);