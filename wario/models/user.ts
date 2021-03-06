import { Document, Schema, model } from "mongoose";

export interface IUser extends Document {
    email: string;
    name: string;
    nameLower: string;
    password: string;
    verified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            unique: true,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        nameLower: {
            type: String,
            required: true,
        },
        verified: {
            type: Boolean,
            default: false,
        },
        password: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const User = model<IUser>("User", userSchema);
export default User;
