var OAuth = require("oauth");
var conf = require("../../conf/conf.json");

var oauth = new OAuth.OAuth(
  null, //'https://api.login.yahoo.com/oauth/v2/get_request_token',
  null, //'https://api.login.yahoo.com/oauth/v2/get_token',
  conf.APP_KEY,
  conf.APP_SECRET,
  '1.0',
  null,
  'HMAC-SHA1'
);

module.exports = oauth;