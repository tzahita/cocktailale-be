const express = require('express');
const _ = require('lodash');
const { Card, validateCard, generateBizNumber } = require('../models/card');
const { User } = require('../models/user');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/all', auth, async (req, res) => {
  let card = [];
  if (req.body.filter === 'fav') {
    const user = await User.findById(req.user._id);
    for (const crd of user.cards) {
      let temp = await Card.findOne({
        _id: crd,
        bizName: { $regex: req.body.search, $options: 'i' },
      }).sort( { updatedAt: -1 } );
      temp && card.push(temp);
    }
  }
  else if (req.body.filter === 'all' && req.body.search.length > 1) {
    let temp = await Card.find({
      bizName: { $regex: req.body.search, $options: 'i' },
    }).sort( { updatedAt: -1 } );
    card = temp
    }
  else{
     card = await Card.find().sort( { updatedAt: -1 } );
  }
 
  res.send(card);
});

router.post('/cards/rcom', async (req, res) => {
  console.log(req.body)
  let card = await Card.find({
      _id: { $ne:req.body.id }
    }).limit(4);
 
  res.send(card);
});

router.get('/my-cards', auth, async (req, res) => {
  if (!req.user.biz) {
    res.status(401).send('Access denied!');
  }
  const card = await Card.find({ user_id: req.user._id }).sort( { updatedAt: -1 } );
  res.send(card);
});

router.delete('/:id', auth, async (req, res) => {
  const card = await Card.findOneAndRemove({
    _id: req.params.id,
    user_id: req.user._id,
  });
  if (!card)
    return res.status(404).send('The card with the given ID was not found.');
  res.send(card);
});

router.put('/:id', auth, async (req, res) => {
  const { error } = validateCard(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  req.body.updatedAt = Date.now()
  let card = await Card.findOneAndUpdate(
    { _id: req.params.id, user_id: req.user._id },
    req.body
  );
  if (!card)
    return res.status(404).send('The card with the given ID was not found.');

  card = await Card.findOne({ _id: req.params.id, user_id: req.user._id });
  res.send(card);
});

router.get('/favorite', auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  let card = [];
  for (const crd of user.cards) {
    let temp = await Card.findOne({
      _id: crd,
    });
    card.push(temp);
  }
  res.send(card);
});

router.get('/card/:id', auth, async (req, res) => {
  const card = await Card.findOne({
    _id: req.params.id,
    // user_id: req.user._id,
  });
  if (!card)
    return res.status(404).send('The card with the given ID was not found.');
  res.send(card);
});

router.get('/search/:name', auth, async (req, res) => {
  let card;
  if (req.params.name === '') {
    card = await Card.find();
  } else {
    card = await Card.find({
      bizName: { $regex: req.params.name, $options: 'i' },
    });
  }
  if (!card)
    return res.status(404).send('The card with the given ID was not found.');
  res.send(card);
});

router.post('/', auth, async (req, res) => {
  const { error } = validateCard(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let card = new Card({
    bizName: req.body.bizName,
    bizDescription: req.body.bizDescription,
    bizAddress: req.body.bizAddress,
    bizPhone: req.body.bizPhone,
    bizIngredients: req.body.bizIngredients,
    bizImage: req.body.bizImage
      ? req.body.bizImage
      : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
    bizNumber: await generateBizNumber(Card),
    updatedAt: Date.now() ,
    user_id: req.user._id,
    popularity: 0,
  });

  post = await card.save();
  res.send(post);
});

module.exports = router;
