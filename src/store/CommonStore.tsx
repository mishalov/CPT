import { observable } from "mobx";

interface ICommonStore {
  //Could be Dropbox, Onedrive или ""
  sourceCloud: string;
}

class CommonStore implements ICommonStore {
  @observable sourceCloud = "";
}

export default new CommonStore();
