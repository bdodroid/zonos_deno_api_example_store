import { Zonos, ZonosCart, ZonosCartItem } from "https://deno.land/x/zonos_api/mod.ts";

const zonos = new Zonos({
  account_number: "",
  api_key: "",
  apiVersion: 1,
});

export async function importOrder(orderId: string): Promise<string> {
  // get order details from Zonos
  const order = await zonos.getOrder(orderId);

  /*
    Add your own logic here to import the order into your system
  */

  // return the order details to the success page to display to the customer.
  return JSON.stringify(order);
}

export async function createCheckout(cart: any) {
  // parse the cart items into the expected Zonos format
  const items: ZonosCartItem[] = parseCart(cart);
  const zonosCart: ZonosCart = {
    items,
    externalConfirmationPageURL: "", // if no externalConfirmationPageURL is provided, the customer will be redirected to the Zonos default confirmation page
  };

  // create a checkout and get the redirect URL
  const checkout = await zonos.createCheckout(zonosCart);
    
  return checkout.redirectUrl;
}

function parseCart(cart: any): ZonosCartItem[] {
  if (cart?.length) {
    return cart.map((item: any) => {
      return {
        description: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        weight: item.weight,
      };
    });
  }

  return [];
}