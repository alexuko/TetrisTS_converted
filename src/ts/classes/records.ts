export default class Records {
  private _player: string;
  private _level: number;
  private _score: number;
  private _lines: number;

  constructor(player?: string, level?: number) {
    this._player = !player ? 'unknown' : player;
    this._level = !level || level < 1 ? 1 : level;
    this._score = 0;
    this._lines = 0;
  }

  public get score(): number {
    return this._score;
  }

  public get lines(): number {
    return this._lines;
  }

  public get level(): number {
    return this._level;
  }

  public get player(): string {
    return this._player;
  }


  setInitialUIvalues() {
    this.setName(this._player);
    this.setLevel(this._level);
    this.setLines(this._lines);
    this.setScore(this._score);
  }

  setLevel(level: number) {
    let levelUI = document.querySelector("strong.current_level")!;
    this._level = level;
    levelUI.textContent = this._level.toString();
    return this._level;
  }

  setScore(score: number = 0) {
    let scoreUI = document.querySelector("strong.current_score")!;
    this._score = score;
    scoreUI.textContent = this._score.toString();
    return this._score;
  }

  setLines(lines: number = 0) {
    let linesUI = document.querySelector("strong.current_lines")!;
    this._lines = lines;
    linesUI.textContent = this._lines.toString();
    return this._lines;
  }
  
  setName(name: string) {
    let playerUI = document.querySelector("strong.current_player")! as HTMLElement;
    playerUI.textContent = this._player = name;
  }
}
