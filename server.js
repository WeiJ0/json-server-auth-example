const fs = require("fs");
const jsonServer = require("json-server");
const auth = require("json-server-auth");

const app = jsonServer.create();
const router = jsonServer.router("db.json");

app.use(jsonServer.bodyParser);

app.db = router.db;

const rules = auth.rewriter({
  users: 600,
  carts: 660,
});

// 產品
app.post("/products/", (req, res, next) => {
  const { name, price, color } = req.body;

  if (!name || !price || !color) {
    res.status(401).json({ status: 401, message: "需輸入完整資訊" });
    return;
  }

  if (isNaN(Number(price))) {
    res.status(401).json({ status: 401, message: "價格欄位需為數字" });
    return;
  }

  next();
});

// 購物車
app.post("/carts/", (req, res, next) => {
  const { pid, count } = req.body;
  if (!pid) {
    res.status(401).json({ status: 401, message: "需輸入商品識別碼" });
    return;
  }

  if (count && isNaN(Number(price))) {
    res.status(401).json({ status: 401, message: "數量欄位需為數字" });
    return;
  }

  if (!count) req.body.count = 1;
  next();
});

app.patch("/carts/*", (req, res, next) => {
  const { pid, count } = req.body;
  console.log("hi");
  if (!pid || !count) {
    res.status(401).json({ status: 401, message: "需輸入商品識別碼及數量" });
    return;
  }
  next();
});

app.use(rules);
app.use(auth);
app.use(router);
app.listen(3033);
