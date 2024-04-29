const express = require('express');
const mysql = require('mysql');


const app = express();

const portNumber = 8080;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.set("views", "views");

//connect with database
const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'optichain'
})

con.connect((err) => {
    if (err) throw err;
    console.log("Database is connected");
})


app.get("/db", (req, res) => {
    const q = "select count(*) as count from products";
    con.query(q, (err, results) => {
        if (err) throw err;
        const count = results[0].count;
        console.log("Number of products are: " + results[0].count);
        //res.send("Number of students in the student table: " + results[0].count);
        res.render("home", { count: count });
    })
});

app.post("/register", (req, res) => {
    const { product_id, name, description, quantity, price } = req.body;

    // Construct an object with the product information
    const product_info = {
        product_id: product_id,
        name: name,
        description: description,
        quantity: quantity,
        price: price
    };

    const q = "insert into products set ?";
    con.query(q, product_info, (err, result) => {
        if (err) throw err;
        res.redirect("/db");
    })

})


app.get("/display", (req, res) => {
    const q = "select * from products";
    con.query(q, (err, result) => {
        if (err) throw err;
        //console.log(result);
        //res.send(result);
        res.render("showAll", { data: result });
    })
})


app.get("/search", (req, res) => {
    res.render("search");
})

app.post("/search", (req, res) => {
    const id = req.body.id;
    const q = "select * from products where product_id=? ";

    con.query(q, [id], (err, result) => {
        if (err) throw err;
        // if (result.length == 0) {
        //     res.send("No such student found");
        else {
            res.render("searchResult", { data: result[0], count: result.length });
        }
    })
})


// Route to render the delete page
app.get('/delete', (req, res) => {
    res.render('delete');
});

// Route to handle product deletion
app.post('/delete', (req, res) => {
    const productId = req.body.productId;
    const sql = 'DELETE FROM products WHERE product_id = ?';
    con.query(sql, [productId], (err, result) => {
        if (err) throw err;
        res.render('deleteResult');
    });
});


// Route handler to render the modify.ejs page
app.get("/modify", (req, res) => {
    res.render("modify"); // Render the modify.ejs view
});


// Route handler to handle form submission from modify.ejs
app.post("/modify", (req, res) => {
    // Extract data from the request body
    const product_id = req.body.product_id;
    const field = req.body.field;
    const new_value = req.body.new_value;

    // Define the SQL query based on the field selected for modification
    let q;
    switch (field) {
        case "name":
            q = "UPDATE products SET name = ? WHERE product_id = ?";
            break;
        case "description":
            q = "UPDATE products SET description = ? WHERE product_id = ?";
            break;
        case "price":
            q = "UPDATE products SET price = ? WHERE product_id = ?";
            break;
        case "quantity":
            q = "UPDATE products SET quantity = ? WHERE product_id = ?";
            break;
        default:
            return res.send("Invalid field selected for modification");
    }

    // Execute the SQL query to update the database
    con.query(q, [new_value, product_id], (err, result) => {
        if (err) throw err;
        console.log("Product updated successfully");
        res.redirect("/db"); // Redirect to the page displaying all products
    });
});



app.get("/", (req, res) => {
    res.send("The response is coming from express web server");
})

app.get("/hello", (req, res) => {
    console.log("The entered product name is: " + req.query.name);
    res.send("The entered product name is: " + req.query.name);
})

app.post("/hello", (req, res) => {
    console.log("The entered product name is: " + req.body.name);
    res.send("The entered product name is: " + req.body.name);
})

app.get("/test", (req, res) => {
    res.send("This is another test route");
})

app.listen(portNumber, () => {
    console.log("Server is listening at portNumber: " + portNumber);
})