const ApiGateway = require("moleculer-web");
const {Errors: {MoleculerError}} = require('moleculer');
const E = require("moleculer-web").Errors;
const cors = require('cors');
const cookieParser = require("cookie-parser");
const {getUserByJwt} = require("../actions/userActions");
const {getSettingsByUserId} = require("../actions/settingsActions");

module.exports = {
    name: 'api',
    version: 1,
    mixins: [ApiGateway],
    settings: {
        path: 'api/',
        origin: '*',
        methods: ["GET", "OPTIONS", "POST", "PUT", "DELETE"],
        use: [cors(), cookieParser()],
        port: process.env.SERVER_PORT,
        routes: [
            {
                path: '/auth',
                whiteList: ['auth.*'],
                authorization: false,
                aliases: {
                    "GET /count": "v1.auth.count",
                    "POST /login": "v1.auth.login",
                    "POST /logout": "v1.auth.logout",
                    "POST /bot": "v1.auth.bot",
                    "POST /disconnect": "v1.auth.disconnect",
                },
                bodyParser: {
                    json: true,
                    urlencoded: {extended: true}
                }
            },
            {
                path: '/users',
                whiteList: ['user.*'],
                authorization: true,
                aliases: {
                    "GET /me": "v1.user.me",
                },
                bodyParser: {
                    json: true,
                    urlencoded: {extended: true}
                }
            },
            {
                path: '/settings',
                whiteList: ['settings.*'],
                authorization: true,
                aliases: {
                    "GET /get": "v1.settings.get",
                    "POST /update": "v1.settings.update",
                },
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
                const user = await getUserByJwt(authorization);
                const userSettings = await getSettingsByUserId(user.userId);

                if (!user) throw new MoleculerError('Unauthorized', 401);
                if (user) ctx.meta.user = {...user, ...userSettings};

                return Promise.resolve(ctx);
            }

            return Promise.reject(new E.UnAuthorizedError(E.ERR_NO_TOKEN));
        }
    }
}