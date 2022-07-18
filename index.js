var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var ObjectId = require('mongodb').ObjectId;
const MongoClient = require('mongodb').MongoClient;
const PORT = process.env.PORT || 3000;

const connectionString = "mongodb+srv://hari2511:hEllo911@cluster0.unihd7w.mongodb.net/?retryWrites=true&w=majority";
var db;
var blogs;

MongoClient.connect(connectionString, { useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to Database')
        db = client.db('blog')
        blogs = db.collection('blogs')
    })
    .catch(error => console.error(error))


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    db.collection('blogs').find().sort({ date: -1 }).toArray()
        .then(results => {
            res.render("home", { recent: results });
        })
        .catch(error => console.error(error))
});

app.get('/edit/:id', (req, res) => {
    var o_id = new ObjectId(req.params.id);
    db.collection('blogs').find({ _id: o_id }).toArray()
        .then(results => {
            res.render("edit", { blog: results });
        })
        .catch(error => console.error(error))
});

app.get('/blogs', (req, res) => {
    db.collection('blogs').find().toArray()
        .then(results => {
            res.render("blogs", { blogs: results });
        })
        .catch(error => console.error(error))
});

app.get('/create', (req, res) => {
    res.render("create");
});

app.get('/post/:id', (req, res) => {
    var o_id = new ObjectId(req.params.id);
    db.collection('blogs').find({ _id: o_id }).toArray()
        .then(results => {

            db.collection('blogs').find().sort({ date: -1 }).toArray()
                .then(recents => {
                    res.render("post", { blog: results, recent: recents });
                })
                .catch(error => console.error(error))


        })
        .catch(error => console.error(error))
});

app.post('/create', (req, res) => {
    var date = new Date();
    var day = date.getDate();
    var months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUNE", "JULY", "AUG", "SEP", "OCT", "NOV", "DEC"];
    var month = months[date.getMonth() - 1];
    var year = date.getFullYear();
    var today = month + " " + day + ", " + year;
    req.body.date = today;
    blogs.insertOne(req.body)
        .then(result => {
            res.redirect('/')
        })
        .catch(error => console.error(error))
});

app.get('/delete_blog', (req, res) => {
    blogs.deleteOne({ _id: ObjectId(req.query.id) })
        .then(() => {
            console.log(ObjectId(req.query.id) + " DELETED")
            res.redirect('/')
        })
        .catch(error => console.error(error))

});

app.get('/search/:category', (req, res) => {
    db.collection('blogs').find().sort({ date: -1 }).toArray()
        .then(results => {
            res.render("search", { searches: results, category: req.params.category });
        })
        .catch(error => console.error(error))
});

app.get('/edit_blog', (req, res) => {
    var o_id = new ObjectId(req.query.id);
    blogs.updateOne({ _id: o_id },
        {
            $set: { "title": req.query.title, "category": req.query.category, "image": req.query.image, "desc": req.query.desc }
        });
    res.redirect('/');
});

var server = app.listen(PORT, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port)
})  