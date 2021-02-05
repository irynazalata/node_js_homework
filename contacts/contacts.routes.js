const { Router } = require('express');
const ContactsController = require('./contacts.controllers');

const router = Router();

router.get('/', ContactsController.getContacts);
router.get(
  '/:contactId',
  ContactsController.validateId,
  ContactsController.getContactByID,
);
router.post(
  '/',
  ContactsController.validateAddContact,
  ContactsController.addContact,
);
router.delete(
  '/:contactId',
  ContactsController.validateId,
  ContactsController.removeContact,
);
router.patch(
  '/:contactId',
  ContactsController.validateId,
  ContactsController.validateUpdateContact,
  ContactsController.updateContact,
);

module.exports = router;
