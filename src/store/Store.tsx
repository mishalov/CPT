import AuthStore from "./AuthStore";
import CommonStore from "./CommonStore";
import FilesStore from "./FilesStore";

class Store {
  public AuthStore = AuthStore;
  public CommonStore = CommonStore;
  public FilesStore = FilesStore;
}

export default new Store();
