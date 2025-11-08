import { db } from "../firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

// COLLECTION REFERENCE
const needHelpCollection = collection(db, "needHelp");

// CREATE
export const addNeedHelp = async (help) => {
  try {
    const docRef = await addDoc(needHelpCollection, help);
    return { id: docRef.id, ...help };
  } catch (err) {
    console.error("Error adding need help:", err);
    throw err;
  }
};

// READ ALL
export const getNeedHelp = async () => {
  try {
    const snapshot = await getDocs(needHelpCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Error getting need help:", err);
    throw err;
  }
};

// UPDATE
export const updateNeedHelp = async (id, updatedData) => {
  try {
    const helpRef = doc(db, "needHelp", id);
    await updateDoc(helpRef, updatedData);
  } catch (err) {
    console.error("Error updating need help:", err);
    throw err;
  }
};

// DELETE
export const deleteNeedHelp = async (id) => {
  try {
    const helpRef = doc(db, "needHelp", id);
    await deleteDoc(helpRef);
  } catch (err) {
    console.error("Error deleting need help:", err);
    throw err;
  }
};
