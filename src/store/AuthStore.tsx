import { observable, action } from "mobx";

export class AuthStore {
  @observable OAuthUrl: string = "";
  @observable OAuthToken: string = "";
  @observable OAuthPassed: boolean = false;

  @observable loading = false;

  @action.bound setIsAuthed = () => {
    this.OAuthPassed = true;
  };

  @action.bound setNotAuthed = () => {
    this.OAuthPassed = false;
  };

  @action.bound setLoading = (loading: boolean) => {
    this.loading = loading;
  };
}

export default new AuthStore();
