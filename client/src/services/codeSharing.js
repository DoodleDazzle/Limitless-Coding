import { db } from '../firebase/config';
import { collection, addDoc, query, where } from 'firebase/firestore';

export const codeSharingService = {
  async shareSnippet(snippet) {
    const snippetsCollection = collection(db, 'snippets');
    const docRef = await addDoc(snippetsCollection, {
      code: snippet.code,
      language: snippet.language,
      author: snippet.authorId,
      createdAt: new Date(),
      isPublic: snippet.isPublic,
      tags: snippet.tags
    });
    return docRef.id;
  },

  async getSharedSnippets(filters) {
    const snippetsQuery = query(
      collection(db, 'snippets'),
      where('isPublic', '==', true)
    );
    // Query implementation
  }
};
