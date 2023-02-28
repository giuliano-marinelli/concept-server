export class Utils {
    //generate random identifier
    // static uuidv4 = () => {
    //     return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    //         var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    //         return v.toString(16);
    //     });
    // }

    //send email with nodemailer
    static sendEmail = async (to, subject, text, html) => {
        try {
            const nodemailer = require('nodemailer');

            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.EMAIL_PASSWORD
                }
            });

            let info = await transporter.sendMail({
                from: {
                    name: 'Concept',
                    adress: process.env.EMAIL
                },
                to: to,
                subject: subject,
                text: text,
                html: html
            });

            return info;
        } catch (error) {
            return false;
        }
    }

    //transforms form data into request body keys/values
    static formData = (req) => {
        try {
            if (req.body.data) {
                var objectData = JSON.parse(req.body.data);
                Object.entries(objectData).forEach(([key, value]) => {
                    req.body[key] = value;
                });
                delete req.body.data;
            }
        } catch {
            console.log("Can't proccess formdata object data.");
        }
    }

    //transforms nested object keys into dot notation. Ex: { a: { b: { c: 1 } } } => { "a.b.c": 1 }
    static dotNotation = (obj, newObj = {}, prefix = "") => {
        for (let key in obj) {
            if (typeof obj[key] === "object") {
                this.dotNotation(obj[key], newObj, prefix + key + ".");
            } else {
                newObj[prefix + key] = obj[key];
            }
        }

        return newObj;
    }

    //transforms search query string into object
    static searchParams = (req) => {
        let search: any = {};
        if (req.query) {
            search['skip'] = req.query.page ? (req.query.page - 1) * req.query.count : 0;
            search['limit'] = req.query.count ? parseInt(req.query.count) : Number.MAX_SAFE_INTEGER;
            Object.entries(req.query).forEach(([key, value]) => {
                if (key != 'page' && key != 'count' && value != '') {
                    search[key] = value;
                }
            });
        }

        return search;
    }

    //basic bad request response
    static badRequest = (res, error) => {
        return res.status(400).send(error.message);
    }

    //basic unauthorized response
    static unhauthorized = (res) => {
        return res.status(401).send("Unauthorized request, please login first.");
    }

    //basic forbidden response
    static forbidden = (res) => {
        return res.status(403).send("Forbidden request, you don't have permission to do this.");
    }
}
