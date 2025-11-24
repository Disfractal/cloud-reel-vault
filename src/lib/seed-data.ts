import { collection, writeBatch, doc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

// Sample makes data (subset from SQL)
const SAMPLE_MAKES = [
  { name: "acura", foundedYear: 1986 },
  { name: "audi", foundedYear: 1909 },
  { name: "bmw", foundedYear: 1916 },
  { name: "chevrolet", foundedYear: 1911 },
  { name: "dodge", foundedYear: 1900 },
  { name: "ford", foundedYear: 1903 },
  { name: "honda", foundedYear: 1948 },
  { name: "hyundai", foundedYear: 1967 },
  { name: "lamborghini", foundedYear: 1963 },
  { name: "mercedes-benz", foundedYear: 1926 },
  { name: "porsche", foundedYear: 1931 },
  { name: "tesla", foundedYear: 2003 },
  { name: "toyota", foundedYear: 1937 },
  { name: "volkswagen", foundedYear: 1937 },
];

const SAMPLE_MODELS = [
  { make: "tesla", name: "model 3", startYear: 2017, endYear: 0 },
  { make: "tesla", name: "model s", startYear: 2012, endYear: 0 },
  { make: "tesla", name: "model x", startYear: 2015, endYear: 0 },
  { make: "tesla", name: "model y", startYear: 2020, endYear: 0 },
  { make: "ford", name: "mustang", startYear: 1964, endYear: 0 },
  { make: "ford", name: "f-150", startYear: 1948, endYear: 0 },
  { make: "chevrolet", name: "corvette", startYear: 1953, endYear: 0 },
  { make: "chevrolet", name: "camaro", startYear: 1966, endYear: 0 },
  { make: "porsche", name: "911", startYear: 1963, endYear: 0 },
  { make: "lamborghini", name: "aventador", startYear: 2011, endYear: 2022 },
];

/**
 * Seeds the Firestore database with initial car make and model data
 * This is a helper function to populate the database for testing
 */
export async function seedDatabase() {
  const batch = writeBatch(db);
  const makeIds: Record<string, string> = {};

  console.log("Seeding makes...");
  
  // Add makes
  SAMPLE_MAKES.forEach((make) => {
    const makeRef = doc(collection(db, "autoMakes"));
    makeIds[make.name] = makeRef.id;
    
    batch.set(makeRef, {
      name: make.name,
      foundedYear: make.foundedYear,
      logoImage: "",
      createdOn: serverTimestamp(),
      updatedOn: serverTimestamp(),
    });
  });

  await batch.commit();
  console.log(`Seeded ${SAMPLE_MAKES.length} makes`);

  // Add models (in a new batch)
  const modelBatch = writeBatch(db);
  const modelIds: Record<string, string> = {};

  console.log("Seeding models...");
  
  SAMPLE_MODELS.forEach((model) => {
    const modelRef = doc(collection(db, "autoModels"));
    const modelKey = `${model.make}-${model.name}`;
    modelIds[modelKey] = modelRef.id;
    
    modelBatch.set(modelRef, {
      name: model.name,
      makeId: makeIds[model.make],
      makeName: model.make,
      productionStartYear: model.startYear,
      productionEndYear: model.endYear,
      createdOn: serverTimestamp(),
      updatedOn: serverTimestamp(),
    });
  });

  await modelBatch.commit();
  console.log(`Seeded ${SAMPLE_MODELS.length} models`);

  return { makeIds, modelIds };
}

/**
 * Creates a sample clip entry
 * You can call this function to add test clips to your database
 */
export async function createSampleClip(
  makeId: string,
  makeName: string,
  modelId: string,
  modelName: string,
  trimName: string,
  videoUrl: string
) {
  const clipRef = doc(collection(db, "clips"));
  const clipBatch = writeBatch(db);
  
  const clipData = {
    source: videoUrl,
    trimId: `${modelId}-${trimName}`,
    trimName,
    modelName,
    makeName,
    makeId,
    duration: "0:45",
    size: "12.5 MB",
    createdOn: serverTimestamp(),
    updatedOn: serverTimestamp(),
  };

  clipBatch.set(clipRef, clipData);
  await clipBatch.commit();
  console.log(`Created clip for ${makeName} ${modelName} ${trimName}`);
}
