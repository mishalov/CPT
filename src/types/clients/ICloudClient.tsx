import { FileSet } from "../playlist/FileSet";

export interface ICloudClient {
  cloudSource: string;
  getAllFiles: () => Promise<FileSet>;
  authorize: () => void;
  //setMockupAuthed: () => void;
}
