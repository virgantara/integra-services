'use strict';
module.exports = function(app) {
  var todoList = require('../controller/appController');

  app.route('/b/tagihan/update')
    .post(todoList.update_payment);
  // todoList Routes
  app.route('/b/tagihan/generate')
    .post(todoList.generate_tagihan);

  app.route('/b/tagihan/mahasiswa')
    .get(todoList.tagihan_mahasiswa);

  
    // .post(todoList.create_a_task);
   
  // app.route('/tasks/:taskId')
  //   .get(todoList.read_a_task)
  //   .put(todoList.update_a_task)
  //   .delete(todoList.delete_a_task);
};