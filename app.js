//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const lodash = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-jalagam:jalagam@cluster0-doaih.mongodb.net/todoList", {useNewUrlParser:true});


var itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item ({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Add your own items using + button."
});

const item3 = new Item({
  name: "Use checkbox to delete item."
});

const defaultItems = [item1,item2,item3];

const listSchema = new mongoose.Schema({
  name:String,
  items:[itemsSchema]
});

const List = mongoose.model("list",listSchema);


app.get("/", function(req, res) {

   Item.find(function(err,founditems){
    if(founditems.length ===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("succesfully saved items to database");
        }
      });
      res.redirect("/");
    } else{
      res.render("list", {listTitle: "Today", newListItems: founditems});
      }
    });
});


app.get("/:customListName",function(req, res){
  const customListName = lodash.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundList){
      if(!err){
        if(!foundList){
          const list = new List({
            name:customListName,
            items: defaultItems
          });
          list.save();
          res.redirect("/"+customListName);
        } else{
          res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        }
      }
  });
});



app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const itemnew = new Item({
    name:itemName
  });

  if(listName === "Today"){
  itemnew.save();
  res.redirect("/");
  } else {
      List.findOne({name:listName},function(err,foundList){
      foundList.items.push(itemnew);
      foundList.save();
      res.redirect("/"+listName);
      });
    }
});

app.post("/delete",function(req,res){

const checkedItemId = req.body.checkbox;
const listName = req.body.listName;

if(listName==="Today"){
  Item.findByIdAndRemove(checkedItemId,function(err){
    if(!err){
        console.log("succesfully checked");
        res.redirect("/");
        }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }
});


app.get("/about", function(req, res){
  res.render("about");
});



 app.post("/deleteall", function(req, res){

   const listName = req.body.deletebutton;

    if(listName==="Today"){
      Item.deleteMany({}, function (err) {
      if (!err) {
      res.redirect("/");
      }
    });
    }
    else{
      List.deleteMany({ name: listName}, function (err) {
        if (!err) {
          res.redirect("/");
        }
      });
    }
  });



let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started succesfully");
});
