#!/bin/bash

echo "Starting cleanup and reorganization..."

# 1. Create new feature directories if they don't exist
mkdir -p src/features/florist/{components,hooks,utils}
mkdir -p src/features/orders/{components,hooks,utils}
mkdir -p src/features/delivery/{components,hooks,utils}
mkdir -p src/features/cart/{components,hooks,utils}
mkdir -p src/features/products/{components,hooks,utils}
mkdir -p src/features/home/{components,hooks,utils}
mkdir -p src/features/search/{components,hooks,utils}

# 2. Move florist-related components
mv src/components/FloristCard.tsx src/features/florist/components/
mv src/components/florist-card/* src/features/florist/components/

# 3. Move cart-related components
mv src/components/Cart.tsx src/features/cart/components/
mv src/components/cart/* src/features/cart/components/
mv src/components/AddToCartButton.tsx src/features/cart/components/

# 4. Move product-related components
mv src/components/ProductCard.tsx src/features/products/components/
mv src/components/product/* src/features/products/components/
mv src/components/product-detail/* src/features/products/components/

# 5. Move search and filter components
mv src/components/FilterBar.tsx src/features/search/components/
mv src/components/LocationFilter.tsx src/features/search/components/
mv src/components/HomeFilterBar.tsx src/features/search/components/
mv src/components/filters/* src/features/search/components/
mv src/components/home-filters/* src/features/search/components/

# 6. Move home page components
mv src/components/Hero.tsx src/features/home/components/
mv src/components/HowItWorks.tsx src/features/home/components/
mv src/components/Testimonials.tsx src/features/home/components/
mv src/components/TrustSection.tsx src/features/home/components/
mv src/components/Categories.tsx src/features/home/components/
mv src/components/FeaturedProducts.tsx src/features/home/components/
mv src/components/MobileHero.tsx src/features/home/components/
mv src/components/MobileHeroImage.tsx src/features/home/components/
mv src/components/MobileHowItWorks.tsx src/features/home/components/

# 7. Move order-related components
mv src/components/order/* src/features/orders/components/
mv src/pages/dashboard/OrderManagement.tsx src/features/orders/components/
mv src/components/dashboard/RecentOrders.tsx src/features/orders/components/

# 8. Move delivery-related components
mv src/components/store-management/DeliverySlotConfig.tsx src/features/delivery/components/
mv src/components/forms/DeliverySettingsForm.tsx src/features/delivery/components/

# 9. Move hooks to feature-specific locations
mv src/hooks/useFlorist.ts src/features/florist/hooks/
mv src/hooks/useOrders.ts src/features/orders/hooks/
mv src/hooks/useDeliveryZone.ts src/features/delivery/hooks/

# 10. Clean up empty directories
rm -rf src/components/florist-card
rm -rf src/components/cart
rm -rf src/components/product
rm -rf src/components/product-detail
rm -rf src/components/filters
rm -rf src/components/home-filters
rm -rf src/components/florist
rm -rf src/components/florist-dashboard
rm -rf src/components/florist-application
rm -rf src/components/order

echo "Cleanup complete! 🎉" 