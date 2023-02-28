import jwt from 'jsonwebtoken';
import BaseCtrl from './base';
import User from '../models/user';
import Session from '../models/session';
import { Utils } from '../utils';
import { Search } from '../search';

class SessionCtrl extends BaseCtrl {
    model = Session;
    searchCriteria = (authUser: any) => {
        return {
            default: { user: authUser._id },
            authOnly: ['blocked', 'closed', 'createdAt', 'updatedAt'],
            adminOnly: ['user']
        }
    }

    //get all (with searching, restricted to logged user)
    getAll = async (req, res) => {
        try {
            const authUser = await User.findByAuthorization(req);
            if (!authUser) return Utils.unhauthorized(res);

            const filters = Search.filters(req, res, authUser, this.searchCriteria(authUser));
            const sorts = Search.sorts(req, res, authUser, this.searchCriteria(authUser));
            const pagination = Search.pagination(req);

            var docs;
            docs = await this.model.find(filters).sort(sorts).skip(pagination.skip).limit(pagination.limit);

            res.status(200).json(docs);
        } catch (error) {
            return Utils.badRequest(res, error);
        }
    }

    //count all (with searching, restricted to logged user)
    count = async (req, res) => {
        try {
            const authUser = await User.findByAuthorization(req);
            if (!authUser) return Utils.unhauthorized(res);

            const filters = Search.filters(req, res, authUser, this.searchCriteria(authUser));

            var count;
            count = await this.model.count(filters);

            res.status(200).json(count);
        } catch (error) {
            return Utils.badRequest(res, error);
        }
    }

    //insert (forbidden, only throw user login)
    insert = async (req, res) => {
        return Utils.forbidden(res);
    }

    //get (forbidden, only throw user login)
    get = async (req, res) => {
        return Utils.forbidden(res);
    }

    //update (forbidden, only throw user login)
    update = async (req, res) => {
        try {
            Utils.formData(req);
            const authUser = await User.findByAuthorization(req);
            if (!authUser) return Utils.unhauthorized(res);

            const session = await this.model.findOne({
                _id: req.params.id,
                ...(authUser.role != 'admin' ? { user: authUser._id } : {})
            });

            session.closed = req.body.closed == true ? true : session.closed;

            await this.model.updateOne({ _id: req.params.id }, session);
            res.sendStatus(200);
        } catch (error) {
            return Utils.badRequest(res, error);
        }
    }

    //delete (forbidden, only throw user login)
    delete = async (req, res) => {
        return Utils.forbidden(res);
    }

}

export default SessionCtrl;