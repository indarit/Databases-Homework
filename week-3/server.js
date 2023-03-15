const express = require("express");
const app = express();
const { Pool } = require("pg");
const pool = new Pool({
  user: "postgres",
  password: "postgres",
  host: "localhost",
  database: "cyf_ecommerce",
  port: 5432,
});
const listAllProducts =
  "select products.product_name , suppliers.supplier_name " +
  "from products join suppliers on products.supplier_id = suppliers.id";
const listProductsByName =
  "select products.product_name, suppliers.supplier_name " +
  " from products join suppliers on products.supplier_id = suppliers.id " +
  " where products.product_name like $1";
app.get("/customers", (req, res) => {
  pool.query("select * from customers", (error, result) => {
    res.json(result.rows);
  });
});
app.get("/products", function (req, res) {
  let productNameLike = req.query.productName;
  if (!productNameLike) {
    // Client is not sending any name
    pool.query(listAllProducts, (error, result) => {
      if (error) {
        console.error(e);
        res.send("Error al buscar productos");
      } else {
        res.json(result.rows);
      }
    });
  } else {
    pool
      .query(listProductsByName, ["%" + productNameLike + "%"])
      .then((result) => {
        res.json(result.rows);
      })
      .catch((e) => {
        console.error(e);
        res.send("Error al buscar productos pro nombre");
      });
  }
});
app.listen(3000, function () {
  console.log("Server is listening on port 3000. Ready to accept requests!");
});
const customersById = "select * from customers where id = $1";
app.get("/customers/:customersId", (req, res) => {
  let customersId = req.params.customersId;
  if (!customersId) {
    pool.query("select * from customers", (error, result) => {
      res.json(result.rows);
    });
  } else {
    pool.query(customersById, [customersId], (error, result) => {
      res.json(result.rows);
    });
  }
});

// Add a new POST endpoint /products to create a new product (with a product name, a price and a supplier id).
// Check that the price is a positive integer and that the supplier ID exists in the database, otherwise return an error.
// Steps:
//   Define the SQL INSERT
//   Create a new POST endpoint for /products
//   Read name, unitPrice and supplierId
//     Optional -> Validate that price is a positive number
//   Execute the Insert
const createNewProduct =
  "INSERT INTO products (product_name, unit_price, supplier_id) VALUES ($1,$2,$3)";
app.post("/products", (req, res) => {
  let newProductName = req.body.productName;
  let newProductUnitPrice = req.body.unitPrice;
  let newProductSupplierId = req.body.supplierId;

  // TODO Validar que el supplierId existe

  // TODO Validar que el nombre de producto no existe

  if (isNaN(newProductUnitPrice) || newProductUnitPrice < 0) {
    res.send("el precio debe ser numerico y mayor a 0");
  } else {
    pool.query(
      createNewProduct,
      [newProductName, newProductUnitPrice, newProductSupplierId],
      (error, result) => {
        if (error) {
          console.log(error);
        } else {
          res.json("producto creado");
        }
      }
    );
  }
});
// Add a new POST endpoint /products to create a new product (with a product name, a price and a supplier id).
// Check that the price is a positive integer and that the supplier ID exists in the database, otherwise return an error.
// Steps:
//   Define the SQL INSERT
//   Create a new POST endpoint for /products
//   Read name, unitPrice and supplierId
//     Optional -> Validate that price is a positive number
//   Execute the Insert
const createNewProduct =
  "INSERT INTO products (product_name, unit_price, supplier_id) VALUES ($1,$2,$3)";
app.post("/products", (req, res) => {
  let newProductName = req.body.productName;
  let newProductUnitPrice = req.body.unitPrice;
  let newProductSupplierId = req.body.supplierId;

  // TODO Validar que el supplierId existe

  // TODO Validar que el nombre de producto no existe

  if (isNaN(newProductUnitPrice) || newProductUnitPrice < 0) {
    res.send("el precio debe ser numerico y mayor a 0");
  } else {
    pool.query(
      createNewProduct,
      [newProductName, newProductUnitPrice, newProductSupplierId],
      (error, result) => {
        if (error) {
          console.log(error);
        } else {
          res.json("producto creado");
        }
      }
    );
  }
});
const createNewOrder =
  "insert into orders(order_date, order_reference, customer_id) values ($1, $2, $3)";
app.post("/customers/:customerId/orders", (req, res) => {
  // req
  //   query -> Acceso a los campos definidos despues del ? (query string)
  //   params -> Acceso a los valores definidos en la URL del endpoint
  //   body -> Acceso al JSON que llega en el body para POST y PUT

  let customerId = req.params.customerId;
  let orderDate = req.body.orderDate;
  let orderReference = req.body.orderReference;

  // TODO Validar que el orderReference es unico

  pool.query(customersById, [customerId]).then((result) => {
    if (result.rows.length > 0) {
      pool
        .query(createNewOrder, [orderDate, orderReference, customerId])
        .then((result) => res.send("Pedido creado!"))
        .catch((error) => {
          console.error(error);
          res.send("Error al crear el pedido");
        });
    } else {
      res.send(`Customer with id ${customerId} does not exist`);
    }
  });
});

let deleteCustomer = "delete from customers where id = $1";
let checkOrdersForCustomer = "select * from orders where customer_id = $1";

app.delete("/customers/:customerId", (req, res) => {
  let customerId = req.params.customerId;

  pool.query(checkOrdersForCustomer, [customerId]).then((result) => {
    if (result.rows.length === 0) {
      pool
        .query(deleteCustomer, [customerId])
        .then((result) => res.send("Customer eliminado"))
        .catch((error) => {
          console.error(error);
          res.send("Error al eliminar el customer");
        });
    } else {
      res.send("No se puede eliminar el customer porque tiene pedidos");
    }
  });
});
