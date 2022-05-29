var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const data = path.join(__dirname, "data", "db.db");
const nodemailer = require('nodemailer');
const { isIPv4 } = require('net');
const { response } = require('express');
const { json } = require('express/lib/response');
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
  

router.post('/', async (req, res) => {
        let date = new Date();
  			let hor = date.getHours();
  			let min = date.getMinutes();
  			let sec = date.getSeconds();
        let form = hor >= 12 ? 'PM' : 'AM'; 
  			hor = hor % 12; 
  			hor = hor ? hor : 12; 
  			min = min < 10 ? '0' + min : min;
        //var response = grecaptcha.getResponse();
        let time = hor + ':' + min + ':' + sec + ' ' + form;
        let T_Date = date.getDate() + '-' + ( date.getMonth() + 1 ) + '-' + date.getFullYear();
        /*const response_key = req.body["g-recaptcha-response"];
        const secret_key = "6Ld31CMgAAAAADt2dw7uV14D8x0pc9t4kxpKZvaZ";
        const resp = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${response_key}`;
          let atrib = json_decode(resp, true);
          if(!atrib["success"]){*/ //No conseguí que funcionara :c
           
          

          var ip = req.headers['x-forwarded-for'];
            if(ip){
              let ip_ls = ip.split(',');
              ip = ip_ls[ip_ls.length - 1];
            }
            else{
              console.log('Direccion ip no encontrada');
            }
            const { name, email, message} = req.body;
            contentHTML = `
            <h1>Datos del usuario</h1>
            <ul>
                <li>Nombre: ${name}</li>
                <li>Email: ${email}</li>
                <li>Ip:  ${ip} </li>
                <li>Fecha: ${T_Date} </li>
                <li>Hora: ${time} </li>

            </ul>
            <p>${message}</p>
          `;
          let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'cp06685@gmail.com',
              pass: 'zgdh kqvy qkcg rmvt'
            },
            tls: {
                rejectUnauthorized: false
            }
          });
          let info = await transporter.sendMail({
            from: '"Task 3 P2" <cp06685@gmail.com>',
            to: 'programacion2ais@dispostable.com',
            subject: 'Formulario de contatos',
            html: contentHTML
          })

            const query = "INSERT INTO contacts(name, email, message, date, time, ip) VALUES (?,?,?,?,?,?);";
            const messages = [req.body.name, req.body.email, req.body.message, T_Date, time, ip];

            database.run(query, messages, (err)=>{
            if (err){
              return console.error(err.message);
            }
            else{
              res.redirect("/");
            }
            });  
          /* }else{
         console.log("Por fa valida el capcha");
       };*/
    })


router.get('/', (req, res, next) => {
  res.render('index.ejs',{data:{}});
});



module.exports = router;
