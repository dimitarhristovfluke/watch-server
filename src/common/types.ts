export interface ProcessInfo {
  PROCESSID: string;
  PNAME: string;
  PENDING: number;
  ERRORS?: number;
  COUNT?: number;
  LASTCHECK?: Date;
  DETAILSURL: string;
  CSERVERID?: string;
}
