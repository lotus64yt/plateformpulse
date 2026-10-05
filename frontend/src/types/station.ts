export interface Station {
  Name: string;
  UIDs: string[];
  Lines: string[];
  Routes: string[];
  ChosenVia?: number;
}
