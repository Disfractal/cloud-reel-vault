import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  User,
  AutoMake,
  AutoModel,
  AutoTrim,
  Clip,
  DailyPrompt,
  Submission,
} from "../types/firestore";

// Collection references
export const collections = {
  users: "users",
  autoMakes: "autoMakes",
  autoModels: "autoModels",
  autoTrims: "autoTrims",
  clips: "clips",
  dailyPrompts: "dailyPrompts",
} as const;

// Generic CRUD operations
export async function createDocument<T>(
  collectionName: string,
  data: Omit<T, "id" | "createdOn" | "updatedOn">
) {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdOn: serverTimestamp(),
    updatedOn: serverTimestamp(),
  });
  return docRef.id;
}

export async function getDocument<T>(
  collectionName: string,
  docId: string
): Promise<T | null> {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as T;
  }
  return null;
}

export async function updateDocument<T>(
  collectionName: string,
  docId: string,
  data: Partial<T>
) {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, {
    ...data,
    updatedOn: serverTimestamp(),
  });
}

export async function deleteDocument(collectionName: string, docId: string) {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
}

export async function queryDocuments<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  const q = query(collection(db, collectionName), ...constraints);
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as T[];
}

// Specific helper functions
export async function getAllClips(): Promise<Clip[]> {
  return queryDocuments<Clip>(collections.clips, [
    orderBy("createdOn", "desc"),
  ]);
}

export async function getClipsByMake(makeName: string): Promise<Clip[]> {
  return queryDocuments<Clip>(collections.clips, [
    where("makeName", "==", makeName),
    orderBy("createdOn", "desc"),
  ]);
}

export async function getClipsByModel(modelName: string): Promise<Clip[]> {
  return queryDocuments<Clip>(collections.clips, [
    where("modelName", "==", modelName),
    orderBy("createdOn", "desc"),
  ]);
}

export async function searchAutosByMake(makeName: string): Promise<AutoTrim[]> {
  return queryDocuments<AutoTrim>(collections.autoTrims, [
    where("makeName", "==", makeName.toLowerCase()),
  ]);
}

export async function searchAutosByModel(modelName: string): Promise<AutoTrim[]> {
  return queryDocuments<AutoTrim>(collections.autoTrims, [
    where("modelName", "==", modelName.toLowerCase()),
  ]);
}

export async function getAllMakes(): Promise<AutoMake[]> {
  return queryDocuments<AutoMake>(collections.autoMakes, [
    orderBy("name", "asc"),
  ]);
}

export async function getModelsByMake(makeId: string): Promise<AutoModel[]> {
  return queryDocuments<AutoModel>(collections.autoModels, [
    where("makeId", "==", makeId),
    orderBy("name", "asc"),
  ]);
}

export async function getTrimsByModel(modelId: string): Promise<AutoTrim[]> {
  return queryDocuments<AutoTrim>(collections.autoTrims, [
    where("modelId", "==", modelId),
    orderBy("name", "asc"),
  ]);
}

export async function getTodayPrompt(): Promise<DailyPrompt | null> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const prompts = await queryDocuments<DailyPrompt>(collections.dailyPrompts, [
    where("promptDate", ">=", Timestamp.fromDate(today)),
    orderBy("promptDate", "desc"),
    orderBy("promptRound", "asc"),
    limit(1),
  ]);
  
  return prompts[0] || null;
}

export async function getUserSubmissions(
  userId: string
): Promise<Submission[]> {
  const submissionsRef = collection(db, collections.users, userId, "submissions");
  const querySnapshot = await getDocs(
    query(submissionsRef, orderBy("createdOn", "desc"))
  );
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Submission[];
}

export async function createSubmission(
  userId: string,
  submissionData: Omit<Submission, "id" | "createdOn" | "updatedOn">
) {
  const submissionsRef = collection(db, collections.users, userId, "submissions");
  const docRef = await addDoc(submissionsRef, {
    ...submissionData,
    createdOn: serverTimestamp(),
    updatedOn: serverTimestamp(),
  });
  return docRef.id;
}
