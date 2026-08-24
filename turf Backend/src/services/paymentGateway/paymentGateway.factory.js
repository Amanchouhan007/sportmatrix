const prisma = require('../../config/prisma');
const ManualGatewayProvider = require('./ManualGatewayProvider');
const RazorpayRouteProvider = require('./RazorpayRouteProvider');

const GATEWAY_CONFIG_ID = 'global_gateway';

async function getGatewayConfig() {
    let config = await prisma.paymentGatewayConfig.findUnique({ where: { id: GATEWAY_CONFIG_ID } });
    if (!config) {
        config = await prisma.paymentGatewayConfig.create({ data: { id: GATEWAY_CONFIG_ID } });
    }
    return config;
}

/** Returns the currently-active PaymentGatewayProvider instance. Manual (no live gateway) unless a Super Admin has switched it. */
async function getActiveProvider() {
    const config = await getGatewayConfig();
    switch (config.activeProvider) {
        case 'RAZORPAY_ROUTE':
            return new RazorpayRouteProvider(config);
        case 'MANUAL':
        default:
            return new ManualGatewayProvider();
    }
}

module.exports = { getGatewayConfig, getActiveProvider, GATEWAY_CONFIG_ID };
