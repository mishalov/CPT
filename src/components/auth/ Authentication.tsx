import React from "react";
import queryString from "query-string";
import { Dropbox } from "dropbox";
import { withRouter, RouteComponentProps } from "react-router";
import { Card, Button, Icon } from "antd";
import * as Msal from "msal";
import * as MicrosoftGraph from "@microsoft/microsoft-graph-client";
import "./Authentication.scss";
import { inject, IStoresToProps, observer } from "mobx-react";
import { Store } from "../../store/Store";
import { FilesStore } from "../../store/FilesStore";
import { DropboxClient } from "../../types/clients/DropboxClient";
import { AuthProviderCallback } from "@microsoft/microsoft-graph-client";
import { OneDriveClient } from "../../types/clients/OneDriveClient";
import { AuthStore } from "../../store/AuthStore";

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

    const oldToken = localStorage.getItem("access_token");
    const cloudSource = localStorage.getItem("cloudSource");
    if (oldToken && cloudSource === "Dropbox") {
      AuthStore.setLoading(true);
      dropBox.setAccessToken(oldToken);

      dropBox
        .usersGetCurrentAccount()
        .then(result => {
          AuthStore.setLoading(false);
          AuthStore.setIsAuthed();
          FilesStore.setClient(new DropboxClient(dropBox));
          this.props.history.push("/");
        })
        .catch(err => {
          AuthStore.setLoading(false);
        });
    }

    // если есть Access_token то входим
    const accessToken = localStorage.getItem("access_token");
    if (accessToken && cloudSource === "OneDrive") {
      FilesStore.setClient(
        new OneDriveClient(
          MicrosoftGraph.Client.init({
            authProvider: (done: AuthProviderCallback) => {
              done(null, accessToken);
            }
          })
        )
      );
      AuthStore.setIsAuthed();

      this.props.history.push("/");
    }

    //* Получаем Access_token для OneDrive по id_token
    const userAgentApplication = new Msal.UserAgentApplication(
      "b07f11e5-8934-40a1-a327-1859322ed1c6",
      null,
      () => {}
    );

    const idToken = localStorage.getItem("id_token");
    if (idToken && !(accessToken && cloudSource === "OneDrive")) {
      userAgentApplication
        .acquireTokenSilent(["files.read.all"])
        .then(async accessToken => {
          localStorage.setItem("access_token", accessToken);
          FilesStore.setClient(
            new OneDriveClient(
              MicrosoftGraph.Client.init({
                authProvider: (done: AuthProviderCallback) => {
                  done(null, accessToken);
                }
              })
            )
          );
          AuthStore.setIsAuthed();

          this.props.history.push("/");
        })
        .catch(err => {
          console.error("Ошибка получения access_token Onedrive", err);
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
    localStorage.setItem("access_token", urlParams.access_token);
    FilesStore.setClient(
      new DropboxClient(
        new Dropbox({
          accessToken: urlParams.access_token
        })
      )
    );
  };

  authorizedByOneDrive = async (urlParams: any) => {
    const FilesStore: FilesStore = (this.props.store as any).FilesStore;
    const AuthStore: AuthStore = (this.props.store as any).AuthStore;
    const accessToken =
      localStorage.getItem("access_token") || urlParams.access_token;
    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
    }
    if (urlParams.id_token) {
      localStorage.setItem("id_token", urlParams.id_token);
    }
  };

  handleOnedriveAuth = () => {
    localStorage.setItem("cloudSource", "OneDrive");
    const userAgentApplication = new Msal.UserAgentApplication(
      "b07f11e5-8934-40a1-a327-1859322ed1c6",
      null,
      () => {}
    );
    userAgentApplication.loginRedirect(["files.read.all"]);
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
            Здравствуйте! Для получения доступа к Вашему облаку нам необходима
            авторизация. Нажмите пожалуйста на кнопку ниже.{" "}
          </p>
          <p>
            Мы рекомендуем ипользовать <b>OneDrive</b> т.к он предоставляет
            метаинформацию по файлам (альбом, композитор, обложка и т.д)
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
