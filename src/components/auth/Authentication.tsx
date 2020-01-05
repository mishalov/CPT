import React from "react";
import queryString from "query-string";
import { Dropbox } from "dropbox";
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

interface IAuthentication {
  store?: Store;
}

@inject("store")
@observer
class Authentication extends React.Component<IAuthentication> {
  state = { OAuthUrl: "" };

  /**
   * Получаем URL Аутентификации DropBox.
   * Если есть запомненный токен и запомнено, что входили через дропбокс - пытаемся аутентифицироваться
   */
  public tryDropboxRelog = async (dropBox: Dropbox) => {
    const { AuthStore, FilesStore } = this.props.store!;
    const oldToken = localStorage.getItem("access_token");
    const cloudSource = localStorage.getItem("cloudSource");
    if (oldToken && cloudSource === "Dropbox") {
      AuthStore.setLoading(true);
      dropBox.setAccessToken(oldToken);
      try {
        const currentAccount = await dropBox.usersGetCurrentAccount();
        AuthStore.setLoading(false);
        AuthStore.setIsAuthed();
        FilesStore.setClient(new DropboxClient(dropBox));
      } catch (e) {
        AuthStore.setLoading(false);
      }
    }
  };

  /**
   * Попытка релогнуться в Onedrive
   */
  public tryOnedriveRelog = async () => {
    const { AuthStore, FilesStore } = this.props.store!;
    const oldToken = localStorage.getItem("access_token");
    const cloudSource = localStorage.getItem("cloudSource");
    /**
     * oldToken - токен доступа OneDrive;
     * Если он есть, и при этом последний сервис - onedrive
     * То пытаемся логнуться через onedrive
     */
    if (oldToken && cloudSource === "OneDrive") {
      FilesStore.setClient(
        new OneDriveClient(
          MicrosoftGraph.Client.init({
            authProvider: (done: AuthProviderCallback) => {
              done(null, oldToken);
            }
          })
        )
      );
      AuthStore.setIsAuthed();
      return;
    }

    //* Получаем Access_token для OneDrive по id_token

    const idToken = localStorage.getItem("id_token");
    if (idToken) {
      this.getOnedriveAccessToken(idToken);
    }
  };

  public getOnedriveAccessToken = async (idToken: string) => {
    const store = this.props.store!;
    const { FilesStore, AuthStore } = store;
    const userAgentApplication = new Msal.UserAgentApplication(
      "b07f11e5-8934-40a1-a327-1859322ed1c6",
      null,
      () => {}
    );
    if (idToken) {
      userAgentApplication
        .acquireTokenSilent(["files.read.all"])
        .then(accessToken => {
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
        })
        .catch(err => {
          console.error("Ошибка получения access_token Onedrive", err);
        });
    }
  };

  /**
   * Перехват после редиректа при авторизации через Дропбокс
   */
  public authorizedByDropbox = async (urlParams: any) => {
    const store = this.props.store!;
    const FilesStore: FilesStore = store.FilesStore;
    const { AuthStore } = store;
    localStorage.setItem("access_token", urlParams.access_token);
    const dropbox = new Dropbox({
      accessToken: urlParams.access_token
    });
    FilesStore.setClient(new DropboxClient(dropbox));
    AuthStore.setIsAuthed();
  };

  /**
   * Перехват после редиректа при авторизации через Onedrive
   */
  public authorizedByOneDrive = async (urlParams: any) => {
    const accessToken =
      urlParams.access_token || localStorage.getItem("access_token");
    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
    }
    if (urlParams.id_token) {
      localStorage.setItem("id_token", urlParams.id_token);
    }
    await this.getOnedriveAccessToken(urlParams.id_token);
  };

  public handleOnedriveAuth = () => {
    localStorage.setItem("cloudSource", "OneDrive");
    const userAgentApplication = new Msal.UserAgentApplication(
      "b07f11e5-8934-40a1-a327-1859322ed1c6",
      null,
      () => {}
    );
    userAgentApplication.loginRedirect(["files.read.all"]);
  };

  /**
   * Создаем инстансы SDK Dropbox и Onedrive
   */
  public componentDidMount() {
    const dropBox = new Dropbox({ clientId: "7174q8sh3aiss51" });
    const url = dropBox.getAuthenticationUrl("http://localhost:3000");
    if (url) {
      this.setState({ OAuthUrl: url });
    }

    // Когда страничка OAUTH2 Dropbox или Onedrive редиректнула нас назад при авторизации
    if (location.hash) {
      const urlParams = queryString.parse(location.hash) as any;
      switch (localStorage.getItem("cloudSource")) {
        case "Dropbox":
          this.authorizedByDropbox(urlParams);
        case "OneDrive":
          this.authorizedByOneDrive(urlParams);
      }
    } else {
      // Пытаемся релогнуться, вдруг входили раньше?
      const cloudSource = localStorage.getItem("cloudSource");
      if (cloudSource === "OneDrive") {
        this.tryOnedriveRelog();
      }
      if (cloudSource === "Dropbox") {
        this.tryDropboxRelog(dropBox);
      }
    }
  }

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

export default Authentication;
