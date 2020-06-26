var vcapServices = require('vcap_services');
var express = require("express");
var bodyParser = require("body-parser");
var MongoClient = require("mongodb").MongoClient;
var app = express();
let url;
var credentials = vcapServices.getCredentials('mlab');
url=credentials.uri;

if (url==null)
  url="mongodb://mongo:27017/db"
var urlencodedParser = bodyParser.urlencoded({ extended: false });

MongoClient.connect(url, {native_parser:true},{ useUnifiedTopology: true },function (err, db) {
    if(!err)
    {

    console.log("Connected to Database");


    //console.log("We are connected to the company database",url);
    app.use(express.static('public'));
    app.use(bodyParser.json());
app.get('/home', function (req, res) {  
   console.log("Got a GET request for the homepage");  
   res.send('<h1>Welcome to College Details MEAN Stack Application</h1>');   
})

app.get('/about', function (req, res) {  
   console.log("Got a GET request for /about");  
   res.send('This application gives you the deatils about various colleges');
})  
/*JS client side files has to be placed under a folder by name 'public' */

app.get('/index.html', function (req, res) {  
   res.sendFile( __dirname + "/" + "index.html" );    
})

app.get('/about.html', function (req, res) {  
   res.sendFile( __dirname + "/" + "about.html" );    
})  

app.get('/insert.html', function (req, res) {
    res.sendFile( __dirname + "/" + "insert.html" );
})
/* to access the posted data from client using request body (POST) or request params(GET) */
//-----------------------POST METHOD-------------------------------------------------
app.post('/process_post', function (req, res) {
    /* Handling the AngularJS post request*/
    console.log(req.body);
	res.setHeader('Content-Type', 'text/html');
    req.body.serverMessage = "NodeJS replying to angular"
        /*adding a new field to send it to the angular Client */
		console.log("Sent data are (POST): College Code :"+req.body.clgcode+" College Name :"+req.body.clgname+" College type:"+req.body.clgtype+" Courses offered:"+req.body.course+" Address:"+req.body.address+" Phone No.: "+req.body.phone+" Email id:"+req.body.email);
		// Submit to the DB
  	var clgcode = req.body.clgcode;
    var clgname = req.body.clgname;
	var clgtype = req.body.clgtype;
	var course = req.body.course;
	var address = req.body.address;
	var phone = req.body.phone;
	var email = req.body.email;
	//To avoid duplicate entries in MongoDB
	db.collection('college').createIndex({"clgcode":1},{unique:true});
	/*response has to be in the form of a JSON*/
	db.collection('college').insertOne({clgcode:clgcode,clgname:clgname,clgtype:clgtype,course:course,address:address,phone:phone,email:email}, (err, result) => {                       
                    if(err) 
					{ 
						console.log(err.message); 
						res.send("Duplicate College Code")
					} 
					else
					{
                    console.log('College Details Inserted');
					/*Sending the respone back to the angular Client */
					res.end("College details Inserted-->"+JSON.stringify(req.body));
					}
                })      
	
    });
//--------------------------GET METHOD-------------------------------
app.get('/process_get', function (req, res) { 
// Submit to the DB
  var newClg = req.query;
	var clgcode = req.query['clgcode'];
    var clgname = req.query['clgname'];
	var clgtype = req.query['clgtype'];
	var course = req.query['course'];
	var address = req.query['address'];
	var phone = req.query['phone'];
	var email = req.query['email'];
	db.collection('college').createIndex({"clgcode":1},{unique:true});
	db.collection('college').insertOne({clgcode:clgcode,clgname:clgname,clgtype:clgtype,course:course,address:address,phone:phone,email:email}, (err, result) => {                       
                    if(err) 
					{ 
						console.log(err.message); 
						res.send("Duplicate College Code")
					} 
					else
					{
                    console.log("Sent data are (GET): College Code :"+clgcode+" College Name :"+clgname+" College type:"+clgtype+" Courses offered:"+course+" Address:"+address+" Phone No.: "+phone+" Email id:"+email);
					/*Sending the respone back to the angular Client */
					res.end("College Details Inserted-->"+JSON.stringify(newClg));
					}
                })      
}) 

//--------------UPDATE------------------------------------------
app.get('/update.html', function (req, res) {
    res.sendFile( __dirname + "/" + "update.html" );
})

app.get("/update", function(req, res) {
	var empname1=req.query.empname;
	var clgcode1=req.query.clgcode;
	var clgname1=req.query.clgname;
	var clgtype1=req.query.clgtype;
	var course1=req.query.course;
	var address1=req.query.address;
	var phone1=req.query.phone;
	var email1=req.query.email;
    db.collection('college', function (err, data) {
        data.update({"clgcode":clgcode1},{$set:{"clgname":clgname1,"clgtype":clgtype1,"course":course1,"address":address1,"phone":phone1,"email":email1}},{multi:true},
            function(err, obj){
				if (err) {
					console.log("Failed to update data.");
			} else {
				if (obj.result.n==1)
				{
				res.send("<br/>"+clgname1+":"+"<b> College Details Updated</b>");
				console.log("College Updated")
				}
				else
					res.send("College Not Found")
			}
        });
    });
})	
//--------------SEARCH------------------------------------------
app.get('/search.html', function (req, res) {  
   res.sendFile( __dirname + "/" + "search.html" );    
})

app.get("/search", function(req, res) {
	//var clgcodenum=parseInt(req.query.clgcode)  // if empid is an integer
	var clgcodenum=req.query.clgcode;
    db.collection('college').find({clgcode: clgcodenum},{clgname:1,clgcode:1,clgtype:1,course:1,address:1,phone:1,email:1,_id:0}).toArray(function(err, docs) {
    if (docs.length==0) {
      res.send("College doesnt exist ");
    }
     else {
		     res.status(200).json(docs);
	  
    }
  });
  });
  // --------------To find "Single Document"-------------------
	/*var clgcodenum=parseInt(req.query.clgcode)
    db.collection('college').find({'clgcode':clgcodenum}).nextObject(function(err, doc) {
    if (err) {
      console.log(err.message+ "Failed to get data");
    } else {
      res.status(200).json(doc);
    }
  })
}); */

//--------------DELETE------------------------------------------
app.get('/delete.html', function (req, res) {  
   res.sendFile( __dirname + "/" + "delete.html" );    
})

app.get("/delete", function(req, res) {
	//var clgcodenum=parseInt(req.query.clgcode)  // if empid is an integer
	var clgcodenum=req.query.clgcode;
	db.collection('college', function (err, data) {
        data.remove({"clgcode":clgcodenum},function(err, obj){
				if (err) {
					console.log("Failed to remove data.");
			} else {
				if (obj.result.n>=1)
				{
				res.send("<br/>"+clgcodenum+": "+"<b>College Deleted</b>");
				console.log("College Deleted")
				}
				else
					res.send("College Not Found")
			}
        });
    });
    
  });


//-------------------DISPLAY-----------------------
app.get('/display', function (req, res) { 
//-----IN JSON FORMAT  -------------------------
/*db.collection('college').find({}).toArray(function(err, docs) {
    if (err) {
      console.log("Failed to get data.");
    } else 
	{
		res.status(200).json(docs);
    }
  });*/
//------------- USING EMBEDDED JS -----------
 db.collection('college').find().sort({clgcode:1}).toArray(
 		function(err , i){
        if (err) return console.log(err)
        res.render('disp.ejs',{college: i})  
     })
//---------------------// sort({empid:-1}) for descending order -----------//
}) 

 
var server = app.listen(8080, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("MEAN Stack app listening at http://%s:%s", host, port)
  })

}
else {

console.log("not connected",url);
//db.close()

}

});


