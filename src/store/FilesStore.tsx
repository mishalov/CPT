import { observable, action } from "mobx";
import { FileSet } from "../types/playlist/FileSet";
import { ICloudClient } from "../types/clients/ICloudClient";

export class FilesStore {
  @observable files!: FileSet;
  @observable sourceCloud: "OneDrive" | "Dropbox" | string = "";
  @observable client!: ICloudClient;

  @action.bound setCloud = (sourceCloud: "OneDrive" | "Dropbox" | "") => {
    this.sourceCloud = sourceCloud;
  };
  @action.bound setClient = (client: ICloudClient) => {
    this.client = client;
  };
  @action.bound fetchFiles = async () => {
    this.files = await this.client.getAllFiles();
  };
}

export default new FilesStore();
