const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const { User, validate, validateCards } = require('../models/user');
const { Card } = require('../models/card');
const auth = require('../middleware/auth');
const router = express.Router();

const getCards = async (cardsArray) => {
  const cards = await Card.find({ "bizNumber": { $in: cardsArray } });
  return cards;
};

router.get('/cards', auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.send(user.cards);
});

router.put('/cards/:id', auth, async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, _id: req.user._id });
  const card = await Card.find({ _id: req.params.id });
  console.log(card[0].popularity)
  const found =  user.cards.find(element => element === req.params.id)
  if(!found){
  user.cards.push(req.params.id)
  card[0].popularity++; 
  }
  else{
    user.cards = user.cards.filter(element => element !== req.params.id);
    card[0].popularity--;
  }
  let updatedUser = await User.findOneAndUpdate(
    { _id: req.params.id, _id: req.user._id },
    {cards: user.cards}
    );
  await Card.findOneAndUpdate(
    { _id: req.params.id},
    card[0]
    );
  if (!user)
    return res.status(404).send('The user with the given ID was not found.');

    updatedUser = await User.findOne({ _id: req.params.id, _id: req.user._id }).select('-password');
  res.send(updatedUser);
});

router.patch('/cards', auth, async (req, res) => {
  const { error } = validateCards(req.body);
  if (error) res.status(400).send(error.details[0].message);

  const cards = await getCards(req.body.cards);
  if (cards.length != req.body.cards.length) res.status(400).send("Card numbers don't match");

  let user = await User.findById(req.user._id);
  user.cards = req.body.cards;
  user = await user.save();
  res.send(user);

});

router.put('/:id', auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const salt = await bcrypt.genSalt(10);
  req.body.password = await bcrypt.hash(req.body.password, salt);
  let user = await User.findOneAndUpdate(
    { _id: req.params.id, _id: req.user._id },
    req.body
  );
  if (!user)
    return res.status(404).send('The user with the given ID was not found.');

    user = await User.findOne({ _id: req.params.id, _id: req.user._id }).select('-password');
  res.send(user);
});

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.send(user);
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send('User already registered.');

  user = new User(_.pick(req.body, ['name', 'email', 'password', 'biz', 'cards', 'ClAdmin']));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();
  res.send(_.pick(user, ['_id', 'name', 'email', 'ClAdmin']));

});

module.exports = router; 