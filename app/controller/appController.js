'use strict';

var Integra = require('../model/appModel.js');

var response = require('../../res.js');

exports.getPembelian = function(req, res) {
  Integra.getPembelian(req.query.startdate, req.query.enddate, function(err, values) {
    if (err)
      res.send(err);

    response.ok(values, res);

  });
};

exports.getPenjualan = function(req, res) {
  Integra.getPenjualan(req.query.startdate, req.query.enddate, function(err, values) {
    if (err)
      res.send(err);

    response.ok(values, res);

  });
};

exports.getLaba = function(req, res) {
  Integra.getLaba(req.query.startdate, req.query.enddate, function(err, values) {
    if (err)
      res.send(err);

    response.ok(values, res);

  });
};


exports.update_penjualan = function(req, res) {
  Integra.updatePenjualan(req.body, function(err, values) {
    
    if (err)
      res.send(err);

    response.ok(values, res);

  });
};

exports.generate_stok_departemen = function(req, res) {
  Integra.generateStokDepartemen(req.body, function(err, values) {
    
    if (err)
      res.send(err);

    response.ok(values, res);

  });
};

