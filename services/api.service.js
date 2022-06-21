const ApiGateway = require("moleculer-web");
const SocketIOService = require("moleculer-io");
const context = require('moleculer-cls');
const E = require("moleculer-web").Errors;
const cors = require('cors');
const cookieParser = require("cookie-parser");
const {getUserByJwt} = require("../actions/userActions");

module.exports = {
    name: 'api',
    version: 1,
    mixins: [ApiGateway, SocketIOService],
    settings: {
        origin: '*',
        middlewares: [context.middleware],
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
                whiteList: ['user.*', 'chat.*'],
                authorization: true,
                bodyParser: {
                    json: true,
                    urlencoded: {extended: true}
                }
            },
            {
                path: '/settings',
                whiteList: ['settings.*'],
                authorization: true,
                bodyParser: {
                    json: true,
                    urlencoded: {extended: true}
                }
            }
        ],
    },
    methods: {
        authorize: async (ctx, route, req) => {
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