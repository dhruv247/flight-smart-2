import Discount from '../models/discount.model.js';

const createDiscount = async (req, res) => {
  try {
    const { discountType, discountStyle, discountFor, discountValue } = req.body;

    if (!discountType || !discountStyle || !discountFor || !discountValue) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const discount = await Discount.create({ discountType, discountStyle, discountFor, discountValue });

    res.status(201).json(discount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDiscounts = async (req, res) => {
  try {

    const discountType = req.query.discountType;
    
    const discounts = await Discount.find({ discountType });

    res.status(200).json(discounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { createDiscount, getDiscounts };