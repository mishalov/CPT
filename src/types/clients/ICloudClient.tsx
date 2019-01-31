import { FileSet } from "../playlist/FileSet";
import { AudioPlaying } from "../AudioPlaying";
import { File } from "../playlist/File";
import { User } from "../playlist/User";

export interface ICloudClient {
  cloudSource: string;
  mapOfFiles: File[];
  getAllFiles: () => Promise<FileSet>;
  getAllFilesAlbums: () => Promise<FileSet>;
  authorize: () => void;
  playFile: (path: string) => Promise<AudioPlaying>;
  getMe: () => Promise<User>;
  getNext: (path: string) => Promise<AudioPlaying>;
  getPrev: (path: string) => Promise<AudioPlaying>;
}
