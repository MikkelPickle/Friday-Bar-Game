// types.ts

export type Faculty = "Science" | "Arts" | "Engineering" | "Business" | "Health";

export type FacultyGradients = Record<string, readonly [string, string]>;

export interface MarkerData {
  name: string;
  coordinate: { latitude: number; longitude: number };
  faculty: Faculty;
}

export type Markers = Record<string, MarkerData>;
