'user strict';
var sql = require('../../db.js');

var unique = require("array-unique").immutable;
var async = require('async');
// var async = require('async');
// var await = require('await');
var Promise = require('promise');

//Task object constructor
var Integra = function(task){
   
};



async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}


function updatePenjualan(params,callback){

    let p = editPenjualan(params);
    p.then(res => {

        callback(null,res);
    })
    .catch(err => {
        console.log(err);
        callback(err, null);
    });
}

function editPenjualan(params){
    return new Promise((resolve,reject)=>{
        
        sql.getConnection(function(err,conn){
                       
            conn.beginTransaction(function(err){
                
                var txt = "UPDATE erp_penjualan SET status_penjualan = ? WHERE kode_penjualan = ?; ";
                conn.query(txt,[params.status_bayar, params.kode_trx],function(err, res){
                    if(err){
                        conn.rollback(function(){
                            reject(err);    
                        });   
                    }

                    conn.commit(function(err){
                        if(err){
                            conn.rollback(function(){
                                reject(err);    
                            });   
                        }

                        resolve(res);
                        
                    });
                });    
            });
        });
    });
}


function getBarangNotInDepartemen(departemen_id){
    let listItem = [];
    return new Promise((resolve, reject)=>{
        let txt = "select id_barang,exp_date,batch_no from erp_sales_stok_gudang ";
            txt += "where id_barang not in (select barang_id from erp_departemen_stok where departemen_id = ?);";
        sql.query(txt,[departemen_id],function(err, values){
            if(err) reject(err);
            
            if(values.length == 0)
                reject(listItem);

            for(var i=0;i < values.length;i++){
                var item = values[i];
                listItem.push(item);

                if(i == values.length - 1)
                    resolve(listItem);

            }
        });
        
    });
}

function insertBarangNotInDepartemen(departemen_id,values){
    return new Promise((resolve, reject)=>{

        let result = [];

        if(values.length == 0)
            resolve(result);

        sql.getConnection(function(err,conn){
            asyncForEach(values, async(item,i)=>{


                const mainDone = i == values.length - 1;
                
                conn.beginTransaction(function(err){
                    var txt = "INSERT INTO erp_departemen_stok (barang_id,departemen_id,exp_date, batch_no,tanggal,stok,stok_minimal) VALUES (?,?,?,?,CURDATE(),2000,100); ";
                    conn.query(txt,[item.id_barang,departemen_id, item.exp_date,item.batch_no],function(err, res){
                        if(err){
                            conn.rollback(function(){
                                reject(err);    
                            });   
                        }
                        conn.commit(function(err){
                            if(err){
                                conn.rollback(function(){
                                    reject(err);    
                                });   
                            }

                            if(mainDone){
                                result.push(res);
                                resolve(result);
                            }
                        });
                        
                    });    
                });
            });

        });
        
        
    });
}

function generateStokDepartemen(body,callback){
    let did = body.dept_id;

    getBarangNotInDepartemen(did)
    .then(results =>{
        return insertBarangNotInDepartemen(did, results);
    })
    .then(results => {
        callback(null,results);
    })
    .catch(err=>{
        callback(err,null);
    });
    
}

Integra.generateStokDepartemen = generateStokDepartemen;
Integra.updatePenjualan = updatePenjualan;

module.exports= Integra;
