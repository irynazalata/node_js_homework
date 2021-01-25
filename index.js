const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
} = require('./contacts.js');
const argv = require('yargs').argv;

async function invokeAction({ action, id, name, email, phone }) {
  switch (action) {
    case 'list':
      const list = await listContacts();
      console.table(list);
      break;

    case 'get':
      const contactById = await getContactById(id);
      console.table(contactById);
      break;

    case 'add':
      const newList = await addContact(name, email, phone);
      console.table(newList);
      break;

    case 'remove':
      const newContactsList = await removeContact(id);
      console.table(newContactsList);
      break;

    default:
      console.warn('\x1B[31m Unknown action type!');
  }
}

invokeAction(argv);
