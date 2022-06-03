const ApiGateway = require("moleculer-web");
const E = require("moleculer-web").Errors;
const cors = require('cors');
const cookieParser = require("cookie-parser");
const {validateToken} = require('../requests/auth');

module.exports = {
    name: 'api',
    version: 1,
    mixins: [ApiGateway],
    settings: {
        origin: '*',
        methods: ["GET", "OPTIONS", "POST", "PUT", "DELETE"],
        use: [cors(), cookieParser()],
        port: process.env.SERVER_PORT,
        routes: [
            {
                whiteList: ['auth.*'],
                bodyParser: {
                    json: true,
                    urlencoded: {extended: true}
                }
            },
            {
                whiteList: ['user.*'],
                // authorization: true,
                bodyParser: {
                    json: true,
                    urlencoded: {extended: true}
                }
            }
        ]
    },
    methods: {
        authorize: async (ctx, route, req, res) => {
            const {authorization} = req.headers;

            if (authorization) {
                const data = await validateToken(authorization);
                console.log(data);
                ctx.meta.access_token = authorization;
                return Promise.resolve(ctx);
            }

            return Promise.reject(new E.UnAuthorizedError(E.ERR_NO_TOKEN));
        }
    }
}