import { observable, action } from "mobx";
import { ICloudClient } from "../types/clients/ICloudClient";

interface ICommonStore {
  sourceCloud: "OneDrive" | "Dropbox" | string;
  client?: ICloudClient;
}

class CommonStore implements ICommonStore {
  @observable sourceCloud = "";
  @observable client?: ICloudClient = undefined;

  @action.bound setCloud = (sourceCloud: "OneDrive" | "Dropbox" | "") => {
    this.sourceCloud = sourceCloud;
  };
  @action.bound setClient = (client: ICloudClient) => {
    this.client = client;
  };
}

export default new CommonStore();
