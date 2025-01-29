import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const quantity = parseInt(searchParams.get('quantity') || '0', 10);

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    if (isNaN(quantity) || quantity < 1) {
      return NextResponse.json(
        { error: 'Valid quantity is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get current inventory level
    const { data: product, error } = await supabase
      .from('products')
      .select('inventory_level, min_inventory_level')
      .eq('id', productId)
      .single();

    if (error) {
      console.error('Error checking inventory:', error);
      return NextResponse.json(
        { error: 'Failed to check inventory' },
        { status: 500 }
      );
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if requested quantity is available
    const availableQuantity = product.inventory_level - product.min_inventory_level;
    
    if (availableQuantity < quantity) {
      return NextResponse.json(
        { 
          error: 'Insufficient inventory',
          availableQuantity 
        },
        { status: 409 }
      );
    }

    return NextResponse.json({ 
      success: true,
      availableQuantity
    });

  } catch (error) {
    console.error('Inventory check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 