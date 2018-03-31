//const storage = require('@google-cloud/storage')();
const vision = require('@google-cloud/vision').v1p1beta1;

var fs = require('fs'),
    path = require('path');

const client = new vision.ImageAnnotatorClient();

var fileName = '../test3.jpg';

exports.readFile = function(filename, callback){
  var lines = [];

  client
    .textDetection(fileName)
    .then(results => {
      const pages = results[0].fullTextAnnotation.pages;
      pages.forEach(page => {
        page.blocks.forEach(block => {
          const blockWords = [];
          block.paragraphs.forEach(paragraph => {
            paragraph.words.forEach(word => blockWords.push(word));
          });

          let blockText = '';
          const blockSymbols = [];
          blockWords.forEach(word => {
            word.symbols.forEach(symbol => blockSymbols.push(symbol));
            let wordText = '';
            word.symbols.forEach(symbol => {
              wordText = wordText + symbol.text;
            });
            blockText = blockText + ` ${wordText}`;
          });

          lines.push(blockText);
        });
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
}

exports.