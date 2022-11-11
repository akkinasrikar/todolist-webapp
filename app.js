const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + '/date.js');
const mongoose = require('mongoose'); 
const _ = require('lodash');
var path = require('path')



mongoose.connect('mongodb://localhost:27017/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = {
    name: String
};

const listSchema = {
    name: String,
    itemslist: [itemsSchema]
};


const Item = mongoose.model('Item', itemsSchema);
const List = mongoose.model('List', listSchema); 


const a = new Item({
    name:'coding'
});
const b = new Item({
    name:'sleeping'
});


const defaultItems = [a,b];
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, '/public')));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {

    let day = date.getDate();
    
    Item.find({}, function(err, foundItems){
        if(err){
            console.log(err);
        } else {
            res.render('list', {listTitle: day, newListItems: foundItems});
        }
    });
    
});



app.get('/news', (req, res) => {
    res.render('about');
});

app.get('/:customListName', (req, res) => {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err, foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name: customListName,
                    itemslist: defaultItems
                });
                list.save();
                res.redirect('/' + customListName);
            } else {
                res.render('list', {listTitle: foundList.name, newListItems: foundList.itemslist});
            }
        } else {    
            console.log(err);
        }

    });

    

});


app.post('/', (req, res) => {

    let itemword = req.body.item;
    let listName = req.body.list;

    const item = new Item({
        name: itemword
    });

    if(listName === date.getDate()){
        item.save();
        res.redirect('/');
    } else {
        List.findOne({name: listName}, function(err, foundList){
            foundList.itemslist.push(item);
            foundList.save();
            res.redirect('/' + listName);
        });
    }
    
});


app.post('/delete', (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === date.getDate()){
        Item.findByIdAndRemove(checkedItemId, function(err){
            if(!err){
                console.log('successfully deleted');
                res.redirect('/');
            } else {
                console.log(err);
            }
        });
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {itemslist: {_id: checkedItemId}}}, function(err, foundList){
            if(!err){
                res.redirect('/' + listName);
            } else {
                console.log(err);
            }
        });
    }
});



app.listen(3000, () => {
    console.log('Server started on port 3000');
});