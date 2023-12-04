const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const assert = require('assert');
const fs = require('fs');
const formidable = require('express-formidable');
const mongourl = 'mongodb+srv://yiuming628:Tom1@cluster0.9ushbsy.mongodb.net/?retryWrites=true&w=majority';
const dbName = '381project';
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(formidable());
app.set('view engine', 'ejs');

const session = require('cookie-session');
const SECRETKEY = 'cs381';
app.use(session({
  name: 'session',
  keys: [SECRETKEY],
}));

var userslist = new Array(
  {uid:"1",name: "Peter Parker", password: "1"},
  {uid:"20002",name: "Ken", password: "20002"},
  {uid:"30003",name: "Thomas", password: "30003"}
);

const findDocument = (db, criteria, callback) => {
    let cursor = db.collection('inventory').find(criteria);
    console.log(`findDocument: ${JSON.stringify(criteria)}`);
    cursor.toArray((err,docs) => {
        assert.equal(err,null);
        console.log(`findDocument: ${docs.length}`);
        callback(docs);
    });
}
const createDocument = function(db, createdD, callback) {
    db.collection('inventory').insertOne(createdD, function(error, result) {
        if (error) {
            throw error;
        }
        console.log(result);
        return callback();
    });
};


const handle_create = (req, res) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to the MongoDB database server.");
        const db = client.db(dbName);

        let document = {
            itemID: req.body.itemID,
            itemName: req.body.itemName,
            supplier: req.body.supplier,
            itemQuantity: req.body.itemQuantity
        };

        createDocument(db, document, () => {
            client.close();
            console.log("Closed DB connection");
            res.status(200).send("Document created successfully");
        });
    });
}


const handle_Find = (res, criteria) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);
        //db.collection([[name[, options]], callback);

        findDocument(db, criteria, (docs) => {
            client.close();
            console.log("Closed DB connection");
            res.status(200).render('list',{ninventory: docs.length, inventory: docs});
        });
    });
}


const handle_Edit = (res, query) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        // Use the itemID from the query parameters to find the item in the database
        findDocument(db, { itemID: query.itemID }, (docs) => {
            client.close();
            console.log("Closed DB connection");

            // Check if an item was found
            if (docs.length > 0) {
                // Render the edit view with the item data
                res.render('edit', { item: docs[0] });
            } else {
                // Send a 404 Not Found response if no item was found
                res.status(404).send('Item not found');
            }
        });
    });
}

const updateDocument = (criteria, updateDoc, callback) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

         db.collection('inventory').updateOne(criteria,
            {
                $set : updateDoc
            },
            (err, results) => {
                client.close();
                assert.equal(err, null);
                callback(results);
            }
        );
    });
}


const handle_Update = (req, res, criteria) => {
    var DOCID = {};
    DOCID['_id'] = ObjectID(req.fields._id);
    var updateDoc = {};
     updateDoc['itemID'] = req.fields.itemID;
    updateDoc['itemName'] = req.fields.itemName;
    updateDoc['supplier'] = req.fields.supplier;
    updateDoc['itemQuantity'] = req.fields.itemQuantity;
    if (req.files.filetoupload.size > 0) {
        fs.readFile(req.files.filetoupload.path, (err,data) => {
            assert.equal(err,null);
            updateDoc['photo'] = new Buffer.from(data).toString('base64');
            updateDocument(DOCID, updateDoc, (results) => {
                res.status(200).render('info', {message: `Updated ${results.result.nModified} document(s)`})
            });
        });
    } else {
        updateDocument(DOCID, updateDoc, (results) => {
            res.status(200).render('info', {message: `Updated ${results.result.nModified} document(s)`})
        });
    }

}
const deleteDocument = function(db, criteria, callback){
    console.log(criteria);
        db.collection('inventory').deleteOne(criteria, function(err, results){
        assert.equal(err, null);
        console.log(results);
        return callback();
        });
    
    };
    
    const handle_Delete = function(res, criteria) {
        const client = new MongoClient(mongourl);
        client.connect(function(err) {
            console.log("Connected successfully to server");
            const db = client.db(dbName);
        
        let deldocument = {};
        
            deldocument["_id"] = ObjectID(criteria._id);
            deldocument["ownerID"] = criteria.owner;
            console.log(deldocument["_id"]);
            console.log(deldocument["ownerID"]);
            
            deleteDocument(db, deldocument, function(results){
                client.close();
                console.log("Closed DB connection");
                res.status(200).render('info', {message: "Document is successfully deleted."});
            })     
        });
    }



app.get('/', function(req, res){     
    	res.redirect("/login");
        console.log("...Hello, welcome back");
});

//login
app.get('/login', function(req, res){
    console.log("...Welcome to login page.");
     res.status(200).render("login");
});

app.post('/login', function(res){
    console.log("...Welcome to login page.");
    return res.status(200).redirect('/main');
});
/*app.post('/login', function(req, res){
    console.log("...Welcome to login page.");
    return res.status(200).redirect('/main');
});*/

/*app.post('/login', function(req, res){
    console.log("...Handling your login request");
    for (var i=0; i<userslist.length; i++){
        if (userslist[i].uid == req.body.uid && userslist[i].password == req.body.password) {
        req.session.authenticated = true;
        req.session.userid = userslist[i].uid;
        console.log(req.session.userid);
        return res.status(200).redirect("/main");
        }
    }
        console.log("Error username or password.");
        return res.redirect("/");
});*/


  app.get('/main', (req, res) => {
    console.log("...Welcome to the main page!");
    return res.status(200).render("main");
  });

app.get('/find', (req,res) => {
    handle_Find(res, req.query.docs);
})


app.get('/find', function(req, res){
    return res.status(200).render("search");
});

app.post('/create', function(req, res) {
    handle_create(req, res);
  });
  
  app.get('/create', function(req, res) {
    res.status(200).render("create");
  });

app.get('/edit', (req,res) => {
    handle_Edit(res, req.query);
})

app.post('/update', (req,res) => {
    handle_Update(req, res, req.query);
})
app.get('/delete', function(req, res){
     handle_Delete(res, req.query);
  
});
app.post('/api/item/itemID/:itemID', function(req,res) {
    if (req.params.itemID) {
        console.log(req.body)
        const client = new MongoClient(mongourl);
        client.connect(function(err){
            assert.equal(null,err);
            console.log("Connected successfully to server");
            const db = client.db(dbName);
            let newDocument = {};
            newDocument['itemID'] = req.params.itemID; // Use req.params.itemID instead of req.body.itemID
            newDocument['itemName'] = req.body.itemName;
            newDocument['supplier'] = req.body.supplier;
            newDocument['itemQuantity'] = req.body.itemQuantity;
            db.collection('inventory').insertMany(newDocument, function(err,results){
                assert.equal(err,null);
                client.close()
                res.status(200).end()
            });
        })
    }
    else {
        res.status(500).json({"error": "Not Found"});
    }
})

app.get('/api/item/:itemID', (req,res) => {
    if (req.params.itemID) {
        let criteria = {};
        criteria['itemID'] = req.params.itemID;
        const client = new MongoClient(mongourl);
        client.connect((err) => {
            assert.equal(null, err);
            console.log("Connected successfully to server");
            const db = client.db(dbName);

            findDocument(db, criteria, (docs) => {
                client.close();
                console.log("Closed DB connection");
                res.status(200).json(docs);
            });
        });
    } else {
        res.status(500).json({"error": "Not Found"}).end();
    }
})

app.put('/api/item/:itemID', (req,res) => {
    if (req.params.itemID) {
        console.log(req.body)
        const client = new MongoClient(mongourl);
        client.connect((err) => {
            assert.equal(null,err);
            console.log("Connected successfully to server");
            const db = client.db(dbName);

            let criteria = {}
            criteria['itemID'] = req.params.itemID

            let updateDoc = {};
            Object.keys(req.fields).forEach((key) => {
                updateDoc[key] = req.fields[key];
            })
            console.log(updateDoc)
            if (req.files.filetoupload && req.files.filetoupload.size > 0) {
                fs.readFile(req.files.filetoupload.path, (err,data) => {
                    assert.equal(err,null);
                    newDoc['photo'] = new Buffer.from(data).toString('base64');
                    db.collection('inventory').updateOne(criteria, {$set: updateDoc},(err,results) => {
                        assert.equal(err,null);
                        client.close()
                        res.status(200).json(results).end();
                    })
                });
            } else {
                db.collection('inventory').updateOne(criteria, {$set: updateDoc},(err,results) => {
                    assert.equal(err,null);
                    client.close()
                    res.status(200).json(results).end();
                })
            }
        })
    } else {
        res.status(500).json({"error": "missing bookingid"});
    }
})

app.delete('/api/item/itemID/:itemID', function(req,res){
    if (req.params.itemID) {
        let criteria = {};
        criteria['itemID'] = req.params.itemID;
        const client = new MongoClient(mongourl);
        client.connect(function(err){
            assert.equal(null, err);
            console.log("Connected successfully to server");
            const db = client.db(dbName);

            db.collection('inventory').deleteMany(criteria, function(err,results) {
                assert.equal(err,null)
                client.close()
                res.status(200).end();
            })
        });
    } else {
        res.status(500).json({"error": "missing item id"});       
    }
})
//curl -X DELETE localhost:8099/api/item/itemID/A009

app.get('/*', (req,res) => {
    res.status(404).render('info', {message: `${req.path} - Unknown request!` });
})

app.listen(app.listen(process.env.PORT || 8099));
