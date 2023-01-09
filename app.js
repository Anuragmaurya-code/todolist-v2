//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose =require("mongoose");
const app = express();
const _ =require("lodash");
require('dotenv').config();
URL=process.env.URL_MONGODB;
mongoose.set('strictQuery', false);
mongoose.connect(URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemSchema= new mongoose.Schema({//defining schema
  name:String
});

const Item=mongoose.model("item",itemSchema);

const listSchema=new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  items:[itemSchema]
});

const List=mongoose.model("List",listSchema);

const l1=new Item({
  name:"Brush Teeth"
});
const l2=new Item({
  name:"Bath"
});
const l3=new Item({
  name:"Eat Food"
});

const defaultItems=[l1,l2,l3];

 


app.get("/", function(req, res) {
  Item.find({},function(err,docs){
    if(docs.length === 0)
    {
      Item.insertMany([l1,l2,l3],function(e){
        if(e)
          console.log(e);
        else
          console.log("Inserted Successfully");
      });
      res.redirect("/");   
    }
    else 
    res.render("list", {listTitle: "Today", newListItems: docs});
    
  });
});

app.post("/", function(req, res){
  const listname=req.body.list;
  console.log(listname);
  const item = new Item({
    name:req.body.newItem
  });
  if(listname==='Today')
  {
    item.save();
    res.redirect("/");  
  }
  else{
    List.findOne({name:listname},function(e,docs){
      if(!e)
      {
        docs.items.push(item);
        docs.save();
        res.redirect("/"+listname);
      }
    });
  }
});

app.post("/delete",function(req,res){
  const idVal=req.body.checkbox;
  const listName=req.body.listname;
  if(listName==='Today')
  { 
    Item.findByIdAndDelete(idVal,function(err){
      if(!err)
      {
        console.log("Succusfully deleted");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:idVal}}},function(err,result) {
      if(!err)
      {
        res.redirect("/"+listName);
      }
    });
  } 
  
});

app.get("/:customListName", function(req,res){//express dynamic routing
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list=new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else
      res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
    }
  });
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});