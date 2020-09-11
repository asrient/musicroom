document.documentElement.setAttribute("data-theme", "dark");

function isEmail(email) {
  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
}

window.isEmail = isEmail
class Api {
  constructor(baseUrl = null) {
    if (baseUrl)
      this.baseUrl = baseUrl;
    else
      this.baseUrl = "/api/";
  }
  _send(method, url, data, cb) {
    $.ajax({
      url: this.baseUrl + url,
      type: method,
      data,
      headers: {
        "MR-CLIENT": 'web'
      },
      dataType: 'json',
      success: (result, status, xhr) => {
        cb(xhr.status, result)
      },
      error: (xhr, txtStatus, err) => {
        cb(xhr.status, xhr.responseJSON)
      }
    });
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

window.Api = Api;

const ua = window.navigator.userAgent;
const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
const webkit = !!ua.match(/WebKit/i);
const iOSSafari = iOS && webkit && !ua.match(/CriOS/i);