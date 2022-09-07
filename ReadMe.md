# 六角 js 直播班用 json-server-auth Fake API

## 參考說明

[json-server](https://weij0.github.io/Web/docs/tags/json-server)

## 安裝方式

```js
npm install

npm start

// 成功訊息
// json-server-auth is running at http://localhost:3033 ~
```

## PORT 設定

```js
//server.js:1
const PORT: {port}
```

## 預設 API 說明

<h3 id="Member">會員</h3>

#### 註冊

```js
-POST /signup/

// Request
{
    "email" : 必填，[唯一值],
    "password": 必填,
    // ... 其他可自訂欄位
}

// Responese
{
    "accessToken": Bearer Token,
    "user": {
        "email": email,
        // ... 若有其他欄位一並回傳
        "id": 系統產生 id，之後的 userId
    }
}
```

#### 登入

```js
-POST /login/

// Request
{
    "email" : 必填，唯一值,
    "password": 必填,
}

// Responese
{
    "accessToken": Bearer Token,
    "user": {
        "email": email,
        "id": 系統產生 id，之後的 userId
    }
}
```

#### 修改會員資料

```js
-PATCH /users/{userId}
Header Authorization: Bearer {Token}

// Request
{
    // 欲修改欄位....
    "name": "new Name"
}

// Responese
 {
    "email": email,
    "password": password,
    "id": userId
    // ... 其他自定義欄位
}
```

#### 刪除會員資料 (無法恢復)

```js
-DELETE /users/{userId}
Header Authorization: Bearer {Token}

// Responese
{}
```

####

---

<h3 id="Product">商品</h3>

#### 商品全部列表

```js
-GET /api/products/all

// Responese
[
    {
        "name": "使用 HTML、CSS 開發一個網站",
        "price": 1200,
        "category": "html",
        "platform": [
            "Udemy, Teachable"
        ],
        "id": 1
    },
    {
        "name": "使用 jQuery 打造互動性網頁動畫效果",
        "price": 1300,
        "category": "js",
        "platform": [
            "Udemy, Teachable"
        ],
        "id": 2
    },
    // ....
]

```

#### 商品某分類列表

```js
-GET /api/products/category/{:category}
-GET /api/products/category/html

// Response
[
    {
        "name": "使用 HTML、CSS 開發一個網站",
        "price": 1200,
        "category": "html",
        "platform": [
            "Udemy, Teachable"
        ],
        "id": 1
    }
]
```

#### 新增商品

```js
-POST /api/admin/products/
Header Authorization: Bearer {Token}

// Request
{
    "name": name,
    "price": price,
    "category": category,
    // ... 可自訂義欄位
}

// Response
{
    "success": true,
    "message": {
        "name": name,
        "price": price,
        "category": category,
        // ... 可自訂義欄位
        "id": 系統自動產生
    }
}
```

#### 修改商品

```js
-PATCH /api/admin/products/{productId}
Header Authorization: Bearer {Token}

// Request
{
    "name": name,
    "price": price,
    "category": category,
    // ... 可自訂義欄位
}

// Response
{
    "name": name,
    "price": price,
    "category": category,
    "platform": Platform,
    // ... 可自訂義欄位
    "id": 系統自動產生
}
```

#### 刪除商品

```js
-DELETE /api/admin/products/{productId}
Header Authorization: Bearer {Token}

// Response
{
    "success": true,
    "message": {}
}
```

####

---

<h3 id="Product">購物車</h3>

#### 取得購物車列表

```js
-GET /api/carts/
Header Authorization: Bearer {Token}
[備註] 原應列出所有 carts 資料，但於 server.js :118 做自定義輸出，只產出該 Token User 的項目
// Response
{
    "success": true,
    "message":[
       {
            "id": 2,
            "productId": 3,
            "qty": 2,
            "userId": 3
        },
    ]
}
```

#### 新增購物車項目

```js
-POST /api/carts/
Header Authorization: Bearer {Token}

// Request
{
    "productId": 商品 id 必填,
    "userId": userId 必填,
    "qty": 數量 (沒有填則為 1)
}

// Response
{
    "success": true,
    "message": {
        "name": name,
        "price": price,
        "category": category,
        "platform": Platform,
        // ... 可自訂義欄位
        "id": 系統自動產生
    }
}
```

#### 修改購物車項目

```js
-PATCH /api/carts/{:itemId}
Header Authorization: Bearer {Token}

// Request
{
    "productId": 商品 id 必填,
    "qty": 數量 必填
}

// Response
{
    "success": true,
    "message": {
        "productId": 商品id,
        "userId": userId,
        "qty:" 數量,
        "id": 系統自動產生
    }
}
```

#### 刪除購物車項目

```js
-DELETE /api/carts/{:itemId}
Header Authorization: Bearer {Token}

// Response
{
    "success": true,
    "message": {}
}
```
####

---

<h3 id="Product">訂單</h3>

#### 取得訂單列表
```js
-GET /api/orders/
Header Authorization: Bearer {Token}
[備註] 原應列出所有 orders 資料，但於 server.js :126 做自定義輸出，只產出該 Token User 的項目
// Response
{
    "success": true,
    "message":[
       {
            "id": 2,
            "productId": 3,
            "qty": 2,
            "userId": 3
        },
    ]
}
```

#### 新增訂單
```js
-POST /api/orders/
Header Authorization: Bearer {Token}
[備註] 會在 carts 資料集中計算該 userId 的 product 總額，產生訂單後移除 carts 資料集 //server.js :54
// Request
{
    "userId": {userId}
}
// Response
{
    "success": true,
    "message": {
        "userId": {userId},
        "detail": {購物車項目資訊},
        //{
        //  "name" : 商品名稱,
        //  "price" : 價格,
        //  "category" : 商品分類,
        //  "id" : 商品 id,
        //  "qty" : 購買數量,
        //}
        "total": {計算購物車總計},
        "paid": 是否付款 預設為 false,
        "id": 系統自動產生
    }
}
```

#### 訂單付款
```js
-PUT /api/pay/{:orderId}
Header Authorization: Bearer {Token}
// Response
{
    "success": true,
    "message": {
        "userId": {userId},
        "detail": {購物車項目資訊},
        //{
        //  "name" : 商品名稱,
        //  "price" : 價格,
        //  "category" : 商品分類,
        //  "id" : 商品 id,
        //  "qty" : 購買數量,
        //}
        "total": {計算購物車總計},
        "paid": 是否付款 預設為 false,
        "id": 系統自動產生
    }
}
```
