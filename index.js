const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const db = require("quick.db")
const path = require("path")
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
const templateDir = path.resolve(__dirname + `/src/pages/`);
app.use("/css", express.static(path.resolve(__dirname + `/src/css`)));
app.use("/js", express.static(path.resolve(__dirname + `/src/js`)));


const renderTemplate = (res, req, template, data = {}) => {
  const baseData = {
    path: req.path
  };
  res.render(path.resolve(`${templateDir}${path.sep}${template}`), Object.assign(baseData, data));

};

app.get('/', function(request, response) {
  renderTemplate(response, request, "index.ejs");
  console.log(request.headers["x-forwarded-for"])
});

app.get('/~:id/', function(request, response) {
  //response.redirect(JSON.parse(fs.readFileSync('data/urls.json'))[request.params.id]);
  response.redirect((db.get("urls").filter(code => code.urlcode === request.params.id)[0]).url)
});


app.post('/', function(request, response) {
  //let json = JSON.parse(fs.readFileSync('data/urls.json'));
  let fullUrl = request.protocol + '://' + request.get('host');
  let d = [];
  var a = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (var i = 0; i < 6; i++) {
    d.push(a[Math.round(Math.random() * a.length)]);
  }
  let id = d.join("").toString();
  //json[id]=request.body.url;

  //console.log(JSON.parse(fs.readFileSync('data/urls.json')))
  //fs.writeFileSync('data/urls.json',JSON.stringify(json));
  if (((db.get("urls").filter(code => code.url === request.body.url)[0]) ? true : false) === false) {
    db.push("urls", { "url": request.body.url, "urlcode": id, "fullurl": fullUrl, "sahipip": request.headers["x-forwarded-for"] })
    return renderTemplate(response, request, "success.ejs", { "linkcode": id, "fullurl": fullUrl, "lognurl": request.body.url });
    // db.push("urls",{"url": request.body.url, "urlcode": id, "fullurl": fullUrl })
    //response.send("<h3>URL: "+fullUrl+"/"+id+"</h3>");
  } else {
    return renderTemplate(response, request, "unsuccess.ejs", { "linkcode": id, "fullurl": fullUrl, "lognurl": request.body.url, "kod": (db.get("urls").filter(code => code.url === request.body.url)[0]).urlcode });

  }
});

app.get("/*", (req, res) => {
  if (res.status(404)) return renderTemplate(res, req, "404.ejs");
})

app.listen(3000)

if (!Array.isArray(db.get("urls"))) {
  db.set("urls", [])
}
