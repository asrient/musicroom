const request = require('request').defaults({ jar: true });
var crypto = require('crypto');

time = () => { return new Date().getTime(); }

function isEmail(email) {
  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
}

class Api {
  constructor() {
    this.baseUrl = process.env.MAIN_SERVER_URL + "/api/private/";
  }
  _send(method, url, data, cb) {
    data = { ...data, access_key: process.env.ACCESS_KEY }
    var query = undefined
    var body = undefined
    if (method == 'GET') {
      query = data;
    }
    else {
      body = data;
    }
    request({
      method: method,
      url: this.baseUrl + url,
      headers: {
        "MR-LIVE-SERVER": '1.0',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'MR-LIVE-SERVER',
      },
      qs: query,
      form: body,
      json: true
    },
      function (error, response, body) {
        if (!error) {
          var code = response.statusCode;
          if (typeof body == 'string') {
            body = JSON.parse(body)
          }
          cb(code, body)
        }
        else {
          cb(400, null)
        }
      }
    )
  }
  post(url, data = {}, cb) {
    this._send('POST', url, data, cb)
  }
  get(url, data = {}, cb) {
    this._send('GET', url, data, cb)
  }
  put(url, data = {}, cb) {
    this._send('PUT', url, data, cb)
  }
  SET(url, data = {}, cb) {
    this._send('SET', url, data, cb)
  }
}

code = (length = 10) => { return crypto.randomBytes(length).toString('hex'); }

module.exports = { api: new Api(), isEmail, time, code }