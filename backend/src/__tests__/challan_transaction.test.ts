import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Role } from '@prisma/client';

describe('Sales Challan & Atomic Stock Transaction Test Suite', () => {
  let adminToken: string;
  let adminUserId: string;

  beforeAll(async () => {
    // Check if test admin exists or create one
    let user = await prisma.user.findFirst({ where: { email: 'admin@example.com' } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'admin_test@example.com',
          password: 'hashed_password_mock',
          fullName: 'Test Admin',
          role: Role.ADMIN,
        },
      });
    }

    adminUserId = user.id;
    adminToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET, {
      expiresIn: '1h',
    });
  });

  it('Strict Multi-Product Stock Transaction: Insufficient stock rolls back ALL deductions', async () => {
    // 1. Create Customer
    const customer = await prisma.customer.create({
      data: {
        customerName: 'Transaction Test Customer',
        businessName: 'Transaction Test Inc',
        mobileNumber: '+91 9999900001',
        customerType: 'WHOLESALE',
        address: 'Test Warehouse Lane',
      },
    });

    // 2. Create Product A with 10 stock and Product B with 5 stock
    const skuA = `SKU-A-${Date.now()}`;
    const skuB = `SKU-B-${Date.now()}`;

    const prodA = await prisma.product.create({
      data: {
        productName: 'Product Alpha Test',
        sku: skuA,
        category: 'Testing',
        unitPrice: 100,
        currentStock: 10,
        minimumStock: 2,
      },
    });

    const prodB = await prisma.product.create({
      data: {
        productName: 'Product Beta Test',
        sku: skuB,
        category: 'Testing',
        unitPrice: 200,
        currentStock: 5,
        minimumStock: 2,
      },
    });

    // 3. Create Draft Challan requesting: Product A = 5 units, Product B = 10 units (Exceeds Prod B stock)
    const challanRes = await request(app)
      .post('/api/challans')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        customerId: customer.id,
        items: [
          { productId: prodA.id, quantity: 5 },
          { productId: prodB.id, quantity: 10 },
        ],
      });

    expect(challanRes.status).toBe(201);
    expect(challanRes.body.success).toBe(true);
    const challanId = challanRes.body.data.id;
    expect(challanRes.body.data.status).toBe('DRAFT');

    // 4. Attempt to CONFIRM the challan -> Should FAIL because Product B only has 5 available
    const confirmRes = await request(app)
      .post(`/api/challans/${challanId}/confirm`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(confirmRes.status).toBe(400);
    expect(confirmRes.body.success).toBe(false);
    expect(confirmRes.body.message).toContain('Insufficient stock');

    // 5. CRITICAL VERIFICATION: Verify database transaction rollback
    // Product A stock MUST NOT be reduced (remains 10)
    // Product B stock MUST NOT be reduced (remains 5)
    // Challan MUST NOT be CONFIRMED (remains DRAFT)
    const freshProdA = await prisma.product.findUnique({ where: { id: prodA.id } });
    const freshProdB = await prisma.product.findUnique({ where: { id: prodB.id } });
    const freshChallan = await prisma.salesChallan.findUnique({ where: { id: challanId } });

    expect(freshProdA?.currentStock).toBe(10);
    expect(freshProdB?.currentStock).toBe(5);
    expect(freshChallan?.status).toBe('DRAFT');

    // Clean up test records
    await prisma.salesChallanItem.deleteMany({ where: { challanId } });
    await prisma.salesChallan.delete({ where: { id: challanId } });
    await prisma.customer.delete({ where: { id: customer.id } });
    await prisma.product.deleteMany({ where: { id: { in: [prodA.id, prodB.id] } } });
  });

  it('Stock OUT cannot make inventory negative', async () => {
    const skuTest = `SKU-NEG-${Date.now()}`;
    const prod = await prisma.product.create({
      data: {
        productName: 'Negative Stock Test SKU',
        sku: skuTest,
        category: 'Testing',
        unitPrice: 50,
        currentStock: 3,
        minimumStock: 1,
      },
    });

    const res = await request(app)
      .post('/api/inventory/stock-out')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        productId: prod.id,
        quantity: 5, // Exceeds currentStock 3
        reason: 'Attempted overdraft',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Insufficient stock');

    const fresh = await prisma.product.findUnique({ where: { id: prod.id } });
    expect(fresh?.currentStock).toBe(3);

    await prisma.product.delete({ where: { id: prod.id } });
  });
});
