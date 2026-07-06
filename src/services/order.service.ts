import { OrderMongoRepository } from "../repositories/order.repository";
import { ProductMongoRepository } from "../repositories/product.repository";
import { CreateOrderDto, UpdateOrderStatusDto } from "../dtos/order.dto";
import { IOrder } from "../models/order.model";
import { IProduct } from "../models/product.model";
import { HttpException } from "../exceptions/http_exception";

const orderRepository = new OrderMongoRepository();
const productRepository = new ProductMongoRepository();

export class OrderService {
    async createOrder(orderData: CreateOrderDto, userId: string): Promise<IOrder> {
        // Validate and calculate total
        let totalAmount = 0;
        const orderItems: any[] = [];

        for (const item of orderData.items) {
            const product = await productRepository.findById(item.productId);
            if (!product) {
                throw new HttpException(404, `Product with id ${item.productId} not found`);
            }

            if ((product as any).stock < item.quantity) {
                throw new HttpException(400, `Insufficient stock for product ${product.name}`);
            }

            const itemTotal = (product as any).price * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                productId: product._id,
                productName: product.name,
                productImage: product.image,
                price: (product as any).price,
                quantity: item.quantity,
                farmerId: (product as any).farmerId
            });

            // Update product stock
            await productRepository.updateStock(item.productId, item.quantity);
        }

        const orderToCreate: Partial<IOrder> = {
            userId,
            items: orderItems,
            totalAmount,
            status: 'pending',
            shippingAddress: orderData.shippingAddress,
            paymentMethod: orderData.paymentMethod,
            paymentStatus: 'pending'
        };

        const order = await orderRepository.create(orderToCreate);
        return order;
    }

    async getOrderById(id: string): Promise<IOrder> {
        const order = await orderRepository.findById(id);
        if (!order) {
            throw new HttpException(404, "Order not found");
        }
        return order;
    }

    async getUserOrders(userId: string, page: number = 1, limit: number = 10) {
        const result = await orderRepository.findWithPagination(page, limit, userId);
        return result;
    }

    async getFarmerOrders(farmerId: string): Promise<IOrder[]> {
        const orders = await orderRepository.findByFarmer(farmerId);
        return orders;
    }

    async updateOrderStatus(id: string, statusData: UpdateOrderStatusDto, farmerId: string): Promise<IOrder> {
        const order = await orderRepository.findById(id);
        if (!order) {
            throw new HttpException(404, "Order not found");
        }

        // Check if the order contains items from this farmer
        const hasFarmerItems = (order as any).items.some((item: any) => item.farmerId?.toString() === farmerId?.toString());
        if (!hasFarmerItems) {
            throw new HttpException(403, "You can only update orders containing your products");
        }

        const updatedOrder = await orderRepository.updateStatus(id, statusData.status, statusData.paymentStatus);
        if (!updatedOrder) {
            throw new HttpException(500, "Failed to update order status");
        }
        return updatedOrder;
    }

    async cancelOrder(id: string, userId: string): Promise<IOrder> {
        const order = await orderRepository.findById(id);
        if (!order) {
            throw new HttpException(404, "Order not found");
        }

        // Check if the order belongs to the user
        if ((order as any).userId?.toString() !== userId?.toString()) {
            throw new HttpException(403, "You can only cancel your own orders");
        }

        // Only allow cancellation if order is pending or confirmed
        if (!['pending', 'confirmed'].includes((order as any).status)) {
            throw new HttpException(400, "Cannot cancel order in current status");
        }

        // Restore product stock
        for (const item of (order as any).items) {
            await productRepository.updateStock(item.productId, -item.quantity); // Negative to add back stock
        }

        const updatedOrder = await orderRepository.updateStatus(id, 'cancelled');
        if (!updatedOrder) {
            throw new HttpException(500, "Failed to cancel order");
        }
        return updatedOrder;
    }
}
