const PaymentGatewayProvider = require('./PaymentGatewayProvider');

/**
 * Scaffold only -- not activated by default and not wired to the Razorpay SDK.
 * The "plug-and-play" contract: once a Super Admin switches
 * PaymentGatewayConfig.activeProvider to RAZORPAY_ROUTE and adds real API
 * keys, only the method bodies below need real Razorpay SDK calls -- no
 * schema or controller changes required elsewhere, since every caller already
 * goes through the same PaymentGatewayProvider interface used by
 * ManualGatewayProvider today. Every method here throws rather than
 * fabricating a successful payment while unconfigured.
 */
class RazorpayRouteProvider extends PaymentGatewayProvider {
    constructor(config) {
        super();
        this.config = config;
    }

    #assertConfigured() {
        if (!this.config?.razorpayKeyId || !this.config?.razorpayKeySecret) {
            throw new Error('Razorpay Route is selected as the active payment gateway but no API keys have been configured yet. Add them under Super Admin > Settings > Payment Gateway.');
        }
    }

    async getPayoutDestination(_branchId) {
        this.#assertConfigured();
        // TODO: return the branch owner's linked Razorpay Route account (linked_account_id)
        throw new Error('Razorpay Route integration is not implemented yet.');
    }

    async confirmOwnerLeg(_context) {
        this.#assertConfigured();
        // TODO: this leg is confirmed automatically by the Razorpay transfer webhook, not a manual action
        throw new Error('Razorpay Route integration is not implemented yet.');
    }

    async confirmCommissionLeg(_context) {
        this.#assertConfigured();
        // TODO: this leg is confirmed automatically once the platform's own transfer settles
        throw new Error('Razorpay Route integration is not implemented yet.');
    }
}

module.exports = RazorpayRouteProvider;
