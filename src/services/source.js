import { db, rtdb } from "../firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, set, remove, update, onValue } from "firebase/database";

// COLLECTION REFERENCE
const sourceCollection = collection(db, "sources");
const sourceRTDBRef = ref(rtdb, "sources");

// CREATE
export const addSource = async (source) => {
  try {
    // Add to Firestore
    const docRef = await addDoc(sourceCollection, source);

    // Add to Realtime Database
    await set(ref(rtdb, `sources/${docRef.id}`), {
      id: docRef.id,
      ...source,
    });

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
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Error getting sources:", err);
    throw err;
  }
};

// UPDATE
export const updateSource = async (id, updatedData) => {
  try {
    // Firestore
    const sourceRef = doc(db, "sources", id);
    await updateDoc(sourceRef, updatedData);

    // Realtime Database
    await update(ref(rtdb, `sources/${id}`), updatedData);
  } catch (err) {
    console.error("Error updating source:", err);
    throw err;
  }
};

// DELETE
export const deleteSource = async (id) => {
  try {
    // Firestore
    await deleteDoc(doc(db, "sources", id));

    // Realtime Database
    await remove(ref(rtdb, `sources/${id}`));
  } catch (err) {
    console.error("Error deleting source:", err);
    throw err;
  }
};

// LIVE LISTENER
export const liveSource = (callback) => {
  const unsub = onValue(sourceRTDBRef, (snapshot) => {
    const data = snapshot.val();
    const listSources = data ? Object.values(data) : [];
    callback(listSources); // Return latest list
  });

  return () => unsub(); // Cleanup listener
};
