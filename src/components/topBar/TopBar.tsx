import React from "react";
import "./TopBar.scss";
import { inject, observer } from "mobx-react";
import { Icon, Tooltip, Switch } from "antd";
import { Store } from "../../store/Store";

interface ITopBar {
  store?: Store;
}
@inject("store")
@observer
class TopBar extends React.Component<ITopBar> {
  async componentDidMount() {
    const { PlayerStore, AuthStore } = this.props.store!;
    AuthStore.setUser(await PlayerStore.client.getMe());
  }

  handleLogOut = () => {
    localStorage.removeItem("cloudSource");
    localStorage.removeItem("id_token");
    localStorage.removeItem("access_token");
    window.location.href = "/";
  };

  handleChangeDest = (checked: boolean) => {
    if (checked) this.props.store!.PlayerStore.fetchFilesAlbum();
    else {
      this.props.store!.PlayerStore.fetchFiles();
    }
  };

  public render() {
    const AuthStore = this.props.store!.AuthStore;
    return (
      <div className="top-bar">
        <div className="top-bar__switch-dest">
          <Switch
            onChange={this.handleChangeDest}
            unCheckedChildren={<Icon type="folder" />}
            checkedChildren={<div className="top-bar__switch-dest_icon" />}
          />
        </div>
        <div className="top-bar__user-icon">
          <p>{AuthStore.user!.userName}</p>
          <Tooltip title="Выход">
            <Icon type="logout" onClick={this.handleLogOut} />
          </Tooltip>
        </div>
      </div>
    );
  }
}
export default TopBar;
