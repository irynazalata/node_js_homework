const { v4: uuid } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

const contactsPath = path.join(__filename, '../', './db/contacts.json');

async function listContacts() {
  const contacts = await fs.readFile(contactsPath, 'utf-8', (err, data) => {
    if (err) {
      console.log('err', err);
    }
  });
  return JSON.parse(contacts);
}

async function getContactById(contactId) {
  const contactsList = await listContacts();
  const contactById = contactsList.find(contact => contact.id === contactId);
  return contactById;
}

async function removeContact(contactId) {
  const contactsList = await listContacts();
  const filteredList = contactsList.filter(contact => contact.id !== contactId);
  fs.writeFile(contactsPath, JSON.stringify(filteredList));
  return filteredList;
}

async function addContact(name, email, phone) {
  const contact = { id: uuid(), name, email, phone };
  const newList = await listContacts();
  newList.push(contact);
  const addedContact = await fs.writeFile(
    contactsPath,
    JSON.stringify(newList),
  );
  return addedContact;
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
};
