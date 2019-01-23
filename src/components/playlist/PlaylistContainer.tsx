import React from "react";
import { List, Icon, Row, Col } from "antd";
import "./Playlist.scss";
import { Dropbox } from "dropbox";
import { IFile } from "../../types/playlist/IFile";
import { IPlaylistItem } from "../../types/playlist/IPlaylistItem";

interface IPlayListContainer {
  files: IFile[];
}

class PlaylistContainer extends React.Component<IPlayListContainer> {
  state = {
    playlist: []
  };

  mapPlaylist = (files: IFile[]) => {
    const playlist: IPlaylistItem[] = files.map(el => ({
      title: el.name,
      bandName: "Альбомы пока не поддерживаются",
      duration: 100,
      isFolder: false
    }));
    console.log("playlist: ", playlist);
    return playlist;
  };

  componentDidUpdate(prevProps: any, prevState: any) {
    const { files } = this.props;
    if (files.length !== prevProps.files.length) {
      this.setState({ playlist: this.mapPlaylist(files) });
    }
  }

  public render() {
    return (
      <List
        itemLayout="horizontal"
        dataSource={this.state.playlist}
        renderItem={(item: IPlaylistItem) => (
          <List.Item className="audio-item">
            <Icon
              type="play-circle"
              className="audio-item__play"
              style={{ fontSize: "32px", color: "#08c" }}
            />
            <div className="audio-item__info">
              <p className="audio-item__title">{item.title}</p>
              <p className="audio-item__bandName">{item.bandName}</p>
            </div>
          </List.Item>
        )}
      />
    );
  }
}

export default PlaylistContainer;
