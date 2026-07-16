import { OrderService } from "../services/order.service";
import { z } from "zod";
import { CreateOrderDto, UpdateOrderStatusDto } from "../dtos/order.dto";
import { ApiResponseHelper } from "../utils/apihelper";
import { Request, Response } from "express";
import "../middlewares/authorized.middleware";

const orderService = new OrderService();

export class OrderController {
    async createOrder(req: Request, res: Response) {
        try {
            const orderData = CreateOrderDto.safeParse(req.body);
            if (!orderData.success) {
                return ApiResponseHelper
                    .error(res, z.prettifyError(orderData.error), 400);
            }

            if (!req.user) {
                return ApiResponseHelper.error(res, "User not authenticated", 401);
            }

            const order = await orderService.createOrder(orderData.data, req.user._id);
            return ApiResponseHelper.success(res, order, "Order created successfully", 201);
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async getOrderById(req: Request, res: Response) {
        try {
            if (!req.user) {
                return ApiResponseHelper.error(res, "User not authenticated", 401);
            }

            const { id } = req.params;
            const order = await orderService.getOrderById(id);
            
            // Check if user is the order owner or a farmer with items in the order
            const isOwner = (order as any).userId?.toString() === req.user!._id?.toString();
            const hasFarmerItems = (order as any).items?.some((item: any) => item.farmerId?.toString() === req.user!._id?.toString());
            
            if (!isOwner && !hasFarmerItems && req.user!.role !== 'admin') {
                return ApiResponseHelper.error(res, "You don't have permission to view this order", 403);
            }
            
            return ApiResponseHelper.success(res, order, "Order fetched successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async getUserOrders(req: Request, res: Response) {
        try {
            if (!req.user) {
                return ApiResponseHelper.error(res, "User not authenticated", 401);
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const result = await orderService.getUserOrders(req.user._id, page, limit);
            const response = {
                orders: result.orders,
                meta: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: result.totalPages
                }
            };
            return ApiResponseHelper.success(res, response, "User orders fetched successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async getFarmerOrders(req: Request, res: Response) {
        try {
            if (!req.user) {
                return ApiResponseHelper.error(res, "User not authenticated", 401);
            }

            if (req.user.role !== 'farmer') {
                return ApiResponseHelper.error(res, "Only farmers can view their orders", 403);
            }

            const orders = await orderService.getFarmerOrders(req.user._id);
            return ApiResponseHelper.success(res, orders, "Farmer orders fetched successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async updateOrderStatus(req: Request, res: Response) {
        try {
            if (!req.user) {
                return ApiResponseHelper.error(res, "User not authenticated", 401);
            }

            if (req.user.role !== 'farmer') {
                return ApiResponseHelper.error(res, "Only farmers can update order status", 403);
            }

            const { id } = req.params;
            const statusData = UpdateOrderStatusDto.safeParse(req.body);
            if (!statusData.success) {
                return ApiResponseHelper
                    .error(res, z.prettifyError(statusData.error), 400);
            }

            const updatedOrder = await orderService.updateOrderStatus(id, statusData.data, req.user._id);
            return ApiResponseHelper.success(res, updatedOrder, "Order status updated successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async cancelOrder(req: Request, res: Response) {
        try {
            if (!req.user) {
                return ApiResponseHelper.error(res, "User not authenticated", 401);
            }

            const { id } = req.params;
            const cancelledOrder = await orderService.cancelOrder(id, req.user._id);
            return ApiResponseHelper.success(res, cancelledOrder, "Order cancelled successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }
}
