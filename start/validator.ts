import vine, { SimpleMessagesProvider } from '@vinejs/vine';

vine.messagesProvider = new SimpleMessagesProvider({
	'notebookId.database.exists': 'notebookId must refer to an existing notebook',
	'prevSibling.database.exists': 'prevSibling (optional) must be a note in the same notebook',
	'parent.database.exists': 'parent (optional) must be a note in the same notebook',
	'userId.database.exists': 'userId must refer to an existing user',
	'email.database.unique': 'email cannot already exist'
});
