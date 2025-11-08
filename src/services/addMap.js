import { db } from "../firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

// COLLECTION REFERENCE
const pinsCollection = collection(db, "pins");

// CREATE
export const addPin = async (pin) => {
  try {
    const docRef = await addDoc(pinsCollection, pin);
    return { id: docRef.id, ...pin };
  } catch (err) {
    console.error("Error adding pin:", err);
    throw err;
  }
};

// READ ALL
export const getPins = async () => {
  try {
    const snapshot = await getDocs(pinsCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Error getting pins:", err);
    throw err;
  }
};

// UPDATE
export const updatePin = async (id, updatedData) => {
  try {
    const pinRef = doc(db, "pins", id);
    await updateDoc(pinRef, updatedData);
  } catch (err) {
    console.error("Error updating pin:", err);
    throw err;
  }
};

// DELETE
export const deletePin = async (id) => {
  try {
    const pinRef = doc(db, "pins", id);
    await deleteDoc(pinRef);
  } catch (err) {
    console.error("Error deleting pin:", err);
    throw err;
  }
};
