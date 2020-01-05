import AuthStore from "./AuthStore";
import CommonStore from "./CommonStore";
import PlayerStore from "./PlayerStore";

export class Store {
  public AuthStore = AuthStore;
  public CommonStore = CommonStore;
  public PlayerStore = PlayerStore;
}

export default new Store();
