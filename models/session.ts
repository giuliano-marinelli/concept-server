import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
    client: String,
    os: String,
    brand: String,
    model: String,
    type: String,
    bot: Boolean,
    ip: String
});

const sessionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    token: String,
    device: { type: deviceSchema },
    blocked: Boolean,
    closed: Boolean,
    createdAt: Date,
    updatedAt: Date
});

//omit the __v when returning a session
sessionSchema.set('toJSON', {
    transform: (doc, ret, options) => {
        delete ret.__v;
        return ret;
    }
});

//before deleteOne hook (only for query, ex: Session.deleteOne)
sessionSchema.pre('deleteOne', { query: true, document: false }, async function () {
    const session = await this.model.findOne(this.getQuery());
    await session._delete();
});

//before deleteMany hook (only for query, ex: Session.deleteMany)
sessionSchema.pre('deleteMany', { query: true, document: false }, async function () {
    const sessions = await this.model.find(this.getQuery());
    for (const session of sessions) {
        await session._delete();
    }
});

sessionSchema.methods._delete = async function () {
    console.log("DELETE Session: ", this._id);
}

const Session = mongoose.model('Session', sessionSchema);

export default Session;