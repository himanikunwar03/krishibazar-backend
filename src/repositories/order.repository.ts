export {};
import OrderModel from "../models/order.model";
const Order = OrderModel;
import { IOrder } from "../models/order.model";

export interface IOrderRepository {
    findById(id: string): Promise<IOrder | null>;
    findByUser(userId: string): Promise<IOrder[]>;
    findByFarmer(farmerId: string): Promise<IOrder[]>;
    create(order: Partial<IOrder>): Promise<IOrder>;
    update(id: string, order: Partial<IOrder>): Promise<IOrder | null>;
    updateStatus(id: string, status: string, paymentStatus?: string): Promise<IOrder | null>;
    findWithPagination(page: number, limit: number, userId?: string): Promise<{ orders: IOrder[], total: number, page: number, limit: number, totalPages: number }>;
}

export class OrderMongoRepository implements IOrderRepository {
    async findById(id: string): Promise<IOrder | null> {
        const foundOrder = await Order.findById(id);
        return foundOrder;
    }

    async findByUser(userId: string): Promise<IOrder[]> {
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });
        return orders;
    }

    async findByFarmer(farmerId: string): Promise<IOrder[]> {
        const orders = await Order.find({ 'items.farmerId': farmerId }).sort({ createdAt: -1 });
        return orders;
    }

    async create(order: Partial<IOrder>): Promise<IOrder> {
        const createdOrder = await Order.create(order);
        return createdOrder;
    }

    async update(id: string, order: Partial<IOrder>): Promise<IOrder | null> {
        const updatedOrder = await Order.findByIdAndUpdate(id, order, { returnDocument: 'after' });
        return updatedOrder;
    }

    async updateStatus(id: string, status: string, paymentStatus?: string): Promise<IOrder | null> {
        const updateData: any = { status };
        if (paymentStatus) {
            updateData.paymentStatus = paymentStatus;
        }
        const updatedOrder = await Order.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });
        return updatedOrder;
    }

    async findWithPagination(page: number = 1, limit: number = 10, userId?: string): Promise<{ orders: IOrder[], total: number, page: number, limit: number, totalPages: number }> {
        const skip = (page - 1) * limit;
        let query: any = {};

        if (userId) {
            query.userId = userId;
        }

        const orders = await Order.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Order.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        return {
            orders,
            total,
            page,
            limit,
            totalPages
        };
    }
}
