import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { Product } from "../services/productService";

import {
  getCartItems,
  addToCartApi,
  updateCartItemApi,
  removeFromCartApi,
  clearCartApi,
} from "../../api/cartApi";

export interface CartItem {
  product: Product;
  quantity: number;
  cartItemId: number;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (productId: number) => boolean;
  loading: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const totalItems = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const loadCart = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setItems([]);
      return;
    }

    try {
      setLoading(true);

      const response = await getCartItems();

      const cartItems = response?.carts || [];

      const formattedItems: CartItem[] = cartItems.map(
        (item: any) => ({
          cartItemId: Number(item.cartItemId),
          quantity: Number(item.quantity),

          product: {
            id: Number(item.productId),
            name: item.name,
            price: Number(
              item.discount_price ?? item.price
            ),
            originalPrice:
              item.discount_price != null
                ? Number(item.price)
                : undefined,
            description: item.description ?? "",
            image: item.image ?? "",
            category: item.category ?? "",
            stock: Number(item.stock ?? 0),
            rating: Number(item.rating ?? 0),
            reviewCount: Number(item.reviewCount ?? 0),
          } as Product,
        })
      );

      setItems(formattedItems);
    } catch (error) {
      console.error("Failed to load cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const addToCart = async (
    product: Product,
    quantity = 1
  ) => {
    try {
      setLoading(true);

      await addToCartApi(product.id, quantity);

      await loadCart();
    } catch (error) {
      console.error(
        "Failed to add product to cart:",
        error
      );

      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (
    cartItemId: number
  ) => {
    try {
      setLoading(true);

      await removeFromCartApi(cartItemId);

      await loadCart();
    } catch (error) {
      console.error(
        "Failed to remove product:",
        error
      );

      throw error;
    } finally {
      setLoading(false);
    }
  };
const updateQuantity = async (
  cartItemId: number,
  quantity: number
) => {
  try {
    setLoading(true);

    if (quantity <= 0) {
      await removeFromCartApi(cartItemId);
    } else {
      await updateCartItemApi(cartItemId, quantity);
    }

    await loadCart();

  } catch (error) {
    console.error("Failed to update cart:", error);
    throw error;
  } finally {
    setLoading(false);
  }
};
  const clearCart = async () => {
    try {
      setLoading(true);

      await clearCartApi();

      setItems([]);
    } catch (error) {
      console.error(
        "Failed to clear cart:",
        error
      );

      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isInCart = (productId: number) =>
    items.some(
      (item) => item.product.id === productId
    );

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used within CartProvider"
    );
  }

  return context;
}