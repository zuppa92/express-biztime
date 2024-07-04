// routes/invoices.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const ExpressError = require('../expressError');

// GET /invoices
router.get('/', async (req, res, next) => {
  try {
    const result = await db.query('SELECT id, comp_code FROM invoices');
    return res.json({ invoices: result.rows });
  } catch (err) {
    return next(err);
  }
});

// GET /invoices/[id]
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT i.id, 
              i.amt, 
              i.paid, 
              i.add_date, 
              i.paid_date, 
              c.code, 
              c.name, 
              c.description
       FROM invoices AS i
         INNER JOIN companies AS c ON (i.comp_code = c.code)
       WHERE i.id = $1`, [id]);

    if (result.rows.length === 0) {
      throw new ExpressError(`Invoice not found: ${id}`, 404);
    }

    const data = result.rows[0];
    const invoice = {
      id: data.id,
      amt: data.amt,
      paid: data.paid,
      add_date: data.add_date,
      paid_date: data.paid_date,
      company: {
        code: data.code,
        name: data.name,
        description: data.description
      }
    };

    return res.json({ invoice });
  } catch (err) {
    return next(err);
  }
});

// POST /invoices
router.post('/', async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt) 
       VALUES ($1, $2) 
       RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [comp_code, amt]
    );

    return res.status(201).json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// PUT /invoices/[id]
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amt, paid } = req.body;

    let paidDate = null;
    if (paid) {
      paidDate = new Date();
    }

    const result = await db.query(
      `UPDATE invoices 
       SET amt=$1, paid=$2, paid_date=$3 
       WHERE id=$4 
       RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [amt, paid, paidDate, id]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`Invoice not found: ${id}`, 404);
    }

    return res.json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// DELETE /invoices/[id]
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'DELETE FROM invoices WHERE id=$1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`Invoice not found: ${id}`, 404);
    }

    return res.json({ status: 'deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
