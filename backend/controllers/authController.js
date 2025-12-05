const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Tenant, Account } = require('../models');

exports.login = async (req, res) => {
    const { email, password, shopifyDomain } = req.body;
    try {
        // 1. Find Account by Email
        const account = await Account.findOne({ 
            where: { email },
            include: [{ model: Tenant }] // Join with Tenant to get shop details
        });

        if (!account) return res.status(401).json({ error: 'Invalid credentials' });

        // 2. Verify Password
        const valid = await bcrypt.compare(password, account.password);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        // 3. Verify Shop Domain (Security Check)
        if (shopifyDomain && account.Tenant.shopifyDomain !== shopifyDomain) {
            return res.status(401).json({ error: 'Invalid Shop Domain for this user' });
        }

        // 4. Generate Token
        const token = jwt.sign({ id: account.Tenant.id, email: account.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, shopName: account.Tenant.shopName });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.register = async (req, res) => {
    const { shopifyDomain, accessToken, email, password, shopName } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Transaction to ensure both Tenant and Account are created
        const result = await Tenant.sequelize.transaction(async (t) => {
            const tenant = await Tenant.create({
                shopifyDomain,
                accessToken,
                shopName
            }, { transaction: t });

            const account = await Account.create({
                email,
                password: hashedPassword,
                TenantId: tenant.id
            }, { transaction: t });

            return tenant;
        });

        res.json({ message: 'Tenant and Account created', id: result.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
