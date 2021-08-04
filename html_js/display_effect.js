// Z技
var Zlist = [
    ['ノーマル', 'ウルトラダッシュアタック', 'ノーマルZ'], 
    ['くさ', 'ブルームシャインエクストラ', 'クサZ'], 
    ['ほのお', 'ダイナミックフルフレイム', 'ホノオZ'], 
    ['みず', 'スーパーアクアトルネード', 'ミズZ'], 
    ['でんき', 'スパーキングギガボルト', 'デンキZ'], 
    ['ひこう', 'ファイナルダイブクラッシュ', 'ヒコウZ'], 
    ['かくとう', 'ぜんりょくむそうげきれつけん', 'カクトウZ'], 
    ['じめん', 'ライジングランドオーバー', 'ジメンZ'], 
    ['むし', 'ぜったいほしょくかいてんざん', 'ムシZ'], 
    ['いわ', 'ワールズエンドフォール', 'イワZ'], 
    ['あく', 'ブラックホールイクリプス', 'アクZ'], 
    ['こおり', 'レイジングジオフリーズ', 'コオリZ'], 
    ['どく', 'アシッドポイズンデリート', 'ドクZ'], 
    ['はがね', 'ちょうぜつらせんれんげき', 'ハガネZ'], 
    ['ゴースト', 'むげんあんやへのいざない', 'ゴーストZ'], 
    ['エスパー', 'マキシマムサイブレイカー', 'エスパーZ'], 
    ['ドラゴン', 'アルティメットドラゴンバーン', 'ドラゴンZ'], 
    ['フェアリー', 'ラブリースターインパクト', 'フェアリーZ']
]

// 専用Z
var spZlist = [
    ['ピカチュウ', 'ひっさつのピカチュート', 'ピカチュウZ', 'ボルテッカー'], 
    ['ジュナイパー', 'シャドーアローズストライク', 'ジュナイパーZ', 'かげぬい'], 
    ['ガオガエン', 'ハイパーダーククラッシャー', 'ガオガエンZ', 'DDラリアット'], 
    ['アシレーヌ', 'わだつみのシンフォニア', 'アシレーヌZ', 'うたかたのアリア'], 
    ['カプ・コケコ', 'ガーディアン・デ・アローラ', 'カプZ', 'しぜんのいかり'], 
    ['カプ・テテフ', 'ガーディアン・デ・アローラ', 'カプZ', 'しぜんのいかり'], 
    ['カプ・ブルル', 'ガーディアン・デ・アローラ', 'カプZ', 'しぜんのいかり'], 
    ['カプ・レヒレ', 'ガーディアン・デ・アローラ', 'カプZ', 'しぜんのいかり'], 
    ['マーシャドー', 'しちせいだっこんたい', 'マーシャドーZ', 'シャドースチール'], 
    ['ライチュウ(アローラのすがた)', 'ライトニングサーフライド', 'アロライZ', '10まんボルト'], 
    ['カビゴン', 'ほんきをだす こうげき', 'カビゴンZ', 'ギガインパクト'], 
    ['イーブイ', 'ナインエボルブースト', 'イーブイZ', 'とっておき'], 
    ['ミュウ', 'オリジンズスーパーノヴァ', 'ミュウZ', 'サイコキネシス'], 
    ['サトシのピカチュウ', '1000まんボルト', 'サトピカZ', '10まんボルト'], 
    ['ソルガレオ', 'サンシャインスマッシャー', 'ソルガレオZ', 'メテオドライブ'], 
    ['日食ネクロズマ', 'サンシャインスマッシャー', 'ソルガレオZ', 'メテオドライブ'], 
    ['ルナアーラ', 'ムーンライトブラスター', 'ルナアーラZ', 'シャドーレイ'], 
    ['月食ネクロズマ', 'ムーンライトブラスター', 'ルナアーラZ', 'シャドーレイ'], 
    ['ウルトラネクロズマ', 'てんこがすめつぼうのひかり', 'ウルトラネクロZ', 'フォトンゲイザー'], 
    ['ミミッキュ', 'ぽかぼかフレンドタイム', 'ミミッキュZ', 'じゃれつく'], 
    ['ルガルガン', 'ラジアルエッジストーム', 'ルガルガンZ', 'ストーンエッジ'], 
    ['ジャラランガ', 'ブレイジングソウルビート', 'ジャラランガZ', 'スケイルノイズ'], 
]


// キョダイマックス
var gigalist = [
    ['フシギバナ', 'キョダイベンタツ', 'くさ'], 
    ['リザードン', 'キョダイゴクエン', 'ほのお'], 
    ['カメックス', 'キョダイホウゲキ', 'みず'], 
    ['バタフリー', 'キョダイコワク', 'むし'], 
    ['ピカチュウ', 'キョダイバンライ', 'でんき'], 
    ['ニャース', 'キョダイコバン', 'ノーマル'], 
    ['カイリキー', 'キョダイシンゲキ', 'かくとう'], 
    ['ゲンガー', 'キョダイゲンエイ', 'ゴースト'], 
    ['キングラー', 'キョダイホウマツ', 'みず'], 
    ['ラプラス', 'キョダイセンリツ', 'こおり'], 
    ['イーブイ', 'キョダイホウヨウ', 'ノーマル'], 
    ['カビゴン', 'キョダイサイセイ', 'ノーマル'], 
    ['ダストダス', 'キョダイシュウキ', 'どく'], 
    ['メルメタル', 'キョダイユウゲキ', 'はがね'], 
    ['ゴリランダー', 'キョダイコランダ', 'くさ'], 
    ['エースバーン', 'キョダイカキュウ', 'ほのお'], 
    ['インテレオン', 'キョダイソゲキ', 'みず'], 
    ['アーマーガア', 'キョダイフウゲキ', 'ひこう'], 
    ['イオルブ', 'キョダイテンドウ', 'エスパー'], 
    ['カジリガメ', 'キョダイガンジン', 'みず'], 
    ['セキタンザン', 'キョダイフンセキ', 'いわ'], 
    ['アップリュー', 'キョダイサンゲキ', 'くさ'], 
    ['タルップル', 'キョダイカンロ', 'くさ'], 
    ['サダイジャ', 'キョダイサジン', 'じめん'], 
    ['ストリンダー', 'キョダイカンデン', 'でんき'], 
    ['マルヤクデ', 'キョダイヒャッカ', 'ほのお'], 
    ['ブリムオン', 'キョダイテンバツ', 'フェアリー'], 
    ['オーロンゲ', 'キョダイスイマ', 'あく'], 
    ['マホイップ', 'キョダイダンエン', 'フェアリー'], 
    ['ダイオウドウ', 'キョダイコウジン', 'はがね'], 
    ['ジュラルドン', 'キョダイゲンスイ', 'ドラゴン'], 
    ['ウーラオス(いちげきのかた)', 'キョダイイチゲキ', 'あく'], 
    ['ウーラオス(れんげきのかた)', 'キョダイレンゲキ', 'みず']
]

var dynalist = [
    ['かくとう', 'ダイナックル'], 
    ['ドラゴン', 'ダイドラグーン'], 
    ['はがね', 'ダイスチル'], 
    ['ゴースト', 'ダイホロウ'], 
    ['どく', 'ダイアシッド'], 
    ['むし', 'ダイワーム'], 
    ['じめん', 'ダイアース'], 
    ['あく', 'ダイアーク'], 
    ['ひこう', 'ダイジェット'], 
    ['ノーマル', 'ダイアタック'], 
    ['ほのお', 'ダイバーン'], 
    ['みず', 'ダイストリーム'], 
    ['いわ', 'ダイロック'], 
    ['こおり', 'ダイアイス'], 
    ['でんき', 'ダイサンダー'], 
    ['くさ', 'ダイソウゲン'], 
    ['エスパー', 'ダイサイコ'], 
    ['フェアリー', 'ダイフェアリー'] 
]

var berry_item_list = [
    'チイラのみ', 
    'リュガのみ', 
    'アッキのみ', 
    'ヤタピのみ', 
    'ズアのみ', 
    'タラプのみ', 
    'カムラのみ', 
    'ミクルのみ', 
    'サンのみ', 
    'スターのみ', 
    'ジャポのみ', 
    'レンブのみ', 
    'オッカのみ', 
    'イトケのみ', 
    'ソクノのみ', 
    'リンドのみ', 
    'ヤチェのみ', 
    'ヨプのみ', 
    'ビアーのみ', 
    'シュカのみ', 
    'バコウのみ', 
    'ウタンのみ', 
    'タンガのみ', 
    'ヨロギのみ', 
    'カシブのみ', 
    'ハバンのみ', 
    'ナモのみ', 
    'リリバのみ', 
    'ロゼルのみ', 
    'ホズのみ', 
    'オレンのみ', 
    'オボンのみ', 
    'ナゾのみ', 
    'ヒメリのみ', 
    'ラムのみ', 
    'モモンのみ', 
    'チーゴのみ', 
    'クラボのみ', 
    'カゴのみ', 
    'ナナシのみ', 
    'キーのみ', 
    'イバンのみ', 
    'フィラのみ', 
    'ウイのみ', 
    'マゴのみ', 
    'バンジのみ', 
    'イアのみ'
]