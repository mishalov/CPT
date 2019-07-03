import React, { ReactNode } from "react";
import { Icon, Slider, Button, Popover, Radio } from "antd";
import "./Player.scss";
import { observer, inject } from "mobx-react";
import ReactPlayer, { ReactPlayerProps } from "react-player";
import { Store } from "../../store/Store";
import { secsToMins } from "../../helpers/secsToMins";
import { SliderValue } from "antd/lib/slider";
import RadioGroup from "antd/lib/radio/group";

interface IPlayerContainer {
  store?: Store;
}

interface IDurationProgress {
  played: number;
  playedSeconds: number;
  loaded: number;
  loadedSeconds: number;
}

@inject("store")
@observer
class PlayerContainer extends React.Component<IPlayerContainer> {
  state = {
    progress: {
      played: 0,
      playedSeconds: 0,
      loaded: 0,
      loadedSeconds: 0
    },
    repeat: {
      value: "",
      title: ""
    },
    shuffle: {
      value: "",
      title: ""
    },
    volume: 50,
    playback: 0
  };
  private player!: ReactPlayer;

  handleChangeVolume = (volume: SliderValue) => {
    this.setState({ volume: Number(volume) });
  };

  handleChangeMode = (mode: string) => {
    let repeat = { title: "", value: "" };
    let shuffle = { title: "", value: "" };
    switch (((this.state as any)[mode] as any).value) {
      case "": {
        this.setState({
          repeat,
          shuffle,
          [mode]: { title: "альбом", value: "album" }
        });
        break;
      }
      case "album": {
        this.setState({
          repeat,
          shuffle,
          [mode]: { title: "песня", value: "song" }
        });
        break;
      }
      case "song": {
        this.setState({ repeat, shuffle, [mode]: { value: "", title: "" } });
        break;
      }
      default: {
        this.setState({ repeat, shuffle, [mode]: { value: "", title: "" } });
        break;
      }
    }
  };

  public render() {
    const { FilesStore } = this.props.store!;
    return (
      <div className="player" style={{ marginBottom: "12px" }}>
        <ReactPlayer
          ref={el => (this.player = el!)}
          style={{
            position: "absolute",
            zIndex: -5
          }}
          onDuration={(dur: any) => {
            FilesStore.playNow.audio.duration = dur;
          }}
          onProgress={(progress: IDurationProgress) => {
            this.setState({ progress });
          }}
          width="1px"
          height="1px"
          fileConfig={{ forceAudio: true }}
          url={FilesStore.playNow.URL}
          playing={FilesStore.isPlay}
          volume={this.state.volume / 100}
          onEnded={FilesStore.getNext}
        />

        <Icon
          type={!FilesStore.isPlay ? "play-circle" : "pause-circle"}
          theme="filled"
          className="player-btn__play"
          onClick={() => {
            FilesStore.switchPlay();
          }}
        />

        <Icon
          type="step-backward"
          theme="filled"
          className="player-btn__step"
          onClick={FilesStore.getPrev}
        />
        <Icon
          type="step-forward"
          theme="filled"
          className="player-btn__step"
          onClick={FilesStore.getNext}
        />
        <div className="slider-block">
          <div className="slider-block__meta">
            <div className="slider-block__naming">
              <p className="slider-block__title">
                {FilesStore.playNow.audio.title}
              </p>
              <p className="slider-block__author">
                {FilesStore.playNow.audio.author}
              </p>
            </div>
            <p className="slider-block__time">
              <span>
                {secsToMins(this.state.progress.playedSeconds)} /
                {secsToMins(FilesStore.playNow.audio.duration)}
              </span>
            </p>
          </div>
          <Slider
            className="slider-block__slider"
            max={FilesStore.playNow.audio.duration}
            tipFormatter={(val: number) => secsToMins(val)}
            onChange={(el: SliderValue) => {
              this.player.seekTo(Number(el));
            }}
            value={this.state.progress.playedSeconds}
          />
        </div>
        <Slider
          className="player__volume"
          max={100}
          value={this.state.volume}
          onChange={this.handleChangeVolume}
        />
        <div className="player__additional">
          <div className="shuffle-group">
            <Icon
              className={`player-btn__shuffle ${this.state.shuffle.value &&
                "active"}`}
              type="swap"
              onClick={() => {
                this.handleChangeMode("shuffle");
              }}
            />
            <p className="repeat-group__label">{this.state.shuffle.title}</p>
          </div>
          <div className="repeat-group">
            <Icon
              className={`player-btn__repeat ${this.state.repeat.value &&
                "active"}`}
              type="reload"
              onClick={() => {
                this.handleChangeMode("repeat");
              }}
            />
            <p className="repeat-group__label">{this.state.repeat.title}</p>
          </div>
        </div>
      </div>
    );
  }
}

export default PlayerContainer;
