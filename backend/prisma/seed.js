"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seeding...');
    // 1. Clean existing records in reverse dependency order
    await prisma.invoiceItem.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.salesChallanItem.deleteMany();
    await prisma.salesChallan.deleteMany();
    await prisma.stockMovement.deleteMany();
    await prisma.followUp.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
    console.log('🧹 Cleaned existing database tables.');
    // 2. Hash default password
    const hashedPassword = await bcryptjs_1.default.hash('Admin@123', 10);
    // 3. Create Demo Users for all 4 Roles
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@example.com',
            password: hashedPassword,
            fullName: 'System Administrator',
            role: client_1.Role.ADMIN,
            isActive: true,
        },
    });
    const salesUser = await prisma.user.create({
        data: {
            email: 'sales@example.com',
            password: hashedPassword,
            fullName: 'Vikram Sharma (Sales Lead)',
            role: client_1.Role.SALES,
            isActive: true,
        },
    });
    const warehouseUser = await prisma.user.create({
        data: {
            email: 'warehouse@example.com',
            password: hashedPassword,
            fullName: 'Rajesh Patil (Warehouse Mgr)',
            role: client_1.Role.WAREHOUSE,
            isActive: true,
        },
    });
    const accountsUser = await prisma.user.create({
        data: {
            email: 'accounts@example.com',
            password: hashedPassword,
            fullName: 'Sneha Deshmukh (Accountant)',
            role: client_1.Role.ACCOUNTS,
            isActive: true,
        },
    });
    console.log('✅ Created 4 demo users (ADMIN, SALES, WAREHOUSE, ACCOUNTS).');
    // 4. Create 10+ Realistic Customers
    const customerData = [
        {
            customerName: 'Apex Industrial Solutions',
            mobileNumber: '+91 9823011223',
            email: 'procurement@apexind.com',
            businessName: 'Apex Industrial Solutions Pvt Ltd',
            gstNumber: '27AAACA1234A1Z5',
            customerType: client_1.CustomerType.DISTRIBUTOR,
            address: 'Plot 45, Bhosari MIDC, Pune, MH - 411026',
            status: client_1.CustomerStatus.ACTIVE,
            notes: 'Key distributor for Western Maharashtra. Net 30 payment terms.',
            followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        },
        {
            customerName: 'Metro Hardware & Electricals',
            mobileNumber: '+91 9822044556',
            email: 'metrohardware.pune@gmail.com',
            businessName: 'Metro Hardware Stores',
            gstNumber: '27AABCM5678B1Z2',
            customerType: client_1.CustomerType.WHOLESALE,
            address: 'Shop 12, Raviwar Peth, Pune, MH - 411002',
            status: client_1.CustomerStatus.ACTIVE,
            notes: 'Weekly bulk orders of industrial tools and fasteners.',
            followUpDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        },
        {
            customerName: 'Shree Ganesh Enterprises',
            mobileNumber: '+91 9765432109',
            email: 'contact@shreeganeshent.in',
            businessName: 'Shree Ganesh Enterprises',
            gstNumber: '27AABCS9988C1Z0',
            customerType: client_1.CustomerType.DISTRIBUTOR,
            address: 'Sector 10, PCMC Industrial Area, Pune, MH - 411019',
            status: client_1.CustomerStatus.ACTIVE,
            notes: 'High volume packaging consumer.',
        },
        {
            customerName: 'Zenith Tech Innovations',
            mobileNumber: '+91 9123456780',
            email: 'info@zenithtech.io',
            businessName: 'Zenith Tech Solutions LLP',
            gstNumber: '27AAACZ3344D1Z9',
            customerType: client_1.CustomerType.RETAIL,
            address: 'Office 402, Hinjewadi Phase 1, Pune, MH - 411057',
            status: client_1.CustomerStatus.LEAD,
            notes: 'Interested in electronic test equipment and cabling.',
            followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        },
        {
            customerName: 'Prime Logistics & Warehousing',
            mobileNumber: '+91 9988776655',
            email: 'ops@primelogistics.co.in',
            businessName: 'Prime Logistics India Ltd',
            gstNumber: '27AAACP7766E1Z4',
            customerType: client_1.CustomerType.WHOLESALE,
            address: 'Chakan MIDC Phase 2, Pune, MH - 410501',
            status: client_1.CustomerStatus.ACTIVE,
            notes: 'Regular buyer of thermal rolls, barcodes, and strapping tape.',
        },
        {
            customerName: 'Kalyani Tools & Spares',
            mobileNumber: '+91 9422019283',
            email: 'kalyanitools@yahoo.co.in',
            businessName: 'Kalyani Spares Agency',
            gstNumber: '27AAACK1122F1Z8',
            customerType: client_1.CustomerType.WHOLESALE,
            address: 'Hadapsar Industrial Estate, Pune, MH - 411013',
            status: client_1.CustomerStatus.ACTIVE,
            notes: 'Looking for distributor pricing on power drills.',
        },
        {
            customerName: 'Nexus Retail Outlets',
            mobileNumber: '+91 9890123456',
            email: 'purchase@nexusretail.com',
            businessName: 'Nexus Commercial Hub',
            gstNumber: '27AAACN5566G1Z7',
            customerType: client_1.CustomerType.RETAIL,
            address: 'FC Road, Shivaji Nagar, Pune, MH - 411005',
            status: client_1.CustomerStatus.LEAD,
            notes: 'Demo scheduled next Tuesday for store fixtures.',
            followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
        {
            customerName: 'Omega Auto Component Makers',
            mobileNumber: '+91 9371089201',
            email: 'accounts@omegaauto.com',
            businessName: 'Omega Auto Components Pvt Ltd',
            gstNumber: '27AAACO8899H1Z6',
            customerType: client_1.CustomerType.DISTRIBUTOR,
            address: 'Talawade IT/Auto Park, Pune, MH - 411062',
            status: client_1.CustomerStatus.ACTIVE,
            notes: 'Tier 2 OEM supplier. Demands high precision inspection gauges.',
        },
        {
            customerName: 'Sai Samarth Electrical Works',
            mobileNumber: '+91 9850987654',
            email: 'saisamarth.elec@gmail.com',
            businessName: 'Sai Samarth Works',
            gstNumber: null,
            customerType: client_1.CustomerType.RETAIL,
            address: 'Kothrud Depot Road, Pune, MH - 411038',
            status: client_1.CustomerStatus.INACTIVE,
            notes: 'Account paused due to unverified tax details.',
        },
        {
            customerName: 'Vanguard Construction Supplies',
            mobileNumber: '+91 9604123890',
            email: 'vendor@vanguardbuild.com',
            businessName: 'Vanguard Infrastructure Ltd',
            gstNumber: '27AAACV9012J1Z3',
            customerType: client_1.CustomerType.WHOLESALE,
            address: 'Wakad Bridge Corner, Pune, MH - 411057',
            status: client_1.CustomerStatus.ACTIVE,
            notes: 'Orders safety gear and heavy duty extension cables.',
            followUpDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        },
    ];
    const createdCustomers = [];
    for (const cust of customerData) {
        const c = await prisma.customer.create({ data: cust });
        createdCustomers.push(c);
    }
    console.log(`✅ Created ${createdCustomers.length} realistic customers.`);
    // 5. Create Follow-Up Notes for CRM
    await prisma.followUp.createMany({
        data: [
            {
                customerId: createdCustomers[0].id,
                notes: 'Discussed Q3 bulk discount slab. Client requested 5% extra on pallet orders.',
                followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                status: client_1.FollowUpStatus.PENDING,
                createdById: salesUser.id,
            },
            {
                customerId: createdCustomers[1].id,
                notes: 'Confirmed dispatched challan items arrived safely.',
                followUpDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                status: client_1.FollowUpStatus.COMPLETED,
                createdById: salesUser.id,
            },
            {
                customerId: createdCustomers[3].id,
                notes: 'Introductory demo call conducted. Sent product catalog PDF.',
                followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
                status: client_1.FollowUpStatus.PENDING,
                createdById: salesUser.id,
            },
            {
                customerId: createdCustomers[6].id,
                notes: 'Scheduled on-site visit for store fixture measurements.',
                followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                status: client_1.FollowUpStatus.PENDING,
                createdById: salesUser.id,
            },
        ],
    });
    console.log('✅ Created CRM Follow-up timeline records.');
    // 6. Create 20+ Realistic Products
    const productData = [
        { productName: 'Industrial Digital Multimeter Pro', sku: 'ELEC-DMM-001', category: 'Electronics', unitPrice: 2450.00, currentStock: 45, minimumStock: 10, warehouseLocation: 'Aisle A, Rack 1' },
        { productName: 'Heavy Duty 750W Rotary Hammer Drill', sku: 'TOOL-RHD-002', category: 'Power Tools', unitPrice: 4890.00, currentStock: 18, minimumStock: 5, warehouseLocation: 'Aisle A, Rack 2' },
        { productName: 'High Voltage Insulated Wire Stripper 8"', sku: 'TOOL-STR-003', category: 'Hand Tools', unitPrice: 380.00, currentStock: 120, minimumStock: 20, warehouseLocation: 'Aisle B, Bin 04' },
        { productName: 'Laser Distance Meter 50M Range', sku: 'ELEC-LDM-004', category: 'Electronics', unitPrice: 1950.00, currentStock: 8, minimumStock: 10, warehouseLocation: 'Aisle A, Rack 3' }, // Low stock
        { productName: 'Corrugated Shipping Box 12x10x8 (Pack of 50)', sku: 'PKG-BOX-005', category: 'Packaging', unitPrice: 850.00, currentStock: 250, minimumStock: 50, warehouseLocation: 'Zone C, Pallet 01' },
        { productName: 'Stretch Wrap Film 500mm x 300m Roll', sku: 'PKG-STW-006', category: 'Packaging', unitPrice: 420.00, currentStock: 95, minimumStock: 25, warehouseLocation: 'Zone C, Pallet 02' },
        { productName: 'LED Floodlight 100W IP66 Waterproof', sku: 'ELEC-LED-007', category: 'Electricals', unitPrice: 1150.00, currentStock: 35, minimumStock: 10, warehouseLocation: 'Aisle B, Rack 1' },
        { productName: 'Copper Armoured Cable 3-Core 2.5sqmm (100m)', sku: 'CAB-COP-008', category: 'Electricals', unitPrice: 7200.00, currentStock: 14, minimumStock: 5, warehouseLocation: 'Aisle D, Drum 02' },
        { productName: 'Stainless Steel Hex Bolt M8x40 (Box of 100)', sku: 'FST-SSB-009', category: 'Hardware & Fasteners', unitPrice: 650.00, currentStock: 4, minimumStock: 15, warehouseLocation: 'Aisle E, Drawer 12' }, // Low stock
        { productName: 'Nylon Self-Locking Cable Ties 300mm (Pack 100)', sku: 'FST-NYT-010', category: 'Hardware & Fasteners', unitPrice: 120.00, currentStock: 400, minimumStock: 50, warehouseLocation: 'Aisle E, Drawer 05' },
        { productName: 'Industrial Safety Helmet with Ratchet (Yellow)', sku: 'SAF-HLM-011', category: 'Safety Equipment', unitPrice: 290.00, currentStock: 80, minimumStock: 20, warehouseLocation: 'Aisle F, Rack 1' },
        { productName: 'High Visibility Reflective Vest (Orange)', sku: 'SAF-VST-012', category: 'Safety Equipment', unitPrice: 160.00, currentStock: 150, minimumStock: 30, warehouseLocation: 'Aisle F, Rack 2' },
        { productName: 'Steel Toe Cap Safety Shoes Size 9', sku: 'SAF-SHO-013', category: 'Safety Equipment', unitPrice: 1350.00, currentStock: 3, minimumStock: 8, warehouseLocation: 'Aisle F, Rack 4' }, // Low stock
        { productName: 'Cordless Screwdriver Kit 12V Li-ion', sku: 'TOOL-SCD-014', category: 'Power Tools', unitPrice: 2199.00, currentStock: 22, minimumStock: 5, warehouseLocation: 'Aisle A, Rack 4' },
        { productName: 'Angle Grinder 4-Inch 850W', sku: 'TOOL-AGR-015', category: 'Power Tools', unitPrice: 2650.00, currentStock: 12, minimumStock: 5, warehouseLocation: 'Aisle A, Rack 5' },
        { productName: 'Heavy Duty Bench Vise 6-Inch', sku: 'TOOL-VIS-016', category: 'Hand Tools', unitPrice: 3400.00, currentStock: 6, minimumStock: 3, warehouseLocation: 'Aisle B, Floor 1' },
        { productName: 'BOPP Packaging Tape 2-Inch Brown (Pack of 6)', sku: 'PKG-TAP-017', category: 'Packaging', unitPrice: 270.00, currentStock: 180, minimumStock: 30, warehouseLocation: 'Zone C, Pallet 03' },
        { productName: 'Industrial Air Blower 600W Variable Speed', sku: 'TOOL-BLW-018', category: 'Power Tools', unitPrice: 1450.00, currentStock: 2, minimumStock: 6, warehouseLocation: 'Aisle A, Rack 6' }, // Low stock
        { productName: 'Vernier Caliper Digital 150mm Stainless', sku: 'TOOL-VCL-019', category: 'Hand Tools', unitPrice: 1100.00, currentStock: 25, minimumStock: 5, warehouseLocation: 'Aisle B, Drawer 01' },
        { productName: 'Cat6 UTP Solid LAN Cable 305m Roll', sku: 'CAB-LAN-020', category: 'Electricals', unitPrice: 5900.00, currentStock: 19, minimumStock: 5, warehouseLocation: 'Aisle D, Drum 05' },
        { productName: 'Soldering Station 60W Temperature Controlled', sku: 'ELEC-SLD-021', category: 'Electronics', unitPrice: 1850.00, currentStock: 16, minimumStock: 4, warehouseLocation: 'Aisle A, Rack 7' },
    ];
    const createdProducts = [];
    for (const prod of productData) {
        const p = await prisma.product.create({ data: prod });
        createdProducts.push(p);
        // Create Initial Stock IN movement record
        await prisma.stockMovement.create({
            data: {
                productId: p.id,
                quantity: p.currentStock,
                movementType: client_1.StockMovementType.IN,
                reason: 'INITIAL_STOCK_ONBOARDING',
                createdById: warehouseUser.id,
            },
        });
    }
    console.log(`✅ Created ${createdProducts.length} products with initial stock movements.`);
    // 7. Create Sales Challans (Draft and Confirmed)
    // Challan 1: Confirmed Challan
    const ch1Number = 'CH-2025-0001';
    const ch1Customer = createdCustomers[0]; // Apex Industrial Solutions
    const ch1Prod1 = createdProducts[0]; // DMM
    const ch1Prod2 = createdProducts[1]; // Hammer Drill
    const ch1Item1Total = Number(ch1Prod1.unitPrice) * 5;
    const ch1Item2Total = Number(ch1Prod2.unitPrice) * 2;
    const ch1GrandTotal = ch1Item1Total + ch1Item2Total;
    const challan1 = await prisma.salesChallan.create({
        data: {
            challanNumber: ch1Number,
            customerId: ch1Customer.id,
            totalQuantity: 7,
            totalAmount: ch1GrandTotal,
            status: client_1.ChallanStatus.CONFIRMED,
            notes: 'Urgent site delivery to Bhosari MIDC. Handed to Apex Logistics.',
            createdById: salesUser.id,
            confirmedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            items: {
                create: [
                    {
                        productId: ch1Prod1.id,
                        productNameSnapshot: ch1Prod1.productName,
                        skuSnapshot: ch1Prod1.sku,
                        unitPriceSnapshot: ch1Prod1.unitPrice,
                        quantity: 5,
                        totalPrice: ch1Item1Total,
                    },
                    {
                        productId: ch1Prod2.id,
                        productNameSnapshot: ch1Prod2.productName,
                        skuSnapshot: ch1Prod2.sku,
                        unitPriceSnapshot: ch1Prod2.unitPrice,
                        quantity: 2,
                        totalPrice: ch1Item2Total,
                    },
                ],
            },
        },
    });
    // OUT stock movements for confirmed challan 1
    await prisma.stockMovement.createMany({
        data: [
            {
                productId: ch1Prod1.id,
                quantity: 5,
                movementType: client_1.StockMovementType.OUT,
                reason: `SALES_CHALLAN_${ch1Number}`,
                referenceId: challan1.id,
                createdById: warehouseUser.id,
            },
            {
                productId: ch1Prod2.id,
                quantity: 2,
                movementType: client_1.StockMovementType.OUT,
                reason: `SALES_CHALLAN_${ch1Number}`,
                referenceId: challan1.id,
                createdById: warehouseUser.id,
            },
        ],
    });
    // Challan 2: Draft Challan
    const ch2Number = 'CH-2025-0002';
    const ch2Customer = createdCustomers[1]; // Metro Hardware
    const ch2Prod1 = createdProducts[4]; // Boxes
    const ch2Prod2 = createdProducts[5]; // Stretch Wrap
    const ch2Item1Total = Number(ch2Prod1.unitPrice) * 20;
    const ch2Item2Total = Number(ch2Prod2.unitPrice) * 10;
    const ch2GrandTotal = ch2Item1Total + ch2Item2Total;
    await prisma.salesChallan.create({
        data: {
            challanNumber: ch2Number,
            customerId: ch2Customer.id,
            totalQuantity: 30,
            totalAmount: ch2GrandTotal,
            status: client_1.ChallanStatus.DRAFT,
            notes: 'Draft awaiting final dispatch truck vehicle number.',
            createdById: salesUser.id,
            items: {
                create: [
                    {
                        productId: ch2Prod1.id,
                        productNameSnapshot: ch2Prod1.productName,
                        skuSnapshot: ch2Prod1.sku,
                        unitPriceSnapshot: ch2Prod1.unitPrice,
                        quantity: 20,
                        totalPrice: ch2Item1Total,
                    },
                    {
                        productId: ch2Prod2.id,
                        productNameSnapshot: ch2Prod2.productName,
                        skuSnapshot: ch2Prod2.sku,
                        unitPriceSnapshot: ch2Prod2.unitPrice,
                        quantity: 10,
                        totalPrice: ch2Item2Total,
                    },
                ],
            },
        },
    });
    // Challan 3: Confirmed Challan
    const ch3Number = 'CH-2025-0003';
    const ch3Customer = createdCustomers[7]; // Omega Auto Components
    const ch3Prod1 = createdProducts[10]; // Safety Helmet
    const ch3Prod2 = createdProducts[11]; // Reflective Vest
    const ch3Item1Total = Number(ch3Prod1.unitPrice) * 25;
    const ch3Item2Total = Number(ch3Prod2.unitPrice) * 25;
    const ch3GrandTotal = ch3Item1Total + ch3Item2Total;
    const challan3 = await prisma.salesChallan.create({
        data: {
            challanNumber: ch3Number,
            customerId: ch3Customer.id,
            totalQuantity: 50,
            totalAmount: ch3GrandTotal,
            status: client_1.ChallanStatus.CONFIRMED,
            notes: 'Monthly PPE safety supply batch for factory shop floor.',
            createdById: salesUser.id,
            confirmedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            items: {
                create: [
                    {
                        productId: ch3Prod1.id,
                        productNameSnapshot: ch3Prod1.productName,
                        skuSnapshot: ch3Prod1.sku,
                        unitPriceSnapshot: ch3Prod1.unitPrice,
                        quantity: 25,
                        totalPrice: ch3Item1Total,
                    },
                    {
                        productId: ch3Prod2.id,
                        productNameSnapshot: ch3Prod2.productName,
                        skuSnapshot: ch3Prod2.sku,
                        unitPriceSnapshot: ch3Prod2.unitPrice,
                        quantity: 25,
                        totalPrice: ch3Item2Total,
                    },
                ],
            },
        },
    });
    await prisma.stockMovement.createMany({
        data: [
            {
                productId: ch3Prod1.id,
                quantity: 25,
                movementType: client_1.StockMovementType.OUT,
                reason: `SALES_CHALLAN_${ch3Number}`,
                referenceId: challan3.id,
                createdById: warehouseUser.id,
            },
            {
                productId: ch3Prod2.id,
                quantity: 25,
                movementType: client_1.StockMovementType.OUT,
                reason: `SALES_CHALLAN_${ch3Number}`,
                referenceId: challan3.id,
                createdById: warehouseUser.id,
            },
        ],
    });
    console.log('✅ Created demo Sales Challans (Confirmed & Draft) with snapshot data.');
    console.log('🎉 Database seeding completed successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
