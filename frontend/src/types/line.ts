export const enum LineType {
  LineTrain = 0,
  LineRer = 1,
  LineMetro = 2,
  LineTram = 3,
}

export interface Line {
  Id: string;
  Name: string;
  Color: string;
  Type: LineType;
}
