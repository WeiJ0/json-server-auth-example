const PORT = 3033;
const jsonServer = require("json-server");
const auth = require("json-server-auth");

const server = jsonServer.create();
const router = jsonServer.router("db.json");

server.use(jsonServer.bodyParser);
server.db = router.db;

const rules = auth.rewriter({
  users: 600,
  "/api/*": "/$1",
  "/products/all": "/products/",
  "/products/:category": "/products?category=:category",
  "/carts/*": "/640/carts/",
  "/orders/*": "/640/orders/",
  "/pay/:orderid": "/640/orders/:orderid",
});

// 產品
server.post("/api/products/", (req, res, next) => {
  const { name, price, category } = req.body;

  // 新增時檢查欄位
  if (!name || !price || !category) {
    res.json({ success: false, message: "需輸入完整資訊" });
    return;
  }

  if (isNaN(Number(price))) {
    res.json({ success: false, message: "價格欄位需為數字" });
    return;
  }
  next();
});

server.post("/api/carts/", (req, res, next) => {
  const { product_id, qty } = req.body;
  if (!product_id) {
    res.json({ success: false, message: "需輸入商品識別碼" });
    return;
  }

  if (qty && isNaN(Number(qty))) {
    res.json({ success: false, message: "數量欄位需為數字" });
    return;
  }

  if (!qty) req.body.qty = 1;
  next();
});
// 訂單
server.post("/api/orders/", (req, res, next) => {
  const { userId, total, paid } = req.body;

  const { db } = req.app;
  // 取出目前登入 User 購物車資料
  const carts = db
    .get("carts")
    .value()
    .filter((item) => item.userId === req.claims.sub);

  // 若購物車內無項目則返回訊息
  if (carts.length == 0) {
    res.json({ success: false, message: "購物車無項目可成立訂單" });
    return;
  }

  // 取出目前登入 User 購物車資料取出中的 ProductID
  const cartsProductIDs = Array.from(
    new Set(carts.map((item) => item.product_id))
  );

  // 取出在購物車中的商品資料
  const products = db
    .get("products")
    .value()
    .filter((item) => cartsProductIDs.includes(item.id));

  let calcTotal = 0;

  // 取得商品價格
  const getProductsPrice = (product_id) =>
    products.find((item) => item.id === parseInt(product_id)).price || 0;

  // Total 計算
  carts.forEach((item) => {
    calcTotal +=
      parseInt(getProductsPrice(item.product_id)) * parseInt(item.qty);

    let product = products.find((product) => product.id == item.product_id);
    product.qty = item.qty;
  });

  if (calcTotal == 0) {
    res.json({ success: false, message: "訂單總金額為 0，無法成立訂單" });
    return;
  }

  // 移除 carts 項目
  carts
    .map((item) => item.id)
    .forEach((id) => {
      db.get("carts").removeById(id).value();
    });

  req.body.detail = products;
  req.body.total = calcTotal;
  req.body.paid = false;

  next();
});
// 付款
server.put("/api/pay/*", (req, res, next) => {
  const { db } = req.app;
  const path = req.url;
  const [, mod, resource, id] = path.split("/");

  if (!id) {
    res.json({ success: false, message: "需要輸入訂單 id" });
    return;
  }

  let orderData = db
    .get("orders")
    .value()
    .find((item) => item.id == id);

  if (!orderData) {
    res.json({ success: false, message: "未找到該筆訂單" });
    return;
  }

  if (orderData.paid) {
    res.json({ success: false, message: "該筆訂單已付款" });
    return;
  }

  req.body.userId = orderData.userId;
  req.body.detail = orderData.detail;
  req.body.total = orderData.total;
  req.body.paid = true;

  next();
});

server.use(rules);
server.use(auth);
server.use(router);

router.render = (req, res) => {
  // GET 購物車只列出登入的 User 的
  if (req.url == "/carts/" && req.method == "GET") {
    console.log(req.claims);
    res.locals.data = res.locals.data.filter(
      (item) => item.userId == req.claims.sub
    );
  }

  // GET 訂單只列出登入的 User 的
  if (req.url == "/orders/" && req.method == "GET") {
    res.locals.data = res.locals.data.filter(
      (item) => item.userId == req.claims.sub
    );
  }

  // 自定義輸出結果，除原本的物件外多一個屬性 success
  res.json({
    success: true,
    message: res.locals.data,
  });
};

server.listen(PORT, () => {
  console.log(`json-server-auth is running at http://localhost:${PORT} ~`);
});
