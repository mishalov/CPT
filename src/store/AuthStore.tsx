import { observable } from "mobx";

interface IAuthStore {
  OAuthUrl: string;
  OAuthToken: string;
  OAuthPassed: boolean;
}

class AuthStore implements IAuthStore {
  @observable OAuthUrl = "";
  @observable OAuthToken = "";
  @observable OAuthPassed = false;
}

export default new AuthStore();
