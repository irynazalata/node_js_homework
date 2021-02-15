const Contact = require('./Contact.js');
const {
  Types: { ObjectId },
} = require('mongoose');
const Joi = require('joi');

async function getContacts(req, res) {
  try {
    const {
      query: { sub, page, limit = 20 },
    } = req;

    const { docs: contacts } = await Contact.paginate(
      sub ? { subscription: sub } : {},
      page
        ? {
            page: page,
            limit: limit,
          }
        : {},
    );
    res.json(contacts);
  } catch (error) {
    res.status(400).send(error);
  }
}

async function getContactByID(req, res) {
  try {
    const {
      params: { contactId },
    } = req;
    const contactById = await Contact.findById(contactId);
    if (!contactById) res.status(400).send('Contact is not found');
    res.json(contactById);
  } catch (error) {
    res.status(400).send(error);
  }
}

async function addContact(req, res) {
  try {
    const { body } = req;
    const newContact = await Contact.create(body);
    res.json(newContact);
  } catch (error) {
    res.status(400).send(error.message);
  }
}

async function removeContact(req, res) {
  const {
    params: { contactId },
  } = req;

  const deletedContact = await Contact.findByIdAndDelete(contactId);

  if (!deletedContact) res.status(400).send('Contact is not found');
  res.send(`Contact named '${deletedContact.name}' was deleted`);
}

async function updateContact(req, res) {
  const {
    params: { contactId },
  } = req;

  const updatedContact = await Contact.findByIdAndUpdate(contactId, req.body, {
    new: true,
  });

  if (!updatedContact) res.status(400).send('Contact is not found');
  res.json(updatedContact);
}

function validateId(req, res, next) {
  const {
    params: { contactId },
  } = req;

  if (!ObjectId.isValid(contactId))
    res.status(400).send('Your id is not valid');
  next();
}

function validateAddContact(req, res, next) {
  const validationRules = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    phone: Joi.string().required(),
    subscription: Joi.string().required(),
    password: Joi.string().required(),
  });

  const validationResult = validationRules.validate(req.body);

  if (validationResult.error) {
    return res.status(400).send(validationResult.error);
  }

  next();
}

function validateUpdateContact(req, res, next) {
  const validationRules = Joi.object({
    name: Joi.string(),
    email: Joi.string(),
    phone: Joi.string(),
    subscription: Joi.string(),
    password: Joi.string(),
  }).min(1);

  const validationResult = validationRules.validate(req.body);

  if (validationResult.error) {
    return res.status(400).send({ message: 'missing fields' });
  }

  next();
}

module.exports = {
  getContacts,
  getContactByID,
  addContact,
  updateContact,
  removeContact,
  validateId,
  validateAddContact,
  validateUpdateContact,
};
