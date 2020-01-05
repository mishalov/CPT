import { observable, action } from "mobx";
import { User } from "../types/playlist/User";

export class AuthStore {
  @observable OAuthUrl: string = "";
  @observable OAuthToken: string = "";
  @observable OAuthPassed: boolean = false;
  @observable loading = false;
  @observable user?: User = new User("");

  @action setIsAuthed = () => {
    this.OAuthPassed = true;
  };

  @action setNotAuthed = () => {
    this.OAuthPassed = false;
  };

  @action setLoading = (loading: boolean) => {
    this.loading = loading;
  };

  @action setUser = (user: User) => {
    this.user = user;
  };
}

export default new AuthStore();
