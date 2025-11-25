import { Timestamp } from "firebase/firestore";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  picture?: string;
  locale?: string;
  email: string;
  emailVerified: boolean;
  sub: string;
  updatedOn: Timestamp;
  createdOn: Timestamp;
}

export interface AutoMake {
  id: string;
  name: string;
  logoImage?: string;
  heroImage?: string;
  foundedYear?: number;
  uppercase?: boolean;
  updatedOn: Timestamp;
  createdOn: Timestamp;
}

export interface AutoModel {
  id: string;
  name: string;
  makeId: string;
  makeName: string;
  productionStartYear?: number;
  productionEndYear?: number;
  updatedOn: Timestamp;
  createdOn: Timestamp;
}

export interface AutoTrim {
  id: string;
  name: string;
  modelId: string;
  modelName: string;
  makeId: string;
  makeName: string;
  productionStartYear?: number;
  productionEndYear?: number;
  updatedOn: Timestamp;
  createdOn: Timestamp;
}

export interface Clip {
  id: string;
  source: string;
  trimId: string;
  trimName: string;
  modelName: string;
  makeName: string;
  makeLogoImage?: string;
  uploadedBy?: string;
  duration?: string;
  size?: string;
  updatedOn: Timestamp;
  createdOn: Timestamp;
}

export interface Question {
  question: string;
  type: string;
  options?: string[];
}

export interface DailyPrompt {
  id: string;
  promptDate: Timestamp;
  promptRound: number;
  timeLimitMs: number;
  clipId: string;
  questions: {
    values: Question[];
  };
  updatedOn: Timestamp;
  createdOn: Timestamp;
}

export interface Answer {
  questionNumber: number;
  answer: any;
  correct: boolean;
  createdOn: Timestamp;
}

export interface Submission {
  id: string;
  promptId: string;
  promptDate: Timestamp;
  answers: Answer[];
  totalCorrect: number;
  totalElapsedTime: number;
  updatedOn: Timestamp;
  createdOn: Timestamp;
}

// View models for display
export interface ClipWithDetails extends Clip {
  title?: string;
  thumbnail?: string;
}

export interface AutoSearchResult {
  trimId: string;
  trimName: string;
  modelId: string;
  modelName: string;
  makeId: string;
  makeName: string;
  makeLogoImage?: string;
  productionYears: string;
}
