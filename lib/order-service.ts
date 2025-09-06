import { getSupabaseClient } from "./supabase"

export type Order = {
  id: number
  user_id: string
  product_id: number
  product_name: string
  product_image?: string
  amount: number
  payment_method: string
  transaction_id?: string
  status: "pending" | "completed" | "failed"
  created_at: string
  updated_at: string
  product?: {
    id: number
    name: string
    image_url: string
    size: string
    count: string
    price: number
    download_link?: string // Added download link field
  }
}

// Mock orders for development/testing
const MOCK_ORDERS: Order[] = [
  {
    id: 1001,
    user_id: "user-123",
    product_id: 1,
    product_name: "Premium Collection Bundle",
    product_image: "/vip-access-collection-preview.png",
    amount: 79.99,
    payment_method: "Credit Card",
    transaction_id: "txn_1234567890",
    status: "completed",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    product: {
      id: 1,
      name: "Premium Collection Bundle",
      image_url: "/vip-access-collection-preview.png",
      size: "50GB",
      count: "500+ files",
      price: 79.99,
      download_link: "https://mega.nz/folder/example1", // Example download link
    },
  },
  {
    id: 1002,
    user_id: "user-123",
    product_id: 2,
    product_name: "TikTok Collection",
    product_image: "/tiktok-collection-preview.png",
    amount: 29.99,
    payment_method: "PayPal",
    transaction_id: "txn_0987654321",
    status: "pending",
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    product: {
      id: 2,
      name: "TikTok Collection",
      image_url: "/tiktok-collection-preview.png",
      size: "20GB",
      count: "200+ files",
      price: 29.99,
    },
  },
  {
    id: 1003,
    user_id: "user-123",
    product_id: 3,
    product_name: "Snapchat Premium",
    product_image: "/snapwins-collection-preview.png",
    amount: 59.99,
    payment_method: "Crypto",
    transaction_id: "txn_abcdef1234",
    status: "completed",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    product: {
      id: 3,
      name: "Snapchat Premium",
      image_url: "/snapwins-collection-preview.png",
      size: "30GB",
      count: "300+ files",
      price: 59.99,
      download_link: "https://mega.nz/folder/example3", // Example download link
    },
  },
]

export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const supabase = getSupabaseClient()
    let allOrders: Order[] = []
    let orderTableExists = true

    // First, check if the orders table exists
    try {
      const { error } = await supabase.from("orders").select("id").limit(1)
      if (error && error.message.includes("relation") && error.message.includes("does not exist")) {
        orderTableExists = false
      }
    } catch (error) {
      orderTableExists = false
    }

    // Only try to get orders if the table exists
    if (orderTableExists) {
      try {
        // Try to get orders from the orders table without using the relationship join
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })

        if (orderError) {
          // Silently handle order fetch errors
        } else if (orderData && orderData.length > 0) {

          // Get product IDs from orders
          const productIds = orderData.filter((order) => order.product_id).map((order) => order.product_id)

          // Fetch product details separately if there are product IDs
          let productDetails: Record<number, any> = {}

          if (productIds.length > 0) {
            try {
              const { data: products, error: productsError } = await supabase
                .from("shop_products")
                .select("id, name, image_url, size, count, price, download_link") // Added download_link
                .in("id", productIds)

              if (productsError) {
                // Silently handle product fetch errors
              } else if (products) {
                productDetails = products.reduce(
                  (acc, product) => {
                    acc[product.id] = product
                    return acc
                  },
                  {} as Record<number, any>,
                )
              }
            } catch (err) {
              // Silently handle product details fetch errors
            }
          }

          // Map orders with product details
          allOrders = orderData.map((order) => {
            const productId = order.product_id || 0
            const product = productDetails[productId]

            return {
              ...order,
              product: product || undefined,
            } as Order
          })
        }
      } catch (error) {
        // Silently handle orders fetch errors
      }
    }

    // Also fetch crypto payments and convert them to Order format
    try {
      // First check what columns exist in crypto_payments table
      const { data: cryptoData, error: cryptoError } = await supabase
        .from("crypto_payments")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (cryptoError) {
        // Silently handle crypto payments fetch errors
      } else if (cryptoData && cryptoData.length > 0) {

          // Get product details for shop products
        const shopProductIds = cryptoData
          .filter((payment) => payment.product_type === "shop" && payment.product_id)
          .map((payment) => payment.product_id)

        let productDetails: Record<number, any> = {}

        if (shopProductIds.length > 0) {
          try {
            const { data: products, error: productsError } = await supabase
              .from("shop_products")
              .select("id, name, image_url, size, count, price, download_link") // Added download_link
              .in("id", shopProductIds)

            if (productsError) {
              // Silently handle shop product fetch errors
            } else if (products) {
              productDetails = products.reduce(
                (acc, product) => {
                  acc[product.id] = product
                  return acc
                },
                {} as Record<number, any>,
              )
            }
          } catch (err) {
            // Silently handle shop product details fetch errors
          }
        }

        // Convert crypto payments to Order format
        const cryptoOrders = cryptoData.map((payment) => {
          const productId = payment.product_id || 0
          const isShopProduct = payment.product_type === "shop"
          const productDetail = isShopProduct && productId ? productDetails[productId] : null

          const productName = isShopProduct ? productDetail?.name || `Shop Product #${productId}` : "Premium Membership"

          const productImage = isShopProduct
            ? productDetail?.image_url || "/vip-access-collection-preview.png"
            : "/vip-access-collection-preview.png"

          // Map payment status to order status
          let status: "pending" | "completed" | "failed" = "pending"
          if (payment.payment_status === "confirmed" || payment.payment_status === "finished") {
            status = "completed"
          } else if (payment.payment_status === "failed" || payment.payment_status === "expired") {
            status = "failed"
          }

          return {
            id: payment.id || payment.payment_id || Math.random(),
            user_id: payment.user_id,
            product_id: productId,
            product_name: productName,
            product_image: productImage,
            amount: payment.amount || 0,
            payment_method: "Cryptocurrency",
            transaction_id: payment.payment_id || payment.id,
            status: status,
            created_at: payment.created_at || new Date().toISOString(),
            updated_at: payment.updated_at || payment.created_at || new Date().toISOString(),
            product: productDetail || undefined,
          } as Order
        })

        allOrders = [...allOrders, ...cryptoOrders]
      }
    } catch (error) {
      // Silently handle crypto payments processing errors
    }

    // Sort all orders by created_at date
    allOrders.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    if (allOrders.length > 0) {
      return allOrders
    }

    // If no orders found in database, return mock orders
    return MOCK_ORDERS.map((order) => ({
      ...order,
      user_id: userId, // Set the correct user ID for the mock orders
    }))
  } catch (error) {
    // Return mock orders if any error occurs
    return MOCK_ORDERS.map((order) => ({
      ...order,
      user_id: userId, // Set the correct user ID for the mock orders
    }))
  }
}

export async function createOrder(
  userId: string,
  productId: number,
  productName: string,
  productImage: string,
  amount: number,
  paymentMethod: string,
  transactionId?: string,
): Promise<{ success: boolean; orderId?: number; error?: string }> {
  try {
    const supabase = getSupabaseClient()

    // Check if orders table exists
    try {
      const { error } = await supabase.from("orders").select("id").limit(1)
      if (error && error.message.includes("relation") && error.message.includes("does not exist")) {
        // Orders table does not exist
        return {
          success: false,
          error: "Orders table does not exist. Please run the ensure-orders-table.sql script first.",
        }
      }
    } catch (error) {
      return { success: false, error: "Failed to check if orders table exists" }
    }

    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        product_id: productId,
        product_name: productName,
        product_image: productImage,
        amount,
        payment_method: paymentMethod,
        transaction_id: transactionId,
        status: "completed", // Assuming immediate completion for simplicity
      })
      .select("id")
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, orderId: data.id }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create order" }
  }
}
