'user strict';
var sql = require('../../db.js');

var unique = require("array-unique").immutable;
var async = require('async');
// var async = require('async');
// var await = require('await');
var Promise = require('promise');

//Task object constructor
var Billing = function(task){
   
};

function getBilling(va_code){
    return new Promise((resolve, reject)=>{
        let txt = "SELECT * FROM bill_tagihan WHERE va_code= ? ;";
        sql.query(txt,[va_code],function(err, res){
            if(err) reject(err);

            resolve(res);
        });
    });
}

function updateStatusBayar(body,callback){

    let va_code = body.va_code;
    let status = body.status_bayar;
    let jumlah_bayar = body.jumlah_bayar;

    getBilling(va_code)
    .then(value => {

        if(value.length == 0)
            callback(null,[]);

        let obj = value[0];

        // if(eval(obj.nilai) >= eval(jumlah)){

            let txt = "UPDATE bill_tagihan SET terbayar = ?, status_bayar = ? ";
                txt += "WHERE va_code = ?;";

                sql.query(txt,[jumlah_bayar,status,va_code],function(err,res){
                if(err){
                    callback(null,err);    

                }

                callback(null,res);
            });       
        // }

        // else{
        //     let txt = "UPDATE bill_tagihan SET terbayar = ? ";
        //         txt += "WHERE va_code = ?;";

        //         sql.query(txt,[jumlah,va_code],function(err,res){
        //         if(err){
        //             callback(null,err);    

        //         }

        //         callback(null,res);
        //     });       
        // }        
    });

    
}

function getTagihanMahasiswa(tahun,nim,callback){
    
    let txt = "SELECT k.nama, t.* FROM bill_tagihan t ";
        txt += "JOIN bill_biaya_fakultas b ON b.id = t.biaya_fakultas_id ";
        txt += "JOIN bill_komponen_biaya k ON b.bill_komponen_biaya_id = k.id ";
        txt += "WHERE b.tahun_akademik = ? AND t.nim = ?;";
    sql.query(txt,[tahun,nim],function(err,res){
        if(err) return callback(err,null);

        callback(null,res);
    });
}

function getProdiByFakultas(key){
    
    return new Promise((resolve,reject)=>{
        let txt = "SELECT * FROM simak_masterprogramstudi WHERE kode_fakultas = ? ORDER BY kode_prodi;";
        sql.query(txt,[key],function(err,res){
            if(err) return reject(res);

            resolve(res);
        });
    });
}

function getMhsByProdi(values){
    let listMhs = [];
    return new Promise((resolve,reject)=>{
        for(var i=0;i < values.length;i++){
            let prodi = values[i];
            const mainDone = i == (values.length -1) ;
                        
            var txt = "SELECT m.id, nim_mhs, nama_mahasiswa,jenis_kelamin, ps.kode_prodi, ps.nama_prodi, ps.kode_fakultas,m.kampus,k.nama_kampus, m.semester";
                txt += " FROM simak_mastermahasiswa m ";
                txt += " JOIN simak_masterprogramstudi ps ON ps.kode_prodi = m.kode_prodi ";
                txt += " JOIN simak_kampus k ON k.kode_kampus = m.kampus ";
                txt += " WHERE m.kode_prodi = ? AND m.status_aktivitas = 'A' ORDER BY m.semester;";
            sql.query(txt,[prodi.kode_prodi],function(err, res){
                if(err)
                    return reject(err);
                else{
                    
                    for(j=0;j<res.length;j++){
                        let item = res[j];
                        
                        listMhs.push(item);
                        const subDone = j == (res.length -1) ;

                        if(subDone && mainDone)
                            resolve(listMhs);    
                    }
                    
                }
            });


        }

        if(values.length == 0){
            resolve(listMhs);    
        }
    });
}

function getBiayaFakultas(values,tahun){
    
    let listBiaya = [];
    return new Promise((resolve,reject)=>{
        let counter = 0;
        let counterTwo = 0;
        for(var i=0;i < values.length;i++){
            let mhs = values[i];
            let obj = {};
            obj.nim = mhs.nim_mhs;
            
            
            const mainDone = i == (values.length -1) ;
                        
            var txt = "SELECT * ";
                txt += " FROM bill_biaya_fakultas bf ";
                txt += " WHERE fakultas_id = ? AND tahun_akademik = ?;";
            sql.query(txt,[mhs.kode_fakultas, tahun],function(err, res){
                if(err)
                    return reject(err);
                else{

                    let biayas = [];
                    for(j=0;j<res.length;j++){

                        if(j==0){
                            counter++;
                        }
                        counterTwo++;
                        let item = res[j];
                        var tmp = new Object;
                        tmp.bill_id = item.id;
                        tmp.counter = counterTwo;
                        tmp.biaya = item.biaya;
                        let kode = counter.toString().padStart(4,'0');
                        tmp.kode = item.kode+''+kode;
                        biayas[j] = tmp;
                        

                        const subDone = j == (res.length -1) ;

                        if(subDone){
                            obj.items = biayas;
                            listBiaya.push(obj);

                            if(mainDone){
                                resolve(listBiaya);    
                            }
                        }   
                    }

                    if(res.length == 0){
                        resolve(listBiaya);
                    }
                    
                }
            });


        }

        if(values.length == 0){
            resolve(listBiaya);    
        }
    });
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

function saveBulkTagihan(values){
    return new Promise((resolve,reject)=>{

        let result = [];

        if(values.length == 0)
            resolve(result);
        sql.getConnection(function(err,conn){
            asyncForEach(values, async(item,i)=>{

                const mainDone = i == values.length - 1;
                
                await asyncForEach(item.items,async(tmp,j)=>{
                    
                    let nim = item.nim;
                    const subDone = j == item.items.length - 1;
                    
                    
                        conn.beginTransaction(function(err){
                            var txt = "INSERT INTO bill_tagihan (va_code,urutan,nim, biaya_fakultas_id, nilai) VALUES (?,?,?,?,?); ";
                            conn.query(txt,[tmp.kode,tmp.counter,nim,tmp.bill_id, tmp.biaya],function(err, res){
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

                                    if(mainDone && subDone){
                                        result.push(res);
                                        resolve(result);
                                    }
                                });
                                
                            });    
                        });
                    });
                    
                    
                
                
            });

        });
        
    });
}

function generateTagihan(body,callback){
    let listMhs = [];
    let fid = body.fid;
    let tahun = body.tahun;


    getProdiByFakultas(fid)
    .then(values => {
        return getMhsByProdi(values);
    })
    .then(values =>{
        return getBiayaFakultas(values,tahun);
    })
    .then(values =>{
        return saveBulkTagihan(values);
    })
    .then(results => {
        callback(null,results);
    })
    .catch(err=>{
        callback(err,null);
    });
    
}

Billing.generateTagihan = generateTagihan;
Billing.getTagihanMahasiswa = getTagihanMahasiswa;
Billing.updateStatusBayar = updateStatusBayar;

module.exports= Billing;