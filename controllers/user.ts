import jwt from 'jsonwebtoken';
import BaseCtrl from './base';
import User from '../models/user';
import Session from '../models/session';
import { Utils } from '../utils';
import { Search } from '../search';
import { v4 as uuidv4 } from 'uuid';

class UserCtrl extends BaseCtrl {
    model = User;
    searchCriteria = {
        search: ['username', 'email', 'profile.name'],
        allowed: ['username', 'email'],
        adminOnly: ['profile.name', 'profile.bio', 'profile.location', 'profile.url', 'role', 'verified', 'createdAt']
    }

    //get (restricted to logged user)
    get = async (req, res) => {
        try {
            const authUser = await User.findByAuthorization(req);
            if (!authUser) return Utils.unhauthorized(res);
            if (authUser.role != 'admin' && authUser._id != req.params.id) return Utils.forbidden(res);

            const obj = await this.model.findOne({ _id: req.params.id });
            res.status(200).json(obj);
        } catch (error) {
            return Utils.badRequest(res, error);
        }
    }

    //get by username
    getByUsername = async (req, res) => {
        try {
            const obj = await this.model.findOne({ username: req.params.username });
            res.status(200).json(obj);
        } catch (error) {
            return Utils.badRequest(res, error);
        }
    }

    //get by email
    getByEmail = async (req, res) => {
        try {
            const obj = await this.model.findOne({ email: req.params.email });
            res.status(200).json(obj);
        } catch (error) {
            return Utils.badRequest(res, error);
        }
    }

    //get all (with searching, only admin)
    getAll = async (req, res) => {
        try {
            const authUser = await User.findByAuthorization(req);

            const filters = Search.filters(req, res, authUser, this.searchCriteria);
            const sorts = Search.sorts(req, res, authUser, this.searchCriteria);
            const pagination = Search.pagination(req);

            console.log('filters', filters);
            console.log('sorts', sorts);

            var docs;
            docs = await this.model.find(filters).sort(sorts).skip(pagination.skip).limit(pagination.limit);

            res.status(200).json(docs);
        } catch (error) {
            return Utils.badRequest(res, error);
        }
    }

    //count all (with searching, only admin)
    count = async (req, res) => {
        try {
            const authUser = await User.findByAuthorization(req);

            const filters = Search.filters(req, res, authUser, this.searchCriteria);

            var count;
            count = await this.model.count(filters);

            res.status(200).json(count);
        } catch (error) {
            return Utils.badRequest(res, error);
        }
    }

    //insert (with existence checking and default values)
    insert = async (req, res) => {
        try {
            Utils.formData(req);
            const existent = await this.model.findOne({
                $or: [
                    { email: req.body.email },
                    { username: req.body.username }
                ]
            });
            if (existent) return res.status(409).send('Email or username are already taken.');

            req.body.role = 'user';
            req.body.verified = false;
            req.body.createdAt = Date.now();
            req.body.profile = {};
            req.body.sessions = [];

            if (req.file) req.body.avatar = req.file.location ? req.file.location : req.file.destination + req.file.filename;

            const obj = await new this.model(req.body).save();
            res.status(201).json(obj);
        } catch (error) {
            if (req.file) this.model.deleteFiles(req.file.location ? req.file.location : req.file.destination + req.file.filename);
            return Utils.badRequest(res, error);
        }
    }

    //update (restricted to logged user)
    update = async (req, res) => {
        try {
            Utils.formData(req);
            const authUser = await User.findByAuthorization(req);
            if (!authUser) return Utils.unhauthorized(res);
            if (authUser.role != 'admin' && authUser._id != req.params.id) return Utils.forbidden(res);

            const existent = await this.model.findOne({
                $and: [
                    {
                        $or: [
                            { email: req.body.email },
                            { username: req.body.username }
                        ]
                    },
                    {
                        _id: { $ne: req.params.id }
                    }
                ]
            });
            if (existent) return res.status(409).send('Email or username are already taken.');

            const user = await this.model.findOne({ _id: req.params.id });

            delete req.body.role;
            delete req.body.verified;
            delete req.body.verificationCode
            delete req.body.lastVerifyDate

            if (req.file || req.body.avatar == "") this.model.deleteFiles(user.avatar);
            if (req.file) req.body.avatar = req.file.location ? req.file.location : req.file.destination + req.file.filename;

            await this.model.updateOne({ _id: req.params.id }, req.body);
            res.sendStatus(200);
        } catch (error) {
            if (req.file) this.model.deleteFiles(req.file.location ? req.file.location : req.file.destination + req.file.filename);
            return Utils.badRequest(res, error);
        }
    }

    //delete (restricted to logged user)
    delete = async (req, res) => {
        try {
            const authUser = await User.findByAuthorization(req);
            if (!authUser) return Utils.unhauthorized(res);
            if (authUser.role != 'admin' && authUser._id != req.params.id) return Utils.forbidden(res);

            await this.model.deleteOne({ _id: req.params.id });
            res.sendStatus(200);
        } catch (error) {
            return Utils.badRequest(res, error);
        }
    }

    //login
    login = async (req, res) => {
        try {
            if (!req.headers.device) return res.status(400).send('Device cannot be detected. Please, try again.');

            const user = await this.model.findOne({
                $or: [
                    { email: req.body.usernameOrEmail },
                    { email: req.body.email },
                    { username: req.body.usernameOrEmail },
                    { username: req.body.username }
                ]
            });
            if (!user) return res.status(400).send('Username or email address is not registered.');

            user.comparePassword(req.body.password)
                .then(async (isMatch) => {
                    if (!isMatch) return res.status(403).send('Password is incorrect.');

                    let token = jwt.sign({ id: user._id, device: User.encryptDevice(req.headers.device) }, process.env.SECRET_TOKEN); // , { expiresIn: 10 } seconds
                    // this.model.updateOne({ _id: user._id }, { $push: { sessions: [ token ] } });

                    let device = JSON.parse(req.headers.device);
                    //find user's session with same device
                    const session = await Session.findOne({
                        $and: [
                            { user: user._id },
                            { blocked: false },
                            { "device.client": device.client },
                            { "device.os": device.os },
                            { "device.brand": device.brand },
                            { "device.model": device.model },
                            { "device.type": device.type },
                            { "device.bot": device.bot },
                            { "device.ip": device.ip },
                        ]
                    });

                    //if there are no session with same device, create new session
                    //else, update their token
                    if (!session) {
                        await new Session({
                            user: user._id,
                            token: token,
                            device: device,
                            blocked: false,
                            closed: false,
                            createdAt: Date.now(),
                            updatedAt: Date.now()
                        }).save();
                    } else {
                        token = session.closed ? token : session.token;
                        await Session.updateOne({ _id: session._id }, {
                            $set: {
                                token: token,
                                blocked: false,
                                closed: false,
                                updatedAt: Date.now()
                            }
                        });
                    }

                    res.status(200).json(token);
                })
                .catch(error => {
                    return Utils.badRequest(res, error)
                });
        } catch (error) {
            return Utils.badRequest(res, error);
        }
    }

    //verification (restricted to logged user): send verification email
    verification = async (req, res) => {
        try {
            const authUser = await User.findByAuthorization(req);
            if (!authUser) return Utils.unhauthorized(res);
            if (authUser.role != 'admin' && authUser._id != req.params.id) return Utils.forbidden(res);

            const user = await this.model.findOne({ _id: req.params.id });
            if (user.verified) return res.status(400).send('Email is already verified.');

            var timeDiff = Math.floor(Math.abs(Date.now() - user.lastVerifyDate) / 1000);
            var timeNeed = Math.max(120 - timeDiff, 0);
            // console.log("time elapsed from last email: ", Math.floor(timeDiff / 60) % 60, "minutes", timeDiff % 60, "seconds", "(" + timeDiff + " seconds)");

            //need to wait (2 minutes = 120 seg)
            if ((user.lastVerifyDate && timeDiff < 120))
                return res.status(429).send('Need to wait ' + (timeNeed > 60 ? Math.floor(timeNeed / 60) + ' minutes' : timeNeed + ' seconds') + ' to send email again.');

            user.lastVerifyDate = Date.now();
            user.verificationCode = user.verificationCode ? user.verificationCode : uuidv4();
            await this.model.updateOne({ _id: req.params.id }, user);

            //send verification email
            var url = req.protocol + '://' + req.get('host') + '/account/' + req.params.id + '/' + user.verificationCode;
            var text = 'Please go to the following link to verify your email ' + url;
            var html =
                `Dear ${user.username},<br><br>

                <h3><b>Please click the following link to verify your email:</b><br>
                <a href="${url}">${url}</a></h3>

                If you did NOT request to verify this email address on Concept,
                do not click on the link. Please note that many times, the situation isn't a phishing attempt,
                but either a misunderstanding.<br>
                If you are still concerned, please forward this notification to <a href="mailto: concept.test.noreply@gmail.com">concept.test.noreply@gmail.com</a>
                and let us know in the forward that you did not request the verification.<br><br>

                <b>Concept<b>`;

            let info = await Utils.sendEmail(user.email, 'Concept: Verify your email', text, html);
            if (!info) return res.status(500).send('Email could not be sent, please wait few minutes and retry later.');

            res.sendStatus(200);
        } catch (error) {
            return Utils.badRequest(res, error);
        }
    }

    //verify: verify email with verification code
    verify = async (req, res) => {
        try {
            // console.log("user", req.params.id, "code", req.params.code, "verified");
            const user = await this.model.findOne({ _id: req.params.id, verificationCode: req.params.code });

            if (!user) res.status(400).send('Invalid or expired verification code.');
            if (!user.verified) res.status(400).send('Email is already verified.');

            user.verified = true;

            await this.model.updateOne({ _id: req.params.id }, user);
            res.sendStatus(200);
        } catch (error) {
            return Utils.badRequest(res, error);
        }
    }
}

export default UserCtrl;
