import pg from "pg";
import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "todolist",
  password: "9827171842",
  port: 5432,
});
db.connect();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId=1;

app.get("/",async (req,res)=>{
    const result=await db.query("SELECT * FROM users");
    const result1=await db.query("SELECT * FROM lists WHERE user_id=$1 ORDER BY p_num DESC ",[currentUserId]);
    // console.log(result.rows);
    // console.log(result1.rows);
    res.render("index.ejs",{
        listItems:result1.rows,
        users:result.rows,
        listTitle:result.rows[currentUserId-1].name+" 's TODO List",
        userId:currentUserId
    });
});

app.post("/user",async (req,res)=>{
    // console.log(req.body);
    const id=req.body.id;
    const add=req.body.add;
    if(add=="new"){
        res.render("new.ejs");
    }
    else{
    currentUserId=req.body.user;
    res.redirect("/");
    }
})

app.post("/new",async (req,res)=>{
    console.log(req.body);
    await db.query("INSERT INTO users (name,color) VALUES ($1,$2)",[req.body.name,req.body.color]);
    res.redirect("/");
});

app.post("/delete",async (req,res)=>{
    console.log(req.body.deleteItemId);
    try {
        await db.query("DELETE FROM lists WHERE id=$1",[req.body.deleteItemId]);
    } catch (error) {
        console.log(error);
    }
    res.redirect("/");
})
app.post("/edit",async (req,res)=>{
    console.log(req.body);
    let pnum;
    if(req.body.updatedPriority=="high"){
        pnum=3;
    }
    else if(req.body.updatedPriority=="low"){
        pnum=1;
    }
    else{
        pnum=2;
    }
    await db.query("UPDATE lists SET item_name=$1,priority=$2,p_num=$3 WHERE id=$4",[req.body.updatedItemTitle,req.body.updatedPriority,pnum,req.body.updatedItemId]);
    res.redirect("/");
})

app.post("/add",async (req,res)=>{
    console.log(req.body);
    let pnum;
    if(req.body.priority=="high"){
        pnum=3;
    }
    else if(req.body.priority=="low"){
        pnum=1;
    }
    else{
        pnum=2;
    }
    await db.query("INSERT INTO lists (item_name,user_id,priority,deadline,p_num) VALUES ($1,$2,$3,$4,$5)",[req.body.newItem,req.body.list,req.body.priority,req.body.deadline,pnum]);
    res.redirect("/");
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
  
