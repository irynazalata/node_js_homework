const { Router } = require('express');
const ContactsController = require('../controllers/contacts.controllers');

const router = Router();

router.get('/', ContactsController.getContacts);
router.get(
  '/:contactId',
  ContactsController.validateContactId,
  ContactsController.getContactByID,
);
router.post(
  '/',
  ContactsController.validateAddContact,
  ContactsController.addContact,
);
router.delete(
  '/:contactId',
  ContactsController.validateContactId,
  ContactsController.removeContact,
);
router.patch(
  '/:contactId',
  ContactsController.validateContactId,
  ContactsController.validateUpdateContact,
  ContactsController.updateContact,
);

module.exports = router;
