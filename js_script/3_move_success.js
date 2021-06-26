const afn = require("./function")
const bfn = require("./base_function")
const cfn = require("./law_function")
const summon = require("./1_summon")
const moveEff = require("./move_effect")
const pokeData = require("./poke_data")
const moveList = require("./poke_move")
const itemEff = require("./item_effect")
const abiEff = require("./ability_effect")
const dmgClac = require("./damage_calc")

exports.moveSuccessJudge = function(atk, def, order){
    // 0.技の決定
    let move = decideMove(atk, def)

    // 1.フリーフォールで行動順を飛ばされる
    if (skyDropFailure(atk, def)){return false}
    // 2.(自身のおんねん/いかり状態の解除)
    gradgeRage(atk, def, move)
    // 3.行動の失敗
    if (actionFailure(atk, def, move)){
        cfn.conditionRemove(atk.con, "poke", "溜め技")
        cfn.conditionRemove(atk.con, "poke", "姿を隠す")
        return false
    }
    // 4.ねごと/いびき使用時「ぐうぐう 眠っている」メッセージ
    // 5.Zワザの場合はZパワーを送る。Z変化技の場合は付加効果
    //Z_power_activation(atk, move)
    // 6.他の技が出る技により技を置き換え、(3-8~10)の行程を繰り返す
    moveReplace(atk, def, move, order)
    // 7.特性バトルスイッチによるフォルムチェンジ
    battleSwitch(atk, def, move)
    // 8.「<ポケモン>の <技>!」のメッセージ。PPが減少することが確約される
    attackDeclaration(atk, def, move)
    // 9.わざのタイプが変わる。1→2→3の順にタイプが変わる
    moveTypeChange(atk, def, move)
    // 10.技の対象が決まる。若い番号の対象が優先される
    // 11.PPが適切な量引かれる (プレッシャーの効果が考慮される)
    if (PPDecrease(atk, def, move, order)){return false}
    // 12.こだわり系アイテム/ごりむちゅうで技が固定される
    commitmentRock(atk, def, move)
    // 13.技の仕様による失敗
    if (moveSpecificationsFailure(atk, def, move, order)){return false}
    // 14.自分のこおりを回復するわざにより自身のこおり状態が治る
    selfMeltCheck(atk, def, move)
    // 15.おおあめ/おおひでりによる技の失敗
    if (greatWeatherFailure(atk, def, move)){
        condition_remove(atk.con, "poke", "溜め技")
        condition_remove(atk.con, "poke", "姿を隠す")
        return false
    }
    // 16.ふんじんによるほのお技の失敗とダメージ
    if (powderFailure(atk, def, move)){return false}
    // 17.トラップシェルが物理技を受けていないことによる失敗
    if (shellTrap(atk, def, move)){return false}
    // 18.けたぐり/くさむすび/ヘビーボンバー/ヒートスタンプをダイマックスポケモンに使用したことによる失敗
    // 19.特性による失敗
    if (abilityFailure(atk, def, move)){return false}
    // 20.中断されても効果が発動する技
    if (remainEffectMove(atk, def, move)){return false}
    // 21.へんげんじざい/リベロの発動
    proteanLibero(atk, def, move)
    // 22.溜め技の溜めターンでの動作
    if (accumulateOperation(atk, def, move)){return false}
    // 23.待機中のよこどりで技が盗まれる。技を奪ったポケモンは13-15の行程を繰り返す
    // 24.だいばくはつ/じばく/ミストバーストによるHP消費が確約される
    // 26.だいばくはつ/じばく/ミストバーストの使用者は対象が不在でもHPを全て失う。使用者がひんしになっても攻撃は失敗しない
    selfDestruction(atk, def, move, order)
    // 25.対象のポケモンが全員すでにひんしになっていて場にいないことによる失敗
    if (faintedFailure(atk, def, move)){return false}
    // 27.ビックリヘッド/てっていこうせんの使用者はHPを50%失う。対象が不在なら失わない。使用者がひんしになっても攻撃が失敗しない
    mindblownStealbeam(atk, def, move, order)
    // 28.マグニチュード使用時は威力が決定される
    magnitude(atk, def, move)
    // 29.姿を隠していることによる無効化
    if (hideInvalidation(atk, def, move)){return false}
    // 30.サイコフィールドによる無効化
    if (phschoFieldInvalidation(atk, def, move)){return false}
    // 31.ファストガード/ワイドガード/トリックガードによる無効化 (Zワザ/ダイマックスわざならダメージを75%カットする)
    if (otherProtectInvalidation(atk, def, move)){return false}
    // 32.まもる/キングシールド/ブロッキング/ニードルガード/トーチカによる無効化 (Zワザ/ダイマックスわざなら75%をカットする)
    if (protectInvalidation(atk, def, move)){return false}
    // 33.たたみがえしによる無効化 (Zワザ/ダイマックスわざなら75%をカットする)
    if (matBlock(atk, def, move)){return false}
    // 34.ダイウォールによる無効化
    // 35.マジックコート状態による反射
    magicCoatReflection(atk, def, move)
    // 36.テレキネシスの場合、対象がディグダ/ダグトリオ/スナバァ/シロデスナ/メガゲンガー/うちおとす状態/ねをはる状態であることによる失敗
    if (telekinesisFailure(atk, def, move)){return false}
    // 37.マジックミラーによる反射　35との区別はないので35と同じにした(wiki通りではない)
    // 38.特性による無効化(その1)
    if (abilityInvalidation1(atk, def, move)){
        if (move[0] == "とびげり" || move[0] == "とびひざげり"){
            afn.HPchangeMagic(atk, def, Math.floor(atk.con.full_HP / 2), "-", move)
        }
        return false}
    // 39.相性による無効化
    if (compatibilityInvalidation(atk, def, move)){
        if (move[0] == "とびげり" || move[0] == "とびひざげり"){
            afn.HPchangeMagic(atk, def, Math.floor(atk.con.full_HP / 2), "-", move[0])
        }
        return false}
    // 40,ふゆうによる無効化 41とまとまっている
    // 41.でんじふゆう/テレキネシス/ふうせんによる無効化
    if (levitateInvalidation(atk, def, move)){return false}
    // 42.ぼうじんゴーグルによる無効化
    if (powderGoggleInvalidation(atk, def, move)){return false}
    // 43.特性による無効化(その2)
    if (abilityInvalidation2(atk, def, move)){return false}
    // 44.タイプによる技の無効化(その1)
    if (typeInvalidation1(atk, def, move)){return false}
    // 45.技の仕様による無効化(その1)
    if (moveSpecificationsInvalidation1(atk, def, move)){return false}
    // 46.技の仕様による無効化(その2)
    if (moveSpecificationsInvalidation2(atk, def, move)){return false}
    // 47.タイプによる技の無効化(その2)
    if (typeInvalidation2(atk, def, move)){return false}
    // 48.さわぐによるねむりの無効化
    uproar(atk, def, move)
    // 49.しんぴのまもり状態による無効化
    if (safeguardInvalidation(atk, def, move)){return false}
    // 50.エレキフィールド/ミストフィールド状態による状態異常の無効化
    if (fieldInvalidation(atk, def, move)){return false}
    // 51.みがわり状態によるランク補正を下げる技/デコレーションの無効化
    if (substituteInvalidation1(atk, def, move)){return false}
    // 52.しろいきりによる無効化
    if (mistInvalidation(atk, def, move)){return false}
    // 53.特性による無効化(その3)
    if (abilityInvalidation3(atk, def, move)){return false}
    // 54.命中判定による技の無効化
    if (bfn.accuracyFailure(atk, def, move, order)){return false}
    // 55.シャドースチールで対象のランク補正を吸収する
    spectralThief(atk, def, move)
    // 56.対応するタイプの攻撃技の場合ジュエルが消費される
    useJuwel(atk, def, move)
    // 57. かわらわり/サイコファング/ネコにこばんの効果が発動する
    wallBreak(atk, def, move)
    // 58. ポルターガイストで対象のもちものが表示される
    poltergeist(atk, def, move)
    // 59.みがわりによるランク補正を変動させる効果以外の無効化
    if (substituteInvalidation2(atk, def, move)){return false}
    // 60.ミラーアーマー: ランクを下げる変化技の反射
    if (millorArmer(atk, def, move)){return false}
    // 61.ほえる・ふきとばしの無効化
    if (roarWhirlwind(atk, def, move)){return false}
    // 62.技の仕様による無効化(その3)
    if (moveSpecificationsInvalidation3(atk, def, move)){return false}
    // 63.アロマベール: かなしばり/アンコール/ちょうはつ状態の無効化
    if (alomaVeilInvalidation(atk, def, move)){return false}

    // move を返すと技の成功
    return move
}


// 0.技の決定　その他
function decideMove(atk, def){

    let move_org = "" // 技の元データを代入

    if (atk.con.p_con.includes("反動で動けない")){
        for (let i = 0; i < atk.con.p_con.split("\n").length - 1; i++){
            if (atk.con.p_con.split("\n")[i].includes("反動で動けない")){
                move_org = cfn.moveSearchByName(atk.con.p_con.split("\n")[i].slice(8))
            }
        }
    } else if (atk.con.p_con.includes("溜め技")){
        for (let i = 0; i < atk.con.p_con.split("\n").length - 1; i++){
            if (atk.con.p_con.split("\n")[i].includes("溜め技")){
                move_org = cfn.moveSearchByName(atk.con.p_con.split("\n")[i].slice(4))
            }
        }
    } else if (atk.con.p_con.includes("あばれる")){
        for (let i = 0; i < atk.con.p_con.split("\n").length - 1; i++){
            if (atk.con.p_con.split("\n")[i].includes("あばれる")){
                move_org = cfn.moveSearchByName(atk.con.p_con.split("\n")[i].slice(5, -7))
            }
        }
    } else if (atk.con.p_con.includes("アイスボール")){
        move_org = cfn.moveSearchByName("アイスボール")
    } else if (atk.con.p_con.includes("ころがる")){
        move_org = cfn.moveSearchByName("ころがる")
    } else if (atk.con.p_con.includes("がまん")){
        move_org = cfn.moveSearchByName("がまん")
    } else {
        const move_name = atk.con["move_" + atk.data.command]
        if (move_name.includes("Z")){
            move_org = cfn.moveSearchByName(move_name.replace("Z", "")).concat()
            move_org[0] = move_name
        } else {
            move_org = cfn.moveSearchByName(move_name)
        }
    }

    let move = move_org.concat() // 技データのコピー、こっちをいじる

    if (atk.con.ability == "えんかく"){
        move[6] = "間接"
    }

    cfn.logWrite(atk, def, "(" + atk.con.TN + "の行動)" + "\n")

    // かなしばりのターン消費
    let atk_p_con = atk.con.p_con
    atk.con.p_con = ""
    for (let i = 0; i < atk_p_con.split("\n").length - 1; i++){
        if (atk_p_con.split("\n")[i].includes("かなしばり　4/4")){
            atk.con.p_con += "かなしばり　3/4：" + atk_p_con.split("\n")[i].slice(10) + "\n"
        } else if (atk_p_con.split("\n")[i].includes("かなしばり　3/4")){
            atk.con.p_con += "かなしばり　2/4：" + atk_p_con.split("\n")[i].slice(10) + "\n"
        } else if (atk_p_con.split("\n")[i].includes("かなしばり　2/4")){
            atk.con.p_con += "かなしばり　1/4：" + atk_p_con.split("\n")[i].slice(10) + "\n"
        } else if (atk_p_con.split("\n")[i].includes("かなしばり　1/4")){
            atk.con.p_con += "かなしばり　0/4：" + atk_p_con.split("\n")[i].slice(10) + "\n"
        } else {
            atk.con.p_con += atk_p_con.split("\n")[i] + "\n"
        }
    }

    return move
}


// 1.フリーフォールで行動順を飛ばされる
function skyDropFailure(atk, def){
    if (!atk.con.p_con.includes("反動で動けない")){ // フリーフォールで行動順を飛ばされたときも判定
        if (atk.con.p_con.includes("フリーフォール（防御）")){
            cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　は　空中で身動きが取れない　!" + "\n")
            return true
        }
    }
}

// 2.(自身のおんねん/いかり状態の解除)
function gradgeRage(atk, def, move){
    cfn.conditionRemove(atk.con, "poke", "おんねん")
    if (atk.con.p_con.includes("いかり") && move[0] != "いかり"){
        cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　は　怒りが静まった　!" + "\n")
        cfn.conditionRemove(atk.con, "poke", "いかり")
    }
}

// 3.行動の失敗
function actionFailure(atk, def, move){
    let con = atk.con
    // みちづれ状態の解除
    cfn.conditionRemove(con, "poke", "みちづれ")

    // 1.技の反動で動けない
        // フリーフォールで行動順を飛ばされたときも判定
    if (con.p_con.includes("反動で動けない")){
        cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　反動で動けない　!" + "\n")
        cfn.conditionRemove(con, "poke", "反動で動けない")
        // なまけ状態の時は、3-4のなまけ消費まで持っていく
        if (!con.p_con.includes("なまけ")){
            return true
        }
    }

    // 2.ねむりのカウント消費/こおりの回復判定: 動けない場合メッセージ
        // これらでも使える技を使用した場合は動ける。このときもねむり/こおりの消費/回復判定はある
    if (con.abnormal == "ねむり"){
        const atk_p_con = con.p_con
        con.p_con = ""
        let check = 0
        if (atk_p_con.includes("ねむり")){
            const random = Math.random()
            for (let i = 0; i < atk_p_con.split("\n").length - 1; i++){
                if (atk_p_con.split("\n")[i] == "ねむり　1ターン目"){
                    if (con.ability == "はやおき"){
                        if (random < 1 / 3){
                            check -= 1
                        } else {
                            con.p_con += "ねむり　3ターン目" + "\n"
                            check += 1
                        }
                    } else {
                        con.p_con += "ねむり　2ターン目" + "\n"
                        check += 1
                    }
                } else if (atk_p_con.split("\n")[i] == "ねむり　2ターン目"){
                    if (con.ability == "はやおき"){
                        if (random < 5 / 6){
                            check -= 1
                        } else {
                            con.p_con += "ねむり　4ターン目" + "\n"
                            check += 1
                        }
                    } else {
                        if (random < 1 / 3){
                            check -= 1
                        } else {
                            con.p_con += "ねむり　3ターン目" + "\n"
                            check += 1
                        }
                    }
                } else if (atk_p_con.split("\n")[i] == "ねむり　3ターン目"){
                    if (con.ability == "はやおき"){
                        check -= 1
                    } else {
                        if (random < 1 / 2){
                            check -= 1
                        } else {
                            con.p_con += "ねむり　4ターン目" + "\n"
                            check += 1
                        }
                    }
                } else if (atk_p_con.split("\n")[i] == "ねむり　4ターン目"){
                    check -= 1
                } else {
                    con.p_con += atk_p_con.split("\n")[i] + "\n"
                }
            }
        } else if (atk_p_con.includes("ねむる")){
            for (let i = 0; i < atk_p_con.split("\n").length - 1; i++){
                if (atk_p_con.split("\n")[i] == "ねむる　2/2"){
                    if (con.ability == "はやおき"){
                        con.p_con += "ねむる　回復ターン" + "\n"
                        check += 1
                    } else {
                        con.p_con += "ねむる　1/2" + "\n"
                        check += 1
                    }
                } else if (atk_p_con.split("\n")[i] == "ねむる　1/2"){
                    if (con.ability == "はやおき"){
                        check -= 1
                    } else {
                        con.p_con += "ねむる　回復ターン" + "\n"
                        check += 1
                    }
                } else if (atk_p_con.split("\n")[i] == "ねむる　回復ターン"){
                    check -= 1
                } else {
                    con.p_con += atk_p_con.split("\n")[i] + "\n"
                }
            }
        }
        

        if (check > 0){
            cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　は　ぐうぐう眠っている　!" + "\n")
            if (move[0] == "いびき" || move[0] == "ねごと"){
                return false
            } else {
                return true
            }
        } else if (check < 0){
            cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　は　目を覚ました　!" + "\n")
            con.abnormal = ""
            if (con.p_con.includes("あくむ")){
                cfn.conditionRemove(con, "poke", "あくむ")
                cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　は　あくむから解放された　!" + "\n")
            }
        }
    } else if (con.abnormal == "こおり"){ ////////////////
        const random = Math.random()
        if(random < 0.8){
            const list = moveEff.meltMove()
            for (i = 0; i < list.length; i++){
                if (move[0] == list[i]){
                    return false
                }
            }
            cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　凍って動けない　!" + "\n")
            return true
        } else {
            cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　の　こおりが溶けた　!" + "\n")
            con.abnormal = ""
            return false
        }
    }

    // 3.PPが残っていない
    if (atk.data.command != ""){
        if (con["PP_" + atk.data.command] == 0 && !con.p_con.includes("溜め技")){
            cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　PPがなくて技が出せない　!" + "\n")
            return true
        }
    }

    // 4.なまけのカウント消費: 動けない場合メッセージ
        // 反動で動けないときでも消費
    if (con.p_con.includes("なまけ")){
        cfn.conditionRemove(con, "poke", "なまけ")
        cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　なまけている" + "\n")
        return true
    } else if (con.ability == "なまけ" && !con.p_con.includes("なまけ")){
        con.p_con += "なまけ" + "\n"
    }
    // 5.きあいパンチ使用時、そのターンにダメージを受けていて動けない (ダイマックスポケモンを除く)
    if (con.p_con.includes("きあいパンチ　失敗")){
        cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　集中が途切れて　技が出せなかった　!" + "\n")
        cfn.conditionRemove(con, "poke", "きあいパンチ　失敗")
        return true
    }
    // 6.ひるみで動けない (ダイマックスポケモンを除く)
    if (con.p_con.includes("ひるみ")){
        cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　ひるんで　動けない　!" + "\n")
        if (con.ability == "ふくつのこころ"){
            afn.rankChange(atk, def, "S", 1, 100, "ふくつのこころ")
        }
        return true
    }
    // 7.かなしばりで技が出せない (Zワザを除く)
    for (let i = 0; i < con.p_con.split("\n").length - 1; i++){
        if (con.p_con.split("\n")[i].includes("かなしばり") && (con.p_con.split("\n")[i].slice(10) == move[0])){
            cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　かなしばりで　技が出せなかった　!" + "\n")
            return true
        }
    }
    // 8.じゅうりょくで技が出せない
    if (con.f_con.includes("じゅうりょく") && moveEff.gravity().includes(move[0])){
        cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　じゅうりょくで　技が出せなかった　!" + "\n")
        return true
    }
    // 9.かいふくふうじで技が出せない (Zワザを除く)
    if (con.p_con.includes("かいふくふうじ") && moveEff.recover().includes(move[0])){
        cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　かいふくふうじで　技が出せなかった　!" + "\n")
        return true
    }
    // 10.じごくづきで音技が出せない (Zワザを除く)
    if (con.p_con.includes("じごくづき") && moveEff.music().includes(move[0])){
        cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　じごくづきで　技が出せなかった　!" + "\n")
        return true
    }
    // 11.こだわっていない技が出せない (ダイマックスポケモンを除く)
    for (let i = 0; i < con.p_con.split("\n").length - 1; i++){
        if (con.p_con.split("\n")[i].includes("こだわりロック") &&  con.p_con.split("\n")[i].slice(8) != move[0]){
            cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　こだわっているせいで　技が出せなかった　!" + "\n")
            return true
        }
    }
    // 12.ちょうはつで変化技が出せない (Zワザを除く)
    if (con.p_con.includes("ちょうはつ") && move[2] == "変化"){
        cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　挑発されて　" + move[0] + 　"　が出せなかった　!" + "\n")
        return true
    }
    // 13.ふういんで技が出せない (Zワザ/ダイマックスポケモンを除く)
    if (con.p_con.includes("ふういん")){
        let def_move = []
        for (let i = 0; i < 4; i++){
            def_move.push(def.con["move_" + i])
        }
        if (def_move.includes(move[0])){
            cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　封印されて　技が出せなかった　!" + "\n")
            return true
        }
    }
    // 14.こんらんの自傷の判定
    if (con.p_con.includes("こんらん")){
        const atk_p_con = con.p_con
        con.p_con = ""
        const random = Math.random()
        let check = 0
        for (let i = 0; i < atk_p_con.split("\n").length - 1; i++){
            if (atk_p_con.split("\n")[i] == "こんらん　1ターン目"){
                cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　こんらんしている　!" + "\n")
                con.p_con += "こんらん　2ターン目" + "\n"
                check += 1
            } else if (atk_p_con.split("\n")[i] == "こんらん　2ターン目"){
                if (random < 1 / 3){
                    cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　の　こんらん　がとけた　!" + "\n")
                    check -= 1
                } else {
                    cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　こんらんしている　!" + "\n")
                    con.p_con += "こんらん　3ターン目" + "\n"
                    check += 1
                }
            } else if (atk_p_con.split("\n")[i] == "こんらん　3ターン目"){
                if (random < 1 / 2){
                    cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　の　こんらん　がとけた　!" + "\n")
                    check -= 1
                } else {
                    cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　こんらんしている　!" + "\n")
                    con.p_con += "こんらん　4ターン目" + "\n"
                    check += 1
                }
            } else if (atk_p_con.split("\n")[i] == "こんらん　4ターン目"){
                cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　の　こんらん　がとけた　!" + "\n")
                check -= 1
            } else {
                con.p_con += atk_p_con.split("\n")[i] + "\n"
            }
        }
        if (check > 0){
            const random = Math.random()
            if (random < 1 / 3){ // 確率でこんらん自傷
                confuseSelfInjured(atk, def)
                return true
            }
        } else {
            return false
        }
    }
    // 15.まひして技が出せない
    if (con.abnormal == "まひ"){
        if (Math.random() < 0.25){
            cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　体がしびれて　動けない　!" + "\n")
            return true
        }
    }
    // 16.メロメロの判定
    if (con.p_con.includes("メロメロ")){
        cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　メロメロだ　!" + "\n")
        if (Math.random() < 0.5){
            cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　メロメロで　技が出せなかった　!" + "\n")
            return true
        }
    }
}

// 5.Zワザの場合はZパワーを送る。Z変化技の場合は付加効果
function Z_power_activation(atk, move){
    let check = 0
    // 普通のZクリスタル（攻撃技）の場合
    for (let i = 0; i < itemEff.Zcrystal().length; i++){
        if (move[0] == itemEff.Zcrystal()[i][1]){
            check += 1
            txt = atk + "チームの　" + new get(atk).name + "　は　Zパワーを身に纏った！" + "\n"
            document.battle_log.battle_log.value += txt
            const poke_num = battle_poke_num(atk)
            const move_num = document.getElementById("battle")[atk + "_move"].value
            const org_move = move_search_by_name(document.getElementById(atk + "_" + poke_num + "_" + move_num + "_move").textContent)
            if (org_move[2] != "変化"){
                if (org_move[3] < 60){
                    move[3] = 100
                } else if (org_move[3] < 70){
                    move[3] = 120
                } else if (org_move[3] < 80){
                    move[3] = 140
                } else if (org_move[3] < 90){
                    move[3] = 160
                } else if (org_move[3] < 100){
                    move[3] = 175
                } else if (org_move[3] < 110){
                    move[3] = 180
                } else if (org_move[3] < 120){
                    move[3] = 185
                } else if (org_move[3] < 130){
                    move[3] = 190
                } else if (org_move[3] < 140){
                    move[3] = 195
                } else {
                    move[3] = 200
                }
            }
        }
    }
    // 普通のZクリスタル（変化技）の場合
    if (move[0].includes("Z")){
        check += 1
        txt = atk + "チームの　" + new get(atk).name + "　は　Zパワーを身に纏った！" + "\n"
        document.battle_log.battle_log.value += txt
        for (let i = 0; i < Z_status_move.length; i++){
            if (move[0].slice(1) == Z_status_move[i][0]){
                if (move[0].slice(1) == "のろい"){
                    if (new get(atk).type.includes("ゴースト")){
                        txt = atk + "チームの　" + new get(atk).name + "　の　HPが全回復した！" + "\n"
                        document.battle_log.battle_log.value += txt
                        document.getElementById(atk + "_HP_last").textContent = new get(atk).full_HP
                    } else {
                        rank_change_Z(atk, "A", 1)
                    }
                } else if (Z_status_move[i][1] == "A" || Z_status_move[i][1] == "B" || Z_status_move[i][1] == "C" || Z_status_move[i][1] == "D" 
                || Z_status_move[i][1] == "S" || Z_status_move[i][1] == "accuracy" || Z_status_move[i][1] == "evasiveness"){
                    const change = Z_status_move[i][2]
                    rank_change(atk, Z_status_move[i][1], change)
                } else if (Z_status_move[i][1] == "all"){
                    rank_change_Z(atk, "A", 1)
                    rank_change_Z(atk, "B", 1)
                    rank_change_Z(atk, "C", 1)
                    rank_change_Z(atk, "D", 1)
                    rank_change_Z(atk, "S", 1)
                } else if (Z_status_move[i][1] == "critical"){
                    if (!new get(atk).p_con.includes("きゅうしょアップ")){
                        txt = atk + "チームの　" + new get(atk).name + "　は　技が急所に当たりやすくなった！" + "\n"
                        document.battle_log.battle_log.value += txt
                        document.battle[atk + "_poke_condition"].value += "きゅうしょアップ" + "\n"
                    }
                } else if (Z_status_move[i][1] == "clear"){
                    txt = atk + "チームの　" + new get(atk).name + "　の　能力ダウンがリセットされた！" + "\n"
                    document.battle_log.battle_log.value += txt
                    for (const parameter of ["A", "B", "C", "D", "S", "accuracy", "evasiveness"]){
                        document.getElementById(atk + "_rank_" + parameter).textContent = Math.max(new get(atk)[parameter + "_rank"], 0)
                    }
                } else if (Z_status_move[i][1] == "cure"){
                    txt = atk + "チームの　" + new get(atk).name + "　の　HPが全回復した！" + "\n"
                    document.battle_log.battle_log.value += txt
                    document.getElementById(atk + "_HP_last").textContent = new get(atk).full_HP
                }
            }
        }
    }
    // 専用Zクリスタルの場合
    for (let i = 0; i < special_Z_crystal_list.length; i++){
        if (move[0] == special_Z_crystal_list[i][1]){
            check += 1
            txt = atk + "チームの　" + new get(atk).name + "　は　Zパワーを身に纏った！" + "\n"
            document.battle_log.battle_log.value += txt
        }
    }
    if (check > 0){
        document.getElementById(atk + "_Z_move").checked = false
        document.getElementById(atk + "_Z_move").disabled = true
        document.getElementById(atk + "_Z_text").textContent = "Z技：済"
    }
}

// 6.他の技が出る技により技を置き換え、(3-8~10)の行程を繰り返す
// オウムがえし、さきどり、しぜんのちから、ねごと、ねこのて、まねっこ、ゆびをふる
function moveReplace(atk, def, move, order){
    let con = atk.con
    // オウムがえし
    if (move[0].includes("オウムがえし")){
        move[9] = move[0]
        let check = 0
        if (!moveEff.mirror().includes(def.con.used)){
            if (def.con.used == "あばれる" || def.con.used == "げきりん" || def.con.used == "はなびらのまい" || def.con.used == "さわぐ" || def.con.used == "メタルバースト" 
            || def.con.used == "トリックルーム" || def.con.used == "ワンダールーム" || def.con.used == "マジックルーム" || def.con.used == "フェアリーロック"){
                check += 1
            } else {
                if (!(cfn.moveSearchByName(def.con.used)[8] == "自分" || cfn.moveSearchByName(def.con.used)[8].includes("場"))){
                    check += 1
                }
            }
        }
        for (let i = 0; i < 9; i++){
            move[i] = cfn.moveSearchByName(def.con.used)[i]
        }
        if (check == 0){
            move.push("失敗")
        }
    }
    // さきどり: 対象が先制した、対象の使用した技がさきどりできない技の時、失敗
    if (move[0].includes("さきどり")){
        move[9] = move[0]
        if (atk = order[0]){
            const defMove = def.con["move_" + def.data.command]
            for (let i = 0; i < 9; i++){
                move[i] = cfn.moveSearchByName(defMove)[i]
            }
            if (moveEff.meFirst().includes(defMove) || cfn.moveSearchByName(defMove)[2] == "変化"){
                move.push("失敗")
            }
        }
    }
    // しぜんのちから
    if (move[0].includes("しぜんのちから")){
        move[9] = move[0]
        if (con.f_con.includes("グラスフィールド")){
            for (let i = 0; i < 9; i++){
                move[i] = cfn.moveSearchByName("エナジーボール")[i]
            }
        } else if (con.f_con.includes("エレキフィールド")){
            for (let i = 0; i < 9; i++){
                move[i] = cfn.moveSearchByName("10まんボルト")[i]
            }
        } else if (con.f_con.includes("ミストフィールド")){
            for (let i = 0; i < 9; i++){
                move[i] = cfn.moveSearchByName("ムーンフォース")[i]
            }
        } else if (con.f_con.includes("サイコフィールド")){
            for (let i = 0; i < 9; i++){
                move[i] = cfn.moveSearchByName("サイコキネシス")[i]
            }
        } else {
            for (let i = 0; i < 9; i++){
                move[i] = cfn.moveSearchByName("トライアタック")[i]
            }
        }
    }
    // ねごと
    if (move[0].includes("ねごと")){
        let check = []
        for (let i = 0; i < 4; i++){
            if (!moveEff.sleepTalk().includes(con["move_" + i])){
                check.push(con["move_" + i])
            }
        }
        check = check.slice(0, -1)
        let num = 0
        if (check.length == 1){
            num = 0
        } else if (check.length == 2){
            if (Math.random() < 0.5){
                num = 1
            }
        } else if (check.length == 3){
            const random = Math.random()
            if (random < 1 / 3){
                num = 1
            } else if (random < 2 / 3){
                num = 2
            }
        }
        if (con.abnormal == "ねむり"){
            move[9] = move[0]
            for (let i = 0; i < 9; i++){
                move[i] = cfn.moveSearchByName(check[num])[i]
            }
        }
    }
    // ねこのて
    if (move[0].includes("ねこのて")){
        let cat_hand = []
        for (let i = 0; i < 3; i++){
            if (atk["poke" + i].life == "控え"){
                for (let j = 0; j < 4; j++){
                    let sample = atk["poke" + i]["move_" + j]
                    if (!moveEff.assist().includes(sample) && sample != ""){
                        cat_hand.push(sample)
                    }
                }
            }
        }
        const random = Math.random()
        if (cat_hand.length > 0){
            let dicide = 0
            for (let i = 0; i < cat_hand.length; i++){
                if (random >= i / cat_hand.length){
                    dicide = i
                }
            }
            move[9] = move[0]
            for (let i = 0; i < 9; i++){
                move[i] = cfn.moveSearchByName(cat_hand[Number(dicide)])[i]
            }
        } else {
            move.push("失敗")
        }
    }
    // まねっこ
    if (move[0].includes("まねっこ")){
        const log_list = con.log.split("\n")
        for (let i = 0; i < log_list.length - 1; i++){
            if (log_list[log_list.length - 1 - i].split("　").length == 6){
                let each = log_list[log_list.length - 1 - i].split("　")[1]
                let poke_name = log_list[log_list.length - 1 - i].split("　")[2]
                let no = log_list[log_list.length - 1 - i].split("　")[3]
                let move_name = log_list[log_list.length - 1 - i].split("　")[4]
                let mark = log_list[log_list.length - 1 - i].split("　")[5]
                if (move_name == "ゆびをふる" || move_name == "オウムがえし" || move_name == "さきどり" || move_name == "まねっこ" || move_name == "ねこのて" || move_name == "ねごと" || move_name == "しぜんのちから"){
                    move_name = log_list[log_list.length - i].split("　")[2]
                }
                let check = 0
                for (let j = 0; j < pokeData.poke().length; j++){
                    if (poke_name == pokeData.poke()[j][1]){
                        check += 1
                    }
                }
                for (let j = 0; j < moveList.move().length; j++){
                    if (move_name == moveList.move()[j][0]){
                        check += 1
                    }
                }
                if (check == 2 && each == "の" && no == "の" && mark == "！" && !moveEff.copyCat().includes(move_name)){
                    move[9] = move[0]
                    for (let j = 0; j < 9; j++){
                        move[j] = cfn.moveSearchByName(move_name)[j]
                        break
                    }
                }
            }
        }
        if (move[0].includes("まねっこ")){
            move.push("失敗")
        }
    }
    // ゆびをふる
    if (move[0].includes("ゆびをふる")){
        const random = Math.random()
        let metro_move = ""
        for (let i = 0; i < moveEff.metronome().length; i++){
            if (random >= i / moveEff.metronome().length){
                metro_move = moveEff.metronome()[i]
            }
        }
        move[9] = move[0]
        for (let i = 0; i < 9; i++){
            move[i] = cfn.moveSearchByName(metro_move)[i]
        }
    }

    // 8.じゅうりょくで技が出せない
    if (con.f_con.includes("じゅうりょく") && moveEff.gravity().includes(move[0])){
        cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　じゅうりょくで　技が出せなかった　!" + "\n")
        return true
    }
    // 9.かいふくふうじで技が出せない (Zワザを除く)
    if (con.p_con.includes("かいふくふうじ") && moveEff.recover().includes(move[0])){
        cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　かいふくふうじで　技が出せなかった　!" + "\n")
        return true
    }
    // 10.じごくづきで音技が出せない (Zワザを除く)
    if (con.p_con.includes("じごくづき") && moveEff.music().includes(move[0])){
        cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　じごくづきで　技が出せなかった　!" + "\n")
        return true
    }
}

// 7.特性バトルスイッチによるフォルムチェンジ
function battleSwitch(atk, def, move){
    if (atk.con.ability != "バトルスイッチ"){
        return
    }
    if (atk.con.name.includes("シールド") && move[2] != "変化"){
        cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　の　バトルスイッチ!" + "\n")
        afn.formChenge(atk, def, "ギルガルド(ブレードフォルム)")
        return
    }
    if (atk.con.name.includes("ブレード") && move[0] == "キングシールド"){
        cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　の　バトルスイッチ!" + "\n")
        afn.formChenge(atk, def, "ギルガルド(シールドフォルム)")
        return
    }
}

// 8.「<ポケモン>の <技>!」のメッセージ。PPが減少することが確約される
function attackDeclaration(atk, def, move){
    let con = atk.con
    if (move[9] == "オウムがえし" || move[9] == "さきどり" || move[9] == "しぜんのちから" || move[9] == "ねごと" || move[9] == "ねこのて" || move[9] == "まねっこ" || move[9] == "ゆびをふる"){
        cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　の　" + move[9] + "　！" + "\n")
        cfn.logWrite(atk, def, move[9] + "　で　" + move[0] + "　がでた！" + "\n")
        con.used = move[0]
    } else if (move[9] == "Zオウムがえし" || move[9] == "Zさきどり" || move[9] == "Zしぜんのちから" || move[9] == "Zねごと" || move[9] == "Zねこのて" || move[9] == "Zまねっこ" || move[9] == "Zゆびをふる"){
        cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　の　" + move[9] + "　！" + "\n")
        if (move[2] == "変化"){
            cfn.logWrite(atk, def, move[9] + "　で　" + move[0] + "　がでた！" + "\n")
            con.used = move[0]
        } else {
            const list = itemEff.Zcrystal()
            for (let i = 0; i < list.length; i++){
                if (move[1] == list[i][0]){
                    for (let j = 0; j < 9; j++){
                        move[j] = cfn.moveSearchByName(list[i][1])[j]
                    }
                    cfn.logWrite(atk, def, move[9] + "　で　" + move[0] + "　がでた！" + "\n")
                    con.used = move[0]
                }
            }
            if (move[3] < 60){
                move[3] = 100
            } else if (move[3] < 70){
                move[3] = 120
            } else if (move[3] < 80){
                move[3] = 140
            } else if (move[3] < 90){
                move[3] = 160
            } else if (move[3] < 100){
                move[3] = 175
            } else if (move[3] < 110){
                move[3] = 180
            } else if (move[3] < 120){
                move[3] = 185
            } else if (move[3] < 130){
                move[3] = 190
            } else if (move[3] < 140){
                move[3] = 195
            } else {
                move[3] = 200
            }
        }
    } else {
        cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　の　" + move[0] + "　！" + "\n")
        con.used = move[0]
        if (move[0] == "プレゼント"){
            const random = Math.random() * 100
            if (random < 10){
                move[3] = 120
            } else if (random < 40){
                move[3] = 80
            } else if (random < 80){
                move[3] = 40
            }
        } else if (move[0] == "ふくろだたき"){
            move[3] = Math.floor(con.A_AV / 10 + 5)
        }
    }

    // アンコールターンの消費
    let p_list = con.p_con.split("\n")
    for (let i = 0; i < p_list.length; i++){
        if (p_list[i].includes("アンコール")){
            const turn = Number(p_list[i].slice(6, 7)) - 1
            p_list[i] = "アンコール　" + turn + "/3：" + p_list[i].slice(10) + "\n"
        }
    }
    con.p_con = p_list.join("\n")

    // アイスボール、ころがるのターン開始
    if (move[0] == "アイスボール" || move[0] == "ころがる"){
        if (!con.p_con.includes(move[0])){
            con.p_con += move[0] + "　+1" + "\n"
        } else {
            let p_list = con.p_con.split("\n")
            for (let i = 0; i < p_list.length; i++){
                if (p_list[i].includes(move[0])){
                    const turn = Number(p_list[i].replace(/[^0-9]/g, "")) + 1
                    p_list[i] = move[0] + "　+" + turn + "\n"
                }
            }
            con.p_con = p_list.join("\n")
        }
    }

    // れんぞくぎりの記録
    if (move[0] == "れんぞくぎり"){
        if (!con.p_con.includes("れんぞくぎり")){
            con.p_con += "れんぞくぎり　+1" + "\n"
        } else {
            let p_list = con.p_con
            for (let i = 0; i < p_list.length; i++){
                if (p_list[i].includes("れんぞくぎり")){
                    const turn = Number(p_list[i].replace(/[^0-9]/g, "")) + 1
                    p_list[i] = "れんぞくぎり　+" + turn + "\n"
                }
            }
            con.p_con = p_list.join("\n")
        }
    }

    // がまんの記録
    if (move[0] == "がまん"){
        if (con.p_con.includes("がまん　2/2：")){
            let p_list = con.p_con.split("\n")
            for (let i = 0; i < p_list.length - 1; i++){
                if (p_list[i].includes("がまん　2/2：")){
                    p_list[i] = "がまん　1/2：" + p_list[i].slice(8)
                    cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　がまんを続けている！" + "\n")
                    move[2] = "変化"
                }
            }
            con.p_con = p_list.join("\n")
        } else if (con.p_con.includes("がまん　1/2：")){
            cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　の　がまんが解かれた！" + "\n")
            move[3] = Number(p_list[i].slice(8))
            cfn.conditionRemove(con, "poke", "がまん　1/2：")
        } else {
            con.p_con += "がまん　2/2：0" + "\n"
            cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　がまんを始めた！" + "\n")
            move[2] = "変化"
        }
    }

    // シャドーレイ、フォトンゲイザー: 対象の特性を攻撃処理の終わりまで無くす
    if (moveEff.abiInvalid().includes(move[0]) && moveEff.moldBreak().includes(def.con.ability)){
        def.con.p_con += "特性無視：" + def.con.ability + "\n"
        def.con.ability = ""
    }
}

// 9.わざのタイプが変わる。1→2→3の順にタイプが変わる
function moveTypeChange(atk, def, move){
    let con = atk.con
    // 1.技のタイプを変える特性の効果
    if (con.ability == "うるおいボイス" && moveEff.music().includes(move[0])){
        move[1] = "みず"
    } else if (con.ability == "エレキスキン" && move[1] == "ノーマル"){
        move[1] = "でんき"
        con.p_con += "スキン" + "\n"
    } else if (con.ability == "スカイスキン" && move[1] == "ノーマル"){
        move[1] = "ひこう"
        con.p_con += "スキン" + "\n"
    } else if (con.ability == "ノーマルスキン" && move[1] != "ノーマル"){
        move[1] = "ノーマル"
        con.p_con += "スキン" + "\n"
    } else if (con.ability == "フェアリースキン" && move[1] == "ノーマル"){
        move[1] = "フェアリー"
        con.p_con += "スキン" + "\n"
    } else if (con.ability == "フリーズスキン" && move[1] == "ノーマル"){
        move[1] = "こおり"
        con.p_con += "スキン" + "\n"
    }
    // 2.タイプが変わるわざの効果
    if (move[0] == "ウェザーボール" && cfn.isWeather(atk.con, def.con)){
        if (con.f_con.includes("にほんばれ") && con.item != "ばんのうがさ"){
            move[1] = "ほのお"
        } else if (con.f_con.includes("あめ") && con.item != "ばんのうがさ"){
            move[1] = "みず"
        } else if (con.f_con.includes("あられ")){
            move[1] = "こおり"
        } else if (con.f_con.includes("すなあらし")){
            move[1] = "いわ"
        }
    } else if (move[0] == "オーラぐるま" && con.p_con.includes("はらぺこもよう")){
        move[1] = "あく"
    } else if (move[0] == "さばきのつぶて" && con.item.includes("プレート")){
        const list = itemEff.judgement()
        for (let i = 0; i < list.length; i++){
            if (con.item == list[i][0]){
                move[1] = list[i][1]
            }
        }
    } else if (move[0] == "しぜんのめぐみ" && itemEff.berryList().includes(con.item)){
        cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　は　" + atk.con.item + "　を　力に変えた" + "\n")
        const list = itemEff.naturalGift()
        for (let i = 0; i < list.length; i++){
            if (con.item == list[i][0]){
                move[1] = list[i][1]
            }
        }
    } else if (move[0] == "だいちのはどう" && con.f_con.includes("フィールド") && cfn.groundedCheck(con)){
        if (con.f_con.includes("エレキフィールド")){
            move[1] = "でんき"
        } else if (con.f_con.includes("グラスフィールド")){
            move[1] = "くさ"
        } else if (con.f_con.includes("ミストフィールド")){
            move[1] = "フェアリー"
        } else if (con.f_con.includes("サイコフィールド")){
            move[1] = "エスパー"
        }
    } else if (move[0] == "テクノバスター"){
        if (con.item == "アクアカセット"){
            move[1] = "みず"
        } else if (con.item == "イナズマカセット"){
            move[1] = "でんき"
        } else if (con.item == "ブレイズカセット"){
            move[1] = "ほのお"
        } else if (con.item == "フリーズカセット"){
            move[1] = "こおり"
        }
    } else if (move[0] == "マルチアタック" && !con.p_con.includes("さしおさえ") && !con.f_con.includes("マジックルーム")){
        const list = itemEff.multiAtk()
        for (let i = 0; i < list.length; i++){
            if (con.item == list[i][0]){
                move[1] = list[i][1]
            }
        }
    } else if (move[0] == "めざめるダンス"){
        move[1] = con.type.split("、")[0]
    } else if (move[0] == "めざめるパワー"){

    }
    // 3.そうでん/プラズマシャワー状態
    if (con.p_con.includes("そうでん")){
        move[1] = "でんき"
    } else if (con.f_con.includes("プラズマシャワー") && move[1] == "ノーマル"){
        move[1] = "でんき"
    }
}

// 11.PPが適切な量引かれる (プレッシャーの効果が考慮される)
function PPDecrease(atk, def, move, order){
    let con = atk.con
    if (!(con.p_con.includes("あばれる") || con.p_con.includes("溜め技") 
    || (con.p_con.includes("アイスボール") && !con.p_con.includes("アイスボール　+1")) 
    || (con.p_con.includes("ころがる") && !con.p_con.includes("ころがる　+1")) 
    || (con.p_con.includes("がまん　2/2：") || con.p_con.includes("がまん　1/2：")))){

        const PP = con["last_" + atk.data.command]
        if (def.con.ability == "プレッシャー"){
            con["last_" + atk.data.command] = Math.max(PP - 2, 0)
        } else {
            con["last_" + atk.data.command] = PP - 1
        }
        if (!con.p_con.includes("へんしん")){
            atk["poke" + cfn.battleNum(atk)]["last_" + atk.data.command] = con["last_" + atk.data.command]
        }

        // 他の技が出る技の失敗
        if (move.length == 11){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
    }

    return

    // Z技を元の技に戻す
    for (let i = 0; i < Z_crystal_list.length; i++){
        if (move[0] == Z_crystal_list[i][1]){
            const poke_num = battle_poke_num(atk)
            for (let j = 0; j < 4; j++){
                document.getElementById(atk + "_move_" + j).textContent = document.getElementById(atk + "_" + poke_num + "_" + j + "_move").textContent
            }
        }
    }
    // 普通のZクリスタル（変化技）の場合
    if (move[0].includes("Z")){
        move[0] = move[0].replace("Z", "")
        const poke_num = battle_poke_num(atk)
        for (let i = 0; i < 4; i++){
            document.getElementById(atk + "_move_" + i).textContent = document.getElementById(atk + "_" + poke_num + "_" + i + "_move").textContent
        }
    }
    // 専用Zクリスタルの場合
    for (let i = 0; i < special_Z_crystal_list.length; i++){
        if (move[0] == special_Z_crystal_list[i][1]){
            const poke_num = battle_poke_num(atk)
            for (let j = 0; j < 4; j++){
                document.getElementById(atk + "_move_" + j).textContent = document.getElementById(atk + "_" + poke_num + "_" + j + "_move").textContent
            }
        }
    }

    // よこどり状態のポケモンがいる時、よこどりされる
    if (new get(def).p_con.includes("よこどり") && snatch_move_list.includes(move[0])){
        condition_remove(def, "poke", "よこどり")
        txt = def + "チームの　" + new get(def).name + "に　技を横取りされた！" + "\n"
        document.battle_log.battle_log.value += txt
        atk = order[0]
        def = order[1]

        // 9.わざのタイプが変わる。1→2→3の順にタイプが変わる
        moveTypeChange(atk, def, move)
        // 45.技の仕様による無効化(その1)
        if (moveSpecificationsInvalidation1(atk, def, move)){return false}
        // 46.技の仕様による無効化(その2)
        if (moveSpecificationsInvalidation2(atk, def, move)){return false}
        // 62.技の仕様による無効化(その3)
        if (moveSpecificationsInvalidation3(atk, def, move)){return false}

        move_process(order[0], order[1], move, order)

        return true
    }
}

// 12.こだわり系アイテム/ごりむちゅうで技が固定される
function commitmentRock(atk, def, move){
    let con = atk.con
    const list = moveList.move()
    if ((con.item.includes("こだわり") || con.ability == "ごりむちゅう") && !con.p_con.includes("こだわりロック")){
        con.p_con += "こだわりロック：" + move[0] + "\n"
        for (let i = 0; i < list.length; i++){
            if (move[9] == list[i][0]){
                cfn.conditionRemove(con, "poke", "こだわりロック")
                con.p_con += "こだわりロック：" + move[9] + "\n"
            }
        }
    }
}

// 13.技の仕様による失敗
function moveSpecificationsFailure(atk, def, move, order){

    let con = atk.con
    
    // アイアンローラー: フィールドが無い
    if (move[0] == "アイアンローラー" && !con.f_con.includes("フィールド")){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
    // いじげんラッシュ/ダークホール/オーラぐるま: 使用者のポケモンの姿が適格でない
    if ((move[0] == "いじげんラッシュ" && con.name != "フーパ(ときはなたれしフーパ)") 
    || (move[0] == "ダークホール" && con.name != "ダークライ") 
    || (move[0] == "オーラぐるま" && con.name != "モルペコ")){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
    // うらみ: 対象が技を使っていない（wikiには載っていない）
    if (move[0] == "うらみ" && def.con.used == ""){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
    // がまん: 解き放つダメージが無い
    if (move[0] == "がまん" && move[3] == 0){
        cfn.conditionRemove(con, "poke", "がまん")
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
    // カウンター/ミラーコート/メタルバースト: 適格なダメージをそのターンは受けていない
    if ((move[0] == "カウンター" && !con.p_con.includes("物理ダメージ")) 
    || (move[0] == "ミラーコート" && !con.p_con.includes("特殊ダメージ")) 
    || (move[0] == "メタルバースト" && !con.p_con.includes("ダメージ"))){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
    // ギフトパス: 自分が持ち物を持っていない、対象が持ち物を持っている（wikiには載っていない）
    if (move[0] == "ギフトパス" && (con.item == "" || def.con.item != "")){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
    
    // ソウルビート: 使用者のHPが足りない
    if (move[0] == "ソウルビート" && con.last_HP < Math.floor(con.full_HP / 3)){
        cfn.logWrite(atk, def, "しかし　HPが　足りなかった" + "\n")
        return true
    }
    // たくわえる: たくわえるカウントがすでに3である
    if (move[0] == "たくわえる" && con.p_con.includes("たくわえる　3回目")){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
    // はきだす/のみこむ: たくわえるカウントが0である
    if ((move[0] == "はきだす" || move[0] == "のみこむ") && !con.p_con.includes("たくわえる")){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
    // とっておき: 覚えているわざにとっておきがない/とっておき以外の技を覚えていない/使用されてない技がある
    if (move[0] == "とっておき"){
        if (con.move_0 != "とっておき" && con.move_1 != "とっておき" && con.move_2 != "とっておき" && con.move_3 != "とっておき"){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
        if ((con.move_0 == "とっておき" || con.move_0 == "") && 
        (con.move_1 == "とっておき" || con.move_1 == "") && 
        (con.move_2 == "とっておき" || con.move_2 == "") && 
        (con.move_3 == "とっておき" || con.move_3 == "")){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
        const log_list = con.log.split("\n")
        let log_data = []
        for (let i = 0; i < log_list.length - 1; i++){
            if (log_list[log_list.length - 1 - i].split("　").length == 6){
                let TN = log_list[log_list.length - 1 - i].split("　")[0]
                let ha = log_list[log_list.length - 1 - i].split("　")[1]
                let wo = log_list[log_list.length - 1 - i].split("　")[3]
                let summon = log_list[log_list.length - 1 - i].split("　")[4]
                let mark = log_list[log_list.length - 1 - i].split("　")[5]
                if (TN == con.TN && ha == "は" && wo == "を" && summon == "繰り出した" && mark == "！"){
                    break
                } else if (ha == "の" && wo == "の" && mark == "！" && cfn.moveSearchByName(summon) && !log_data.includes(summon)){
                    log_data.push(summon)
                }
            }
        }
        let check = 0
        for (let i = 0; i < 4; i++){
            if (con["move_" + i] == "")
            check -= 1
        }
        if (log_data.length < 4 - check){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
    }
    // ほおばる: きのみを持っていない
    if (move[0] == "ほおばる" && !itemEff.berryList().includes(con.item)){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
    // なげつける/しぜんのめぐみ: 持ち物が無い/特性ぶきよう/さしおさえ/マジックルーム状態である/不適格な持ち物である
    if (move[0] == "なげつける" || move[0] == "しぜんのめぐみ"){
        if (con.item == "" || con.ability == "ぶきよう" || con.p_con.includes("さしおさえ") || con.p_con.includes("マジックルーム")){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
        if (move[0] == "なげつける" && atk.con.item.includes("ジュエル")){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
    }
    // ねこだまし/であいがしら/たたみがえし: すでに行動をした
    if (move[0] == "ねこだまし" || move[0] == "であいがしら" || move[0] == "たたみがえし"){
        const list = cfn.lastLog(con)
        const len = list.length
        for (let i = 0; i < list.length - 1; i++){
            if (list[len - 1 - i] == "(" + con.TN + "の行動)" && list[len - i].includes(con.name)){
                cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
                return true
            }
        }
    }
    // はいすいのじん: すでにはいすいのじんによりにげられない状態になっている
    if (move[0] == "はいすいのじん" && con.p_con.includes("はいすいのじん")){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
    // ふいうち: 対象がすでに行動済み/変化技を選択している
    if (move[0] == "ふいうち" && (atk == order[1] || bfn.moveSearch(def)[2] == "変化")){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
    // ポルターガイスト: 対象が持ち物を持っていない
    if (move[0] == "ポルターガイスト" && def.con.item == ""){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
    // まもる/こらえる系: ターンの最後の行動/連続使用による失敗判定
    if (moveEff.protect().includes(move[0])){
        let turn = 0
        for (let i = 0; i < con.p_con.split("\n").length - 1; i++){
            if (con.p_con.split("\n")[i].includes("守る")){
                turn = Number(con.p_con.split("\n")[i].slice(3, 4))
            }
        }
        if (Math.random() < 1 / Math.pow(3, turn) && atk == order[0]){
            cfn.conditionRemove(con, "poke", "守る")
            con.p_con += "守る　" + (turn + 1) + "回成功" + "\n"
        } else {
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            cfn.conditionRemove(con, "poke", "守る")
            return true
        }
    }
  
    // みちづれ: 前回まで最後に成功した行動がみちづれである
    if (move[0] == "みちづれ"){
        const log = cfn.lastLog(con)
        for (let i = 0; i < log.length; i++){
            if (log[i] == con.TN + "　の　" + con.name + "は　道連れにしようとしている"){
                cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
                return true
            }
        }
    }
    // みらいよち/はめつのねがい: 対象の場がすでにみらいにこうげき状態になっている
    if ((move[0] == "みらいよち" || move[0] == "はめつのねがい") && (def.con.f_con.includes("みらいよち") || def.con.f_con.includes("はめつのねがい"))){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
    // もえつきる: 使用者がほのおタイプではない
    if (move[0] == "もえつきる" && !con.type.includes("ほのお")){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
    // いびき/ねごと: 使用者がねむり状態でない
    if ((move[0] == "いびき" || move[0] == "ねごと") && con.abnormal != "ねむり"){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
    // ねむる
    if (move[0] == "ねむる"){
        // 1.HPが満タンである/ねごとで出たためすでにねむり状態にある
        if (con.full_HP == con.last_HP || con.abnormal == "ねむり"){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
        // 2.使用者がふみん/やるきである
        if (con.ability == "ふみん" || con.ability == "やるき"){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
    }
}

// こんらん自傷の攻撃宣言
function confuseSelfInjured(atk, def){
    let con = atk.con
    let A_val = 0
    let B_val = 0
    if (con.A_rank > 0){
        A_val = (con.A_AV * (2 + con.A_rank)) / 2
    } else {
        A_val = (con.A_AV * 2) / (2 - con.A_rank)
    }
    if (con.B_rank > 0){
        B_val = (con.B_AV * (2 + con.B_rank)) / 2
    } else {
        B_val = (con.B_AV * 2) / (2 - con.B_rank)
    }
    // こんらんの自傷ダメージは威力40の物理攻撃
    const damage = parseInt(parseInt(parseInt((con.level * 2) / 5 + 2) * 40 * A_val / B_val) / 50 + 2)
    cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　訳もわからず　自分を攻撃した" + "\n")
    afn.HPchangeMagic(atk, def, damage, "-", "こんらん")
} 

// 14.自分のこおりを回復するわざにより自身のこおり状態が治る
function selfMeltCheck(atk, def, move){
    if (atk.con.abnormal == "こおり" && moveEff.meltMove().includes(move[0])){
        cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　の　" + move[0] + "　でこおりがとけた　!" + "\n")
        atk.con.abnormal = ""  
    }
}

// 15.おおあめ/おおひでりによる技の失敗
function greatWeatherFailure(atk, def, move){
    if (cfn.isWeather(atk.con, def.con) && ((atk.con.f_con.includes("おおあめ") && move[1] == "ほのお") || (atk.con.f_con.includes("おおひでり") && move[1] == "みず"))){
        cfn.logWrite(atk, def, "しかし　" + move[0] + "　は　消えてしまった　!" + "\n")
        return true
    }
}

// 16.ふんじんによるほのお技の失敗とダメージ
function powderFailure(atk, def, move){
    if (atk.con.p_con.includes("ふんじん") && move[1] == "ほのお"){
        cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　は　ふんじんで　技が失敗した　!" + "\n")
        afn.HPchangeMagic(atk, def, Math.round(atk.con.full_HP / 4), "-", "ふんじん")
        return true
    }
}

// 17.トラップシェルが物理技を受けていないことによる失敗
function shellTrap(atk, def, move){
    if (move[0] == "トラップシェル"){
        if (atk.con.p_con.includes("トラップシェル：不発")){
            cfn.logWrite(atk, def, atk.con,TN + "チームの　" + atk.con.name + "の　トラップシェルは　不発に終わった！")
            cfn.conditionRemove(atk.con, "poke", "トラップシェル")
            return true
        }
        if (atk.con.p_con.includes("トラップシェル：成功")){
            cfn.conditionRemove(atk.con, "poke", "トラップシェル")
            return false
        }
    }
}

// 19.特性による失敗
function abilityFailure(atk, def, move){
    // しめりけ: 爆発技
    if (atk.con.ability == "しめりけ" || def.con.ability == "しめりけ"){
        if (move[0] == "じばく" || move[0] == "だいばくはつ" || move[0] == "ビックリヘッド" || move[0] == "ミストバースト"){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
    }
    // じょおうのいげん/ビビッドボディ: 優先度が高い技
    if ((def.con.ability == "じょおうのいげん" || def.con.ability == "ビビッドボディ") && bfn.priorityDegree(atk.con, move) > 0 && !(move[8] == "自分" || move[0] == "味方の場" || move[0] == "全体の場")){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
}

// 20.中断されても効果が発動する技
function remainEffectMove(atk, def, move){
    // みらいよち/はめつのねがい: 相手をみらいにこうげき状態にし、行動を終了する
    if (move[0] == "はめつのねがい" || move[0] == "みらいよち"){
        def.con.f_con += move[0] + "(" + cfn.battleNum(atk) + ")：3/3" + "\n"
        cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "は　未来に攻撃を予知した！" + "\n")
        return true
    }
    // 誓い技: コンビネーションわざのセッターである場合、現在の行動は失敗し味方の行動順を引き上げる(リストは1から)
    // りんしょう: 行動後、味方のりんしょうによる行動順を引き上げる
    // エコーボイス: 次のターンのエコーボイスの威力が上がる
    if (move[0] == "エコーボイス"){
        if (atk.con.f_con.includes("エコーボイス")){
            for (const con of [atk.con, def.con]){
                let f_list = con.f_con.split("\n")
                for (let i = 0; i < f_list.length; i++){
                    if (f_list[i].includes("エコーボイス")){
                        const num = Number(f_list[i].slice(8)) + 0.1
                        f_list[i] = "エコーボイス　+" + num + "\n"
                    }
                }
                con.f_con = f_list.join("\n")
            }
        } else {
            atk.con.f_con += "エコーボイス　0.1" + "\n"
            def.con.f_con += "エコーボイス　0.1" + "\n"
        }
    }
    // いかり: いかり状態になる
    if (move[0] == "いかり" && !atk.con.p_con.includes("いかり")){
        atk.con.p_con += "いかり" + "\n"
    }
}

// 21.へんげんじざい/リベロの発動
function proteanLibero(atk, def, move){
    if ((atk.con.ability == "へんげんじざい" || atk.con.ability == "リベロ") && move[1] != atk.con.type){
        atk.con.type = move[1]
        cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　は　" + atk.con.ability + "　で　" + move[1] + "　タイプに変わった！" + "\n")
    }
}

// 22.溜め技の溜めターンでの動作
function　accumulateOperation(atk, def, move){
    let con = atk.con
    const list = moveEff.accumulate()
    for (let i = 0; i < list.length; i++){
        if (move[0] == list[i][0]){
            if (con.p_con.includes("溜め技")){ //行動ターン
                if (move[0] == "フリーフォール"){
                    cfn.conditionRemove(con, "poke", "溜め技")
                    cfn.conditionRemove(con, "poke", "姿を隠す")
                    cfn.conditionRemove(def.con, "poke", "姿を隠す")
                    if (def.con.type.includes("ひこう")){
                        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
                        return true
                    }
                } else {
                    cfn.conditionRemove(con, "poke", "溜め技")
                    cfn.conditionRemove(con, "poke", "姿を隠す")
                }
            } else if (move[0] == "フリーフォール"){
                // 1.対象が姿を隠していることによる失敗
                // 2.対象がみがわり状態であることによる失敗
                // 3.対象のおもさが200.0kg以上あることによる失敗
                if (def.con.p_con.includes("姿を隠す") || def.con.p_con.includes("みがわり") || bfn.weight(def.con) >= 200){
                    cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
                    return true
                } else { // 4.相手を空中に連れ去る
                    cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　" + def.con.TN + "　の　" + def.con.name + "を　空へ連れ去った！" + "\n")
                    con.p_con += "溜め技：フリーフォール" + "\n"
                    con.p_con += "姿を隠す：フリーフォール（攻撃）" + "\n"
                    def.con.p_con += "姿を隠す：フリーフォール（防御）" + "\n"
                    return true
                }
            } else { // 溜めるターン
                if (list[i][1] == "s"){ // その場で溜める技
                    con.p_con += "溜め技：" + move[0] + "\n"
                    cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　力を溜めている！" + "\n")
                    if (move[0] == "ロケットずつき"){ // ロケットずつき: ぼうぎょが上がる
                        afn.rankChange(atk, def, "B", 1, 100, "ロケットずつき")
                    }
                    if (move[0] == "メテオビーム"){ // メテオビーム: とくこうが上がる
                        afn.rankChange(atk, def, "C", 1, 100, "メテオビーム")
                    }
                } else if (list[i][1] == "h"){ // 姿を隠す技
                    // ダイビング: うのミサイルでフォルムチェンジする
                    if (move[0] == "ダイビング" && con.ability == "うのミサイル" && !(con.p_con.includes("うのみのすがた") || con.p_con.includes("まるのみのすがた"))){
                        if (con.last_HP > con.full_HP / 2){
                            con.p_con += "うのみのすがた" + "\n"
                            cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　うのみのすがたに　姿を変えた！" + "\n")
                        } else {
                            con.p_con += "まるのみのすがた" + "\n"
                            cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　まるのみのすがたに　姿を変えた！" + "\n")
                        }
                    }
                    con.p_con += "溜め技：" + move[0] + "\n"
                    con.p_con += "姿を隠す：" + list[i][2] + "\n"
                    cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　姿を隠した！" + "\n")
                }
                
                // パワフルハーブを持つ場合は使用する。それ以外の場合は次のターンまで行動を中断する(失敗したとは見なされない)
                if ((move[0] == "ソーラービーム" || move[0] == "ソーラーブレード") && con.f_con.includes("にほんばれ") && con.item != "ばんのうがさ" && cfn.isWeather(atk.con, def.con)){
                    cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "は　にほんばれで　すぐ技が打てる！" + "\n")
                    cfn.conditionRemove(con, "poke", "溜め技")
                    cfn.conditionRemove(con, "poke", "姿を隠す")
                } else if (con.item == "パワフルハーブ"){
                    cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "は　パワフルハーブで　力がみなぎった！" + "\n")
                    cfn.conditionRemove(con, "poke", "溜め技")
                    cfn.conditionRemove(con, "poke", "姿を隠す")
                    cfn.setRecycle(atk)
                } else {
                    return true
                }
            }
        }
    }
}

// 25.対象のポケモンが全員すでにひんしになっていて場にいないことによる失敗
function faintedFailure(atk, def, move){
    if ((move[8] == "1体選択" || move[8] == "相手全体" || move[8] == "自分以外") && def.con.f_con.includes("ひんし")){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
}

// 26.だいばくはつ/じばく/ミストバーストの使用者は対象が不在でもHPを全て失う。使用者がひんしになっても攻撃は失敗しない
function selfDestruction(atk, def, move, order){
    if (move[0] == "だいばくはつ" || move[0] == "じばく" || move[0] == "ミストバースト"){
        atk.damage = dmgClac.damageCalculationProcess(atk, def, move, order)
        atk.con.last_HP = 0
        atk["poke" + cfn.battleNum(atk)].last_HP = 0
        summon.comeBack(atk, def)
    }
}

// 27.ビックリヘッド/てっていこうせんの使用者はHPを50%失う。対象が不在なら失わない。使用者がひんしになっても攻撃が失敗しない
function mindblownStealbeam(atk, def, move, order){
    if (move[0] == "ビックリヘッド" || move[0] == "てっていこうせん"){
        atk.damage = dmgClac.damageCalculationProcess(atk, def, move, order)
        afn.HPchangeMagic(atk, def, Math.ceil(atk.con.full_HP / 2), "-", move[0])
    }
}

// 28.マグニチュード使用時は威力が決定される
function magnitude(atk, def, move){
    if (move[0] == "マグニチュード"){
        const random = Math.random() * 100
        let mag = 0
        const convert = [[0, 4, 10], [5, 5, 30], [15, 6, 50], [35, 7, 70], [65, 8, 90], [85, 9, 110], [95, 10, 150]]
        for (let i = 0; i < 7; i++){
            if (random >= convert[i][0]){
                mag = convert[i][1]
                move[3] = convert[i][2]
            }
        }
        cfn.logWrite(atk, def, "マグニチュード" + mag + "！" + "\n")
    }
}

// 29.姿を隠していることによる無効化
function hideInvalidation(atk, def, move){
    let con = def.con
    if (!(con.p_con.includes("姿を隠す") && (move[8] == "1体選択" || move[8] == "相手全体" || move[8] == "自分以外" || move[8] == "全体") && atk.con.ability != "ノーガード" && con.ability != "ノーガード")){
        return
    }
    if ((con.p_con.includes("あなをほる") && !(move[0] == "じしん" || move[0] == "マグニチュード")) 
    || (con.p_con.includes("そらをとぶ") || con.p_con.includes("フリーフォール（攻撃）") || con.p_con.includes("フリーフォール（防御）")) && !(move[0] == "かぜおこし" || move[0] == "たつまき" || move[0] == "かみなり" || move[0] == "スカイアッパー" || move[0] == "うちおとす" || move[0] == "ぼうふう" || move[0] == "サウザンアロー") 
    || (con.p_con.includes("ダイビング") && !(move[0] == "なみのり" || move[0] == "うずしお")) 
    || (con.p_con.includes("シャドーダイブ"))){
        cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　には　当たらなかった！" + "\n")
        return true
    }
}

// 30.サイコフィールドによる無効化
function phschoFieldInvalidation(atk, def, move){
    if (atk.con.f_con.includes("サイコフィールド") && cfn.groundedCheck(def.con) && bfn.priorityDegree(atk.con, move) > 0 && !(move[8] == "自分" || move[0] == "味方の場" || move[0] == "全体の場")){
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　は　サイコフィールドに　守られている！" + "\n")
        return true
    }
}

// 31.ファストガード/ワイドガード/トリックガードによる無効化 (Zワザ/ダイマックスわざならダメージを75%カットする)
function otherProtectInvalidation(atk, def, move){
    let con = def.con
    if ((con.p_con.includes("ファストガード") && bfn.priorityDegree(atk.con, move) > 0 && !(move[8] == "自分" || move[0] == "味方の場" || move[0] == "全体の場")) 
    || (con.p_con.includes("ワイドガード") && (move[8] == "相手全体" || move[8] == "全体"|| move[8] == "自分以外")) 
    || (con.p_con.includes("トリックガード") && (move[8] == "相手全体" || move[8] == "全体" || move[8] == "1体選択") && move[2] == "変化")){
        cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　攻撃を守った！" + "\n")
        return true
    }
}

// 32.まもる/キングシールド/ブロッキング/ニードルガード/トーチカによる無効化 (Zワザ/ダイマックスわざなら75%をカットする)
function protectInvalidation(atk, def, move){
    if (!(move[8] == "自分以外" || move[8] == "全体" || move[8] == "1体選択" || move[8] == "相手全体")){
        return
    }
    if (atk.con.ability == "ふかしのこぶし" && moveEff.cannotProtect().includes(move[0])){
        return
    }

    let  con = def.con
    if (con.p_con.includes("まもる") || con.p_con.includes("みきり") || con.p_con.includes("ニードルガード") || con.p_con.includes("トーチカ")){
        cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　攻撃を守った！" + "\n")
        if (con.p_con.includes("ニードルガード") && move[6] == "直接" && atk.con.item != "ぼうごパット"){
            afn.HPchangeMagic(atk, def, Math.floor(atk.con.full_HP / 8), "-", "ニードルガード")
        } else if (con.p_con.includes("トーチカ") && move[6] == "直接" && atk.con.item != "ぼうごパット"){
            afn.makeAbnormal(atk, def, "どく", 100, "トーチカ")
        }
        if (move[0] == "とびげり" || move[0] == "とびひざげり"){
            afn.HPchangeMagic(atk, def, Math.floor(atk.con.full_HP / 2), "-", move)
        }
        return true
    } else if ((con.p_con.includes("キングシールド") || con.p_con.includes("ブロッキング")) && move[2] != "変化"){
        cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　攻撃を守った！" + "\n")
        if (move[6] == "直接" && con.p_con.includes("キングシールド") && atk.con.item != "ぼうごパット"){
            afn.rankChange(atk, def, "A", -1, 100, "キングシールド")
        } else if (move[6] == "直接" && con.p_con.includes("ブロッキング") && atk.con.item != "ぼうごパット"){
            afn.rankChange(atk, def, "B", -2, 100, "ブロッキング")
        }
        if (move[0] == "とびげり" || move[0] == "とびひざげり"){
            afn.HPchangeMagic(atk, def, Math.floor(atk.con.full_HP / 2), "-", move)
        }
        return true
    }
}

// 33.たたみがえしによる無効化 (Zワザ/ダイマックスわざなら75%をカットする)
function matBlock(atk, def, move){
    if (def.con.p_con.includes("たたみがえし") && move[2] != "変化"){
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　は　攻撃を守った！" + "\n")
        return true
    }
}

// 35.マジックコート状態による反射
function magicCoatReflection(atk, def, move){
    if ((def.con.p_con.includes("マジックコート") || def.con.ability == "マジックミラー") && moveEff.magicCort().includes(move[0])){
        cfn.logWrite(atk, def, move[0] +  "　は　跳ね返された！" + "\n")
        let save = atk
        atk = def
        def = save
        move[9] = "反射"
    }
}

// 36.テレキネシスの場合、対象がディグダ/ダグトリオ/スナバァ/シロデスナ/メガゲンガー/うちおとす状態/ねをはる状態であることによる失敗
function telekinesisFailure(atk, def, move){
    if (move[0] == "テレキネシス"){
        let con = def.con
        if (con.name == "ディグダ" || con.name == "ダグトリオ" || con.name == "スナバァ" || con.name == "シロデスナ" || con.name == "メガゲンガー" || con.p_con.includes("うちおとす") || con.p_con.includes("ねをはる")){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
    }
}

// 38.特性による無効化(その1)
function abilityInvalidation1(atk, def, move){
    let con = def.con
    // そうしょく: くさタイプ
    if (con.ability == "そうしょく" && move[1] == "くさ" && !(move[8] == "自分" || move[8].match("場"))){
        afn.rankChange(def, atk, "A", 1, 100, "そうしょく")
        return true
    }
    // もらいび: ほのおタイプ
    if (con.ability == "もらいび" && move[1] == "ほのお" && !(move[8] == "自分" || move[8].match("場"))){
        cfn.logWrite(atk, def, con.TN + "　の　" + con.name +  "　は　もらいびで　ほのおの威力が上がった！" + "\n")
        if (!con.p_con.includes("もらいび")){
            con.p_con += "もらいび" + "\n"
        }
        return true
    }
    // かんそうはだ/よびみず/ちょすい: みずタイプ
    if (move[1] == "みず" && !(move[8] == "自分" || move[8].match("場"))){
        if (con.ability == "かんそうはだ" || con.ability == "ちょすい"){
            afn.HPchangeMagic(def, atk, Math.floor(con.full_HP / 4), "+", con.ability)
            return true
        } else if (con.ability == "よびみず"){
            afn.rankChange(def, atk, "C", 1, 100, "よびみず")
            return true
        }
    }
    // ひらいしん/でんきエンジン/ちくでん: でんきタイプ
    if (move[1] == "でんき" && !(move[8] == "自分" || move[8].match("場"))){
        if (con.ability == "ひらいしん"){
            afn.rankChange(def, atk, "C", 1, 100, "ひらいしん")
            return true
        } else if (con.ability == "でんきエンジン"){
            afn.rankChange(def, atk, "S", 1, 100, "でんきエンジン")
            return true
        } else if (con.ability == "ちくでん"){
            afn.HPchangeMagic(def, atk, Math.floor(con.full_HP / 4), "+", "ちくでん")
            return true
        }
    }
    // ぼうおん: 音技
    if (con.ability == "ぼうおん" && moveEff.music().includes(move[0]) && move[0] != "ソウルビート"){
        cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　の　ぼうおん　で無効になった！" + "\n")
        return true
    }
    // テレパシー:　味方による攻撃技
    // ふしぎなまもり: 効果抜群でない技
    if (con.ability == "ふしぎなまもり" && cfn.compatibilityCheck(atk, def, move) <= 1){
        cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　の　ふしぎなまもり　で無効になった！" + "\n")
        return true
    }
    // ぼうじん: 粉技
    if (con.ability == "ぼうじん" && moveEff.powder().includes(move[0])){
        cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　の　ぼうじん　で無効になった！" + "\n")
        return true
    }
}

// 39.相性による無効化
function compatibilityInvalidation(atk, def, move){
    // 変化技でない、あるいはでんじはであり、対象がねらいのまとを持っていない場合
    if ((move[2] != "変化" || move[0] == "でんじは") && def.con.item != "ねらいのまと" && cfn.compatibilityCheck(atk, def, move) == 0){
        cfn.logWrite(atk, def, def.con.TN +  "　の　" + def.con.name + "　には　効果がないようだ・・・" + "\n")
        return true
    }
}

// 40,ふゆうによる無効化
// 41.でんじふゆう/テレキネシス/ふうせんによる無効化
function levitateInvalidation(atk, def, move){
    if (move[1] == "じめん" && move[2] != "変化" && !def.con.p_con.includes("ねをはる")){
        if (def.con.ability == "ふゆう"){
            cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　の　ふゆう　で無効になった！" + "\n")
            return true
        } else if (def.con.p_con.includes("でんじふゆう") || def.con.p_con.includes("テレキネシス") || def.con.item == "ふうせん"){
            cfn.logWrite(atk, def, def.con.TN +  "　の　" + def.con.name + "　には　効果がないようだ・・・" + "\n")
            return true
        }
    }
}

// 42.ぼうじんゴーグルによる無効化
function powderGoggleInvalidation(atk, def, move){
    if (def.con.item == "ぼうじんゴーグル" && moveEff.powder().includes(move[0])){
        cfn.logWrite(atk, def, def.con.TN +  "　の　" + def.con.name + "　は　ぼうじんゴーグルで　" + move[0] + "を　受けない！" + "\n")
        return true
    }
}

// 43.特性による無効化(その2)
function abilityInvalidation2(atk, def, move){
    // ぼうだん: 弾の技
    if (def.con.ability == "ぼうだん" && moveEff.ball().includes(move[0])){
        cfn.logWrite(atk, def, def.con.TN +  "　の　" + def.con.name + "　は　ぼうだんで　無効になった！" + "\n")
        return true
    }
    // ねんちゃく: トリック/すりかえ/ふしょくガス
    if (def.con.ability == "ねんちゃく" && (move[0] == "トリック" || move[0] == "すりかえ" || move[0] == "ふしょくガス")){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
}

// 44.タイプによる技の無効化(その1)
function typeInvalidation1(atk, def, move){
    // くさタイプ: 粉技の無効化
    if (def.con.type.includes("くさ") && moveEff.powder().includes(move[0])){
        cfn.logWrite(atk, def, def.con.TN +  "　の　" + def.con.name + "　には　効果がないようだ・・・" + "\n")
        return true
    } 
    // ゴーストタイプ: にげられない状態にする変化技の無効化
    if (def.con.type.includes("ゴースト") && (move[0] == "くろいまなざし" || move[0] == "クモのす" || move[0] == "とおせんぼう")){
        cfn.logWrite(atk, def, def.con.TN +  "　の　" + def.con.name + "　には　効果がないようだ・・・" + "\n")
        return true
    }
    // あくタイプ: いたずらごころの効果が発動した技の無効化
    if (atk.con.ability == "いたずらごころ" && def.con.type.includes("あく") && move[2] == "変化" && !(move[8] == "自分" || move[0] == "味方の場" || move[0] == "全体の場")){
        cfn.logWrite(atk, def, def.con.TN +  "　の　" + def.con.name + "　には　効果がないようだ・・・" + "\n")
        return true
    }
    // こおりタイプ: ぜったいれいどの無効化
    if (atk.con.type.includes("こおり") && move[0] == "ぜったいれいど"){
        cfn.logWrite(atk, def, def.con.TN +  "　の　" + def.con.name + "　には　効果がないようだ・・・" + "\n")
        return true
    }
}

// 45.技の仕様による無効化(その1)
function moveSpecificationsInvalidation1(atk, def, move){
    // メロメロ: 対象と性別が同じ/対象が性別不明
    if (move[0] == "メロメロ" && (atk.con.sex == " - " || def.con.sex == " - " || atk.con.ex == def.con.sex)){
        cfn.logWrite(atk, def, def.con.TN +  "　の　" + def.con.name + "　には　効果がないようだ・・・" + "\n")
        return true
    }
    // ゆうわく（wikiには書いていなかったが、勝手に入れた）
    if (move[0] == "ゆうわく" && !((atk.con.sex == " ♂ " && def.con.sex == " ♀ ") || (atk.con.sex == " ♀ " && def.con.sex == " ♂ "))){
        cfn.logWrite(atk, def, def.con.TN +  "　の　" + def.con.name + "　には　効果がないようだ・・・" + "\n")
        return true
    }
    // いちゃもん: 対象がダイマックスしている
    // ベノムトラップ: 対象がどく/もうどく状態でない
    if (move[0] == "ベノムトラップ" && !def.con.abnormal.includes("どく")){
        cfn.logWrite(atk, def, def.con.TN +  "　の　" + def.con.name + "　には　効果がないようだ・・・" + "\n")
        return true
    }
}

// 46.技の仕様による無効化(その2)
function moveSpecificationsInvalidation2(atk, def, move){
    // 重複による無効化
    // あくび: 対象がすでに状態異常/あくび状態になっている
    if (move[0] == "あくび" && (def.con.abnormal != "" || def.con.p_con.includes("ねむけ"))){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
    // あくむ: 対象がすでにあくむ状態になっている　（wikiにはなかった）
    if (move[0] == "あくむ" && def.con.p_con.includes("あくむ")){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
    // いちゃもん: 対象がすでにいちゃもん状態である
    if (move[0] == "いちゃもん" && def.con.p_con.includes("いちゃもん")){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
    // とぎすます: 自信がすでにとぎすます状態である　（wikiにはなかった）
    if (move[0] == "とぎすます" && atk.con.p_con.includes("とぎすます")){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
    // オーロラベール: あられ状態でない（wikiには載っていない）
    if (move[0] == "オーロラベール" && (!def.con.f_con.includes("あられ") || !cfn.isWeather(atk.con, def.con))){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }

    // ほごしょく: 自身が同じタイプを持っている (wikiにない)
    if (move[0] == "ほごしょく"){
        if ((atk.con.f_con.includes("グラスフィールド") && atk.con.type.includes("くさ")) 
        || (atk.con.f_con.includes("エレキフィールド") && atk.con.type.includes("でんき")) 
        || (atk.con.f_con.includes("ミストフィールド") && atk.con.type.includes("フェアリー")) 
        || (atk.con.f_con.includes("サイコフィールド") && atk.con.type.includes("エスパー")) 
        || (!atk.con.f_con.includes("フィールド") && atk.con.type.includes("ノーマル"))){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
    }
    // なやみのタネ: 対象がすでにふみんである
    if (move[0] == "なやみのタネ" && def.con.ability == "ふみん"){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
    // ねをはる: 自身がすでにねをはる状態である
    if (move[0] == "ねをはる" && atk.con.p_con.includes("ねをはる")){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
    // ほろびのうた: 対象がすでにほろびのうた状態である
    if (move[0] == "ほろびのうた" && atk.con.p_con.includes("ほろびカウント") && def.con.p_con.includes("ほろびカウント")){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
    // ミラクルアイ: 対象がすでにミラクルアイ状態である
    if (move[0] == "ミラクルアイ" && def.con.p_con.includes("ミラクルアイ")){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
    // メロメロ: 対象がすでにメロメロ状態である
    if (move[0] == "メロメロ" && def.con.p_con.includes("メロメロ")){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
    // やどりぎのタネ: 対象がすでにやどりぎのタネ状態である
    if (move[0] == "やどりぎのタネ" && def.con.p_con.includes("やどりぎのタネ")){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
    // 状態異常にする変化技
    const abnormal = moveEff.abnormal()
    for (let i = 0; i < abnormal.length; i++){
        if (move[0] == abnormal[i][0]){
            // 対象がすでに同じ状態異常になっている
            if ((abnormal[i][1] == "こんらん" && def.con.p_con.includes("こんらん")) || (abnormal[i][1] != "こんらん" && def.con.abnormal == abnormal[i][1])){
                cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "は　すでに　" + abnormal[i][1] + "に　なっていた・・・" + "\n")
                return true
            }
            // 対象が別の状態異常になっている
            if (abnormal[i][1] != "こんらん" && def.con.abnormal != ""){
                cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
                return true
            }
        }
    }
    // ランク補正に関する無効化
    // ランク補正を上げる変化技: ランクがすでに最大である
    // ランク補正を下げる変化技: ランクがすでに最低である
    const rank = moveEff.rankChange()
    for (let i = 0; i < rank.length; i++){
        if (move[0] == rank[i][0]){
            let team = rank[i][1]
            if (team == "s"){
                team = atk
            } else if (team == "e"){
                team = def
            }
            let check = 0
            for (let j = 2; j < rank[i].length; j++){
                let parameter = rank[i][j][0]
                let change = rank[i][j][1]
                if ((change > 0 && team.con[parameter + "_rank"] == 6) && (change < 0 && team.con[parameter + "_rank"] == -6)){
                    check += 1
                }
            }
            if (check == rank[i].length - 2){
                cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
                return true
            }
        }
    }
    // コーチング: シングルバトルである/対象となる味方がいない
    if (move[0] == "コーチング" || move[0] == "アロマミスト"){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
    // ソウルビート/はいすいのじん: 全能力が最大まで上がっている
    if (move[0] == "ソウルビート" || move[0] == "はいすいのじん"){
        if (atk.con.A_rank == 6 && atk.con.B_rank == 6 && atk.con.C_rank == 6 && atk.con.D_rank == 6 && atk.con.S_rank == 6){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
    }
    // ほおばる: ぼうぎょランクがすでに最大である
    if (move[0] == "ほおばる" && atk.con.B_rank == 6){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
    // その他
    // がむしゃら: 対象のHPが使用者以下
    if (move[0] == "がむしゃら" && (atk.con.last_HP >= def.con.last_HP)){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
    // シンクロノイズ: タイプが合致していない
    if (move[0] == "シンクロノイズ" && (atk.con.type != def.con.type)){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
    // ゆめくい/あくむ: 対象がねむり状態でない
    if ((move[0] == "ゆめくい" || move[0] == "あくむ") && def.con.abnormal != "ねむり"){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
    // 一撃必殺技: 対象が使用者よりレベルが高い/対象がダイマックスしている
    if (moveEff.oneShot().includes(move[0]) && atk.con.level < def.con.level){
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "には　全然効いてない！" + "\n")
        return true
    }
    // リフレッシュ: 状態異常のポケモンがいない（wikiにない）
    if (move[0] == "リフレッシュ" && !(atk.con.abnormal == "どく" || atk.con.abnormal == "やけど" || atk.con.abnormal == "まひ")){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
}

// 47.タイプによる技の無効化(その2)
function typeInvalidation2(atk, def, move){
    // くさタイプ: やどりぎのタネの無効化
    if (def.con.type.includes("くさ") && move[0] == "やどりぎのタネ"){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
    // ほのおタイプ: やけどの無効化
    if (def.con.type.includes("ほのお") && move[0] == "おにび"){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
    // どく/はがねタイプ: どく/もうどくの無効化
    if ((def.con.type.includes("どく") || def.con.type.includes("はがね")) && (move[0] == "どくガス" || move[0] == "どくどく" || move[0] == "どくのこな") && atk.con.ability != "ふしょく"){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
    // でんきタイプ: まひの無効化
    if (def.con.type.includes("でんき") && (move[0] == "しびれごな" || move[0] == "でんじは" || move[0] == "へびにらみ")){
        cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
        return true
    }
}

// 48.さわぐによるねむりの無効化
function uproar(atk, def, move){
    if (move[0] == "さわぐ" && def.con.abnormal == "ねむり"){
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　は　騒がしくて　目を覚ました！" + "\n")
        def.con.abnormal = ""
        cfn.conditionRemove(def.con, "poke", "ねむり")
        cfn.conditionRemove(def.con, "poke", "ねむる")
    }
    const list = moveEff.abnormal()
    for (let i = 0; i < list.length; i++){
        if (move[0] == list[i][0] && list[i][1] == "ねむり" && (atk.con.p_con.includes("さわぐ") || def.con.p_con.includes("さわぐ"))){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
    }
}

// 49.しんぴのまもり状態による無効化
function safeguardInvalidation(atk, def, move){
    if (def.con.f_con.includes("しんぴのまもり") && atk.con.ability != "すりぬけ"){
        for (let i = 0; i < moveEff.abnormal().length; i++){
            if (move[0] == moveEff.abnormal()[i][0]){
                cfn.logWrite(atk, def, "しかし　しんぴのまもりに　防がれた・・・" + "\n")
                return true   
            }
        }
    }
}

// 50.エレキフィールド/ミストフィールド状態による状態異常の無効化
function fieldInvalidation(atk, def, move){
    const list = moveEff.abnormal()
    for (let i = 0; i < list.length; i++){
        if (move[0] == list[i][0] && list[i][1] == "ねむり" && def.con.f_con.includes("エレキフィールド") && cfn.groundedCheck(def.con)){
            cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "は　エレキフィールドに守られている！" + "\n")
            return true
        }
        if (move[0] == list[i][0] && def.con.f_con.includes("ミストフィールド") && cfn.groundedCheck(def.con)){
            cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "は　ミストフィールドに守られている！" + "\n")
            return true 
        }
    }
}

// 51.みがわり状態によるランク補正を下げる技/デコレーションの無効化
function substituteInvalidation1(atk, def, move){
    const list = moveEff.rankChange()
    for (let i = 0; i < list.length ;i++){
        if (move[0] == list[i][0] && list[i][1] == "e" && def.con.p_con.includes("みがわり") && atk.con.ability != "すりぬけ" && !moveEff.music().includes(move[0])){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
    }
}

// 52.しろいきりによる無効化
function mistInvalidation(atk, def, move){
    const list = moveEff.rankChange()
    for (let i = 0; i < list.length ;i++){
        if (move[0] == list[i][0] && list[i][1] == "e" && move[0] != "デコレーション" && def.con.f_con.includes("しろいきり") && atk.con.ability != "すりぬけ"){
                document.battle_log.battle_log.value += "しかし　しろいきりに　防がれた・・・" + "\n"
                return true 
            }
        }
    }

// 53.特性による無効化(その3)
function abilityInvalidation3(atk, def, move){
    let con = def.con
    const rank = moveEff.rankChange()
    const abnormal = moveEff.abnormal()
    // ランク補正に関する無効化
    // クリアボディ/しろいけむり/メタルプロテクト/フラワーベール: 能力を下げる技
    if (con.ability == "クリアボディ" || con.ability == "しろいけむり" || con.ability == "メタルプロテクト" || (con.ability == "フラワーベール" && con.type.includes("くさ"))){
        for (let i = 0; i < rank.length ;i++){
            if (move[0] == rank[i][0] && rank[i][1] == "e" && move[0] != "デコレーション"){
                cfn.logWrite(atk, def, con.ability + " によりランクは下がらない・・・" + "\n")
                return true 
            }
        }
    }
    // かいりきバサミ: こうげきを下げる技
    if (con.ability == "かいりきバサミ"){
        for (let i = 0; i < rank.length ;i++){
            if (move[0] == rank[i][0] && rank[i][1] == "e" && rank[i].length == 3 && rank[i][2][0] == "A"){
                cfn.logWrite(atk, def, con.ability + " によりランクは下がらない・・・" + "\n")
                return true 
            }
        }
    }
    // はとむね: ぼうぎょを下げる技
    if (con.ability == "はとむね"){
        for (let i = 0; i < rank.length ;i++){
            if (move[0] == rank[i][0] && rank[i][1] == "e" && rank[i].length == 3 && rank[i][2][0] == "B"){
                cfn.logWrite(atk, def, con.ability + " によりランクは下がらない・・・" + "\n")
                return true 
            }
        }
    }
    // するどいめ: 命中を下げる技
    if (con.ability == "するどいめ"){
        for (let i = 0; i < rank.length ;i++){
            if (move[0] == rank[i][0] && rank[i][1] == "e" && rank[i].length == 3 && rank[i][2][0] == "X"){
                cfn.logWrite(atk, def, con.ability + " によりランクは下がらない・・・" + "\n")
                return true 
            }
        }
    }
    // 状態異常/状態変化に関する無効化
    // スイートベール/ぜったいねむり/フラワーベール/リーフガード/リミットシールド: 状態異常の無効化
    if (con.ability == "スイートベール" 
    || con.ability == "ぜったいねむり" 
    || (con.ability == "フラワーベール" && con.type.includes("くさ")) 
    || (con.ability == "リーフガード" && con.f_con.includes("にほんばれ") && cfn.isWeather(atk.con, def.con)) 
    || con.name == "メテノ(りゅうせいのすがた)"){
        for (let i = 0; i < abnormal.length; i++){
            if (move[0] == abnormal[i][0]){
                cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　" + con.ability + " に　守られている！" + "\n")
                return true
            }
        }
        if (move[0] == "あくび"){
            cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　" + con.ability + " に　守られている！" + "\n")
            return true
        }
    }
    // めんえき/パステルベール: どく・もうどく状態の無効化
    if (con.ability == "めんえき" || con.ability == "パステルベール"){
        for (let i = 0; i < abnormal.length; i++){
            if (move[0] == abnormal[i][0] && abnormal[i][1].includes("どく")){
                cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　" + con.ability + " に　守られている！" + "\n")
                return true 
            }
        }
    }
    // じゅうなん: まひ状態の無効化
    if (con.ability == "じゅうなん"){
        for (let i = 0; i < abnormal.length; i++){
            if (move[0] == abnormal[i][0] && abnormal[i][1] == "まひ"){
                cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　" + con.ability + " に　守られている！" + "\n")
                return true
            }   
        }
    }
    // みずのベール/すいほう: やけど状態の無効化
    if (con.ability == "みずのベール" || con.ability == "すいほう"){
        for (let i = 0; i < abnormal.length; i++){
            if (move[0] == abnormal[i][0] && abnormal[i][1] == "やけど"){
                cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　" + con.ability + " に　守られている！" + "\n")
                return true  
            }
        }
    }
    // ふみん/やるき: ねむり状態の無効化
    if (con.ability == "ふみん" || con.ability == "やるき"){
        for (let i = 0; i < abnormal; i++){
            if (move[0] == abnormal[i][0] && abnormal[i][1] == "ねむり" || move[0] == "あくび"){
                cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　" + con.ability + " に　守られている！" + "\n")
                return true
            }   
        }
    }
    // マグマのよろい: こおり状態の無効化
    if (con.ability == "マグマのよろい"){
        for (let i = 0; i < abnormal; i++){
            if (move[0] == abnormal[i][0] && abnormal[i][1] == "こおり"){
                cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　" + con.ability + " に　守られている！" + "\n")
                return true
            }   
        }
    }
    // マイペース: こんらん状態の無効化
    if (con.ability == "マイペース"){
        for (let i = 0; i < abnormal.length; i++){
            if (move[0] == abnormal[i][0] && abnormal[i][1] == "こんらん"){
                cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　" + con.ability + " に　守られている！" + "\n")
                return true
            }
        }
    }
    // どんかん: メロメロ/ちょうはつ状態の無効化　ゆうわく（wikiにない）
    if (con.ability == "どんかん" && (move[0] == "メロメロ" || move[0] == "ちょうはつ" || move[0] == "ゆうわく")){
        cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　" + con.ability + " に　守られている！" + "\n")
        return true
    }   
    // その他
    // アロマベール: メロメロ/いちゃもん/かいふくふうじ状態の無効化
    if (con.ability == "アロマベール" && (move[0] == "メロメロ" || move[0] == "いちゃもん" || move[0] == "かいふくふうじ")){
        cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　アロマベールに　守られている！" + "\n")
        return true
    }
    // がんじょう: 一撃必殺技の無効化
    if (con.ability == "がんじょう" && moveEff.oneShot().includes(move[0])){
        cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　" + con.ability + " に　守られている！" + "\n")
        return true
    }
}

// 55.シャドースチールで対象のランク補正を吸収する
function spectralThief(atk, def, move){
    if (move[0] == "シャドースチール"){
        let check = 0
        for (const parameter of ["A", "B", "C", "D", "S", "X", "Y"]){
            if (def.con[parameter + "_rank"] > 0){
                afn.rankChange(atk, def, parameter, def.con[parameter + "_rank"], 100, move)
                def.con[parameter + "_rank"] = 0
                check += 1
            }
        }
        if (check > 0){
            cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　は　上がった能力を　奪い取った！" + "\n")
        }
    }
}

// 56.対応するタイプの攻撃技の場合ジュエルが消費される
function useJuwel(atk, def, move){
    if (atk.con.item.includes("ジュエル") && move[2] != "変化" && !moveEff.oneShot().includes(move[0]) && atk.con.item.includes(move[1])){
        cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　は　" + atk.con.item + "　で威力を高めた！" + "\n")
        cfn.setRecycle(atk)
        atk.con.p_con += "ジュエル" + "\n"
    }
}

// 57. かわらわり/サイコファング/ネコにこばんの効果が発動する
function wallBreak(atk, def, move){
    if ((move[0] == "かわらわり" || move[0] == "サイコファング") && (def.con.f_con.includes("オーロラベール") || def.con.f_con.includes("ひかりのかべ") || def.con.f_con.includes("リフレクター"))){
        cfn.logWrite(atk, def, def.con.TN + "　の　壁を　破壊した！" + "\n")
        cfn.conditionRemove(def.con, "field", "オーロラベール")
        cfn.conditionRemove(def.con, "field", "ひかりのかべ")
        cfn.conditionRemove(def.con, "field", "リフレクター")
    }
}

// 58. ポルターガイストで対象のもちものが表示される
function poltergeist(atk, def, move){
    if (move[0] == "ポルターガイスト"){
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "に　" + def.con.item + "が　襲いかかる！" + "\n")
    }
}

// 59.みがわりによるランク補正を変動させる効果以外の無効化
function substituteInvalidation2(atk, def, move){
    // みがわり状態であり、変化技であり、音技でなく、身代わり貫通技でない
    if (def.con.p_con.includes("みがわり") && move[2] == "変化" && !moveEff.music().includes(move[0]) && !moveEff.substitute().includes(move[0])){
        // 対象が、1体選択、相手全体、自分以外、全体
        if (move[8] == "1体選択" || move[8] == "相手全体" || move[8] == "自分以外" || move[8] == "全体"){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
    }
}

// 60.ミラーアーマー: ランクを下げる変化技の反射
function millorArmer(atk, def, move){
    const list = moveEff.rankChange()
    for (let i = 0; i < list.length; i++){
        if (def.con.ability == "ミラーアーマー" && move[0] == list[i][0] && move[0] != "デコレーション" && list[i][1] == "e"){
            cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "は　ミラーアーマーで　跳ね返した！" + "\n")
            for (let j = 2; j < list[i].length; j++){
                let parameter = list[i][j][0]
                let change = list[i][j][1]
                afn.rankChange(atk, def, parameter, change, 100, move)
            }
            return true
        }
    }
}

// 61.ほえる・ふきとばしの無効化
function roarWhirlwind(atk, def, move){
    if (move[0] == "ほえる" || move[0] == "ふきとばし"){
        // 1.ダイマックスによる無効化
        // 2.きゅうばんによる無効化
        if (def.con.ability == "きゅうばん"){
            cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　は　きゅうばんにより　動かない！" + "\n")
            return true
        }
        // 3.ねをはるによる無効化
        if (def.con.f_con.includes("ねをはる")){
            cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　は　根を張って　動かない！" + "\n")
            return true
        }
    }
}

// 62.技の仕様による無効化(その3)
function moveSpecificationsInvalidation3(atk, def, move){
    // 特性に関する無効化
        // なかまづくり: 対象がダイマックスしている/対象が自身と同じ特性である/自身がコピーできない特性である/対象が上書きできない特性である
        if (move[0] == "なかまづくり" && (atk.con.ability == def.con.ability || abiEff.entrainmentEnemy().includes(def.con.ability) || abiEff.entrainmentSelf().includes(atk.con.ability))){
            cfn.logWrite(atk, def, "しかし　効果がないようだ・・・" + "\n")
            return true
        }
        // いえき: 対象がすでにとくせいなし状態である/とくせいなしにできない特性である
        if (move[0] == "いえき" && (def.con.p_con.includes("特性なし") || abiEff.gastro().includes(def.con.ability))){
            cfn.logWrite(atk, def, "しかし　効果がないようだ・・・" + "\n")
            return true
        }
        // なりきり: 自身が対象と同じ特性である/対象がコピーできない特性である
        if (move[0] == "なりきり" && (atk.con.ability == def.con.ability || abiEff.rolePlayEnemy().includes(def.con.ability) || abiEff.rolePlaySelf().includes(atk.con.ability))){
            cfn.logWrite(atk, def, "しかし　効果がないようだ・・・" + "\n")
            return true
        }
        // シンプルビーム: 対象がすでにたんじゅんである/上書きできない特性である
        if (move[0] == "シンプルビーム" && (def.con.ability == "たんじゅん" || abiEff.simpleBeam().includes(def.con.ability))){
            cfn.logWrite(atk, def, "しかし　効果がないようだ・・・" + "\n")
            return true
        }
        // なやみのタネ: 対象が上書きできない特性である
        if (move[0] == "なやみのタネ" && abiEff.worrySeed().includes(def.con.ability)){
            cfn.logWrite(atk, def, "しかし　効果がないようだ・・・" + "\n")
            return true
        }
        // スキルスワップ: 自身や対象が交換できない特性である/対象がダイマックスしている
        if (move[0] == "スキルスワップ" && (abiEff.skillSwap().includes(atk.con.ability) || abiEff.skillSwap().includes(def.con.ability))){
            cfn.logWrite(atk, def, "しかし　効果がないようだ・・・" + "\n")
            return true
        }
    // HPが満タンによる無効化
        // いやしのはどう/フラワーヒール
        if ((move[0] == "いやしのはどう" || move[0] == "フラワーヒール") && (def.con.last_HP == def.con.full_HP)){
            cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "は　HPが満タンだった" + "\n")
            return true
        }
        // いのちのしずく
        if (move[0] == "いのちのしずく" && atk.con.last_HP == atk.con.full_HP){
            cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "は　HPが満タンだった" + "\n")
            return true
        }
        // ジャングルヒール: HPが満タンで、状態異常でもない
        if (move[0] == "ジャングルヒール" && atk.con.last_HP == atk.con.full_HP && atk.con.abnormal == ""){
            cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "は　HPが満タンだった" + "\n")
            return true
        }
        // かふんだんご
        // プレゼント: 回復効果が選ばれた場合
        if (move[0] == "プレゼント" && move[3] == "-"){
            if (def.con.last_HP == def.con.full_HP){
                cfn.logWrite(def, atk, def.con.TN + "　の　" + def.con.name + "は　HPが満タンだった" + "\n")
                return true
            } else {
                afn.HPchangeMagic(def, atk, Math.floor(def.con.full_HP / 4), "+", move)
                return true
            }
        }
        // 自分の体力を回復する技(じこさいせい等)
        if ((move[0] == "じこさいせい" || move[0] == "タマゴうみ" || move[0] == "ミルクのみ" || move[0] == "なまける" || move[0] == "かいふくしれい" || move[0] == "はねやすめ") && (atk.con.last_HP == atk.con.full_HP)){
            cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "は　HPが満タンだった" + "\n")
            return true
        }
    // ステータスに関する無効化
        // はらだいこ: 自身がHP半分以下である/すでにランク+6である
        if (move[0] == "はらだいこ" && (atk.con.last_HP < Math.floor(atk.con.full_HP / 2) || atk.con.A_rank == 6)){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
        // フラワーガード/たがやす: 対象がくさタイプでない（たがやすの時は地面にいる必要がある）
        if (move[0] == "フラワーガード" && !atk.con.type.includes("くさ") && !def.con.type.includes("くさ")){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
        if (move[0] == "たがやす" && !atk.con.type.includes("くさ") && cfn.groundedCheck(atk.con) && !def.con.type.includes("くさ") && cfn.groundedCheck(def.con)){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
        // じばそうさ/アシストギア: 対象の特性がプラスかマイナスでない
        if ((move[0] == "じばそうさ" || move[0] == "アシストギア") && atk.con.ability != "プラス" && atk.con.ability != "マイナス"){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
        // ちからをすいとる: 対象のこうげきが-6である
        if (move[0] == "ちからをすいとる" && def.con.A_rank == -6){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
        // いばる/おだてる: 対象のランクが+6でありこんらんしている
        if (move[0] == "いばる" && def.con.A_rank == 6 && def.con.p_con.includes("こんらん")){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        } else if (move[0] == "おだてる" && def.con.C_rank == 6 && def.con.p_con.includes("こんらん")){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
        // ひっくりかえす: 対象のランクが変化していない
        if (move[0] == "ひっくりかえす" && (def.con.A_rank == 0 && def.con.B_rank == 0 && def.con.C_rank == 0 && def.con.D_rank == 0 && def.con.S_rank == 0 && def.con.X_rank == 0 && def.con.Y_rank == 0)){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
    // タイプによる無効化
        // テクスチャー: 現在のタイプが一番上の技と同じ
        if (move[0] == "テクスチャー" && (atk.con.type.includes(cfn.moveSearchByName(atk.con.move_0)[1]) || atk.con.move_0 == "テクスチャー" || (atk.con.move_0 == "のろい" && !atk.con.type.includes("ゴースト") && atk.con.type.includes("ノーマル")))){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
        // テクスチャー2: 対象が行動していない/最後に使った技がわるあがきである
        if (move[0] == "テクスチャー2" && (def.con.used == "" || def.con.used == "わるあがき")){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
        // ミラータイプ: すでに対象と同じタイプである
        if (move[0] == "ミラータイプ" && (atk.con.type == def.con.type)){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
        // みずびたし/まほうのこな: 対象がみず単タイプである/エスパー単タイプである | 対象がアルセウスかシルヴァディである
        if (move[0] == "みずびたし" && (def.con.type == "みず" || def.con.name == "アルセウス" || def.con.name == "シルヴァディ")){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        } else if (move[0] == "まほうのこな" && (def.con.type == "エスパー" || def.con.name == "アルセウス" || def.con.name == "シルヴァディ")){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
        // ハロウィン/もりののろい: 対象がゴーストタイプを持つ/くさタイプを持つ
        if (move[0] == "ハロウィン" && def.con.type.includes("ゴースト")){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        } else if (move[0] == "もりののろい" && def.con.type.includes("くさ")){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
    // 特殊なメッセージが出る技の失敗
        // アロマセラピー/いやしのすず: 状態異常の味方がいない
        if ((move[0] == "アロマセラピー" || move[0] == "いやしのすず") && atk.con.abnormal == ""){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
        // おちゃかい: 場にきのみを持つポケモンがいない
        if (move[0] == "おちゃかい" && !(itemEff.berryList().includes(atk.con.item) || itemEff.berryList().includes(def.con.item))){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
    // 重複による無効化
        // 天気/フィールド/場の状態を発動させる技: すでに同じ状態になっている
        const field = moveEff.fieldCondition()
        for (let i = 0; i < field.length; i++){
            if (move[0] == field[i][0] && ((field[i][2] == "e" && def.con.f_con.includes(field[i][1])) || atk.con.f_con.includes(field[i][1]))){
                cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
                return true
            }
        }
        // 設置技: すでに最大まで仕掛けられている
        if (move[0] == "まきびし" && def.con.f_con.includes("まきびし　3回目")){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        } else if (move[0] == "どくびし" && def.con.f_con.includes("どくびし　2回目")){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
        // にげられない状態にする技: すでににげられない状態である
        if ((move[0] == "くろいまなざし" || move[0] == "クモのす" || move[0] == "とおせんぼう" || move[0] == "たこがため") && def.con.p_con.includes("逃げられない")){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
        // アクアリング: 自身がすでにアクアリング状態である
        if (move[0] == "アクアリング" && atk.con.p_con.includes("アクアリング")){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
        // きあいだめ: 自身がすでにきゅうしょアップ状態である
        if (move[0] == "きあいだめ" && atk.con.p_con.includes("きゅうしょアップ")){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
        // かいふくふうじ: 対象がすでにかいふくふうじ状態である
        if (move[0] == "かいふくふうじ" && def.con.p_con.includes("かいふくふうじ")){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
        // さしおさえ: 対象がすでにさしおさえ状態である　（wikiにない）
        if (move[0] == "さしおさえ" && (def.con.p_con.includes("さしおさえ") || def.con.item == "")){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
        // ちょうはつ: 対象がすでにちょうはつ状態である
        if (move[0] == "ちょうはつ" && def.con.p_con.includes("ちょうはつ")){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
        // テレキネシス: 対象がすでにテレキネシス状態である　（wikiにない）
        if (move[0] == "テレキネシス" && def.con.p_con.includes("テレキネシス")){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
        // でんじふゆう: 自身がすでにでんじふゆう状態である (うちおとす状態である wikiにない)
        if (move[0] == "でんじふゆう" && (atk.con.p_con.includes("でんじふゆう") || atk.con.p_con.includes("うちおとす"))){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
        // ねがいごと: 前のターンのねがいごとの効果が残っている
        if (move[0] == "ねがいごと" && atk.con.f_con.includes("ねがいごと")){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
        // のろい(呪い): 対象がすでにのろい状態である
        if (move[0] == "のろい" && def.con.p_con.includes("のろい")){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
        // ロックオン/こころのめ: 自身がすでにロックオン状態である
        if ((move[0] == "ロックオン" || move[0] == "こころのめ") && atk.con.p_con.includes("ロックオン")){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
    // その他の無効化
        // 天気を変える技: おおひでり/おおあめ/デルタストリームにより変えられない
        if (atk.con.f_con.includes("おおひでり") || atk.con.f_con.includes("おおあめ") || atk.con.f_con.includes("らんきりゅう")){
            if (move[0] == "にほんばれ" || move[0] == "あまごい" || move[0] == "すなあらし" || move[0] == "あられ"){
                cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
                return true
            }
        }
        // コートチェンジ: 入れ替える場の状態が無い
        if (move[0] == "コートチェンジ"){
            const list = moveEff.courtChange()
            let check = 0
            for (let i = 0; i < list.length; i++){
                if (atk.con.f_con.includes(list[i]) || def.con.f_con.includes(list[i])){
                    check += 1
                }
            }
            if (check == 0){
                cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
                return true
            }
        }
        // アンコール: 対象が技を使用していない/技のPPが残っていない/アンコールできない技/相手がダイマックス/すでにアンコール状態
        let now_PP = 0
        for (let i = 0; i < 4; i++){
            if (def.con["move_" + i] == def.con.used){
                now_PP = def.con["last_" + i]
            }
        }
        if (move[0] == "アンコール" && (def.con.used == "" || now_PP == 0 || def.con.used == "アンコール" || def.con.p_con.includes("アンコール"))){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
        // かなしばり: 対象が技を使用していない/最後のわざがわるあがき/ダイマックスわざ/すでにかなしばり状態
        if (move[0] == "かなしばり" && (def.con.used == "" || def.con.used == "わるあがき" || def.con.p_con.includes("かなしばり"))){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
        // ものまね: 対象が技を使用していない/ものまねできない技
        if (move[0] == "ものまね"){
            if (def.con.used == "" || moveEff.mimic().includes(def.con.used)){
                cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
                return true
            }
            if (def.con.used != def.con.move_0 && def.con.used != def.con.move_1 && def.con.used != def.con.move_2 && def.con.used != def.con.move_3){
                cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
                return true
            }
        }
        // スケッチ: 対象が技を使用していない/スケッチできない技
        if (move[0] == "スケッチ" && (def.con.used == "" || def.con.used == "スケッチ" || def.con.used == "おしゃべり" || def.con.used == "わるあがき")){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
        // リサイクル：持ち物を持っている、リサイクルできる道具がない(wikiにない)
        if (move[0] == "リサイクル" && (atk.con.item != "" || atk["poke" + cfn.battleNum(atk)].recycle == "")){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
        // さいはい: さいはいできない技
        // おさきにどうぞ/さきおくり/そうでん/てだすけ: 対象がすでに行動している
        // バトンタッチ/いやしのねがい/みかづきのまい: 交代できる味方がいない
        if (def.poke0.life != "控え" && def.poke1.life != "控え" && def.poke2.life != "控え" && (move[0] == "バトンタッチ" || move[0] == "いやしのねがい" || move[0] == "みかづきのまいし")){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
        // ほえる/ふきとばし: 交代できる相手がいない
        if (def.poke0.life != "控え" && def.poke1.life != "控え" && def.poke2.life != "控え" && (move[0] == "ほえる" || move[0] == "ふきとばし")){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
        // てだすけ/サイドチェンジ/アロマミスト/てをつなぐ: 味方がいない
        // サイコシフト
            // 1.自身が状態異常でない/対象がすでに状態異常である
            if (move[0] == "サイコシフト" && (atk.con.abnormal == "" || def.con.abnormal != "")){
                cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
                return true
            }
            // 2.対象が状態異常に耐性を持っている
        // じょうか: 対象が状態異常でない
        if (move[0] == "じょうか" && def.con.abnormal == ""){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
        // みがわり
        if (move[0] == "みがわり"){
            // 1.自身がすでにみがわり状態である
            if (atk.con.p_con.includes("みがわり")){
                cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
                return true
            }
            // 2.自身に技を使う体力が残っていない
            if (atk.con.last_HP <= Math.floor(atk.con.full_HP / 4)){
                cfn.logWrite(atk, def, "しかし　みがわりを出す　体力が残っていなかった・・・" + "\n")
                return true
            }
        }
            
        // へんしん: 自身/対象がすでにへんしん状態である
        if (move[0] == "へんしん" && (atk.con.p_con.includes("へんしん") || def.con.p_con.includes("へんしん"))){
            cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
            return true
        }
        // トリック/すりかえ: どちらも道具を持っていない/どちらかの道具が交換できない
        if (move[0] == "トリック" || move[0] == "すりかえ"){
            let check = 0
            for (const team of [atk, def]){
                if ((team.con.name == "シルヴァディ" && team.con.item.includes("メモリ")) 
                || (team.con.name == "アルセウス" && team.con.item.includes("プレート")) 
                || (team.con.name.includes("ザシアン") && team.con.item　== "くちたけん") 
                || (team.con.name.includes("ザマゼンタ") && team.con.item　== "くちたたて")){
                    check += 1
                }
            }
            if (check > 0){
                cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
                return true
            }
        }
        // ふしょくガス: 溶かせない道具がある
        if (move[0] == "ふしょくガス"){
            if ((def.con.name.includes("ギラティナ") && def.con.item == "はっきんだま") 
            || (def.con.name.includes("ゲノセクト") && def.con.item.includes("カセット")) 
            || (def.con.name.includes("シルヴァディ") && def.con.item.includes("メモリ")) 
            || (def.con.name.includes("ザシアン") && def.con.item == "くちたけん") 
            || (def.con.name.includes("ザマゼンタ") && def.con.item == "くちたたて")){
                cfn.logWrite(atk, def, "しかし　うまく決まらなかった・・・" + "\n")
                return true
            }
        }
}

// 63.アロマベール: かなしばり/アンコール/ちょうはつ状態の無効化
function alomaVeilInvalidation(atk, def, move){
    if (def.con.ability == "アロマベール" && (move[0] == "かなしばり" || move[0] == "アンコール" || move[0] == "ちょうはつ")){
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "は　アロマベールに　守られている！" + "\n")
        return true
    }
}
