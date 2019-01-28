import { FileSet } from "../playlist/FileSet";
import { AudioPlaying } from "../AudioPlaying";

export interface ICloudClient {
  cloudSource: string;
  getAllFiles: () => Promise<FileSet>;
  authorize: () => void;
  playFile: (path: string) => Promise<AudioPlaying>;
}
