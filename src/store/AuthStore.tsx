import { observable, action } from "mobx";
import { User } from "../types/playlist/User";

export class AuthStore {
  @observable OAuthUrl: string = "";
  @observable OAuthToken: string = "";
  @observable OAuthPassed: boolean = false;
  @observable loading = false;
  @observable user?: User = new User("");

  @action.bound setIsAuthed = () => {
    this.OAuthPassed = true;
  };

  @action.bound setNotAuthed = () => {
    this.OAuthPassed = false;
  };

  @action.bound setLoading = (loading: boolean) => {
    this.loading = loading;
  };

  @action.bound setUser = (user: User) => {
    this.user = user;
  };
}

export default new AuthStore();
