var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const data = path.join(__dirname, "data", "db.db");
const database = new sqlite3.Database(data, err => {
  if(err){
    return console.error(err.message);
  }
  else{
    console.log("Conexion exitosa");
  }
});
const create = "CREATE TABLE IF NOT EXISTS contacts(name VARCHAR(50), email VARCHAR(50), message TEXT, date DATETIME, time VARCHAR(10), ip VARCHAR(50));";

database.run(create, err => {
  if(err){
    return console.error(err.message);
  }
  else{
    console.log("Tabla creada");
  }
});

router.get('/contacts', (req, res, next) => {
          const query = "SELECT * FROM contacts;";
          database.all(query, [], (err, rows) => {
            if(err){
              return console.error(err.message);
            }
            else{
              res.render("contacts.ejs", {data:rows});
            }
          });
});
  

router.post('/', (req, res) => {

  let datetime = new Date();
  let _date = datetime.toLocaleString();
  let _time = datetime.toLocaleString();
  let date = '';
  let time = '';
  let ip = req.headers['x-forwarded-for'];

  for(let d = 0; d <= 9; d++){
      if(_date[d] == '/'){
        date += '-';
        continue;
      }
      else if(_date[d] == ','){
        continue;
      }
      date += _date[d];
  }

  for(let t = 11; t <= 23; t++){
    time += _time[t];
  }

  if(ip){
    let ip_ls = ip.split(',');
    ip = ip_ls[ip_ls.length - 1];
  }
  else{
    console.log('Direccion ip no encontrada');
  }

  const query = "INSERT INTO contacts(name, email, message, date, time, ip) VALUES (?,?,?,?,?,?);";
	const messages = [req.body.name, req.body.email, req.body.message, date, time, ip];

	database.run(query, messages, (err)=>{
	if (err){
		return console.error(err.message);
	}
	else{
		res.redirect("/");
    console.log("Un usuario ha comentado");
	}
	});
          
});


router.get('/', (req, res, next) => {
  res.render('index.ejs',{data:{}});
});

module.exports = router;
