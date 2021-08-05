var item_list = [
    'あいいろのたま', 
    'アイスメモリ', 
    'あおぞらプレート', 
    'あかいいと', 
    'アクZ', 
    'アクアカセット', 
    'あくのジュエル', 
    'アシレーヌZ', 
    'あついいわ', 
    'アッキのみ', 
    'あつぞこブーツ', 
    'アブソルナイト', 
    'あやしいおこう', 
    'アロライZ', 
    'イアのみ', 
    'いかずちプレート', 
    'イトケのみ', 
    'イナズマカセット', 
    'いのちのたま', 
    'イバンのみ', 
    'イワZ', 
    'いわのジュエル', 
    'イーブイZ', 
    'ウイのみ', 
    'うしおのおこう', 
    'ウタンのみ', 
    'ウルトラネクロZ', 
    'エスパーZ', 
    'エスパージュエル', 
    'エルレイドナイト', 
    'エレキシード', 
    'エレクトロメモリ', 
    'おうじゃのしるし', 
    'おおきなねっこ', 
    'オッカのみ', 
    'オニゴーリナイト', 
    'おはなのおこう', 
    'オボンのみ', 
    'オレンのみ', 
    'かいがらのすず', 
    'カイロスナイト', 
    'かえんだま', 
    'カクトウZ', 
    'かくとうジュエル', 
    'カゴのみ', 
    'カシブのみ', 
    'かたいいし', 
    'カビゴンZ', 
    'カプZ', 
    'カムラのみ', 
    'カメックスナイト', 
    'からぶりほけん', 
    'かるいし', 
    'ガオガエンZ', 
    'ガブリアスナイト', 
    'ガルーラナイト', 
    'がんせきおこう', 
    'がんせきプレート', 
    'キーのみ', 
    'きあいのタスキ', 
    'きあいのハチマキ', 
    'きせきのタネ', 
    'きのみジュース', 
    'きゅうこん', 
    'きょうせいギプス', 
    'きれいなぬけがら', 
    'ギャラドスナイト', 
    'ぎんのこな', 
    'クサZ', 
    'くさのジュエル', 
    'クチートナイト', 
    'くちたけん', 
    'くちたたて', 
    'くっつきバリ', 
    'クラボのみ', 
    'くろいてっきゅう', 
    'くろいヘドロ', 
    'くろいメガネ', 
    'くろおび', 
    'グラウンドメモリ', 
    'グラスシード', 
    'グラスメモリ', 
    'グランドコート', 
    'ゲンガナイト', 
    'こうかくレンズ', 
    'こうこうのしっぽ', 
    'こうてつプレート', 
    'コオリZ', 
    'こおりのジュエル', 
    'こころのしずく', 
    'こだわりスカーフ', 
    'こだわりハチマキ', 
    'こだわりメガネ', 
    'こぶしのプレート', 
    'こわもてプレート', 
    'こんごうだま', 
    'ゴツゴツメット', 
    'ゴーストZ', 
    'ゴーストジュエル', 
    'ゴーストメモリ', 
    'サイキックメモリ', 
    'サイコシード', 
    'さざなみのおこう', 
    'サトピカZ', 
    'サメハダナイト', 
    'さらさらいわ', 
    'サンのみ', 
    'サーナイトナイト', 
    'しずくプレート', 
    'しめったいわ', 
    'しめつけバンド', 
    'シュカのみ', 
    'しらたま', 
    'しろいハーブ',  
    'シルクのスカーフ', 
    'しんかいのウロコ', 
    'しんかいのキバ', 
    'しんかのきせき', 
    'しんぴのしずく',
    'じしゃく', 
    'ジメンZ', 
    'じめんのジュエル', 
    'じゃくてんほけん', 
    'ジャポのみ', 
    'ジャラランガZ', 
    'じゅうでんち', 
    'ジュカインナイト', 
    'ジュナイパーZ', 
    'ジュペッタナイト', 
    'スターのみ', 
    'スチールメモリ', 
    'スピアナイト', 
    'スピードパウダー', 
    'するどいくちばし', 
    'するどいキバ', 
    'するどいツメ', 
    'ズアのみ', 
    'せいれいプレート', 
    'せんせいのツメ', 
    'ソクノのみ', 
    'ソルガレオZ', 
    'たつじんのおび', 
    'タブンネナイト', 
    'たべのこし', 
    'たまむしプレート', 
    'タラプのみ', 
    'タンガのみ', 
    'ダークメモリ', 
    'だいちのプレート', 
    'だっしゅつパック', 
    'だっしゅつボタン', 
    'チイラのみ', 
    'チャーレムナイト', 
    'ちからのハチマキ', 
    'チルタリスナイト', 
    'チーゴのみ', 
    'つめたいいわ', 
    'つららのプレート', 
    'ディアンシナイト', 
    'デンキZ', 
    'でんきだま', 
    'でんきのジュエル', 
    'デンリュウナイト', 
    'とけないこおり', 
    'とつげきチョッキ', 
    'ドクZ', 
    'どくどくだま', 
    'どくのジュエル', 
    'どくバリ', 
    'ドラゴンZ', 
    'ドラゴンジュエル', 
    'ドラゴンメモリ', 
    'ながねぎ', 
    'ナゾのみ', 
    'ナナシのみ', 
    'ナモのみ', 
    'ねばりのかぎづめ', 
    'ねらいのまと', 
    'ノーマルZ', 
    'ノーマルジュエル', 
    'のどスプレー', 
    'のろいのおふだ', 
    'のんきのおこう', 
    'ハガネZ', 
    'ハガネールナイト', 
    'はがねのジュエル', 
    'はっきんだま', 
    'ハッサムナイト', 
    'ハバンのみ', 
    'バクーダナイト', 
    'バグメモリ', 
    'バコウのみ', 
    'バシャーモナイト', 
    'バンギラスナイト', 
    'バンジのみ', 
    'ばんのうがさ', 
    'パワフルハーブ', 
    'パワーアンクル', 
    'パワーウエイト', 
    'パワーバンド', 
    'パワーベルト', 
    'パワーリスト', 
    'パワーレンズ', 
    'ひかりごけ', 
    'ひかりのこな', 
    'ひかりのねんど', 
    'ヒコウZ', 
    'ひこうのジュエル', 
    'ひのたまプレート', 
    'ヒメリのみ', 
    'ビアーのみ', 
    'ビビリだま', 
    'ピカチュウZ', 
    'ピジョットナイト', 
    'ピントレンズ', 
    'ファイトメモリ', 
    'ファイヤーメモリ', 
    'フィラのみ', 
    'ふうせん', 
    'フェアリーZ', 
    'フェアリージュエル', 
    'フェアリーメモリ', 
    'フォーカスレンズ', 
    'ふしぎのプレート', 
    'フシギバナイト', 
    'ふといホネ', 
    'フライングメモリ', 
    'フリーズカセット', 
    'フーディナイト', 
    'ブレイズカセット', 
    'プテラナイト', 
    'ヘラクロスナイト', 
    'ヘルガナイト', 
    'べにいろのたま', 
    'ホズのみ', 
    'ホノオZ', 
    'ほのおのジュエル', 
    'ぼうごパット', 
    'ぼうじんゴーグル', 
    'ボスゴドラナイト', 
    'ボーマンダナイト', 
    'ポイズンメモリ', 
    'まがったスプーン', 
    'マゴのみ', 
    'まんぷくおこう', 
    'マーシャドーZ', 
    'ミクルのみ', 
    'ミストシード', 
    'ミズZ', 
    'みずのジュエル', 
    'みどりのプレート', 
    'ミミッキュZ', 
    'ミミロップナイト', 
    'ミュウZ', 
    'ミュウツナイトX', 
    'ミュウツナイトY', 
    'ムシZ', 
    'むしのジュエル', 
    'メタグロスナイト', 
    'メタルコート', 
    'メタルパウダー', 
    'メトロノーム', 
    'メンタルハーブ', 
    'もうどくプレート', 
    'もくたん', 
    'ものしりメガネ', 
    'もののけプレート', 
    'モモンのみ', 
    'ヤタピのみ', 
    'ヤチェのみ', 
    'ヤドランナイト', 
    'ヤミラミナイト', 
    'やわらかいすな', 
    'ゆきだま', 
    'ユキノオナイト', 
    'ヨプのみ', 
    'ヨロギのみ', 
    'ライボルトナイト', 
    'ラグラージナイト', 
    'ラッキーパンチ', 
    'ラティアスナイト', 
    'ラティオスナイト', 
    'ラムのみ', 
    'リザードナイトX', 
    'リザードナイトY', 
    'りゅうのキバ', 
    'りゅうのプレート', 
    'リュガのみ', 
    'リリバのみ', 
    'リンドのみ', 
    'ルカリオナイト', 
    'ルガルガンZ', 
    'ルナアーラZ', 
    'ルームサービス', 
    'レッドカード', 
    'レンブのみ', 
    'ロゼルのみ', 
    'ロックメモリ'
]

var random_item_list = [
    'あかいいと', 
    'あくのジュエル', 
    'あついいわ', 
    'アッキのみ', 
    'あつぞこブーツ', 
    'あやしいおこう', 
    'イアのみ', 
    'イトケのみ', 
    'いのちのたま', 
    'イバンのみ', 
    'いわのジュエル', 
    'ウイのみ', 
    'うしおのおこう', 
    'ウタンのみ', 
    'エスパージュエル', 
    'エレキシード', 
    'おうじゃのしるし', 
    'おおきなねっこ', 
    'オッカのみ', 
    'おはなのおこう', 
    'オボンのみ', 
    'オレンのみ', 
    'かいがらのすず', 
    'かえんだま', 
    'かくとうジュエル', 
    'カゴのみ', 
    'カシブのみ', 
    'かたいいし', 
    'カムラのみ', 
    'からぶりほけん', 
    'かるいし', 
    'がんせきおこう', 
    'キーのみ', 
    'きあいのタスキ', 
    'きあいのハチマキ', 
    'きせきのタネ', 
    'きのみジュース', 
    'きゅうこん', 
    'きれいなぬけがら', 
    'ぎんのこな', 
    'くさのジュエル', 
    'くっつきバリ', 
    'クラボのみ', 
    'くろいてっきゅう', 
    'くろいヘドロ', 
    'くろいメガネ', 
    'くろおび', 
    'グラスシード', 
    'グランドコート', 
    'こうかくレンズ', 
    'こうこうのしっぽ', 
    'こおりのジュエル', 
    'こころのしずく', 
    'こだわりスカーフ', 
    'こだわりハチマキ', 
    'こだわりメガネ', 
    'ゴツゴツメット', 
    'ゴーストジュエル', 
    'サイコシード', 
    'さざなみのおこう', 
    'さらさらいわ', 
    'サンのみ', 
    'しめったいわ', 
    'しめつけバンド', 
    'シュカのみ', 
    'しろいハーブ', 
    'シルクのスカーフ', 
    'しんかのきせき', 
    'しんぴのしずく', 
    'じしゃく', 
    'じめんのジュエル', 
    'じゃくてんほけん', 
    'ジャポのみ', 
    'じゅうでんち', 
    'スターのみ', 
    'するどいくちばし', 
    'するどいキバ', 
    'するどいツメ', 
    'ズアのみ', 
    'せんせいのツメ', 
    'ソクノのみ', 
    'たつじんのおび', 
    'たべのこし', 
    'タラプのみ', 
    'タンガのみ', 
    'だっしゅつパック', 
    'だっしゅつボタン', 
    'チイラのみ', 
    'ちからのハチマキ', 
    'チーゴのみ', 
    'つめたいいわ', 
    'でんきだま', 
    'でんきのジュエル', 
    'とけないこおり', 
    'とつげきチョッキ', 
    'どくどくだま', 
    'どくのジュエル', 
    'どくバリ', 
    'ドラゴンジュエル', 
    'ナゾのみ', 
    'ナナシのみ', 
    'ナモのみ', 
    'ねばりのかぎづめ', 
    'ねらいのまと', 
    'ノーマルジュエル', 
    'のどスプレー', 
    'のろいのおふだ', 
    'のんきのおこう', 
    'はがねのジュエル', 
    'ハバンのみ', 
    'バコウのみ', 
    'バンジのみ', 
    'ばんのうがさ', 
    'パワフルハーブ', 
    'ひかりごけ', 
    'ひかりのこな', 
    'ひかりのねんど', 
    'ひこうのジュエル', 
    'ヒメリのみ', 
    'ビアーのみ', 
    'ビビリだま', 
    'ピントレンズ', 
    'フィラのみ', 
    'ふうせん', 
    'フェアリージュエル', 
    'フォーカスレンズ', 
    'ホズのみ', 
    'ほのおのジュエル', 
    'ぼうごパット', 
    'ぼうじんゴーグル', 
    'まがったスプーン', 
    'マゴのみ', 
    'まんぷくおこう', 
    'ミクルのみ', 
    'ミストシード', 
    'みずのジュエル', 
    'むしのジュエル', 
    'メタルコート', 
    'メタルパウダー', 
    'メトロノーム', 
    'メンタルハーブ', 
    'もくたん', 
    'ものしりメガネ', 
    'モモンのみ', 
    'ヤタピのみ', 
    'ヤチェのみ', 
    'やわらかいすな', 
    'ゆきだま', 
    'ヨプのみ', 
    'ヨロギのみ', 
    'ラムのみ', 
    'りゅうのキバ', 
    'リュガのみ', 
    'リリバのみ', 
    'リンドのみ', 
    'ルームサービス', 
    'レッドカード', 
    'レンブのみ', 
    'ロゼルのみ'
]