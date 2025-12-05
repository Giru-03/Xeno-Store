const { Customer, Order, Product, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getStats = async (req, res) => {
    try {
        const tenantId = req.user.id;
        const { startDate, endDate } = req.query;

        const dateFilter = {};
        if (startDate && endDate) {
            // Ensure we cover the full day in UTC
            const start = new Date(`${startDate}T00:00:00.000Z`);
            const end = new Date(`${endDate}T23:59:59.999Z`);

            dateFilter.createdAt = {
                [Op.between]: [start, end]
            };
        }

        const totalSales = await Order.sum('totalPrice', { where: { TenantId: tenantId, ...dateFilter } });
        const totalCustomers = await Customer.count({ where: { TenantId: tenantId, ...dateFilter } });
        const totalOrders = await Order.count({ where: { TenantId: tenantId, ...dateFilter } });
        const totalProducts = await Product.count({ where: { TenantId: tenantId } }); // Products usually don't filter by date created for stats, but can if needed. Keeping as is for inventory count.

        // Sales over time (daily)
        const salesOverTime = await Order.findAll({
            where: { TenantId: tenantId, ...dateFilter },
            attributes: [
                [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), 'date'],
                [sequelize.fn('sum', sequelize.col('totalPrice')), 'sales']
            ],
            group: ['date'],
            order: [['date', 'ASC']]
        });

        // Customer Growth (daily)
        const customerGrowth = await Customer.findAll({
            where: { TenantId: tenantId, ...dateFilter },
            attributes: [
                [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), 'date'],
                [sequelize.fn('count', sequelize.col('id')), 'count']
            ],
            group: ['date'],
            order: [['date', 'ASC']]
        });

        // Order Status Distribution
        const orderStatusData = await Order.findAll({
            where: { TenantId: tenantId, ...dateFilter },
            attributes: [
                'financialStatus',
                [sequelize.fn('count', sequelize.col('id')), 'count']
            ],
            group: ['financialStatus']
        });

        // Format order status to ensure count is a number and handle nulls
        const orderStatus = orderStatusData.map(item => ({
            financialStatus: item.financialStatus || 'Unknown',
            count: parseInt(item.getDataValue('count'), 10)
        }));

        // Top Spenders
        const topSpenders = await Customer.findAll({
            where: { TenantId: tenantId },
            order: [['totalSpent', 'DESC']],
            limit: 5,
            attributes: ['firstName', 'lastName', 'email', 'totalSpent']
        });

        res.json({
            totalSales: totalSales || 0,
            totalCustomers,
            totalOrders,
            totalProducts,
            salesOverTime,
            customerGrowth,
            orderStatus,
            topSpenders
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
