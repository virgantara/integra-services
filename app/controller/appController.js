'use strict';

var Integra = require('../model/appModel.js');

var response = require('../../res.js');


exports.generate_stok_departemen = function(req, res) {
  Integra.generateStokDepartemen(req.body, function(err, values) {
    
    if (err)
      res.send(err);

    response.ok(values, res);

  });
};

