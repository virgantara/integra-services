'use strict';

var Billing = require('../model/appModel.js');

var response = require('../../res.js');

exports.update_payment = function(req, res) {

  Billing.updateStatusBayar(req.body, function(err, values) {
    
    if (err)
      res.send(err);

    response.ok(values, res);

  });
};

exports.generate_tagihan = function(req, res) {
  Billing.generateTagihan(req.body, function(err, values) {
    
    if (err)
      res.send(err);

    response.ok(values, res);

  });
};

exports.tagihan_mahasiswa = function(req, res) {
  Billing.getTagihanMahasiswa(req.query.tahun,req.query.nim, function(err, values) {
    
    if (err)
      res.send(err);

    response.ok(values, res);

  });

};


