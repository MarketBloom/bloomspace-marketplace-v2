import { toast } from "@/hooks/use-toast";

interface SendEmailParams {
  to: string[];
  subject: string;
  html: string;
}

// This will be implemented later with Resend
export const sendEmail = async ({ to, subject, html }: SendEmailParams) => {
  console.log('Email sending will be implemented later:', { to, subject, html });
};

export const showSuccessToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    duration: 5000,
  });
};

export const showErrorToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: "destructive",
    duration: 5000,
  });
};

// Common notification templates
export const getOrderConfirmationEmail = (orderDetails: any) => ({
  subject: "Your Lovable Flowers Order Confirmation",
  html: `
    <h1>Thank you for your order!</h1>
    <p>Your order has been confirmed and is being prepared by our talented florist.</p>
    <h2>Order Details:</h2>
    <p>Order ID: ${orderDetails.id}</p>
    <p>Total Amount: $${orderDetails.total_amount}</p>
    <p>Delivery Address: ${orderDetails.delivery_address}</p>
    <p>Delivery Time: ${new Date(orderDetails.delivery_time).toLocaleString()}</p>
  `
});

export const getFloristOrderNotificationEmail = (orderDetails: any) => ({
  subject: "New Order Received",
  html: `
    <h1>You have a new order!</h1>
    <p>A new order has been placed and requires your attention.</p>
    <h2>Order Details:</h2>
    <p>Order ID: ${orderDetails.id}</p>
    <p>Total Amount: $${orderDetails.total_amount}</p>
    <p>Delivery Address: ${orderDetails.delivery_address}</p>
    <p>Delivery Time: ${new Date(orderDetails.delivery_time).toLocaleString()}</p>
  `
});