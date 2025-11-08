import { db, rtdb } from "../firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { ref, set, remove, update, onValue } from "firebase/database";

// COLLECTION REFERENCE
const needHelpCollection = collection(db, "needHelp");
const helpRTDBRef = ref(rtdb, "needHelp");

// CREATE
export const addNeedHelp = async (help) => {
  try {
    const docRef = await addDoc(needHelpCollection, help);
    await set(ref(rtdb,`needHelp/${docRef.id}`),{
        id: docRef.id,
        ...help,
    });
    return { id: docRef.id, ...help };
  } catch (err) {
    console.error("Error adding need help:", err);
    throw err;
  }
};
//LIVE LISTEN

export const liveHelp = (callback) =>{
    const unsub =  onValue(helpRTDBRef,(snapshot)=>{
        const data = snapshot.val();
        const listHelps = data ? Object.values(data) : [];
        callback(listHelps);
    });
    return () => unsub();
}
// READ ALL
export const getNeedHelpFiltered = async (key,value) => {
  try {
    let q = needHelpCollection;
    Object.entries(filters).forEach(([key, value]) => {
      q = query(q, where(key, "==", value));
    })
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Error getting need help:", err);
    throw err;
  }
};

export const getNeed = async() =>{
    try{
        const snapshot = await getDocs(needHelpCollection);
        return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}))
    }catch(err){
        console.error("error in fetching: ",err);
        throw err;
    }
    
}
// UPDATE
export const updateNeedHelp = async (id, data) => {
  try {
    // Firestore
    const docRef = doc(db, "needHelp", id);
    await updateDoc(docRef, data);

    // Realtime DB
    await update(ref(rtdb, `needHelp/${id}`), data);
  } catch (err) {
    console.error("Error updating help:", err);
    throw err;
  }
};

// DELETE
export const deleteNeedHelp = async (id) => {
  try {
    // Firestore
    await deleteDoc(doc(db, "needHelp", id));

    // Realtime DB
    await remove(ref(rtdb, `needHelp/${id}`));
  } catch (err) {
    console.error("Error deleting help:", err);
    throw err;
  }
};
