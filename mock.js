/**
 * 
 * @authors shenbao 
 * @date    2017-03-21 
 * 
 */

var url = require('url');
var fs = require('fs');

exports.mock = function (req, res, next) {
    var urlObj = url.parse(req.url, true);
    switch (urlObj.pathname) {
        case '/api/list.json':
            res.setHeader('Content-type', 'application/json');
            fs.readFile('./mock/project/package.json', 'utf-8', function (err, data) {
                res.end(data);
            });
        return;
        case '/api/getuser.json':
            // ....
        return;
    }
    next();
}