var logger  = require(__dirname + '/logger');

module.exports = function () {
    return function (err, req, res, next) {
        logger.log('error', err);
        if (err.stack) {
            logger.log('error', err.stack);
        }
        return res.status(err.statusCode || 400)
                .send(err);
    };
};
