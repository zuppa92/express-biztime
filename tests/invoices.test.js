const request = require('supertest');
const app = require('../app');
const db = require('../db');

describe('PUT /invoices/:id', () => {
  let invoiceId;

  beforeEach(async () => {
    await db.query("DELETE FROM invoices");
    await db.query("SELECT setval('invoices_id_seq', 1, false)");
    
    const result = await db.query(`
      INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date)
      VALUES ('apple', 100, false, '2023-01-01', null)
      RETURNING id
    `);
    invoiceId = result.rows[0].id;
  });

  afterAll(async () => {
    await db.end();
  });

  test('It should update an invoice and set paid_date when paid is true', async () => {
    const response = await request(app)
      .put(`/invoices/${invoiceId}`)
      .send({
        amt: 500,
        paid: true
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.invoice).toHaveProperty('id');
    expect(response.body.invoice.paid).toBe(true);
    expect(new Date(response.body.invoice.paid_date)).toBeInstanceOf(Date);
  });

  test('It should update an invoice and set paid_date to null when paid is false', async () => {
    await db.query(`
      UPDATE invoices
      SET paid = true, paid_date = '2023-01-01'
      WHERE id = $1
    `, [invoiceId]);

    const response = await request(app)
      .put(`/invoices/${invoiceId}`)
      .send({
        amt: 500,
        paid: false
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.invoice).toHaveProperty('id');
    expect(response.body.invoice.paid).toBe(false);
    expect(response.body.invoice.paid_date).toBe(null);
  });

  test('It should return 404 for non-existing invoice', async () => {
    const response = await request(app)
      .put(`/invoices/9999`)
      .send({
        amt: 500,
        paid: true
      });

    expect(response.statusCode).toBe(404);
  });
});
