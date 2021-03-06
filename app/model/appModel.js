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

function getPembelian(startdate, enddate,callback){

    let p = new Promise(function(resolve, reject){
        var txt = "SELECT SUM(total) as total FROM (SELECT (SELECT SUM((harga_beli * jumlah))  ";
            txt += " FROM erp_sales_faktur_barang WHERE id_faktur = m.id_faktur) as total";
            txt += " FROM erp_sales_faktur AS m WHERE m.tanggal_faktur BETWEEN ? AND ? ) as t";
        sql.query(txt,[startdate, enddate],function(err, res){
            if(err)
                reject(err);
            else
                resolve(res[0].total);
        });
    });

    p.then(result =>{
        callback(null,result);
    })
    .catch(err=>{
        console.log(err);
        callback(err,null);
    });
    
}

function getPenjualan(startdate, enddate,callback){

    let p = new Promise(function(resolve, reject){
        var txt = "SELECT SUM(total) as total FROM (SELECT (SELECT SUM((harga * CEIL(qty)))  ";
            txt += " FROM erp_penjualan_item WHERE penjualan_id = m.id) as total";
            txt += " FROM erp_penjualan AS m WHERE m.tanggal BETWEEN ? AND ? ) as t";
        sql.query(txt,[startdate, enddate],function(err, res){
            if(err)
                reject(err);
            else
                resolve(res[0].total);
        });
    });

    p.then(result =>{
        callback(null,result);
    })
    .catch(err=>{
        console.log(err);
        callback(err,null);
    });
    
}

function getLaba(startdate, enddate,callback){

    let p = new Promise(function(resolve, reject){
        var txt = "SELECT SUM(total) as total FROM (SELECT (SELECT SUM((harga * CEIL(qty)) - (harga_beli * CEIL(qty)))  ";
            txt += " FROM erp_penjualan_item WHERE penjualan_id = m.id) as total";
            txt += " FROM erp_penjualan AS m WHERE m.tanggal BETWEEN ? AND ? ) as t";
        sql.query(txt,[startdate, enddate],function(err, res){
            if(err)
                reject(err);
            else
                resolve(res[0].total);
        });
    });

    p.then(result =>{
        callback(null,result);
    })
    .catch(err=>{
        console.log(err);
        callback(err,null);
    });
    
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
      
       var txt = "UPDATE erp_penjualan SET status_penjualan = "+params.status_bayar+" WHERE kode_penjualan = ?; ";
        sql.query(txt,[params.kode_trx],function(err, res){
            if(err){
                reject(err);    
                   
            }

            resolve(res);
                
            
        });    
    });
}

function cekBarangInDepartemen(did, bid){
    let listItem = [];
    return new Promise((resolve, reject)=>{
        let txt = "select count(*) as total from erp_departemen_stok where departemen_id = ? and barang_id = ?;";
        sql.query(txt,[did, bid],function(err, values){

            if(err) reject(err);
    
            resolve(values[0]);
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
                resolve(listItem);

            for(var i=0;i < values.length;i++){
                var item = values[i];
                listItem.push(item);

                if(i == values.length - 1)
                    resolve(listItem);

            }
        });
        
    });
}

function insertBarangToDepartemen(did, bid, exp_date, batch_no){
    let m = new Promise((resolve, reject)=>{

        var txt = "INSERT INTO erp_departemen_stok (barang_id,departemen_id,exp_date, batch_no,tanggal,stok,stok_minimal) ";
            txt += " VALUES (?,?,?,?,CURDATE(),2000,100); ";
        sql.query(txt,[bid,did, exp_date,batch_no],function(err, res){
            if(err){
                reject(err);  
            }
            
            resolve(res);
            
            
        });
        
    });

    m.then(res =>{
        return res;
    })
    .catch(err=>{
        console.log(err);
    });
}

function insertBarangNotInDepartemen(departemen_id,values){
    return new Promise((resolve, reject)=>{

        let result = [];

        if(values.length == 0)
            resolve(result);

        asyncForEach(values, async(item,i)=>{


            const mainDone = i == values.length - 1;
            
            var txt = "INSERT INTO erp_departemen_stok (barang_id,departemen_id,exp_date, batch_no,tanggal,stok,stok_minimal) VALUES (?,?,?,?,CURDATE(),2000,100); ";
            sql.query(txt,[item.id_barang,departemen_id, item.exp_date,item.batch_no],function(err, res){
                if(err){
                    reject(err);  
                }
                if(mainDone){
                    result.push(res);
                    resolve(result);
                }
                
            });    
        });
        
        
    });
}

function generateStokDepartemen(body,callback){
    let did = body.dept_id;
    let bid = body.barang_id;
    let exp_date = body.exp_date;
    let batch_no = body.batch_no;
    cekBarangInDepartemen(did, bid)
    .then(results =>{
        if(results.total == 0)
            return insertBarangToDepartemen(did, bid, exp_date, batch_no);
        else
            callback(null,[]);
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
Integra.getLaba = getLaba;
Integra.getPenjualan = getPenjualan;
Integra.getPembelian = getPembelian;

module.exports= Integra;
