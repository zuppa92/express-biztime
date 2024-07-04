const request = require('supertest');
const app = require('../app');
const db = require('../db');

beforeEach(async () => {
  // Clear the table and reset the sequence
  await db.query("DELETE FROM invoices"); // if there's a dependency
  await db.query("DELETE FROM companies");
  
  // Insert the initial data
  await db.query(`
    INSERT INTO companies (code, name, description)
    VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
           ('ibm', 'IBM', 'Big blue.')
  `);
});

afterAll(async () => {
  await db.end();
});

describe("GET /companies", () => {
  test("It should respond with an array of companies", async () => {
    const response = await request(app).get('/companies');
    expect(response.body).toEqual({
      companies: [
        { code: 'apple', name: 'Apple Computer' },
        { code: 'ibm', name: 'IBM' }
      ]
    });
  });
});
