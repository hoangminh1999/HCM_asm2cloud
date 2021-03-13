var express = require('express')
var hbs = require('hbs')

const session = require('express-session');

var app = express()
app.set('view engine','hbs')

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }))
//var url =  "mongodb+srv://minh:123456abc@cluster0.9a6ua.mongodb.net/test";
var url =  "mongodb://localhost:27017"
var MongoClient = require('mongodb').MongoClient;

app.use(session({secret: 'matkhaukhongaibiet_khongcannho',saveUninitialized: true,resave: true}));

app.post('/doLogin',(req,res)=>{
    let nameInput = req.body.txtName;
    let passInput = req.body.txtPassword;
    if(nameInput != 'admin' || passInput !='admin'){
        res.render('login',{errorMsg: "Username and password incorrect!, please try again!"})
    }else{
        //save user name to session befor login successfully!
       myses = req.session;
       myses.userName = nameInput;
       res.redirect('/')
    }
})

app.get('/login',(req,res)=>{
    res.render('login')
})

app.get('/edit', async(req,res)=>{
    let id = req.query.pid;
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id":ObjectID(id)}; 
    
    let client= await MongoClient.connect(url, {useUnifiedTopology: true});
    let dbo = client.db("MyDatabase");
    let prod = await dbo.collection("products").findOne(condition);
    res.render('edit',{model:prod});

})

app.post('/update',async (req,res)=>{
    let client= await MongoClient.connect(url);
    let dbo = client.db("MyDatabase");
    
    let nameInput = req.body.productName;
    let priceInput = req.body.price;
    let idInput = req.body.pid;

    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id":ObjectID(idInput)};  

    let updateProduct ={$set : {productName : nameInput, price:priceInput}} ;
    await dbo.collection("products").updateOne(condition,updateProduct);
    res.redirect('/');
})

app.get('/delete',async (req,res)=>{
    let id = req.query.pid;
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id":ObjectID(id)};    

    let client= await MongoClient.connect(url);
    let dbo = client.db("MyDatabase");
    
    await dbo.collection("products").deleteOne(condition);
    res.redirect('/');
})

app.get('/', async (req,res)=>{
    //check session userName if exited
    myses = req.session;
    if(myses.userName !=null){   
        let client= await MongoClient.connect(url, {useUnifiedTopology: true});
        let dbo = client.db("MyDatabase");
        let results = await dbo.collection("products").find({}).toArray();
        res.render('index',{model:results,userName:myses.userName})
    }else{
        res.render('login')
    }
})

app.get('/newProduct',(req,res)=>{
    res.render('newProduct')
})
app.post('/search',async (req,res)=>{
    let searchText = req.body.txtSearch;
    let client= await MongoClient.connect(url);
    let dbo = client.db("MyDatabase");
    let results = await dbo.collection("products").
        find({productName: new RegExp(searchText,'i')}).toArray();
    res.render('index',{model:results})
})
app.post('/insert',async (req,res)=>{
    let client= await MongoClient.connect(url);
    let dbo = client.db("MyDatabase");
    let nameInput = req.body.productName;
    let priceInput = req.body.price;
    let newProduct = {productName : nameInput, price:priceInput};
    await dbo.collection("products").insertOne(newProduct);
    let results = await dbo.collection("products").find({}).toArray();
    res.render('index',{model:results})
})

const PORT = process.env.PORT || 5000
app.listen(PORT);
console.log("Server is running at " + PORT)