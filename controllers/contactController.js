const { StatusCodes } = require('http-status-codes');

const Contact = require('../models/Contact');

exports.addContact = async (req, res) => {
  const contact = await Contact.create(req.body);

  res.status(StatusCodes.CREATED).json({ contact });
};

exports.getAllContacts = async (req, res) => {
  const contacts = await Contact.find({})
    .sort('-createdAt')
    .select('-createdAt -updatedAt -__v');

  res.status(StatusCodes.OK).json({ contacts });
};
