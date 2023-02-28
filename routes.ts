import * as express from 'express';
import UserCtrl from './controllers/user';
import SessionCtrl from './controllers/session';
import InvitationCtrl from './controllers/invitation';
import Storage from './storage';
import { Utils } from './utils';

function setRoutes(app): void {
    //router and controllers initialization
    const router = express.Router();
    const userCtrl = new UserCtrl();
    const sessionCtrl = new SessionCtrl();
    const invitationCtrl = new InvitationCtrl();
    const storage = new Storage();

    //multer configuration
    const multer = require('multer');

    //define multer to upload files
    const upload = multer({
        storage: storage,
        limits: {
            fileSize: 1048576 * 2 //2MB
        },
        fileFilter: (req, file, cb) => {
            if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
                cb(null, true);
            } else {
                cb(null, false);
                return cb(new Error('Only .png, .jpg and .jpeg format allowed.'));
            }
        }
    });

    //it allows to capture errors in file uploading
    const uploadHandler = (upload) => {
        return (req, res, next) => {
            upload(req, res, (err) => {
                if (err) Utils.badRequest(res, err);
                next();
            });
        };
    }

    //users
    router.route('/login').post(userCtrl.login);
    router.route('/users').post(userCtrl.getAll);
    router.route('/users/count').post(userCtrl.count);
    router.route('/user').post(uploadHandler(upload.single("avatarFile")), userCtrl.insert);
    router.route('/user/username/:username').get(userCtrl.getByUsername);
    router.route('/user/email/:email').get(userCtrl.getByEmail);
    router.route('/user/:id').get(userCtrl.get);
    router.route('/user/:id').post(uploadHandler(upload.single("avatarFile")), userCtrl.update);
    router.route('/user/:id').delete(userCtrl.delete);
    router.route('/user/verification/:id').get(userCtrl.verification);
    router.route('/user/verify/:id/:code').get(userCtrl.verify);

    //sessions
    router.route('/sessions').post(sessionCtrl.getAll);
    router.route('/sessions/count').post(sessionCtrl.count);
    router.route('/session/:id').post(uploadHandler(upload.single("nothing")), sessionCtrl.update);

    //invitations
    router.route('/invitations').get(invitationCtrl.getAll);
    router.route('/invitations/count').get(invitationCtrl.count);
    router.route('/invitation').post(invitationCtrl.insert);
    router.route('/invitation/:id').get(invitationCtrl.get);
    router.route('/invitation/:id').post(invitationCtrl.update);
    router.route('/invitation/:id').delete(invitationCtrl.delete);

    //apply the routes to our application with the prefix /api
    app.use('/api', router);
}

export default setRoutes;
