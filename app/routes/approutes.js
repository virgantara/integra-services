'use strict';
module.exports = function(app) {
  var todoList = require('../controller/appController');

  app.route('/integra/generate/stok')
    .post(todoList.generate_stok_departemen);

  
    // .post(todoList.create_a_task);
   
  // app.route('/tasks/:taskId')
  //   .get(todoList.read_a_task)
  //   .put(todoList.update_a_task)
  //   .delete(todoList.delete_a_task);
};