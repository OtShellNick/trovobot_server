const ApiGateway = require("moleculer-web");
const SocketIOService = require("moleculer-io");
const E = require("moleculer-web").Errors;
const cors = require('cors');
const cookieParser = require("cookie-parser");
const moment = require('moment');
const {getUserByJwt} = require("../actions/userActions");

module.exports = {
    name: 'api',
    version: 1,
    mixins: [ApiGateway, SocketIOService],
    settings: {
        origin: '*',
        methods: ["GET", "OPTIONS", "POST", "PUT", "DELETE"],
        use: [cors(), cookieParser()],
        port: process.env.SERVER_PORT,
        routes: [
            {
                path: '/',
                whiteList: ['auth.*'],
                bodyParser: {
                    json: true,
                    urlencoded: {extended: true}
                }
            },
            {
                path: '/user',
                whiteList: ['user.*'],
                authorization: true,
                bodyParser: {
                    json: true,
                    urlencoded: {extended: true}
                }
            }
        ],
        io: {

        }
    },
    methods: {
        authorize: async (ctx, route, req, res) => {
            const {authorization} = req.headers;

            if (authorization) {
                const [user] = await getUserByJwt(authorization);

                ctx.meta.user = user;

                return Promise.resolve(ctx);
            }

            return Promise.reject(new E.UnAuthorizedError(E.ERR_NO_TOKEN));
        }
    }
}