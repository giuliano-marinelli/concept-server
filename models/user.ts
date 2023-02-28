import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PolyAES } from 'poly-crypto';
import { Utils } from '../utils';
import Invitation from '../models/invitation';
import Session from '../models/session';

const userSchema = new mongoose.Schema({
    username: { type: String, minLength: 4, maxLength: 30 },
    email: { type: String, unique: true, lowercase: true, trim: true },
    password: { type: String, minLength: 6, maxLength: 30 },
    role: { type: String, enum: ['user', 'admin'] },
    avatar: String,
    verified: Boolean,
    lastVerifyDate: Date,
    verificationCode: String,
    createdAt: Date,
    profile: {
        name: String,
        bio: String,
        location: String,
        url: String
    }
});

//before saving the user, hash the password
userSchema.pre('save', function (next): void {
    const user = this;
    if (!user.isModified('password')) { return next(); }
    bcrypt.genSalt(10, (err, salt) => {
        if (err) { return next(err); }
        bcrypt.hash(user.password, salt, (error, hash) => {
            if (error) { return next(error); }
            user.password = hash;
            next();
        });
    });
});

//compare provided password with db encrypted one
userSchema.methods.comparePassword = function (candidatePassword): Promise<boolean> {
    return new Promise((resolve, reject) => {
        bcrypt.compare(candidatePassword, this.password, (error, isMatch) => {
            if (error) reject(error);
            else resolve(isMatch);
        });
    });
};

//omit the password and __v when returning a user
userSchema.set('toJSON', {
    transform: (doc, ret, options) => {
        delete ret.password;
        delete ret.verificationCode;
        delete ret.__v;
        return ret;
    }
});

//before deleteOne hook (only for query, ex: User.deleteOne)
userSchema.pre('deleteOne', { query: true, document: false }, async function () {
    const user = await this.model.findOne(this.getQuery());
    await user._delete();
});

//before deleteMany hook (only for query, ex: User.deleteMany)
userSchema.pre('deleteMany', { query: true, document: false }, async function () {
    const users = await this.model.find(this.getQuery());
    for (const user of users) {
        await user._delete();
    }
});

userSchema.methods._delete = async function () {
    console.log("DELETE User: ", this.username, this.email);

    //detele sessions
    await Session.deleteMany({ user: this._id });

    //delete invitations
    await Invitation.deleteMany({ $or: [{ recipient: this._id }, { sender: this._id }] });

    //delete avatar file
    User.deleteFiles(this.avatar);
}

userSchema.statics.deleteFiles = async function (avatar) {
    try {
        if (avatar) {
            const sameAvatarUsers = await User.find({ avatar: avatar });

            if (!sameAvatarUsers || sameAvatarUsers.length <= 1) {
                const fs = require('fs');

                try {
                    fs.unlinkSync(avatar);
                } catch (err) {
                    console.log("Not found file " + avatar + " to delete");
                }
            }
        }
    } catch {
        console.log("Failed to delete " + avatar + " file");
    }
}

//decode the header authorization of a request in a User object (it's the actual logged user)
//also check devices matching
userSchema.statics.findByAuthorization = async function (req) {
    try {
        var authorization = req?.headers?.authorization?.split(' ')[1];
        var device = req?.headers?.device;
        if (!authorization) throw new Error("Authorization not found");
        // if (!device) throw new Error("Device not found");

        var decodedToken = jwt.verify(authorization, process.env.SECRET_TOKEN);
        if (!decodedToken?.id) throw new Error("User id not found");
        if (!decodedToken?.device) throw new Error("User device not found");

        const user = await User.findOne({ _id: decodedToken.id });

        //find sessions with same token
        const session = await Session.findOne({ token: authorization });
        if (!session) throw new Error("Session not found");
        if (session.closed) throw new Error("Session is closed");
        if (session.blocked) throw new Error("Session is blocked");

        if (User.decryptDevice(decodedToken.device) != device) {
            //block correspondent session
            let sessionDeviceObj = JSON.parse(User.decryptDevice(decodedToken.device));
            await Session.updateMany({
                $and: [
                    { user: user._id },
                    { "device.client": sessionDeviceObj.client },
                    { "device.os": sessionDeviceObj.os },
                    { "device.brand": sessionDeviceObj.brand },
                    { "device.model": sessionDeviceObj.model },
                    { "device.type": sessionDeviceObj.type },
                    { "device.bot": sessionDeviceObj.bot },
                    { "device.ip": sessionDeviceObj.ip }
                ]
            }, {
                $set: {
                    blocked: true
                }
            });

            //send warning email
            let deviceObj = JSON.parse(device);
            var text = `Someone tried to login with your account in a different device.
                        We blocked the login attempt.`;
            var html =
                `Dear ${user.username},<br><br>
                
                <h2><b>Someone tried to login with your account in a different device.</b></h2>

                <table style="border: 1px solid gray; width: 200px; text-align: center">
                    <tr><td><p style="color: gray; margin: 2px">${deviceObj.ip}</p></td></tr>
                    <tr><td><h2 style="margin: 2px">${deviceObj.brand ? deviceObj.brand + ' ' + deviceObj.model : deviceObj.os}</h2></td></tr>
                    <tr><td><p style="margin: 2px">${deviceObj.brand ? deviceObj.os : deviceObj.type}</p></td></tr>
                    <tr><td><p style="margin: 2px">${deviceObj.client}</p></td></tr>
                    <tr><td><p style="margin: 2px">${deviceObj.bot ? "IT'S A BOT" : ''}</p></td></tr>
                </table>

                <h3>We blocked the login attempt.</h3>

                Please note that many times, the situation isn't a hacking attempt, but either a technical issue.<br>
                If you are still concerned, please forward this notification to <a href="mailto: concept.test.noreply@gmail.com">concept.test.noreply@gmail.com</a>
                and let us know in the forward that someone is trying to stole your account.<br><br>

                <b>Concept<b>`;

            await Utils.sendEmail(user.email, 'Concept: Security Alert', text, html);

            throw new Error("Devices not match");
        }

        session.updatedAt = Date.now();
        await session.save();

        return user;
    } catch (error) {
        console.log("Authorization error:", error.message);
        return false;
    }
}

userSchema.statics.encryptDevice = function (device) {
    return PolyAES.withKey(process.env.SECRET_TOKEN).encrypt(JSON.stringify(device));
}

userSchema.statics.decryptDevice = function (encryptedDevice) {
    return JSON.parse(PolyAES.withKey(process.env.SECRET_TOKEN).decrypt(encryptedDevice));
}

const User = mongoose.model('User', userSchema);

export default User;
