import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";
import {
  createCheckout, 
  importOrder 
} from "./functions.ts";

const app = new Application();
const router = new Router();

router.get("/", async (context) => {
  await send(context, context.request.url.pathname, {
    root: `${Deno.cwd()}/public`,
    index: "index.html",
  });
});

router.get("/success", async (context) => {
  let orderDetailsSection = "";
  const orderId = context.request.url.searchParams.get("orderId");

  if(orderId) {
    const orderInfo = await importOrder(orderId);
    let order = null;
    try {
      order = JSON.parse(orderInfo).order
    } catch (error) {
      console.log(error);
      console.log(orderInfo);
    }
    
    if(order) {
      orderDetailsSection = `
      <p>Order details:</p>
        <ul>
          <li>Order Number: ${order.orderId}</li>
          <li>Date: ${order.orderDate}</li>
          <li>Total Amount: ${order.grandTotal}</li>
        </ul>
    `;
    }
  }

  const body = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Order Confirmation</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            background-color: #F2F2F2;
          }
          h1 {
            font-size: 36px;
            margin-top: 50px;
            color: #333;
          }
          p {
            font-size: 18px;
            margin: 20px 0;
            color: #333;
          }
          ul {
            list-style: none;
            padding: 0;
            margin: 50px 0;
            text-align: left;
            background-color: #fff;
            box-shadow: 0px 0px 10px #ccc;
            width: 60%;
            margin-left: 20%;
            padding: 40px;
          }
          li {
            font-size: 18px;
            margin-bottom: 10px;
            color: #333;
          }
        </style>
      </head>
      <body>
        <h1>Order Confirmation</h1>
        <p>Your order has been successfully processed!</p>
        <p>Thank you for shopping with us.</p>
        ${orderDetailsSection}
      </body>
    </html>
  `;

  context.response.body = body;  
});

router.post("/api/createCheckout", async (context) => {
  const cart = await context.request.body().value;
  const url = await createCheckout(cart);
  context.response.body = { redirect: url };
});

app.use(router.routes());
app.use(router.allowedMethods());

console.log("Server running on http://localhost:8000");

await app.listen({ port: 8000 });