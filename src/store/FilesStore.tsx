import { observable } from "mobx";
import { FileSet } from "../types/playlist/FileSet";

class FilesStore {
  @observable files!: FileSet;
}

export default new FilesStore();
