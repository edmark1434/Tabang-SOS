import { db } from "../firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

// COLLECTION REFERENCE
const needAssessmentCollection = collection(db, "needAssessments");

// CREATE
export const addNeedAssessment = async (assessment) => {
  try {
    const docRef = await addDoc(needAssessmentCollection, assessment);
    return { id: docRef.id, ...assessment };
  } catch (err) {
    console.error("Error adding need assessment:", err);
    throw err;
  }
};

// READ ALL
export const getNeedAssessment = async () => {
  try {
    const snapshot = await getDocs(needAssessmentCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Error getting need assessments:", err);
    throw err;
  }
};

// UPDATE
export const updateNeedAssessment = async (id, updatedData) => {
  try {
    const assessmentRef = doc(db, "needAssessments", id);
    await updateDoc(assessmentRef, updatedData);
  } catch (err) {
    console.error("Error updating need assessment:", err);
    throw err;
  }
};

// DELETE
export const deleteNeedAssessment = async (id) => {
  try {
    const assessmentRef = doc(db, "needAssessments", id);
    await deleteDoc(assessmentRef);
  } catch (err) {
    console.error("Error deleting need assessment:", err);
    throw err;
  }
};
