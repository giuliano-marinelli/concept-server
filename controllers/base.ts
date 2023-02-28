import { Utils } from '../utils';

abstract class BaseCtrl {

    abstract model: any;

    //get all
    getAll = async (req, res) => {
        try {
            const docs = await this.model.find({});
            res.status(200).json(docs);
        } catch (error) {
            return Utils.badRequest(res, error);
        }
    }

    //count all
    count = async (req, res) => {
        try {
            const count = await this.model.count();
            res.status(200).json(count);
        } catch (error) {
            return Utils.badRequest(res, error);
        }
    }

    //insert
    insert = async (req, res) => {
        try {
            const obj = await new this.model(req.body).save();
            res.status(201).json(obj);
        } catch (error) {
            return Utils.badRequest(res, error);
        }
    }

    //get by id
    get = async (req, res) => {
        try {
            const obj = await this.model.findOne({ _id: req.params.id });
            res.status(200).json(obj);
        } catch (error) {
            return Utils.badRequest(res, error);
        }
    }

    //update by id
    update = async (req, res, err) => {
        try {
            await this.model.updateOne({ _id: req.params.id }, req.body);
            res.sendStatus(200);
        } catch (error) {
            return Utils.badRequest(res, error);
        }
    }

    //delete by id
    delete = async (req, res) => {
        try {
            await this.model.deleteOne({ _id: req.params.id });
            res.sendStatus(200);
        } catch (error) {
            return Utils.badRequest(res, error);
        }
    }
}

export default BaseCtrl;
