import React from "react";
import queryString from "query-string";
import { Dropbox } from "dropbox";
import { withRouter, RouteComponentProps } from "react-router";
import { Card, Button, Icon } from "antd";
import * as Msal from "msal";
import "./Authentication.scss";
import { inject, IStoresToProps, observer } from "mobx-react";
import { Store } from "../../store/Store";
import { FilesStore } from "../../store/FilesStore";
import { DropboxClient } from "../../types/clients/DropboxClient";

interface IAuthentication extends RouteComponentProps {
  store?: Store;
}

@inject("store")
@observer
class Authentication extends React.Component<IAuthentication> {
  state = { OAuthUrl: "" };

  componentDidMount() {
    // Получаем URL по которому будет авторизовавыться в случае Dropbox
    const { AuthStore, FilesStore } = this.props.store!;
    const dropBox = new Dropbox({ clientId: "7174q8sh3aiss51" });
    const url = dropBox.getAuthenticationUrl("http://localhost:3000/auth");
    if (url) {
      this.setState({ OAuthUrl: url });
    }
    console.log("Квери стринг", queryString.parse(this.props.location.hash));

    const oldToken = localStorage.getItem("access_token");
    if (oldToken) {
      AuthStore.setLoading(true);
      dropBox.setAccessToken(oldToken);

      dropBox
        .usersGetCurrentAccount()
        .then(result => {
          console.log("result: ", result);
          AuthStore.setLoading(false);
          AuthStore.setIsAuthed();
          FilesStore.setClient(new DropboxClient(dropBox));
          this.props.history.push("/");
        })
        .catch(err => {
          AuthStore.setLoading(false);
        });
    }

    // Когда страничка OAUTH2 Dropbox или Onedrive редиректнула нас назад при авторизации
    if (this.props.location.hash) {
      const urlParams = queryString.parse(this.props.location.hash) as any;
      switch (localStorage.getItem("cloudSource")) {
        case "Dropbox":
          this.authorizedByDropbox(urlParams);
        case "OneDrive":
          this.authorizedByOneDrive(urlParams);
      }
    }
  }

  authorizedByDropbox = async (urlParams: any) => {
    const FilesStore: FilesStore = (this.props.store as any).FilesStore;
    const AuthStore: FilesStore = (this.props.store as any).FilesStore;
    localStorage.setItem("access_token", urlParams.access_token);
    FilesStore.setClient(
      new DropboxClient(
        new Dropbox({
          accessToken: urlParams.access_token
        })
      )
    );
  };

  authorizedByOneDrive = (urlParams: any) => {};

  handleOnedriveAuth = () => {
    localStorage.setItem("cloudSource", "OneDrive");
    const userAgentApplication = new Msal.UserAgentApplication(
      "b07f11e5-8934-40a1-a327-1859322ed1c6",
      null,
      () => {}
    );
    userAgentApplication.loginRedirect();
  };

  public render() {
    const { AuthStore } = this.props.store!;
    return (
      <div className="auth-container">
        <Card
          className="auth-container__authbox"
          title="Вход"
          loading={AuthStore.loading}
        >
          <p>
            Здравствуйте! Для получения доступа к Вашему Dropbox нам необходима
            авторизация. Нажмите пожалуйста на кнопку ниже.
          </p>
          <Button
            className="auth-container__button"
            onClick={() => {
              localStorage.setItem("cloudSource", "Dropbox");
            }}
            type="primary"
            href={this.state.OAuthUrl}
          >
            <Icon type="dropbox" />
            Войти через Dropbox
          </Button>
          <Button
            className="auth-container__button"
            type="primary"
            onClick={this.handleOnedriveAuth}
          >
            <Icon type="windows" />
            Войти через OneDrive
          </Button>
        </Card>
      </div>
    );
  }
}

export default inject("store")(withRouter(Authentication));
