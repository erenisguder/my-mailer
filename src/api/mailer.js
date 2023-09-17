"use strict";

const fs = require('fs');
const nodemailer = require("nodemailer");
const uuidv4 = require('uuid/v4');
const minify = require('html-minifier').minify;
const tokens = require('./tokens.json');
const pretty = require('pretty');

const footnoteSymbols = ["*", "†", "‡", "§", "||", "¶"];

Array.prototype.randomElement = function () {
  return this[Math.floor(Math.random() * this.length)]
};
Array.prototype.remove = function () {
  var what, a = arguments,
    L = a.length,
    ax;
  while (L && this.length) {
    what = a[--L];
    while ((ax = this.indexOf(what)) !== -1) {
      this.splice(ax, 1);
    }
  }
  return this;
};
String.prototype.changeTokens = function () {
  let self = this;
  _.forEach(Object.keys(tokens), token => {
    self = _.replace(self, new RegExp(token, 'g'), tokens[token]);
    self = _.replace(self, new RegExp("##", 'g'), "");
  });
  return self;
};
String.prototype.randomText = function () {
  let self = this;
  let customText = getFromBetween.get(self, '{{customText[', ']}}');
  _.forEach(customText, (text, i) => {
    let texts = text.split('|');
    texts.remove("");
    let randomElement = texts.randomElement();
    self = self.replace('{{customText[' + customText[i] + ']}}', randomElement);
  });
  return self;
};
String.prototype.replaceAll = function (search, replacement) {
  let target = this;
  return target.split(search).join(replacement);
};
String.prototype.clearCurlybraces = function () {
  let self = this;
  self = _.replace(self, new RegExp("{{", 'g'), "");
  self = _.replace(self, new RegExp("}}", 'g'), "");
  return self;
};
const getFromBetween = {
  results: [],
  string: "",
  getFromBetween: function (sub1, sub2) {
    if (this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return false;
    var SP = this.string.indexOf(sub1) + sub1.length;
    var string1 = this.string.substr(0, SP);
    var string2 = this.string.substr(SP);
    var TP = string1.length + string2.indexOf(sub2);
    return this.string.substring(SP, TP);
  },
  removeFromBetween: function (sub1, sub2) {
    if (this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return false;
    var removal = sub1 + this.getFromBetween(sub1, sub2) + sub2;
    this.string = this.string.replace(removal, "");
  },
  getAllResults: function (sub1, sub2) {
    if (this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return;
    var result = this.getFromBetween(sub1, sub2);
    this.results.push(result);
    this.removeFromBetween(sub1, sub2);
    if (this.string.indexOf(sub1) > -1 && this.string.indexOf(sub2) > -1) {
      this.getAllResults(sub1, sub2);
    } else return;
  },
  get: function (string, sub1, sub2) {
    this.results = [];
    this.string = string;
    this.getAllResults(sub1, sub2);
    return this.results;
  }
};

function parseFootnotesSymbols(str, i = 0) {
  var temp = "{{FootnoteSymbol[" + (i + 1) + "]}}";
  if (str.indexOf(temp) !== -1) {
    var j = i % 6;
    var k = Math.floor(i / 6);
    str = str.replaceAll(temp, footnoteSymbols[j].repeat(k + 1));
    return parseFootnotesSymbols(str, ++i);
  } else {
    return str;
  }
}

function isEmpty(obj) {
  return Object.entries(obj).length === 0 && obj.constructor === Object;
}
let attachments = [];
export default {
  async sendMail(obj) {
    const localPath = obj.template.path.split("/").slice(0, -1).join("/");
    let html = fs.readFileSync(obj.template.path, 'utf-8');
    if (!isEmpty(obj.fragment) && _.includes(html, "{{insertEmailFragments[1,1]}}")) {
      const fragment = fs.readFileSync(obj.fragment.path, 'utf-8');
      html = html.replace("{{insertEmailFragments[1,1]}}", fragment);
    }
    html = minify(html, {
      collapseWhitespace: true
    });
    if (_.includes(html, "customText")) {
      html = html.randomText();
    }
    let citationSummaries = getFromBetween.get(html, '{{CitationSummaryStart}}', '{{CitationSummaryEnd}}');
    if (citationSummaries.length) {
      html = html.replace("{{InsertCitationSummaries}}", citationSummaries[0]);
      html = html.replace(/{{CitationSummaryStart}}.*{{CitationSummaryEnd}}/, "");
    } else {
      html = html.replace("{{InsertCitationSummaries}}", "");
    }
    let citiations = getFromBetween.get(html, '{{CitationStart}}', '{{CitationEnd}}');
    if (citiations.length) {
      html = html.replace("{{InsertCitations}}", citiations[0]);
      html = html.replace(/{{CitationStart}}.*{{CitationEnd}}/, "");
      html = html.replaceAll("{{CitationNumber[", "");
    } else {
      html = html.replace("{{InsertCitations}}", "");
    }
    let footnotes = getFromBetween.get(html, '{{FootnoteStart}}', '{{FootnoteEnd}}');
    if (footnotes.length) {
      html = parseFootnotesSymbols(html);
      footnotes = getFromBetween.get(html, '{{FootnoteStart}}', '{{FootnoteEnd}}');
      html = html.replace("{{InsertFootnotes}}", footnotes[0]);
      html = html.replace(/{{FootnoteStart}}.*{{FootnoteEnd}}/, "");
      html = html.replaceAll("{{FootnoteSymbol[", "");
    } else {
      html = html.replace("{{InsertFootnotes}}", "");
    }
    html = html.replaceAll("]}}", "");
    html = html.clearCurlybraces();
    html = pretty(html);
    const images = getFromBetween.get(html, '<img', '>');
    attachments = [];
    if (!!images.length) {
      images.forEach((image) => {
        const uuid = uuidv4();
        const src = getFromBetween.get(image, 'src="', '"');
        if (src[0].indexOf("http") === -1) {
          const filename = _.last(src[0].split('/'));
          html = html.replace(src[0], "cid:" + uuid + "@" + process.env.DOMAIN_NAME);
          attachments.push({
            filename: uuid,
            path: localPath + '/images/' + filename,
            cid: uuid + "@" + process.env.DOMAIN_NAME
          });
        }
      });
    }
    html = html.changeTokens();
    const config = {
      host: "smtp-mail.outlook.com",
      secureConnection: false,
      port: 587,
      tls: {
        ciphers: 'SSLv3'
      },
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    };
    const transporter = nodemailer.createTransport(config);
    const message = {
      from: process.env.EMAIL_USERNAME,
      to: obj.to,
      cc: process.env.EMAIL_USERNAME,
      subject: getFromBetween.get(html, '<title>', '</title>')[0] || _.replace(obj.template.name, ".html", ""),
      html: html,
      attachments: attachments
    };
    return transporter.sendMail(message);
  }
};