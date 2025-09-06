import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const supabase = await createClient()

    // Check if orders table exists
    let tableExists = false
    try {
      const { error } = await supabase.from('orders').select('id').limit(1)
      if (!error) {
        tableExists = true
      }
    } catch (err) {
      console.log('Orders table does not exist, will create it')
    }

    if (!tableExists) {
      // Create orders table
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id),
            product_id INTEGER,
            product_name TEXT NOT NULL,
            product_image TEXT,
            amount DECIMAL(10,2) NOT NULL,
            payment_method TEXT NOT NULL,
            transaction_id TEXT,
            status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          -- Enable RLS
          ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

          -- Create policy for users to see only their orders
          CREATE POLICY "Users can view their own orders" ON orders
            FOR SELECT USING (auth.uid() = user_id);

          -- Create policy for users to insert their own orders
          CREATE POLICY "Users can insert their own orders" ON orders
            FOR INSERT WITH CHECK (auth.uid() = user_id);

          -- Create indexes
          CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);
          CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);
        `
      })

      if (createError) {
        console.error('Error creating orders table:', createError)
        return NextResponse.json({
          success: false,
          error: 'Failed to create orders table: ' + createError.message
        }, { status: 500 })
      }
    }

    // Check if crypto_payments table has proper structure
    const { data: cryptoColumns, error: cryptoError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'crypto_payments'
        ORDER BY column_name;
      `
    })

    if (cryptoError) {
      console.error('Error checking crypto_payments structure:', cryptoError)
    }

    return NextResponse.json({
      success: true,
      message: tableExists ? 'Orders table already exists' : 'Orders table created successfully',
      crypto_payments_columns: cryptoColumns || []
    })

  } catch (error) {
    console.error('Error in ensure-orders-table:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    // Check orders table
    let ordersExists = false
    let ordersCount = 0
    try {
      const { data, error } = await supabase.from('orders').select('id', { count: 'exact', head: true })
      if (!error) {
        ordersExists = true
        ordersCount = data || 0
      }
    } catch (err) {
      console.log('Orders table check failed:', err)
    }

    // Check crypto_payments table
    let cryptoExists = false
    let cryptoCount = 0
    try {
      const { data, error } = await supabase.from('crypto_payments').select('id', { count: 'exact', head: true })
      if (!error) {
        cryptoExists = true
        cryptoCount = data || 0
      }
    } catch (err) {
      console.log('Crypto payments table check failed:', err)
    }

    return NextResponse.json({
      orders_table: {
        exists: ordersExists,
        count: ordersCount
      },
      crypto_payments_table: {
        exists: cryptoExists,
        count: cryptoCount
      }
    })

  } catch (error) {
    console.error('Error checking tables:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}