import { observable } from "mobx";
import { IFile } from "../types/playlist/IFile";

class FilesStore {
  @observable files: IFile[] = [];
}

export default new FilesStore();
