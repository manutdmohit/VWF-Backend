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

exports.deleteContact = async (req, res) => {
  const { id } = req.params;

  const contact = await Contact.findByIdAndDelete(id);

  if (!contact) {
    throw new Error(`No contact found with id ${id}`);
  }

  res.status(StatusCodes.OK).json({ msg: 'Contact deleted successfully' });
};
