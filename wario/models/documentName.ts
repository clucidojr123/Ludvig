import { Document, Schema, model } from "mongoose";

export interface IDocumentName extends Document {
    name: string;
    id: string;
}

const connectionSchema = new Schema<IDocumentName>(
    {
        name: {
            type: String,
            required: true,
        },
        id: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

export const DocumentName = model<IDocumentName>("DocumentName", connectionSchema);