const moveEff = require("./move_effect")
const itemEff = require("./item_effect")
const afn = require("./function")
const bfn = require("./base_function")
const cfn = require("./law_function")
const summon = require("./1_summon")
const process = require("./4_move_effect")
const com = require("./compatibility")

// ターン終了時の処理順

// 0.その他の終了
    // まもる、みきり、ニードルガード、トーチカ
    // キングシールド、ブロッキング
    // ファストガード、ワイドガード、トリックガード
    // たたみがえし
    // ふんじん



exports.endProcess = function(user1, user2){

    cfn.logWrite(user1, user2, "---------- 終了時の処理 ----------" + "\n")

    // 素早さ判定
    let order = afn.speedCheck(user1.con, user2.con)
    if (order[0] > order[1] || (order[0] == order[1] && Math.random() < 0.5)){
        order = [user1, user2]
    } else {
        order = [user2, user1]
    }
    if (user1.con.f_con.includes("トリックルーム")){
        order = [order[1], order[0]]
    }
    const reverse = [order[1], order[0]]

    // 1.てんきの効果
    weatherEffect(order, reverse)
    // 2.みらいよち/はめつのねがい: 技が使用された順に発動
    futureAttack(order, reverse)
    // 3.ねがいごと
    wishRecover(order, reverse)
    // 4.場の状態・特性・もちものによる回復・ダメージ
    fieldAbilityItemDamage(order, reverse)
    // 5.アクアリング
    aquaRing(order, reverse)
    // 6.ねをはる
    ingrain(order, reverse)
    // 7.やどりぎのタネ
    leechSeed(order, reverse)
    // 8 どく/もうどく/ポイズンヒール
    acidCheck(order, reverse)
    // 9 やけど
    burnCheck(order, reverse)
    // 10.あくむ
    nightmare(order, reverse)
    // 11.のろい
    curse(order, reverse)
    // 12.バインド
    bindCheck(order, reverse)
    // 1[3.たこが, reverse]ため
    octolock(order, reverse)
    // 14.ちょうはつの終了
    tauntEnd(order, reverse)
    // 15.アンコールの終了
    encoreEnd(order, reverse)
    // 16.かなしばりの終了
    disableEnd(order, reverse)
    // 17.でんじふゆうの終了
    magnetRiseEnd(order, reverse)
    // 18.テレキネシスの終了
    telekinesisEnd(order, reverse)
    // 19.かいふくふうじの終了
    healBlockEnd(order, reverse)
    // 20.さ[しおさえの, reverse]終了
    embargoEnd(order, reverse)
    // 21.ねむけ
    sleepCheck(order, reverse)
    // 22, reverse.ほろびのうた
    perishSong(order, reverse)
    // 23.片側の場の状態の継続/終了: ホスト側の状態が先にすべて解除された後に、ホストでない側の状態が解除される。
    oneSideFieldEnd(order, reverse)
    // 24.全体の場の状態の継続/終了
    bothSideFieldEnd(order, reverse)
    // 25.はねやすめ解除
    roostEnd(order, reverse)
    // 26.その他の状態・特性・もちもの
    otherConditionAbilityItem(order, reverse)
    // 27.ダルマモード
    zenMode(order, reverse)
    // 28.リミットシールド
    shieldsDown(order, reverse)
    // 29.スワームチェンジ
    powerConstruct(order, reverse)
    // 30.ぎょぐん
    schooling(order, reverse)
    // 31.はらぺこスイッチ
    hungerSwitch(order, reverse)

    // A.その他の終了
    otherEnd(order, reverse)
    // B.その他の処理
    otherProcess(order, reverse)

    cfn.logWrite(order[0], order[1], "---------- ターン終了 ----------" + "\n")

    // C.ひんしのポケモンがいる時、交換する
    returnFaintedPokemon(order, reverse)
    // D.次ターンの、選択ボタンの無効化
    cannotChooseAction(order, reverse)
}

// A.その他の終了
function otherEnd(order, reverse){
    // ポケモンの状態の終了
    for (const team of order){
        for (let text of end_process_poke_condition){
            cfn.conditionRemove(team.con, "poke", text)
        }
    }
    // フィールドの状態の終了
    for (const team of order){
        for (let text of end_process_field_condition){
            cfn.conditionRemove(team.con, "field", text)
        }
    }
    
    for (const team of [order, reverse]){
        // じごくづきのターン消費
        decreasePerTurn(team[0], team[1], "じごくづき", "p")
        // じゅうでんのテキスト変更
        if (team[0].con.p_con.includes("じゅうでん　開始")){
            cfn.conditionRemove(team[0].con, "poke", "じゅうでん　開始")
            team[0].con.p_con += "じゅうでん" + CR
        } else {
            cfn.conditionRemove(team[0].con, "poke", "じゅうでん")
        }
        // とぎすますのテキスト変更
        if (team[0].con.p_con.includes("とぎすます　開始")){
            cfn.conditionRemove(team[0].con, "poke", "とぎすます　開始")
            team[0].con.p_con += "とぎすます" + CR
        } else {
            cfn.conditionRemove(team[0].con, "poke", "とぎすます")
        }
        // フェアリーロックのテキスト変更
        if (team[0].con.p_con.includes("逃げられない：フェアリーロック　開始")){
            cfn.conditionRemove(team[0].con, "poke", "逃げられない：フェアリーロック　開始")
            team[0].con.p_con += "逃げられない：フェアリーロック" + CR
        } else {
            cfn.conditionRemove(team[0].con, "poke", "逃げられない：フェアリーロック")
        }
    }
}

var end_process_poke_condition = [
    'みきり', 
    'ニードルガード', 
    'トーチカ', 
    'キングシールド', 
    'ブロッキング', 
    'ファストガード', 
    'ワイドガード', 
    'トリックガード', 
    'たたみがえし', 
    'ふんじん', 
    'ランク上昇', 
    'ランク下降', 
    'ちゅうもくのまと', 
    'きあいパンチ', 
    'こらえる', 
    'アイスボール　+5', 
    'ころがる　+5', 
    'そうでん', 
    'ダメおし', 
    'トラップシェル：成功', 
    'ダメージ', 
    'よこどり', 
    'ミクルのみ', 
    'くちばしキャノン', 
    'カウンター', 
    'ミラーコート', 
    'メタルバースト', 
    'マジックコート', 
    'ひるみ', 
    'スキン'
]

var end_process_field_condition = [
    'プラズマシャワー'
]

// 技選択肢の無効化　アンコール、いちゃもん、かなしばり、溜め技、ちょうはつ、ふういん
// B.その他の処理
function otherProcess(order, reverse){
    for (const team of [order, reverse]){
        // エコーボイスのターン経過
        let list = team[0].con.p_con.split("\n")
        for (let i = 0; i < list.length; i++){
            if (list[i].includes("エコーボイス") &&  Number(list[i].slice(8)) % 1 != 0){
                list[i] = "エコーボイス　+" + Math.ceil(Number(list[i].slice(8)))
            } else if (list[i].includes("エコーボイス") &&  Number(list[i].slice(8)) % 1 == 0){
                list.split(i, 1)
            }
        }
        team[0].con.p_con = list.join("\n")
        // 守る成功の削除
        if (!moveEff.protect().includes(team[0].con.used)){
            cfn.conditionRemove(team[0].con, "poke", "守る")
        }
        // ひんしであれば、ポケモンの状態を削除
        if (team[0].con.f_con.includes("ひんし")){
            team[0].con.p_con = ""
        }
    }
}

// C.ひんしのポケモンがいる時、交換する
function returnFaintedPokemon(order, reverse){
    for (const team of [order, reverse]){
        if (team[0].con.f_con.includes("ひんし")){
            cfn.logWrite(team[0], team[1], team[0].con.TN + "　は　戦闘に出すポケモンを選んでください" + "\n")
        }
    }
}

// D.次ターンの、選択ボタンの無効化
function cannotChooseAction(order, reverse){
    for (const team of [order, reverse]){
        // ほおばる：きのみを持っている場合、技選択が可能になる
        for (let i = 0; i < 4; i++){
            if (team[0].con["move_" + i] == "ほおばる"){
                if (itemEff.berryList().includes((team[0]).con.item)){
                    team[0].data["radio_" + i] = false
                } else {
                    team[0].data["radio_" + i] = true
                }
            }
        }
        // ゲップ：備考欄に「ゲップ」の文字があれば使用可能になる
        for (let i = 0; i < 4; i++){
            if (team[0].con["move_" + i] == "ゲップ" && team[0]["poke" + cfn.battleNum(team[0])].belch == "ゲップ"){
                team[0].data["radio_" + i] = false
            }
        }
        // いちゃもん
        if (team[0].con.p_con.includes("いちゃもん")){
            for (let i = 0; i < 4; i++){
                if (team[0].con["move_" + i] == team[0].con.used){
                    team[0].data["radio_" + i] = true
                }
            }
        }
        // こだわりロック
        if (!team[0].con.item.includes("こだわり") && team[0].con.ability != "ごりむちゅう"){
            cfn.conditionRemove(team[0].con, "poke", "こだわりロック")
        }
        for (let i = 0; i < team[0].con.p_con.split("\n").length - 1; i++){
            if (team[0].con.p_con.split("\n")[i].includes("こだわりロック")){
                for (let j = 0; j < 4; j++){
                    if (team[0].con["move_" + j] != team[0].con.p_con.split("\n")[i].slice(8)){
                        team[0].data["radio_" + j] = true
                    }
                }
            }
        }
        // とつげきチョッキ
        if (team[0].con.item == "とつげきチョッキ"){
            for (let i = 0; i < 4; i++){
                if (cfn.moveSearchByName(team[0].con["move_" + i])[2] == "変化"){
                    team[0].con["radio_" + i] = true
                }
            }
        }
        // 逃げられない状態、バインド状態による交換ボタンの無効化
        if (team[0].con.p_con.includes("逃げられない") || team[0].con.p_con.includes("バインド") || team[0].con.p_con.includes("ねをはる") || team[0].con.f_con.includes("フェアリーロック") 
        || (team[1].con.ability == "ありじごく" && cfn.groundedCheck(team[0].con)) 
        || (team[1].con.ability == "かげふみ" && team[0].con.ability != "かげふみ") 
        || (team[1].con.ability == "じりょく" && team[0].con.type.includes("はがね"))){
            if (team[0].con.item != "きれいなぬけがら" && !team[0].con.type.includes("ゴースト")){
                for (let i = 0; i < 3; i++){
                    team[0].data["radio_" + String(i + 4)] = true
                }
            }
        }
        // 反動で動けなくなる技の反動ターン
        // 溜め技の攻撃ターン
        // 数ターン行動する技の使用中
        if (team[0].con.p_con.includes("反動で動けない") || team[0].con.p_con.includes("溜め技") || team[0].con.p_con.includes("あばれる") 
        || team[0].con.p_con.includes("アイスボール") || team[0].con.p_con.includes("ころがる") || team[0].con.p_con.includes("がまん") || team[0].con.p_con.includes("さわぐ")){
            for (let i = 0; i < 7; i++){
                team[0].data["radio_" + i] = true
            }
        }
        if (team[0].con.p_con.includes("姿を隠す：フリーフォール（防御）")){
            for (let i = 4; i < 7; i++){
                team[0].data["radio_" + i] = true
            }
        }
    }
}


// 1.てんきの効果
function weatherEffect(order, reverse){
    // a. にほんばれ/あめ/すなあらし/あられの終了
    for (const team of [order, reverse]){
        if (!team[0].con.f_con.includes("おおひでり") && !team[0].con.f_con.includes("おおあめ")){
            decreasePerTurn(team[0], team[1], "にほんばれ", "f")
            decreasePerTurn(team[0], team[1], "あめ", "f")
            decreasePerTurn(team[0], team[1], "すなあらし", "f")
            decreasePerTurn(team[0], team[1], "あられ", "f")
        }
    }
    // b. すなあらし/あられのダメージ
    for (const team of [order, reverse]){
        if (team[0].con.last_HP > 0 && team[0].con.ability != "ぼうじん" && team[0].con.item != "ぼうじんゴーグル" && cfn.isWeather(order[0].con, order[1].con)){
            if (team[0].con.f_con.includes("すなあらし") && !(team[0].con.type.includes("いわ") || team[0].con.type.includes("じめん") || team[0].con.type.includes("はがね") || team[0].con.ability == "すながくれ" || team[0].con.ability == "すなかき" || team[0].con.ability == "すなのちから")){
                afn.HPchangeMagic(team[0], team[1], Math.floor(team[0].con.full_HP / 16), "-", "すなあらし")
            } else if (team[0].con.f_con.includes("あられ") && !(team[0].con.type.includes("こおり") || team[0].con.ability == "アイスボディ" || team[0].con.ability == "ゆきかき" || team[0].con.ability == "ゆきがくれ")){
                afn.HPChangeMagic(team[0], team[1], Math.floor(team[0].con.full_HP / 16), "-", "あられ")
            }
        }
    }
    // c. かんそうはだ/サンパワー/あめうけざら/アイスボディ
    for (const team of [order, reverse]){
        if (team[0].con.last_HP > 0 && cfn.isWeather(order[0].con, order[1].con)){
            if (team[0].con.ability == "かんそうはだ" && team[0].con.f_con.includes("にほんばれ")){
                afn.HPChangeMagic(team[0], team[1], Math.floor(team[0].con.full_HP / 8), "-", "かんそうはだ")
            } else if (team[0].con.ability == "かんそうはだ" && team[0].con.f_con.includes("あめ")){
                afn.HPChangeMagic(team[0], team[1], Math.floor(team[0].con.full_HP / 8), "+", "かんそうはだ")
            } else if (team[0].con.ability == "サンパワー" && team[0].con.f_con.includes("にほんばれ")){
                afn.HPChangeMagic(team[0], team[1], Math.floor(team[0].con.full_HP / 8), "-", "サンパワー")
            } else if (team[0].con.ability == "あめうけざら" && team[0].con.f_con.includes("あめ")){
                afn.HPChangeMagic(team[0], team[1], Math.floor(team[0].con.full_HP / 16), "+", "あめうけざら")
            } else if (team[0].con.ability == "アイスボディ" && team[0].con.f_con.includes("あられ")){
                afn.HPChangeMagic(team[0], team[1], Math.floor(team[0].con.full_HP / 16), "+", "アイスボディ")
            }
        }
    }
}

// 2.みらいよち/はめつのねがい: 技が使用された順に発動
function futureAttack(order, reverse){
    for (const team of [order, reverse]){
        let list = team[0].con.f_con.split("\n")
        for (let i = 0; i < list.length; i++){
            if (list[i].includes("みらいよち") || list[i].includes("はめつのねがい")){
                const turn = Number(list[i].slice(-3, -2)) - 1
                list[i] = list[i].slice(0, -3) + turn + "/3"
                if (turn == 0){
                    if (!team[0].con.f_con.includes("ひんし")){
                        cfn.logWrite(team[0], team[1], team[0].con.TN + "　の　" + team[0].con.name + "　は　未来の攻撃を受けた！" + "\n")
                        if (bfn.accuracyFailure(team[1], team[0], cfn.moveSearchByName(list[i].slice(0, -7)))){
                            cfn.logWrite(team[0], team[1], team[0].con.TN + "　の　" + team[0].con.name + "　には当たらなかった" + "\n")
                        } else {
                            process.moveProcess(team[1], team[0], cfn.moveSearchByName(list[i].slice(0, -7)), team)
                        }
                    }
                    list.splice(i, 1)
                }
            }
            break
        }
        team[0].con.f_con = list.join("\n")
    }
}

// 3.ねがいごと
function wishRecover(order, reverse){
    for (const team of [order, reverse]){
        let list = team[0].con.f_con.split("\n")
        for (let i = 0; i < list.length; i++){
            if (list[i].includes("ねがいごと宣言ターン")){
                list[i] = list[i].substring(0, list[i].indexOf("：") + 1) + "回復ターン"
            } else if (list[i].includes("回復ターン")){
                if (!team[0].con.f_con.includes("ひんし")){
                    cfn.logWrite(team[0], team[1], "願いが叶った！" + "\n")
                    afn.HPchangeMagic(team[0], team[1], Number(list[i].replace(/[^0-9]/g, "")), "+", "ねがいごと")
                    cfn.conditionRemove(team[0].con, "field", "ねがいごと")
                }
                list.splice(i, 1)
            }
            break
        }
        team[0].con.f_con = list.join("\n")
    }
}

// 4.場の状態・特性・もちものによる回復・ダメージ
function fieldAbilityItemDamage(order, reverse){
    // a. ひのうみ/キョダイベンタツ/キョダイゴクエン/キョダイホウゲキ/キョダイフンセキ(ダメージ): 技が使用された順に発動。
    // b. グラスフィールド(回復)
    for (const team of [order, reverse]){
        if (cfn.groundedCheck(team[0].con) && team[0].con.f_con.includes("グラスフィールド")){
            afn.HPChangeMagic(team[0], team[1], Math.floor(team[0].con.full_HP / 16), "+", "グラスフィールド")
        }
    }
    // c. うるおいボディ/だっぴ/いやしのこころ
    for (const team of [order, reverse]){
        if (team[0].con.ability == "うるおいボディ" && team[0].con.f_con.includes("あめ") && team[0].con.abnormal != "" && cfn.isWeather(order[0].con, order[1].con)){
            cfn.logWrite(team[0], team[1], team[0].con.TN + "　の　" + team[0].con.name + "　は　うるおいボディで状態異常が回復！" + "\n")
            team[0].con.abnormal = ""
            team[0]["poke" + cfn.battleNum(team[0])].abnormal = ""
        } else if (team[0].con.ability == "だっぴ" && team[0].con.abnormal != "" && Math.random() < 0.3){
            cfn.logWrite(team[0], team[1], team[0].con.TN + "　の　" + team[0].con.name + "　は　だっぴで状態異常が回復！" + "\n")
            team[0].con.abnormal = ""
            team[0]["poke" + cfn.battleNum(team[0])].abnormal = ""
        }
    }
    // b. たべのこし/くろいヘドロ
    for (const team of [order, reverse]){
        if (team[0].con.item == "たべのこし"){
            afn.HPchangeMagic(team[0], team[1], Math.floor(team[0].con.full_HP / 16), "+", "たべのこし")
        } else if (team[0].con.item == "くろいヘドロ"){
            if (team[0].con.type.includes("どく")){
                afn.HPchangeMagic(team[0], team[1], Math.floor(team[0].con.full_HP / 16), "+", "くろいヘドロ")
            } else {
                afn.HPchangeMagic(team[0], team[1], Math.floor(team[0].con.full_HP / 8), "-", "くろいヘドロ")
            }
        }
    }
}

// 5.アクアリング
function aquaRing(order, reverse){
    for (const team of [order, reverse]){
        if (team[0].con.p_con.includes("アクアリング")){
            let change = Math.floor(team[0].con.full_HP / 16)
            if (team[0].con.item == "おおきなねっこ"){
                change = cfn.fiveCut(change * 5324 / 4096)
            }
            afn.HPchangeMagic(team[0], team[1], change, "+", "アクアリング")
        }
    }
}

// 6.ねをはる
function ingrain(order, reverse){
    for (const team of [order, reverse]){
        if (team[0].con.p_con.includes("ねをはる")){
            let change = Math.floor(team[0].con.full_HP / 16)
            if (team[0].con.item == "おおきなねっこ"){
                change = cfn.fiveCut(change * 5324 / 4096)
            }
            afn.HPchangeMagic(team[0], team[1], change, "+", "ねをはる")
        }
    }
}

// 7.やどりぎのタネ
function leechSeed(order, reverse){
    for (const team of [order, reverse]){
        if (team[0].con.p_con.includes("やどりぎのタネ")){
            let change = Math.floor(team[0].con.full_HP / 8)
            afn.HPchangeMagic(team[0], team[1], change, "-", "やどりぎのタネ")
            if (team[1].con.item == "おおきなねっこ"){
                change = cfn.fiveCut(change * 5324 / 4096)
            }
            if (team[0].con.ability == "ヘドロえき"){
                afn.HPchangeMagic(team[1], team[0], change, "-", "やどりぎのタネ")
            } else {
                afn.HPchangeMagic(team[1], team[0], change, "+", "やどりぎのタネ")
            }
        }
    }
}

// 8 どく/もうどく/ポイズンヒール
function acidCheck(order, reverse){
    for (const team of [order, reverse]){
        if (team[0].con.abnormal == "どく"){
            if (team[0].con.ability == "ポイズンヒール"){
                afn.HPchangeMagic(team[0], team[1], Math.floor(team[0].con.full_HP / 8), "+", "ポイズンヒール")   
            } else {
                afn.HPchangeMagic(team[0], team[1], Math.floor(team[0].con.full_HP / 8), "-", "どく")   
            }   
        }
        let list = team[0].con.p_con.split("\n")
        for (let i = 0; i < list.length; i++){
            if (list[i].includes("もうどく")){
                const turn = Number(list[i].replace(/[^0-9]/g, ""))
                list[i] = "もうどく　" + String(turn + 1) + "ターン目"
                if (team[0].con.ability == "ポイズンヒール"){
                    afn.HPchangeMagic(team[0], team[1], Math.floor(team[0].con.full_HP / 8), "+", "ポイズンヒール")
                } else {
                    afn.HPchangeMagic(team[0], team[1], Math.floor(team[0].con.full_HP * turn / 16), "-", "もうどく")
                }
            }
        }
        team[0].con.p_con = list.join("\n")
    }
}

// 9 やけど
function burnCheck(order, reverse){
    for (const team of [order, reverse]){
        if (team[0].con.abnormal == "やけど"){
            if (team[0].con.ability == "たいねつ"){
                afn.HPchangeMagic(team[0], team[1], Math.floor(team[0].con.full_HP / 32), "-", "やけど")
            } else {
                afn.HPchangeMagic(team[0], team[1], Math.floor(team[0].con.full_HP / 16), "-", "やけど")
            }
        }
    }
}

// 10.あくむ
function nightmare(order, reverse){
    for (const team of [order, reverse]){
        if (team[0].con.p_con.includes("あくむ")){
            afn.HPchangeMagic(team[0], team[1], Math.floor(team[0].con.full_HP / 4), "-", "あくむ")
        }
    }
}

// 11.のろい
function curse(order, reverse){
    for (const team of [order, reverse]){
        if (team[0].con.p_con.includes("のろい")){
            afn.HPchangeMagic(team[0], team[1], Math.floor(team[0].con.full_HP / 4), "-", "のろい")
        }
    }
}

// 12.バインド
function bindCheck(order, reverse){
    for (const team of [order, reverse]){
        let list = team[0].con.p_con.split("\n")
        for (let i = 0; i < list.length; i++){
            if (list[i].includes("バインド（長）")){
                const turn = Number(list[i].replace(/[^0-9]/g, ""))
                if (turn < 7){
                    list[i] = "バインド（長）　" + (turn + 1) + "ターン目"
                    afn.HPchangeMagic(team[0], team[1], Math.floor(team[0].con.full_HP / 8), "-", "バインド")
                } else {
                    cfn.logWrite(team[0], team[1], team[0].con.TN + "　の　" + team[0].con.name + "　は　バインドから　解放された！" + "\n")
                    list.splice(i, 1)
                }
                break
            } else if (list[i].includes("バインド")){
                const turn = Number(list[i].replace(/[^0-9]/g, ""))
                if (turn < 4 || (turn == 5 && Math.random() < 0.5)){
                    list[i] = list[i].slice(0, -5) + (turn + 1) + "ターン目"
                    if (list[i].includes("バインド（強）")){
                        afn.HPchangeMagic(team[0], team[1], Math.floor(team[0].con.full_HP / 6), "-", "バインド")
                    } else {
                        afn.HPchangeMagic(team[0], team[1], Math.floor(team[0].con.full_HP / 8), "-", "バインド")
                    }
                } else {
                    cfn.logWrite(team[0], team[1], team[0].con.TN + "　の　" + team[0].con.name + "　は　バインドから　解放された！" + "\n")
                    list.splice(i, 1)
                }
                break
            }
        }
        team[0].con.p_con = list.join("\n")
    }
}

// 13.たこがため
function octolock(order, reverse){
    for (const team of [order, reverse]){
        if (team[0].con.p_con.includes("たこがため")){
            cfn.logWrite(team[0], team[1], team[0].con.TN + "　の　" + team[0].con.name + "　は　たこがためを　受けている！" + "\n")
            afn.rankChange(team[0], team[1], "B", -1, 100, "たこがため")
            afn.rankChange(team[0], team[1], "D", -1, 100, "たこがため")
        }
    }
}

// 14.ちょうはつの終了
function tauntEnd(order, reverse){
    for (const team of [order, reverse]){
        let list = team[0].con.p_con.split("\n")
        for (let i = 0; i < list.length; i++){
            if (list[i].includes("ちょうはつ")){
                const turn = Number(list[i].slice(6, 7)) - 1
                if (turn > 0){
                    list[i] = "ちょうはつ　" + turn + "/3"
                } else {
                    cfn.logWrite(team[0], team[1], team[0].con.TN + "　の　" + team[0].con.name + "　の　ちょうはつが　とけた！" + "\n")
                    list.splice(i, 1)
                }
                break
            }
        }
        team[0].con.p_con = list.join("\n")
    }
}

// 15.アンコールの終了
function encoreEnd(order, reverse){
    for (const team of [order, reverse]){
        let list = team[0].con.p_con.split("\n")
        for (let i = 0; i < list.length; i++){
            if (list[i].includes("アンコール　0/3")){
                cfn.logWrite(team[0], team[1], team[0].con.TN + "　の　" + team[0].con.name + "　の　アンコールが　とけた！" + "\n")
                list.splice(i, 1)
                team[0].con.p_con = list.join("\n")
                break
            } else if (list[i].includes("アンコール")){
                for (let j = 0; j < 4; j++){
                    if (team[0].con["move_" + j] != list[i].slice(10)){
                        team[0].data["radio_" + j] = true
                    }
                }
            }
        }
    }
}

// 16.かなしばりの終了
function disableEnd(order, reverse){
    for (const team of [order, reverse]){
        let list = team[0].con.p_con.split("\n")
        for (let i = 0; i < list.length; i++){
            if (list[i].includes("かなしばり　0/4")){
                cfn.logWrite(team[0], team[1], team[0].con.TN + "　の　" + team[0].con.name + "　の　かなしばりが　とけた！" + "\n")
                list.splice(i, 1)
                team[0].con.p_con = list.join("\n")
                break
            } else if (list[i].includes("かなしばり")){
                for (let j = 0; j < 4; j++){
                    if (list[i].slice(10) == team[0].con["move_" + j]){
                        team[0].data["radio_" + j] = true
                    }
                }
            }
        }
    }
}

// 17.でんじふゆうの終了
function magnetRiseEnd(order, reverse){
    for (const team of [order, reverse]){
        decreasePerTurn(team[0], team[1], "でんじふゆう", "p")
    }
}

// 18.テレキネシスの終了
function telekinesisEnd(order, reverse){
    for (const team of [order, reverse]){
        decreasePerTurn(team[0], team[1], "テレキネシス", "p")
    }
}

// 19.かいふくふうじの終了
function healBlockEnd(order, reverse){
    for (const team of [order, reverse]){
        decreasePerTurn(team[0], team[1], "かいふくふうじ", "p")
    }
}

// 20.さしおさえの終了
function embargoEnd(order, reverse){
    for (const team of [order, reverse]){
        let list = team[0].con.p_con.split("\n")
        for (let i = 0; i < list.length; i++){
            if (list[i].includes("さしおさえ")){
                const turn = Number(list[i].slice(6, 7)) - 1
                if (turn > 0){
                    list[i] = "さしおさえ　" + turn + "/5：" + list[i].slice(10)
                } else {
                    cfn.logWrite(team[0], team[1], team[0].con.TN + "　の　" + team[0].con.name + "　の　さしおさえが　とけた！" + "\n")
                    team[0].con.item = list[i].slice(10)
                    list.slice(i, 0)
                }
                break
            }
        }
        team[0].con.p_con = list.join("\n")
    }
}

// 21.ねむけ
function sleepCheck(order, reverse){
    for (const team of [order, reverse]){
        let list = team[0].con.p_con.split("\n")
        for (let i = 0; i < list.length; i++){
            if (list[i].includes("ねむけ　宣言ターン")){
                list[i] = "ねむけ"
                break
            } else if (list[i].includes("ねむけ")){
                list.splice(i, 1)
                afn.makeAbnormal(team[0], team[1], "ねむり", 100, "ねむけ")
                break
            }
        }
        team[0].con.p_con = list.join("\n")
    }
}

// 22.ほろびのうた
function perishSong(order, reverse){
    for (const team of [order, reverse]){
        let list = team[0].con.p_con.split("\n")
        for (let i = 0; i < list.length; i++){
            if (list[i].includes("ほろびカウント")){
                const turn = Number(list[i].slice(8)) - 1
                cfn.logWrite(team[0], team[1], team[0].con.TN + "　の　" + team[0].con.name + "　は　ほろびのカウントが　" + turn + "になった！" + "\n")
                if (turn > 0){
                    list[i] = "ほろびカウント　" + turn
                } else {
                    list.splice(i, 1)
                    team[0].con.last_HP = 0
                    bfn.fainted(team[0], team[1])
                }
                break
            }
        }
        team[0].con.p_con = list.join("\n")
    }
}

// 23.片側の場の状態の継続/終了: ホスト側の状態が先にすべて解除された後に、ホストでない側の状態が解除される。
function oneSideFieldEnd(order, reverse){
    for (const team of [order, reverse]){
        // a. リフレクター
        decreasePerTurn(team[0], team[1], "リフレクター", "f")
        // b. ひかりのかべ
        decreasePerTurn(team[0], team[1], "ひかりのかべ", "f")
        // c. しんぴのまもり
        decreasePerTurn(team[0], team[1], "しんぴのまもり", "f")
        // d. しろいきり
        decreasePerTurn(team[0], team[1], "しろいきり", "f")
        // e. おいかぜ
        decreasePerTurn(team[0], team[1], "おいかぜ", "f")
        // f. おまじない
        decreasePerTurn(team[0], team[1], "おまじない", "f")
        // g. にじ
        decreasePerTurn(team[0], team[1], "にじ", "f")
        // h. ひのうみ
        decreasePerTurn(team[0], team[1], "ひのうみ", "f")
        // i. しつげん
        decreasePerTurn(team[0], team[1], "しつげん", "f")
        // j. オーロラベール
        decreasePerTurn(team[0], team[1], "オーロラベール", "f")
    }
}

// 24.全体の場の状態の継続/終了
function bothSideFieldEnd(order, reverse){
    for (const team of [order, reverse]){
        // a. トリックルーム
        decreasePerTurn(team[0], team[1], "トリックルーム", "f")
        // b. じゅうりょく
        decreasePerTurn(team[0], team[1], "じゅうりょく", "f")
        // c. みずあそび
        decreasePerTurn(team[0], team[1], "みずあそび", "p")
        // d. どろあそび
        decreasePerTurn(team[0], team[1], "どろあそび", "p")
        // e. ワンダールーム
        decreasePerTurn(team[0], team[1], "ワンダールーム", "f")
        // f. マジックルーム
        decreasePerTurn(team[0], team[1], "マジックルーム", "f")
        // g. エレキフィールド/グラスフィールド/ミストフィールド/サイコフィールド
        decreasePerTurn(team[0], team[1], "エレキフィールド", "f")
        decreasePerTurn(team[0], team[1], "グラスフィールド", "f")
        decreasePerTurn(team[0], team[1], "ミストフィールド", "f")
        decreasePerTurn(team[0], team[1], "サイコフィールド", "f")
    }
}

// 25.はねやすめ解除
function roostEnd(order, reverse){
    for (const team of [order, reverse]){
        let list = team[0].con.p_con.split("\n")
        for (let i = 0; i < list.length; i++){
            if (list[i].includes("はねやすめ")){
                team[0].con.type += "、" + list[i].slice(6)
                list.splice(i, 1)
                break
            }
        }
        team[0].con.p_con = list.join("\n")
    }
}

// 26.その他の状態・特性・もちもの
function otherConditionAbilityItem(order, reverse){
    for (const team of [order, reverse]){
        // a. さわぐ
        let list = team[0].con.p_con.split("\n")
        for (let i = 0; i < list.length; i++){
            if (list[i].includes("さわぐ")){
                const turn = Number(list[i].slice(4, 5)) + 1
                if (turn < 4){
                    list[i] = "さわぐ　" + turn + "ターン目"
                    cfn.logWrite(team[0], team[1], team[0].con.TN + "　の　" + team[0].con.name + "　は　騒いでいる" + "\n")
                } else {
                    list.splice(i, 1)
                    cfn.logWrite(team[0], team[1], team[0].con.TN + "　の　" + team[0].con.name + "　は　おとなしくなった" + "\n")
                }
                break
            }
        }
        team[0].con.p_con = list.join("\n")
        // b. ねむりによるあばれるの中断
        // c. かそく/ムラっけ/スロースタート/ナイトメア
        if (team[0].con.ability == "かそく"){
            afn.rankChange(team[0], team[1], "S", 1, 100, "かそく")
        } else if (team[0].con.ability == "ムラっけ"){
            const parameter = ["A", "B", "C", "D", "S"]
            const plus = Math.floor(Math.random() * 5)
            afn.rankChange(team[0], team[1], parameter[plus], 2, 100, "ムラっけ")
            parameter.pop(plus)
            const minus = Math.floor(Math.random() * 4)
            afn.rankChange(team[0], team[1], parameter[minus], -1, 100, "ムラっけ")
        } else if (team[0].con.ability == "スロースタート"){
            decreasePerTurn(team[0], team[1], "スロースタート", "p")
        } else if (team[0].con.ability == "ナイトメア" && team[1].con.abnormal == "ねむり"){
            afn.HPchangeMagic(team[1], team[0], Math.floor(team[0].con.full_HP / 8), "-", "ナイトメア")
        }
        // d. くっつきバリ/どくどくだま/かえんだま
        if (team[0].con.item == "くっつきバリ"){
            afn.HPchangeMagic(team[0], team[1], Math.floor(team[0].con.full_HP / 8), "-", "くっつきバリ")
        } else if (team[0].con.item == "どくどくだま"){
            afn.makeAbnormal(team[0], team[1], "もうどく", 100, "どくどくだま")
        } else if (team[0].con.item == "かえんだま"){
            afn.makeAbnormal(team[0], team[1], "やけど", 100, "かえんだま")
        }
        // e. ものひろい/しゅうかく/たまひろい
        if (team[0].con.ability == "ものひろい" && team[0].con.item == ""){

        }
        if (team[0].con.ability == "しゅうかく" && team[0].con.item == "" && itemEff.berryList().includes(team[0]["poke" + cfn.battleNum(team[0])].recycle) && ((team[0].con.f_con.includes("にほんばれ") && cfn.isWeather(team[0].con, team[1].con)) || Math.random() < 0.5)){
            cfn.logWrite(team[0], team[1], team[0].con.TN + "　の　" + team[0].con.name + "　は　しゅうかくで　" + team[0]["poke" + cfn.battleNum(team[0])].recycle + "　を　拾ってきた" + "\n")
            team[0].con.item = team[0]["poke" + cfn.battleNum(team[0])].recycle
            team[0]["poke" + cfn.battleNum(team[0])].recycle = ""
            bfn.berryPinch(team[0])
            bfn.berryAbnormal(team[0])
        }
    }
}

// 27.ダルマモード
function zenMode(order, reverse){
    for (const team of [order, reverse]){
        if (!team[0].con.f_con.includes("ひんし") && team[0].con.last_HP <= team[0].con.full_HP / 2){
            if (team[0].con.ability == "ダルマモード" && team[0].con.name == "ヒヒダルマ"){
                cfn.logWrite(team[0], team[1], team[0].con.TN + "　の　" + team[0].con.name + "　の　ダルマモード！" + "\n")
                afn.formChenge(team[0], team[1], "ヒヒダルマ(ダルマモード)")
            } else if (team[0].con.ability == "ダルマモード" && team[0].con.name == "ヒヒダルマ(ガラルのすがた)"){
                cfn.logWrite(team[0], team[1], team[0].con.TN + "　の　" + team[0].con.name + "　の　ダルマモード！" + "\n")
                afn.formChenge(team[0], team[1], "ヒヒダルマ(ダルマモード(ガラルのすがた))")
            }
        } else if (!team[0].con.f_con.includes("ひんし") && team[0].con.last_HP > team[0].con.full_HP / 2){
            if (team[0].con.ability == "ダルマモード" && team[0].con.name == "ヒヒダルマ(ダルマモード)"){
                cfn.logWrite(team[0], team[1], team[0].con.TN + "　の　" + team[0].con.name + "　の　ダルマモード！" + "\n")
                afn.formChenge(team[0], team[1], "ヒヒダルマ")
            } else if (team[0].con.ability == "ダルマモード" && team[0].con.name == "ヒヒダルマ(ダルマモード(ガラルのすがた))"){
                cfn.logWrite(team[0], team[1], team[0].con.TN + "　の　" + team[0].con.name + "　の　ダルマモード！" + "\n")
                afn.formChenge(team[0], team[1], "ヒヒダルマ(ガラルのすがた)")
            }
        }
    }
}

// 28.リミットシールド
function shieldsDown(order, reverse){
    for (const team of [order, reverse]){
        if (team[0].con.ability == "リミットシールド" && team[0].con.last_HP <= team[0].con.full_HP / 2 && team[0].con.name == "メテノ(りゅうせいのすがた)"){
            cfn.logWrite(team[0], team[1], team[0].con.TN + "　の　" + team[0].con.name + "　の　リミットシールド！" + "\n")
            afn.formChenge(team[0], team[1], "メテノ(コア)")
        } else if (team[0].con.ability == "リミットシールド" && team[0].con.last_HP > team[0].con.full_HP / 2 && team[0].con.name == "メテノ(コア)"){
            cfn.logWrite(team[0], team[1], team[0].con.TN + "　の　" + team[0].con.name + "　の　リミットシールド！" + "\n")
            afn.formChenge(team[0], team[1], "メテノ(りゅうせいのすがた)")
        }
    }
}

// 29.スワームチェンジ
function powerConstruct(order, reverse){
    for (const team of [order, reverse]){
        if (team[0].con.ability == "スワームチェンジ" && team[0].con.last_HP <= team[0].con.full_HP / 2){
            cfn.logWrite(team[0], team[1], "たくさんの　気配を　感じる・・・！" + "\n")
            afn.formChenge(team[0], team[1], "ジガルデ(パーフェクトフォルム)")
        }
    }
}

// 30.ぎょぐん
function schooling(order, reverse){
    for (const team of [order, reverse]){
        if (team[0].con.ability == "ぎょぐん" && team[0].con.last_HP <= team[0].con.full_HP / 4 && "ヨワシ(むれたすがた)"){
            cfn.logWrite(team[0], team[1], team[0].con.TN + "　の　" + team[0].con.name + "　の　ぎょぐん！" + "\n")
            afn.formChenge(team[0], team[1], "ヨワシ(たんどくのすがた)")
        } else if (team[0].con.ability == "ぎょぐん" && team[0].con.last_HP <= team[0].con.full_HP / 4 && "ヨワシ(たんどくのすがた)"){
            cfn.logWrite(team[0], team[1], team[0].con.TN + "　の　" + team[0].con.name + "　の　ぎょぐん！" + "\n")
            afn.formChenge(team[0], team[1], "ヨワシ(むれたすがた)")
        }
    }
}

// 31.はらぺこスイッチ
function hungerSwitch(order, reverse){
    for (const team of [order, reverse]){
        if (team[0].con.ability == "はらぺこスイッチ"){
            cfn.logWrite(team[0], team[1], team[0].con.TN + "　の　" + team[0].con.name + "　の　はらぺこスイッチ！" + "\n")
            if (team[0].con.p_con.includes("はらぺこもよう")){
                cfn.conditionRemove(team[0].con, "poke", "はらぺこもよう")
                team[0].con.p_con += "まんぷくもよう" + "\n"
            } else if (team.con.p_con.includes("まんぷくもよう")){
                cfn.conditionRemove(team[0].con, "poke", "まんぷくもよう")
                team[0].con.p_con += "はらぺこもよう" + "\n"
            }
        }
    }
}


function decreasePerTurn(team, enemy, content, PorF){
    let list = team.con[PorF + "_con"].split("\n")
    for (let i = 0; i < list.length; i++){
        if (list[i].includes(content)){
            const turn = Number(list[i].slice(-3, -2)) - 1
            if (turn > 0){
                list[i] = content + "　" + turn + "/" + list[i].slice(-1)
            } else {
                list.splice(i, 1)
                cfn.logWrite(team, enemy, team.con.TN + "　の　" + content + "は　終了した！" + "\n")
                for (let side of [team, enemy]){
                    if (side.con.ability == "ぎたい" && content.includes("フィールド")){
                        cfn.logWrite(team, enemy, side.con.TN + "　の　" + side.con.name + "　は　元のタイプに戻った" + "\n")
                        side.con.type = side["poke" + cfn.battleNum(side)].type
                        if (side.con.p_con.includes("もりののろい")){
                            side.con.type += "、くさ"
                        }
                        if (side.con.p_con.includes("ハロウィン")){
                            side.con.type += "、ゴースト"
                        }
                    }
                }
            }
            break
        }
    }
    team.con[PorF + "_con"] = list.join("\n")
}
