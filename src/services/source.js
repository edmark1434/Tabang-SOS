import { db } from "../firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

// COLLECTION REFERENCE
const sourceCollection = collection(db, "sources");

// CREATE
export const addSource = async (source) => {
  try {
    const docRef = await addDoc(sourceCollection, source);
    return { id: docRef.id, ...source };
  } catch (err) {
    console.error("Error adding source:", err);
    throw err;
  }
};

// READ ALL
export const getSource = async () => {
  try {
    const snapshot = await getDocs(sourceCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Error getting sources:", err);
    throw err;
  }
};

// UPDATE
export const updateSource = async (id, updatedData) => {
  try {
    const sourceRef = doc(db, "sources", id);
    await updateDoc(sourceRef, updatedData);
  } catch (err) {
    console.error("Error updating source:", err);
    throw err;
  }
};

// DELETE
export const deleteSource = async (id) => {
  try {
    const sourceRef = doc(db, "sources", id);
    await deleteDoc(sourceRef);
  } catch (err) {
    console.error("Error deleting source:", err);
    throw err;
  }
};
