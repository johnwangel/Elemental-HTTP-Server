/*jshint esversion: 6 */
const http = require('http');
const qs = require('query-string');
const fs = require('fs');

const server = http.createServer();

server.on('request', (request, response) => {
  let thisHeader = request.headers;
  let thisMethod = request.method;
  let thisURL = request.url;

  let body = '';
  request.on('data',  chunk => {
    body += chunk;
  });

  request.on('end', () => {
    let fullText = body.toString();
    switch (thisMethod) {
      case 'POST':
        processPost(fullText);
        let headers = { 'Content-Type' : 'text/html', 'success': true  };
        response.writeHead(200, 'OK', headers);
        response.end();
        break;
      case 'GET':
        if (thisURL === '/') { thisURL = '/index.html'; }
        let filePath = `./public${thisURL}`;
        let directory = `./public`;
        console.log(thisURL);

        if (thisURL === '/css/styles.css'){
          fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) throw err;
            let headers = { 'Content-Type' : 'text/css', 'success': true  };
            response.writeHead(200, 'OK', headers);
            response.write(data, 'utf8', () => {
              response.end();
            });
          });
        } else {
          fs.readdir(directory, 'utf8', (err, list) => {
            if (err) throw err;
            if (!list.some( files => files ===  thisURL.slice(1) ) ) {

              let filePath = `./public/404.html`;
              fs.readFile(filePath, 'utf8', (err, data) => {
                let headers = { 'Content-Type' : 'text/html', 'success': true  };
                response.writeHead(404, 'Not Found', headers);
                response.write(data, 'utf8', () => {
                  response.end();
                });
              });
            } else {
              fs.readFile(filePath, 'utf8', (err, data) => {
                let headers = { 'Content-Type' : 'text/html', 'success': true  };
                response.writeHead(200, 'OK', headers);
                response.write(data, 'utf8', () => {
                  response.end();
                });
              });
            }
          });
        }
        break;
      case 'PUT':

        break;
      default:
        return;
    }

  });

  request.on('error', (err) => {
    console.log(err);
  });

});

server.listen(9000);

function processPost(fullText){

  let parsedText = qs.parse(fullText);

  let elemName = parsedText.elementName;
  elemName = elemName.toLowerCase();
  let filename = `./public/${elemName}.html`;

  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>The Elements - ${parsedText.elementName}<\/title>
  <link rel="stylesheet" href="\/css\/styles.css">
<\/head>
<body>
  <h1>${parsedText.elementName}<\/h1>
  <h2>${parsedText.elementSymbol}<\/h2>
  <h3>Atomic number ${parsedText.elementAtomicNumber}<\/h3>
  <p>${parsedText.elementDescription}<\/p>
  <p><a href="\/">back<\/a></p>
<\/body>
<\/html>`;

  fs.writeFile(filename, html, (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
  });

  let linkName = `${elemName}.html`;
  addToIndex(linkName);
}

function addToIndex(linkName) {
  let directory = './public';
  let filename = './public/index.html';

  fs.readdir(directory, 'utf8', (err, list) => {
    if (err) throw err;
    elementFiles = list.filter( filename => {
      if (filename !== 'css' && filename !== 'index.html' && filename !== '.keep' && filename !== '404.html' ){
        return filename;
      }
    });

    let indexText = getIndexHTML(elementFiles);

    fs.writeFile(filename, indexText, (err) => {
      if (err) throw err;
      console.log('The index file has been saved!');
    });

  });
}

function getIndexHTML(elementFiles){

  let listCount = elementFiles.length;
  let listItems = '';
  for (var i = 0; i < elementFiles.length; i++) {
    let elem = elementFiles[i].charAt(0).toUpperCase() + elementFiles[i].slice(1, elementFiles[i].length-5);
    listItems += `<li><a href="${elementFiles[i]}">${elem}</a></li>
    `;
  }

    let indexText = `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>The Elements</title>
          <link rel="stylesheet" href="/css/styles.css">
        </head>
        <body>
          <h1>The Elements</h1>
          <h2>These are all the known elements.</h2>
          <h3>These are ${listCount}</h3>
          <ol>
          ${listItems}
          </ol>
        </body>
        </html>`;

  return indexText;
}
