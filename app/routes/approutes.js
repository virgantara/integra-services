'use strict';
module.exports = function(app) {
  var todoList = require('../controller/appController');

  app.route('/integra/penjualan')
    .get(todoList.getPenjualan);

  app.route('/integra/pembelian')
    .get(todoList.getPembelian);

  app.route('/integra/laba')
    .get(todoList.getLaba);

  app.route('/integra/generate/stok')
    .post(todoList.generate_stok_departemen);

  app.route('/integra/p/update')
    .post(todoList.update_penjualan);
  
    // .post(todoList.create_a_task);
   
  // app.route('/tasks/:taskId')
  //   .get(todoList.read_a_task)
  //   .put(todoList.update_a_task)
  //   .delete(todoList.delete_a_task);
};