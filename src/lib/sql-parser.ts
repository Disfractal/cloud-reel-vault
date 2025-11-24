// Parse SQL INSERT statements and convert to Firestore format
export interface ParsedMake {
  name: string;
  logoImage?: string;
  foundedYear?: number;
}

export interface ParsedModel {
  makeName: string;
  name: string;
  productionStartYear?: number;
  productionEndYear?: number;
}

export function parseSQLFile(sqlContent: string) {
  const makes: ParsedMake[] = [];
  const models: ParsedModel[] = [];
  
  // Parse auto_makes inserts
  const makesMatch = sqlContent.match(
    /INSERT INTO autospotr_core\.auto_makes[\s\S]*?VALUES([\s\S]*?);/
  );
  
  if (makesMatch) {
    const valuesSection = makesMatch[1];
    const makePattern = /\('([^']*)'(?:,\s*current_timestamp,\s*current_timestamp)?\)/g;
    let match;
    
    while ((match = makePattern.exec(valuesSection)) !== null) {
      const name = match[1].trim();
      if (name) {
        makes.push({ name });
      }
    }
  }
  
  // Parse auto_models inserts
  const modelsMatch = sqlContent.match(
    /INSERT INTO autospotr_core\.auto_models[\s\S]*?VALUES([\s\S]*?);/
  );
  
  if (modelsMatch) {
    const valuesSection = modelsMatch[1];
    const modelPattern = /\(\(SELECT id from autospotr_core\.auto_makes WHERE name = '([^']*)'\),\s*'([^']*)',\s*(\d+),\s*(\d+)/g;
    let match;
    
    while ((match = modelPattern.exec(valuesSection)) !== null) {
      const makeName = match[1].trim();
      const name = match[2].trim();
      const startYear = parseInt(match[3]);
      const endYear = parseInt(match[4]);
      
      if (makeName && name) {
        models.push({
          makeName,
          name,
          productionStartYear: startYear || undefined,
          productionEndYear: endYear === 0 ? undefined : endYear,
        });
      }
    }
  }
  
  return { makes, models };
}
