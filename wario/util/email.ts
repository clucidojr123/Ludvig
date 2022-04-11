import nodemailer from "nodemailer";
import { IUser } from "../models/user";
import { generateToken } from "./token";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const generateVerifyEmailHTML = (id: string, token: string) => {
    const htmlTemplate = `
        <h1>Hello There!</h1>
        <p>You can verify your email by clicking on the following link:</p>
        <table width="100%" cellspacing="0" cellpadding="0">
        <tr>
            <td>
                <table cellspacing="0" cellpadding="0">
                    <tr>
                        <td style="border-radius: 2px;" bgcolor="blue">
                            <a href="${process.env.ORIGIN}/users/verify/?id=${id}&key=${token}" target="_blank" 
                                style="
                                    padding: 8px 12px; 
                                    border: 1px solid black;
                                    border-radius: 2px;
                                    color: white;
                                    text-decoration: none;
                                    font-weight:bold;
                                    display: inline-block;
                            ">
                                Verify Email            
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        </table>
        <p>Sincerely, <br>Giga Boss of Swag</p>
    `;
    return htmlTemplate;
};

const generateVerifyEmailText = (id: string, token: string) => {
    const textTemplate = `
        Hello There!\n\n
        You can verify your email by clicking on the following link:\n\n
        ${process.env.ORIGIN}/verify/?id=${id}&key=${token}\n\n
        Sincerely,\n
        Giga Boss of Swag
    `;
    return textTemplate;
};

export const sendVerifyEmail = async (user: IUser) => {
    // NOTE generated tokens expire in 1 hour
    const token = generateToken(user);

    const mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: user.email,
        subject: "Verify Your GigaBossOfSwag Account Email",
        text: generateVerifyEmailText(user._id, token),
        html: generateVerifyEmailHTML(user._id, token),
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return "ERROR";
        } else {
            console.log(`Email sent: ${info.response}`);
        }
    });

    return "OK";
};
