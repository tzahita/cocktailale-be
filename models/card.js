const Joi = require('@hapi/joi');
const mongoose = require('mongoose');
const _ = require('lodash');

const cardSchema = new mongoose.Schema({
  bizName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 255
  },
  bizDescription: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 1024
  },
  bizAddress: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 400
  },
  bizPhone: {
    type: String,
    required: true,
    minlength: 9,
    maxlength: 10
  },
  bizImage: {
    type: String,
    required: true,
    minlength: 11,
    maxlength: 1024
  },
  bizIngredients: {
    type: String,
    minlength: 2,
    maxlength: 255,
    required: true

  },
  bizNumber: {
    type: String,
    required: true, 
    minlength: 3,
    maxlength: 99999999999,
    unique: true
  },
  updatedAt: { type: Date, default: Date.now },
  popularity: {
    type: Number,
    maxlength: 99999999999,
  },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  user: {
    type: String,
    required: false,
    minlength: 2,
    maxlength: 255
  },
});

const Card = mongoose.model('Card', cardSchema);

function validateCard(card) {

  const schema = Joi.object({
    bizName: Joi.string().min(2).max(255).required(),
    bizDescription: Joi.string().min(2).max(1024).required(),
    bizAddress: Joi.string().min(2).max(400).required(),
    bizPhone: Joi.string().min(9).max(10).required().regex(/^0[2-9]\d{7,8}$/),
    bizIngredients: Joi.string().min(2).max(255).required(),
    bizImage: Joi.string().min(11).max(1024),
    popularity: Joi.number().max(99999999999),
    updatedAt:Joi.date()
  });

  return schema.validate(card);
}

const outputFN = (tag='p') => (str) => `<${tag}>${str}</${tag}>`;
const trimFN = (str='') => str.trim();


async function generateBizNumber(Card) {

  while (true) {
    let randomNumber = _.random(1000, 999999);
    let card = await Card.findOne({ bizNumber: randomNumber });
    if (!card) return String(randomNumber);
  }

}

exports.Card = Card;
exports.validateCard = validateCard;
exports.generateBizNumber = generateBizNumber;
exports.outputFN = outputFN;
exports.trimFN = trimFN;