import { FileSet } from "../playlist/FileSet";

export interface ICloudClient {
  cloudSource: string;
  getAllFiles: () => FileSet;
}
