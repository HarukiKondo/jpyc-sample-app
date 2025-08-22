export interface Product {
  id: string;
  name: string;
  price: number; // JPYC
  image: string;
  description: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  orderId: string;
  items: CartItem[];
  total: number;
  txHash?: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: 'approve-pay' | 'permit-pay';
} 