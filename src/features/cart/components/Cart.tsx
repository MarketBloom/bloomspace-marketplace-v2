// Fetch cart items with product details
const { data: cartItems } = await supabase
  .from('cart_items')
  .select(`
    quantity,
    products (
      id,
      title,
      price,
      images
    )
  `)
  .eq('user_id', user?.id) 