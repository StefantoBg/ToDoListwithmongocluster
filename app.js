
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const e = require("express");
const date = require(__dirname + "/date.js");
const _ = require("lodash");
const app = express();
mongoose.set('strictQuery', true);
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-stefanobg:steve1@todolist.1jth2cc.mongodb.net/todolistDB", {useNewUrlParser: true});
 
const itemSchema =  new mongoose.Schema(
  {
    name: String
  }
);

const Item = mongoose.model("Item", itemSchema);

const item1 =new Item({
  name: "Welcome to todo list!"
}); 

const item2 =new Item({
  name: "Hit the + button to add a new item."
}); 

const item3 =new Item({
  name: "Click on checkbox to delete an item."
}); 

const defaultItems = [item1, item2, item3];
const listSchema = {
  name: String,
  items: [itemSchema]
};
const List = mongoose.model("List", listSchema);

const day = date.getDay();

app.get("/", function(req, res) {
// Item.insertMany(defaultItems);
Item.find({}, function(err,foundItems){
    
    if (foundItems.length === 0 ){
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully savevd default items to DB.");
        }
      });
      res.redirect("/");
    } else {

      res.render("list", {listTitle: "Today" , newListItems: foundItems})
      
    };

});


  

});
app.post("/delete",function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    console.log(checkedItemId)
    if (listName === "Today"){
      Item.findByIdAndRemove(checkedItemId, function(err){
         
        if (!err){
          console.log("Item Deleted");
          res.redirect("/");
        }
        });
    
    } else {
       List.findOneAndUpdate({name: listName}, {$pull:{items: {_id: checkedItemId}}},function(err,foundList){
        if (!err){
          res.redirect("/" + listName   );
        }
      });
    }
    });
  

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const itemList = req.body.list;

  
  const item = new Item({
    name: itemName
  });

  if(itemList == "Today"){
  item.save();
  res.redirect("/");}
  else{
    List.findOne({name: itemList} , function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + itemList);
    })
  }
});

app.get("/:customList", function(req,res){
  var customList =_.capitalize(req.params.customList);
  List.findOne({name: customList}, function(err, foundList){
   if(!err){
    if(!foundList){
      
      const list = new List({
        name: customList,
        items: defaultItems
       });
       list.save();
           res.redirect("/"+customList)
          }else {
      
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items} )
    }
   }
  })
  

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
