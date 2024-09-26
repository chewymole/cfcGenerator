import { useGeneratorStore } from "../stores/generatorStore";

/*
[{id:fileName,content:`code content`,path:`dot notation path`}]

*/
export const addToCart = function (item) {
  const store = useGeneratorStore();
  const cart = store.getCart();
  if (item.id && item.content) {
    if (!getItem(item.id)) {
      cart.push(item);
      store.setCart(cart);
      return true;
    }
  }
  return false;
};

export const getItem = function (key) {
  const store = useGeneratorStore();
  const cart = store.getCart();
  let result = null;
  for (const item of cart) {
    if (item.id === key) {
      result = item;
      break;
    }
  }
  return result;
};

export const setItem = function (item) {
  const entry = getItem(item.id);
  entry.content = item.content;
  if (item.path) {
    entry.path = item.path;
  }
};

export const emptyCart = function () {
  const store = useGeneratorStore();
  store.setCart([]);
};
