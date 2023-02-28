import * as dotenv from 'dotenv';
import * as path from 'path';
//server
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
//database
import setMongo from './mongo';
import setRoutes from './routes';

//define port based on enviroment variable or 3000 in case it is absent
const port = process.env.PORT || 3000

//create express app
const app = express();
dotenv.config();

//configure express paths and others (cors,...)
app.set('port', port);
app.use('/', express.static(path.join(__dirname, '/../../concept-client/dist'))); //make angular compiled folder public
app.use('/uploads', express.static(path.join(__dirname, '/../uploads'))); //make uploads folder public
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb', parameterLimit: 500000 }));
if (process.env.NODE_ENV?.trim() !== 'test') {
    app.use(morgan('dev'));
}

async function main(): Promise<any> {
    try {
        //set mongoose access
        await setMongo();
        setRoutes(app);
        app.get('/*', (req, res) => {
            res.sendFile(path.join(__dirname, '/../../concept-client/dist/index.html'));
        });
        if (!module.parent) {
            app.listen(app.get('port'), () => console.log(`server: listening on port ${port}`));
        }
    } catch (err) {
        console.error(err);
    }
}

main();

export { app };
