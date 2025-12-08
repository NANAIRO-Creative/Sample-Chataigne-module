# Timecode Converter - Chataigne Module

float（秒）とHH:MM:SS:FF形式のタイムコードを相互変換するChataigneカスタムモジュールです。

## インストール方法

このフォルダを以下のディレクトリにコピーしてください：

- **Windows**: `C:\Users\<Username>\Documents\Chataigne\modules\`
- **Mac**: `/Users/<Username>/Documents/Chataigne/modules/`
- **Linux**: `/home/<Username>/Chataigne/modules/`

その後、Chataigneを再起動してください。

## 機能

### 1. Seconds → Timecode 変換（コマンド経由）
**Set Seconds** コマンドを使用して、float値をタイムコードに変換します。

- 結果は **Values > outputTimecode** に出力されます
- State Machine の Consequence や Mapping から呼び出し可能

### 2. Timecode → Seconds 変換

2つの方法があります：

**A) コマンド経由（他のモジュールから）**
- **Set Timecode** コマンドを使用
- 結果は **Values > outputSeconds** に出力されます

**B) 手入力（Parameters経由）**
- **Parameters > inputTimecode** に HH:MM:SS:FF 形式で入力
- 結果は **Values > outputSeconds** に出力されます

### 3. フレームレート設定
**Parameters > frameRate** でフレームレートを設定できます（デフォルト: 30fps）。

## 使用例

### 他のモジュールから秒数を受け取ってタイムコード表示

1. State Machine で Mapping を作成
2. Input: 送信元モジュールの時間値（float）
3. Output: `Timecode Converter > Commands > Set Seconds`
4. `Values > outputTimecode` をダッシュボードなどで表示

### タイムコードを他のモジュールに送信

1. `Parameters > inputTimecode` に手入力（例: `01:30:45:15`）
2. State Machine で Mapping を作成
3. Input: `Timecode Converter > Values > outputSeconds`
4. Output: 送信先モジュールのパラメータ

### Consequence でタイムコードを設定

1. State の Consequence を追加
2. Module: `Timecode Converter`
3. Command: `Set Seconds` または `Set Timecode`
4. パラメータに値を設定

## トラブルシューティング

Loggerパネルで変換のログを確認できます。エラーが発生した場合は警告メッセージが表示されます。

## ライセンス

Public Domain (Unlicense)
