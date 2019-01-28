import React from "react";
import { List, Icon, Row, Col, Spin, Skeleton, Collapse } from "antd";
import "./Playlist.scss";
import { Dropbox } from "dropbox";
import { File } from "../../types/playlist/File";
import { IPlaylistItem } from "../../types/playlist/IPlaylistItem";
import { IDropboxFile } from "../../types/playlist/IDropboxFile";
import { observer, inject } from "mobx-react";
import { FileSet } from "../../types/playlist/FileSet";
import { Audio } from "../../types/playlist/Audio";
import { Z_BLOCK } from "zlib";

interface IPlayListContainer {
  files: FileSet;
  fetchFiles: () => void;
  playFile: (path: string) => void;
}

let pseudoUid = 0;

const key = () => {
  return pseudoUid++;
};
const Panel = Collapse.Panel;

@inject("store")
@observer
class PlaylistContainer extends React.Component<IPlayListContainer> {
  state = {
    playlist: []
  };

  mapPlaylist = (files: IDropboxFile[]) => {
    const playlist: IPlaylistItem[] = files.map(el => ({
      title: el.name,
      bandName: "Альбомы пока не поддерживаются",
      duration: 100,
      isFolder: false
    }));
    console.log("playlist: ", playlist);
    return playlist;
  };

  componentDidMount() {
    this.props.fetchFiles();
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    const { files } = this.props;
    console.log("files: ", files);
  }

  makeList(fs: FileSet) {
    return fs.files.map(el => this.makeItem(el));
  }

  makeItem(f: File) {
    if (f.type === "File") {
      const audio = f.content as Audio;
      return (
        <div
          className="audio-item"
          key={key()}
          onClick={() => this.props.playFile(audio.fullPath)}
        >
          <div className="audio-item__art" style={{ marginRight: "12px" }} />
          <div className="audio-item__info">
            <p className="audio-item__title">{audio.title}</p>
            <p className="audio-item__bandName">{audio.author}</p>
          </div>
        </div>
      );
    } else {
      const folder = f.content as FileSet;
      return (
        <Row
          type="flex"
          justify="center"
          align="middle"
          key={key()}
          className="folder-item"
        >
          <Col span={24}>
            <Collapse>
              <Panel
                header={
                  <div className="folder-item__header">
                    <Icon className="folder-item__icon" type="folder" />
                    <div className="folder-item__title">{f.title}</div>
                  </div>
                }
                key="1"
              >
                {this.makeList(folder)}
              </Panel>
            </Collapse>
          </Col>
        </Row>
      );
    }
  }

  public render() {
    return this.props.files ? (
      <div className="playlist">{this.makeList(this.props.files)}</div>
    ) : (
      <List
        itemLayout="horizontal"
        renderItem={(el: number) => (
          <List.Item className="audio-item">
            <Skeleton active paragraph={{ rows: 0, width: 100 }} />
          </List.Item>
        )}
        dataSource={[1, 2, 3, 4, 5]}
      />
    );
  }
}

export default observer(PlaylistContainer);
