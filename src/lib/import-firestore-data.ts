import { collection, writeBatch, doc, Timestamp, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { parseSQLFile, ParsedMake, ParsedModel } from "./sql-parser";

export async function importDataToFirestore(sqlContent: string) {
  const { makes, models } = parseSQLFile(sqlContent);
  
  console.log(`Parsed ${makes.length} makes and ${models.length} models`);
  
  // Import makes first
  const makeIds = await importMakes(makes);
  
  // Import models using the make IDs
  await importModels(models, makeIds);
  
  return {
    makesImported: makes.length,
    modelsImported: models.length,
  };
}

async function importMakes(makes: ParsedMake[]) {
  const makeIds = new Map<string, string>();
  let batch = writeBatch(db);
  let batchCount = 0;
  
  // Check if makes already exist
  const existingMakes = await getDocs(collection(db, "autoMakes"));
  const existingMakeNames = new Set(existingMakes.docs.map(doc => doc.data().name));
  
  for (const make of makes) {
    // Skip empty names
    if (!make.name || make.name.trim() === '') {
      continue;
    }
    
    // Skip if already exists
    if (existingMakeNames.has(make.name)) {
      const existingDoc = existingMakes.docs.find(doc => doc.data().name === make.name);
      if (existingDoc) {
        makeIds.set(make.name, existingDoc.id);
      }
      continue;
    }
    
    const docRef = doc(collection(db, "autoMakes"));
    batch.set(docRef, {
      name: make.name,
      logoImage: make.logoImage || null,
      foundedYear: make.foundedYear || null,
      createdOn: Timestamp.now(),
      updatedOn: Timestamp.now(),
    });
    
    makeIds.set(make.name, docRef.id);
    batchCount++;
    
    // Firestore batch limit is 500
    if (batchCount >= 450) {
      await batch.commit();
      batch = writeBatch(db); // Create new batch
      batchCount = 0;
    }
  }
  
  if (batchCount > 0) {
    await batch.commit();
  }
  
  return makeIds;
}

async function importModels(
  models: ParsedModel[],
  makeIds: Map<string, string>
) {
  let batch = writeBatch(db);
  let batchCount = 0;
  
  // Check if models already exist
  const existingModels = await getDocs(collection(db, "autoModels"));
  const existingModelKeys = new Set(
    existingModels.docs.map(doc => `${doc.data().makeName}:${doc.data().name}`)
  );
  
  for (const model of models) {
    const makeId = makeIds.get(model.makeName);
    if (!makeId) {
      console.warn(`Make not found for model: ${model.name} (${model.makeName})`);
      continue;
    }
    
    // Skip if already exists
    const modelKey = `${model.makeName}:${model.name}`;
    if (existingModelKeys.has(modelKey)) {
      continue;
    }
    
    const docRef = doc(collection(db, "autoModels"));
    batch.set(docRef, {
      name: model.name,
      makeId,
      makeName: model.makeName,
      productionStartYear: model.productionStartYear || null,
      productionEndYear: model.productionEndYear || null,
      createdOn: Timestamp.now(),
      updatedOn: Timestamp.now(),
    });
    
    batchCount++;
    
    // Firestore batch limit is 500
    if (batchCount >= 450) {
      await batch.commit();
      batch = writeBatch(db); // Create new batch
      batchCount = 0;
    }
  }
  
  if (batchCount > 0) {
    await batch.commit();
  }
}
