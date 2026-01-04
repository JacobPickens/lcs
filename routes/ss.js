var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET users listing. */
router.get('/', function(req, res, next) {
  const filenames = fs.readdirSync('./public/images/ss');
  console.log('Filenames in directory:', filenames);

  let largest = 0;
  for(let name of filenames) {
      let i = parseInt(name.split('-')[1]);
      if(i > largest) {
          largest = i;
      }
  }
  res.send('/images/ss/screenshot-' + largest + '.png');
});

module.exports = router;
