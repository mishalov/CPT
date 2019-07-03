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
import { AudioPlaying } from "../../types/AudioPlaying";
import PlaylistAudioItem from "./PlaylistAudioItem";
import PlaylistFolderItem from "./PlaylistFolderItem";

interface IPlayListContainer {
  files: FileSet;
  fetchFiles: () => void;
  playFile: (path: string) => void;
  playNow?: AudioPlaying;
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

  componentDidMount() {
    this.props.fetchFiles();
  }

  makeList(fs: FileSet) {
    if (fs.files && fs.files.length > 0)
      return fs.files.map(el => this.makeItem(el));
  }

  makeItem(f: File) {
    if (f.type === "File") {
      const audio = f.content as Audio;
      return (
        <PlaylistAudioItem
          audio={audio}
          key={key()}
          playFile={this.props.playFile}
        />
      );
    } else {
      const folder = f.content as FileSet;
      const content = this.makeList(folder);
      if (content && content!.filter(el => el).length > 0)
        return <PlaylistFolderItem key={key()} content={content} folder={f} />;
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
