const moveEff = require("./move_effect")
const itemEff = require("./item_effect")
const afn = require("./function")
const bfn = require("./base_function")
const cfn = require("./law_function")
const efn = require("./ex_function")
const summon = require("./1_summon")
const com = require("./compatibility")

// 変化技の効果処理
exports.statusMoveEffect = function(atk, def, move){
    // ランク変化のみ
    rankChangeOnlyStatusMove(atk, def, move)
    // ランク変化 + その他の効果のある技
    if (rankChangeEtcStatusMove(atk, def, move)){return true}
    // 状態異常のみ
    makeAbnormalOnlyStatusMove(atk, def, move)
    // 全体の場へ効果をもたらす技
    bfn.allFieldStatus(atk, def, move)
    // 自分の場へ効果をもたらす技
    selfFieldStatusMove(atk, def, move)
    // 相手の場へ効果をもたらす技
    enemyFieldStatusMove(atk, def, move)
    // 自分の状態を変化させる技
    selfStatusMove(atk, def, move)
    // 相手の状態を変化させる技
    enemyStatusMove(atk, def, move)
    // 回復系の技
    recoverStatusMove(atk, def, move)
    // その他の技
    otherStatusMove(atk, def, move)

}

// ランク変化のみ
function rankChangeOnlyStatusMove(atk, def, move){
    const list = moveEff.rankChange()
    for (let i = 0; i < list.length; i++){
        if (move[0] == list[i][0] && list[i][1] == "s"){
            for (let j = 2; j < list[i].length; j++){
                afn.rankChange(atk, def, list[i][j][0], list[i][j][1], 100, move)
            }
        } else if (move[0] == list[i][0] && list[i][1] == "e"){
            for (let j = 2; j < list[i].length; j++){
                afn.rankChange(def, atk, list[i][j][0], list[i][j][1], 100, move)
            }
        }
    }
    bfn.whiteHerb(atk, def)
    bfn.whiteHerb(def, atk)
}

// ランク変化 + その他の効果のある技
function rankChangeEtcStatusMove(atk, def, move){
    if (move[0] == "いばる"){
        afn.rankChange(def, atk, "A", 2, 100, move)
        afn.makeAbnormal(def, atk, "こんらん", 100, move)
    } else if (move[0] == "おだてる"){
        afn.rankChange(def, atk, "C", 1, 100, move)
        afn.makeAbnormal(def, atk, "こんらん", 100, move)
    } else if (move[0] == "すてゼリフ" || move[0] == "テレポート"){
        summon.comeBack(atk, def)
        atk.con.f_con += "選択中・・・" + "\n"
        cfn.logWrite(atk, def, atk.con.TN + "　は　戦闘に出すポケモンを選んでください" + "\n")
        return true
    } else if (move[0] == "せいちょう"){
        if (atk.con.f_con.includes("にほんばれ") && atk.con.item != "ばんのうがさ" && cfn.isWeather(atk.con, def.con)){
            afn.rankChange(atk, def, "A", 2, 100, move)
            afn.rankChange(atk, def, "C", 2, 100, move)
        } else {
            afn.rankChange(atk, def, "A", 1, 100, move)
            afn.rankChange(atk, def, "C", 1, 100, move)
        }
    } else if (move[0] == "ソウルビート"){
        atk.con.last_HP -= Math.floor(atk.con.full_HP / 3)
        atk["poke" + cfn.battleNum(atk)].last_HP = atk.con.last_HP
        cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　は　体力を削って力を得た！" + "\n")
        for (const parameter of ["A", "B", "C", "D", "S"]){
            afn.rankChange(atk, def, parameter, 1, 100, move)
        }
        if (atk.con.item == "のどスプレー" && atk.con.C_rank < 6){
            afn.rankChange(atk, def, "C", 1, 100, "のどスプレー")
            cfn.setRecycle(atk)
        }
    } else if (move[0] == "たがやす"){
        if (atk.con.type.includes("くさ") && cfn.groundedCheck(atk.con)){
            afn.rankChange(atk, def, "A", 1, 100, move)
            afn.rankChange(atk, def, "C", 1, 100, move)
        }
        if (def.con.type.includes("くさ") && cfn.groundedCheck(def.con)){
            afn.rankChange(def, atk, "A", 1, 100, move)
            afn.rankChange(def, atk, "C", 1, 100, move)
        }
    } else if (move[0] == "つぼをつく"){
        const random = Math.random()
        const parameter = [["A", 0], ["B", 1/7], ["C", 2/7], ["D", 3/7], ["S", 4/7], ["X", 5/7], ["Y", 6/7]]
        let check = ""
        for (let i = 0; i < 7; i++){
            if (random > parameter[i][1]){
                check = parameter[i][0]
            }
        }
        afn.rankChange(atk, def, check, 2, 100, move)
    } else if (move[0] == "どくのいと"){
        afn.rankChange(def, atk, "S", -1, 100, move)
        afn.makeAbnormal(def, atk, "どく", 100, move)
    } else if (move[0] == "はらだいこ"){
        atk.con.last_HP -= Math.floor(atk.con.full_HP / 2)
        cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　は　体力を削ってパワー全開！" + "\n")
        atk.con.A_rank = 6
    } else if (move[0] == "バトンタッチ"){
        const p_list = atk.con.p_con.split("\n")
        const rank = atk.con.A_rank + "/" + atk.con.B_rank + "/" + atk.con.C_rank + "/" + atk.con.D_rank + "/" + atk.con.S_rank + "/" + atk.con.X_rank + "/" + atk.con.Y_rank
        summon.comeBack(atk, def)
        for (let i = 0; i < p_list.length; i++){
            if (moveEff.batton().includes(p_list[i])){
                atk.con.p_con += p_list[i] + "\n"
            }
        }
        atk.con.p_con += "バトンタッチ：" + rank + "\n"
        atk.con.f_con += "選択中・・・" + "\n"
        cfn.logWrite(atk, def, atk.con.TN + "　は　戦闘に出すポケモンを選んでください" + "\n")
        return true
    } else if (move[0] == "フラワーガード"){
        if (atk.con.type.includes("くさ")){
            afn.rankChange(atk, def, "B", 1, 100, move)
        }
        if (def.con.type.includes("くさ")){
            afn.rankChange(def, atk, "B", 1, 100, move)
        }
    } else if (move[0] == "ほおばる"){
        bfn.eatingBerry(atk, def, atk.con.item)
        afn.rankChange(atk, def, "B", 2, 100, move)

        eating_berry_effect(atk, atk.con.item)
        rank_change(atk, "B", 2)
        cfn.setRecycle(atk)
    }
    bfn.whiteHerb(atk, def)
    bfn.whiteHerb(def, atk)
}


// 状態異常のみ
function makeAbnormalOnlyStatusMove(atk, def, move){
    for (let i = 0; i < moveEff.abnormal().length; i++){
        if (move[0] == moveEff.abnormal()[i][0]){
            afn.makeAbnormal(def, atk, moveEff.abnormal()[i][1], 100, move)
        }
    }
}


// 自分の場へ効果をもたらす技
function selfFieldStatusMove(atk, def, move){
    const list = moveEff.selfField()
    for (let i = 0; i < list.length; i++){
        if (move[0] == list[i][0]){
            cfn.logWrite(atk, def, list[i][1] + "\n")
            if (list[i][2] == "おいかぜ"){
                atk.con.f_con += "おいかぜ　4/4" + "\n"
            } else if (list[i][2] == "壁"){
                if (atk.con.item == "ひかりのねんど"){
                    atk.con.f_con += move[0] + "　8/8" + "\n"
                } else {
                    atk.con.f_con += move[0] + "　5/5" + "\n"
                }
            } else {
                atk.con.f_con += move[0] + "　5/5" + "\n"
            }
        }
    }
}

// 相手の場へ効果をもたらす技
function enemyFieldStatusMove(atk, def, move){
    const list = moveEff.enemyField()
    for (let i = 0; i < list.length; i++){
        if (move[0] == list[i][0]){
            cfn.logWrite(atk, def, list[i][1] + "\n")
            let f_list = def.con.f_con.split("\n")
            if (move[0] == "どくびし"){
                if (def.con.f_con.includes("どくびし　1回目")){
                    for (let i = 0; i < f_list.length; i++){
                        if (f_list[i] == "どくびし　1回目"){
                            f_list[i] = "どくびし　2回目"
                        }
                    }
                    def.con.f_con = f_list.join("\n")
                } else {
                    def.con.f_con += "どくびし　1回目" + "\n"
                }
            } else if (move[0] == "まきびし"){
                if (def.con.f_con.includes("まきびし")){
                    for (let i = 0; i < f_list.length; i++){
                        if (f_list[i] == "まきびし　1回目"){
                            f_list[i] = "まきびし　2回目"
                        } else if (f_list[i] == "まきびし　2回目"){
                            f_list[i] = "まきびし　3回目"
                        }
                    }
                    def.con.f_con = f_list.join("\n")
                } else {
                    def.con.f_con += "まきびし　1回目" + "\n"
                }
            } else {
                def.con.f_con += move[0] + "\n"
            }
        }
    }
}

// 自分の状態を変化させる技
function selfStatusMove(atk, def, move){
    const list = moveEff.selfStatus()
    for (let i = 0; i < list.length; i++){
        if (move[0] == list[i][0]){
            if (move[0] == "たくわえる"){
                afn.rankChange(atk, def, "B", 1, 100, move)
                afn.rankChange(atk, def, "D", 1, 100, move)
                if (atk.con.p_con.includes("たくわえる　1回目")){
                    cfn.conditionRemove(atk.con, "poke", "たくわえる　1回目")
                    atk.con.p_con += "たくわえる　2回目" + "\n"
                    num = 2
                } else if (atk.con.p_con.includes("たくわえる　2回目")){
                    cfn.conditionRemove(atk.con, "poke", "たくわえる　2回目")
                    atk.con.p_con += "たくわえる　3回目" + "\n"
                    num = 3
                } else {
                    atk.con.p_con += "たくわえる　1回目" + "\n"
                    num = 1
                }
                cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　は　" + num + "つ　たくわえた" + "\n")
                return
            }

            if (move[0] == "じゅうでん"){
                afn.rankChange(atk, def, "D", 1, 100, move)
                atk.con.p_con += "じゅうでん　開始" + "\n"
            } else  if (move[0] == "はいすいのじん"){
                atk.con.p_con += "逃げられない：はいすいのじん" + "\n"
                for (const parameter of ["A", "B", "C", "D", "S"]){
                    afn.rankChange(atk, def, parameter, 1, 100, move)
                }
            } else if (move[0] == "まるくなる"){
                afn.rankChange(atk, def, "B", 1, 100, move)
                if (!atk.con.p_con.includes("まるくなる")){
                    atk.con.p_con += "まるくなる" + "\n"
                }
            } else if (move[0] == "パワートリック"){
                const Aval = atk.con.A_AV
                const Bval = atk.con.B_AV
                atk.con.A_AV = Bval
                atk.con.B_AV = Aval
                if (atk.con.p_con.includes("パワートリック")){
                    cfn.logWrite(atk, def, "自分の攻撃と防御を　元に戻した！" + "\n")
                    cfn.conditionRemove(atk.con, "poke", "パワートリック")
                } else {
                    cfn.logWrite(atk, def, "自分の攻撃と防御を　入れ替えた！" + "\n")
                    atk.con.p_con += "パワートリック" + "\n"
                }
            } else if (move[0] == "みがわり"){
                // バインド状態の解除
                cfn.conditionRemove(atk.con, "poke", "バインド")
                // 身代わりの発生
                atk.con.last_HP -= Math.floor(atk.con.full_HP / 4)
                atk["poke" + cfn.battleNum(atk)].last_HP -= Math.floor(atk.con.full_HP / 4)
                atk.con.p_con += "みがわり：" + Math.floor(atk.con.full_HP / 4) + "/" + Math.floor(atk.con.full_HP / 4) + "\n"
            } else if (move[0] == "ボディパージ"){
                afn.rankChange(atk, def, "S", 2, 100, move)
                if (atk.con.p_con.includes("ボディパージ")){
                    let p_list = atk.con.p_con.split("\n")
                    for (let i = 0; i < p_list.length; i++){
                        if (p_list[i].includes("ボディパージ")){
                            p_list[i] = "ボディパージ　" + (Number(p_list[i].replace(/[^0-9]/g, "")) + 1) + "回目" + "\n"
                        }
                    }
                    atk.con.p_con = p_list.join("\n")
                } else {
                    atk.con.p_con += "ボディパージ　1回目" + "\n"
                }
            } else {
                if (!atk.con.p_con.includes(move[0])){
                    atk.con.p_con += list[i][1] + "\n"
                }
            }
            cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　は　" + list[i][2] + "\n")
        }
    }
}

// 相手の状態を変化させる技
function enemyStatusMove(atk, def, move){
    const list = moveEff.enemyStatus()
    for (let i = 0; i < list.length; i++){
        if (move[0] == list[i][0]){
            if (move[0] == "タールショット"){
                afn.rankChange(def, atk, "S", -1, 100, move)
            } 
            if (move[0] == "のろい" && !atk.con.type.includes("ゴースト")){
                afn.rankChange(atk, def, "A", 1, 100, move)
                afn.rankChange(atk, def, "B", 1, 100, move)
                afn.rankChange(atk, def, "S", -1, 100, move)
                bfn.whiteHerb(atk, def)
            } else if (move[0] == "アンコール"){
                def.con.p_con += "アンコール　3/3：" + def.con.used + "\n"
            } else if (move[0] == "いえき"){
                if (def.con.ability != ""){
                    def.con.p_con += "特性なし：" + def.con.ability + "\n"
                    def.con.ability = ""
                } else {
                    for (let i = 0; i < def.con.p_con.split("\n").length - 1; i++){
                        if (def.con.p_con.split("\n")[i].includes("かがくへんかガス")){
                            def.con.p_con += "特性なし：" + def.con.p_con.split("\n")[i].slice(9) + "\n"
                        }
                    }
                }
            } else if (move[0] == "かなしばり"){
                def.con.p_con += "かなしばり　4/4：" + def.con.used + "\n"
            } else if (move[0] == "たこがため"){
                def.con.p_con += "たこがため" + "\n"
                def.con.p_con += "逃げられない" + "\n"
            } else if (move[0] == "のろい"){
                def.con.p_con += "呪い" + "\n"
                atk.con.last_HP -= Math.floor(atk.con.full_HP / 2)
                atk["poke" + cfn.battleNum(atk)].last_HP -= Math.floor(atk.con.full_HP / 2)
            } else {
                def.con.p_con += list[i][1] + "\n"
            }
            cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　は　" + list[i][2] + "\n")

            if (def.con.item == "メンタルハーブ" && (def.con.p_con.includes("アンコール") || def.con.p_con.includes("いちゃもん") || def.con.p_con.includes("かいふくふうじ") || def.con.p_con.includes("かなしばり") || def.con.p_con.includes("ちょうはつ") || def.con.p_con.includes("メロメロ"))){
                cfn.conditionRemove(def.con, "poke", "アンコール")
                cfn.conditionRemove(def.con, "poke", "いちゃもん")
                cfn.conditionRemove(def.con, "poke", "かいふくふうじ")
                cfn.conditionRemove(def.con, "poke", "かなしばり")
                cfn.conditionRemove(def.con, "poke", "ちょうはつ")
                cfn.conditionRemove(def.con, "poke", "メロメロ")
                cfn.setRecycle(def)
                cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　の　メンタルハーブが発動した" + "\n")
            }
            if (move[0] == "メロメロ" && def.con.item == "あかいいと" && !atk.con.p_con.includes("メロメロ")){
                cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　の　あかいいとが発動した" + "\n")
                atk.con.p_con += "メロメロ" + "\n"
                cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　は　メロメロになった" + "\n")
                if (atk.con.item == "メンタルハーブ"){
                    cfn.conditionRemove(atk.con, "poke", "メロメロ")
                    cfn.setRecycle(atk)
                    cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　の　メンタルハーブが発動した" + "\n")
                }
            }
        }
    }
}

// 回復系の技
function recoverStatusMove(atk, def, move){
    if (moveEff.recover().includes(move[0])){
        if (move[0] == "かいふくしれい" || move[0] == "じこさいせい" || move[0] == "タマゴうみ" || move[0] == "なまける" || move[0] == "はねやすめ" || move[0] == "ミルクのみ"){
            afn.HPchangeMagic(atk, def, Math.ceil(atk.con.full_HP / 2), "+", move)
            if (move[0] == "はねやすめ" && atk.con.type.includes("ひこう")){
                atk.con.p_con += "はねやすめ：" + atk.con.type + "\n"
                atk.con.type = atk.con.type.replace("ひこう", "")
                if (atk.con.type == ""){
                    atk.con.type = "ノーマル"
                }
            }
        } else if (move[0] == "あさのひざし" || move[0] == "こうごうせい" || move[0] == "つきのひかり"){
            if (atk.con.f_con.includes("にほんばれ") && atk.con.item != "ばんのうがさ" && cfn.isWeather(atk.con, def.con)){
                afn.HPchangeMagic(atk, def, cfn.fiveCut(atk.con.full_HP * 2732 / 4096), "+", move)
            } else if ((atk.con.f_con.includes("あめ") && atk.con.item != "ばんのうがさ") || atk.con.f_con.includes("すなあらし") || atk.con.f_con.includes("あられ") && cfn.isWeather(atk.con, def.con)){
                afn.HPchangeMagic(atk, def, cfn.fiveCut(atk.con.full_HP / 4), "+", move)
            } else {
                afn.HPchangeMagic(atk, def, cfn.fiveCut(atk.con.full_HP / 2), "+", move)
            }
        } else if (move[0] == "すなあつめ"){
            if (atk.con.f_con.includes("すなあらし") && cfn.isWeather(atk.con, def.con)){
                afn.HPchangeMagic(atk, def, cfn.fiveCut(atk.con.full_HP * 2732 / 4096), "+", move)
            } else {
                afn.HPchangeMagic(atk, def, cfn.fiveCut(atk.con.full_HP / 2), "+", move)
            }
        } else if (move[0] == "フラワーヒール"){
            if (atk.con.f_con.includes("グラスフィールド")){
                afn.HPchangeMagic(def, atk, cfn.fiveCut(atk.con.full_HP * 2732 / 4096), "+", move)
            } else {
                afn.HPchangeMagic(def, atk, cfn.fiveCut(atk.con.full_HP / 2), "+", move)
            }
        } else if (move[0] == "じょうか"){
            cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　は　" + def.con.abnormal + "が　なおった！" + "\n")
            def.con.abnormal = ""
            afn.HPchangeMagic(atk, def, cfn.fiveCut(atk.con.full_HP / 2), "+", move)
        } else if (move[0] == "ちからをすいとる"){
            let recover = 0
            if (def.con.A_rank > 0){
                recover = Math.floor(def.con.A_AV * (def.con.A_rank + 2) / 2)
            } else {
                recover = Math.floor(def.con.A_AV * 2 / (2 - def.con.A_rank))
            }
            if (def.con.ability == "ミラーアーマー"){
                cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　の　ミラーアーマーが　発動した！" + "\n")
                afn.rankChange(atk, def, "A", -1, 100, move)
                bfn.whiteHerb(atk, def)
            } else {
                afn.rankChange(def, atk, "A", -1, 100, move)
                bfn.whiteHerb(def, atk)
            }
            if (def.con.ability == "ヘドロえき"){
                afn.HPchangeMagic(atk, def, recover, "-", move)
            } else {
                afn.HPchangeMagic(atk, def, recover, "+", move)
            }
        } else if (move[0] == "のみこむ"){
            let recover = atk.con.full_HP
            let num = 0
            if (atk.con.p_con.includes("たくわえる　1回目")){
                recover = cfn.fiveCut(recover / 4)
                num = -1
            } else if (atk.con.p_con.includes("たくわえる　2回目")){
                recover = cfn.fiveCut(recover / 2)
                num = -2
            } else if (atk.con.p_con.includes("たくわえる　3回目")){
                recover = cfn.fiveCut(recover)
                num = -3
            }
            afn.HPchangeMagic(atk, def, recover, "+", move)
            afn.rankChange(atk, def, "B", num, 100, move)
            afn.rankChange(atk, def, "D", num, 100, move)
            cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　は　たくわえが　なくなった！" + "\n")
            cfn.conditionRemove(atk.con, "poke", "たくわえる")
        } else if (move[0] == "ねむる"){
            atk.con.abnormal = "ねむり"
            atk.con.p_con += "ねむる　2/2" + "\n"
            afn.HPchangeMagic(atk, def, atk.con.full_HP, "+", move)
            cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　は　眠って元気になった！" + "\n")
        } else if (move[0] == "ねがいごと"){
            atk.con.f_con += "ねがいごと　" + Math.floor(atk.con.full_HP / 2) + "回復：ねがいごと宣言ターン" + "\n"
            cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　は　願い事をした！" + "\n")
        } else if (move[0] == "いやしのすず"){
            cfn.logWrite(atk, def, "鈴の音が響き渡った！" + "\n")
            for (let i = 0; i < 3; i++){
                if (atk["poke" + i].abnormal == "やけど" || atk["poke" + i].abnormal.includes("どく") || atk["poke" + i].abnormal == "まひ"){
                    atk["poke" + i].abnormal = ""
                }
            }
            if (atk.con.abnormal == "やけど" || atk.con.abnormal.includes("どく") || atk.con.abnormal == "まひ"){
                atk.con.abnormal = ""
            }
        } else if (move[0] == "アロマセラピー" || move[0] == "リフレッシュ"){
            cfn.logWrite(atk, def, "心地よい香りが広がった！" + "\n")
            for (let i = 0; i < 3; i++){
                atk["poke" + i].abnormal = ""
            }
            atk.con.abnormal = ""
        } else if (move[0] == "いやしのねがい"){
            atk.con.f_con += "いやしのねがい" + "\n"
            atk.con.last_HP = 0
            summon.comeBack(atk, def)
        } else if (move[0] == "みかづきのまい"){
            atk.con.f_con += "みかづきのまい" + "\n"
            atk.con.last_HP = 0
            summon.comeBack(atk, def)
        } else if (move[0] == "いのちのしずく"){
            afn.HPchangeMagic(atk, def, Math.round(atk.con.full_HP / 4), "+", move)
        } else if (move[0] == "いやしのはどう"){
            if (atk.con.ability == "メガランチャー"){
                afn.HPchangeMagic(def, atk, Math.ceil(def.con.full_HP * 3 / 4), "+", move)
            } else {
                afn.HPchangeMagic(def, atk, Math.ceil(def.con.full_HP / 2), "+", move)
            }
        } else if (move[0] == "ジャングルヒール"){
            if (atk.con.last_HP < atk.con.full_HP){
                afn.HPchangeMagic(atk, def, Math.floor(atk.con.full_HP / 4), "+", move)
            }
            if (atk.con.abnormal != ""){
                atk.con.abnormal = ""
                cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　は　" + atk.con.abnormal + "が　治った！" + "\n")
            }
        }
    }
}

// その他の技
function otherStatusMove(atk, def, move){
    if (move[0] == "いたみわけ"){
        cfn.logWrite(atk, def, "お互いのHPを　分け合った！" + "\n")
        const atk_HP = atk.con.last_HP
        const def_HP = def.con.last_HP
        atk.con.last_HP = Math.min(Math.floor((atk_HP + def_HP) / 2), atk.con.full_HP)
        def.con.last_HP = Math.min(Math.floor((atk_HP + def_HP) / 2), def.con.full_HP)
    } else if (move[0] == "うらみ") {
        for (let i = 0; i < 4; i++){
            if (def.con.used == def.con["move_" + i]){
                def.con["last_" + i]= Math.max(def.con["last_" + i] - 4, 0)
                cfn.logWrite(atk, def, "最後に使った技の　PPを減らした！" + "\n")
            }
        }
    } else if (move[0] == "おいわい"){
        cfn.logWrite(atk, def, "おめでとう！" + atk.con.TN + "！" + "\n")
    } else if (move[0] == "おきみやげ"){
        atk.con.last_HP = 0
        summon.comeBack(atk, def)
    } else if (move[0] == "おちゃかい"){
        for (const team of [[atk, def], [def, atk]]){
            if (itemEff.berryList().includes(team[0].con.item)){
                bfn.eatingBerry(team[0], team[1], team[0].con.item)
                cfn.setRecycle(team[0])
                cfn.setBelch(team[0])
                if (team[0].con.ability == "かるわざ"){
                    team[0].con.p_con += "かるわざ" + "\n"
                }
            }
        }
    } else if (move[0] == "ガードシェア"){
        cfn.logWrite(atk, def, "お互いの　防御と　特防を　共有した！" + "\n")
        const atk_B = atk.con.B_AV
        const atk_D = atk.con.D_AV
        const def_B = def.con.B_AV
        const def_D = def.con.D_AV
        atk.con.B_AV = Math.floor((atk_B + def_B) / 2)
        def.con.B_AV = Math.floor((atk_B + def_B) / 2)
        atk.con.D_AV = Math.floor((atk_D + def_D) / 2)
        def.con.D_AV = Math.floor((atk_D + def_D) / 2)
    } else if (move[0] == "ガードスワップ"){
        cfn.logWrite(atk, def, "お互いの　防御ランクと　特防ランクを　入れ替えた！" + "\n")
        const atk_B = atk.con.B_rank
        const atk_D = atk.con.D_rank
        const def_B = def.con.B_rank
        const def_D = def.con.D_rank
        atk.con.B_rank = def_B
        atk.con.D_rank = def_D
        def.con.B_rank = atk_B
        def.con.D_rank = atk_D
    } else if (move[0] == "きりばらい"){
        if (!def.con.p_con.includes("みがわり") || atk.con.ability == "すりぬけ"){
            if (def.con.ability == "ミラーアーマー"){
                cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　の　ミラーアーマーが　発動した！" + "\n")
                afn.rankChange(atk, def, "Y", -1, 100, move)
                bfn.whiteHerb(atk, def)
            } else {
                afn.rankChange(def, atk, "Y", -1, 100, move)
                bfn.whiteHerb(def, atk)
            }
        }
        for (const team of [[atk.con, def.con], [def.con, atk.con]]){
            cfn.conditionRemove(team[0], "field", "しろいきり")
            cfn.conditionRemove(team[0], "field", "ひかりのかべ")
            cfn.conditionRemove(team[0], "field", "リフレクター")
            cfn.conditionRemove(team[0], "field", "しんぴのまもり")
            cfn.conditionRemove(team[0], "field", "オーロラベール")
            cfn.conditionRemove(team[0], "field", "まきびし")
            cfn.conditionRemove(team[0], "field", "どくびし")
            cfn.conditionRemove(team[0], "field", "ステルスロック")
            cfn.conditionRemove(team[0], "field", "ねばねばネット")
            cfn.conditionRemove(team[0], "field", "キョダイコウジン")
            cfn.conditionRemove(team[0], "field", "フィールド")
        }
        cfn.logWrite(atk, def, "周りのものを消し去った")
    } else if (move[0] == "ギフトパス"){
        cfn.logWrite(atk, def, "持ち物を　プレゼントした" + "\n")
        def.con.item = atk.con.item
        atk.con.item = ""
    } else if (move[0] == "くろいきり"){
        cfn.logWrite(atk, def, "くろいきりに　包まれた" + "\n")
        for (const team of [atk, def]){
            for (const parameter of ["A", "B", "C", "D", "S", "X", "Y"]){
                team.con[parameter + "_rank"] = 0
            }
        }
    } else if (move[0] == "コートチェンジ"){
        const list = moveEff.courtChange()
        let atk_list = []
        let def_list = []
        const atk_f = atk.con.p_con.split("\n")
        const def_f = def.con.p_con.split("\n")
        atk.con.f_con = ""
        def.con.f_con = ""
        for (let i = 0; i < atk_f.length - 1; i++){
            let check = 0
            for (let j = 0; j < list.length; j++){
                if (atk_f[i].includes(list[j])){
                    atk_list.push(atk_f[i])
                    check += 1
                }
            }
            if (check == 0){
                atk.con.f_con += atk_f[i] + "\n"
            }
        }
        for (let i = 0; i < def_f.length - 1; i++){
            let check = 0
            for (let j = 0; j < list.length; j++){
                if (def_f[i].includes(list[j])){
                    def_list.push(def_f[i])
                    check += 1
                }
            }
            if (check == 0){
                def.con.f_con += def_f[i] + "\n"
            }
        }
        for (let i = 0; i < def_list.length; i++){
            atk.con.f_con += def_list[i] + "\n"
        }
        for (let i = 0; i < atk_list.length; i++){
            def.con.f_con += atk_list[i] + "\n"
        }
    } else if (move[0] == "サイコシフト"){
        cfn.logWrite(atk, def, atk.con.abnormal + "を　移した" + "\n")
        def.con.abnormal = atk.con.abnormal
        atk.con.abnormal = ""
    } else if (move[0] == "さしおさえ"){
        def.con.p_con += "さしおさえ　5/5：" + def.con.item + "\n"
        def.con.item = ""
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　は　道具を差し押さえられた" + "\n")
    } else if (move[0] == "シンプルビーム"){
        afn.changeAbility(def, atk, 3, "たんじゅん")
    } else if (move[0] == "じこあんじ"){
        for (const parameter of ["A", "B", "C", "D", "S", "X", "Y"]){
            atk.con[parameter + "_rank"] = def.con[parameter + "_rank"]
        }
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　の　能力変化を　コピーした" + "\n")
    } else if (move[0] == "スキルスワップ"){
        afn.changeAbility(atk, def, 2, "NA")
    } else if (move[0] == "スケッチ"){
        atk.con["move_" + atk.data.command] = cfn.moveSearchByName(def.con.used)[0]
        atk.con["PP_" + atk.data.command] = cfn.moveSearchByName(def.con.used)[5]
        atk.con["last_" + atk.data.command] = cfn.moveSearchByName(def.con.used)[5]
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　の　" + def.con.used + "　を　スケッチした" + "\n")
    } else if (move[0] == "スピードスワップ"){
        const atk_S = atk.con.S_AV
        atk.con.S_AV = def.con.S_AV
        def.con.S_AV = atk_S
        cfn.logWrite(atk, def, "お互いの　素早さを入れ替えた！" + "\n")
    } else if (move[0] == "すりかえ" || move[0] == "トリック"){
        const atk_item = atk.con.item
        atk.con.item = def.con.item
        def.con.item = atk_item
        cfn.logWrite(atk, def, "お互いの　持ち物を入れ替えた！" + "\n")
        if (atk.con.ability == "かるわざ" && atk.con.item == ""){
            atk.con.p_con += "かるわざ" + "\n"
        }
        if (def.con.ability == "かるわざ" && def.con.item == ""){
            def.con.p_con += "かるわざ" + "\n"
        }
    } else if (move[0] == "テクスチャー"){
        let move_0_type = cfn.moveSearchByName(atk.con.move_0)[1]
        if (atk.con.move_0 == "のろい" && !atk.con.type.includes("ゴースト")){
            move_0_type = "ノーマル"
        }
        atk.con.type = move_0_type
        cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　は　" + move_0_type + "タイプに　なった！" + "\n")
    } else if (move[0] == "テクスチャー2"){
        const move_type = cfn.moveSearchByName(def.con.used)[1]
        const list = com.compatibility()
        let check = []
        for (let i = 0; i < 18; i++){
            if (list[0][i] == move_type){
                for (let j = 0; j < 18; j++){
                    if (list[i+1][j] < 1){
                        check.push(list[0][j])
                    }
                }
            }
        }
        let change_type = ""
        const random = Math.random()
        for (let i = 0; i < check.length; i++){
            if (random >= i / check.length){
                change_type = check[i]
            }
        }
        atk.con.type = change_type
        cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　は　" + change_type + "タイプに　なった！" + "\n")
    } else if (move[0] == "てをつなぐ"){
        cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　と　" + def.con.TN + "　の　" + def.con.name + "　は　手を繋いだ！" + "\n")
    } else if (move[0] == "なかまづくり"){
        afn.changeAbility(atk, def, 1, "NA")
    } else if (move[0] == "なやみのタネ"){
        afn.changeAbility(def, atk, 3, "ふみん")
    } else if (move[0] == "なりきり"){
        afn.changeAbility(def, atk, 1, "NA")
    } else if (move[0] == "ハートスワップ"){
        for (const parameter of ["A", "B", "C", "D", "S", "X", "Y"]){
            let atk_rank = atk.con[parameter + "_rank"]
            atk.con[parameter + "_rank"] = def.con[parameter + "_rank"]
            def.con[parameter + "_rank"] = atk_rank
        }
        cfn.logWrite(atk, def, "お互いの　能力変化を入れ替えた！" + "\n")
    } else if (move[0] == "ハッピータイム"){
        cfn.logWrite(atk, def, "あたりが幸せに包まれた！" + "\n")
    } else if (move[0] == "ハロウィン"){
        const type = def.con.type
        if (type == ""){
            def.con.type = "ゴースト"
        } else {
            def.con.type = type + "、ゴースト"
        }
        def.con.p_con += "ハロウィン" + "\n"
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　の　タイプにゴーストが追加された！" + "\n")
    } else if (move[0] == "パワーシェア"){
        const A_A = atk.con.A_AV
        const B_A = def.con.A_AV
        const A_C = atk.con.C_AV
        const B_C = def.con.C_AV
        atk.con.A_AV = Math.floor((A_A + B_A) / 2)
        def.con.A_AV = Math.floor((A_A + B_A) / 2)
        atk.con.C_AV = Math.floor((A_C + B_C) / 2)
        def.con.C_AV = Math.floor((A_C + B_C) / 2)
        cfn.logWrite(atk, def, "お互いの　攻撃と特攻を分け合った！" + "\n")
    } else if (move[0] == "パワースワップ"){
        const A_A = atk.con.A_rank
        const B_A = def.con.A_rank
        const A_C = atk.con.C_rank
        const B_C = def.con.C_rank
        atk.con.A_rank = B_A
        def.con.A_rank = A_A
        atk.con.C_rank = B_C
        def.con.C_rank = A_C
        cfn.logWrite(atk, def, "お互いの　攻撃ランクを特攻ランクを入れ替えた！" + "\n")
    } else if (move[0] == "ひっくりかえす"){
        for (const parameter of ["A", "B", "C", "D", "S", "X", "Y"]){
            def.con[parameter + "_rank"] = -def.con[parameter + "_rank"]
        }
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　の　能力ランクをひっくり返した！" + "\n")
    } else if (move[0] == "ふしょくガス"){
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　の　" + def.con.item +  "を溶かした！" + "\n")
        def.con.item = ""
    } else if (move[0] == "ほごしょく"){
        if (atk.con.f_con.includes("グラスフィールド")){
            atk.con.type = "くさ"
            cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "の　タイプが　くさになった！" + "\n")
        } else if (atk.con.f_con.includes("エレキフィールド")){
            atk.con.type = "でんき"
            cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "の　タイプが　でんきになった！" + "\n")
        } else if (atk.con.f_con.includes("ミストフィールド")){
            atk.con.type = "フェアリー"
            cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "の　タイプが　フェアリーになった！" + "\n")
        } else if (atk.con.f_con.includes("サイコフィールド")){
            atk.con.type = "エスパー"
            cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "の　タイプが　エスパーになった！" + "\n")
        } else {
            atk.con.type = "ノーマル"
            cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "の　タイプが　ノーマルになった！" + "\n")
        }
    } else if (move[0] == "ふきとばし" || move[0] == "ほえる"){
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + " は　手持ちに戻された！" + "\n")
        let hand = []
        for (let i = 0; i < 3; i++){
            if (def["poke" + i].life == "控え"){
                hand.push(i)
            }
        }
        summon.comeBack(def, atk)
        let battle = hand[0]
        if (hand.length == 2 && Math.random() < 0.5){
            battle = hand[1]
        }
        def.data.command = battle + 4
        summon.pokeReplace(def, atk)
        summon.onField(def, atk, 1)
        def.data.command = ""
    } else if (move[0] == "へんしん" && !def.con.p_con.includes("みがわり") && !def.con.p_con.includes("へんしん") && !def.con.p_con.includes("イリュージョン")){
        afn.metamon(atk, def)
    } else if (move[0] == "ほろびのうた"){
        if (!atk.con.p_con.includes("ほろびカウント")){
            atk.con.p_con += "ほろびカウント　4" + "\n"
        }
        if (!def.con.p_con.includes("ほろびカウント")){
            def.con.p_con += "ほろびカウント　4" + "\n"
        }
        cfn.logWrite(atk, def, "ほろびのうたが響き渡った！" + "\n")
    } else if (move[0] == "まほうのこな"){
        def.con.type = "エスパー"
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　は　エスパータイプになった！" + "\n")
    } else if (move[0] == "みずびたし"){
        def.con.type = "みず"
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　は　みずタイプになった！" + "\n")
    } else if (move[0] == "ミラータイプ"){
        atk.con.type = def.con.type
        cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　の　タイプが変わった！" + "\n")
    } else if (move[0] == "ものまね") {
        atk.con["move_" + atk.data.command] = def.con.used
        atk.con["PP_" + atk.data.command] = cfn.moveSearchByName(def.con.used)[5]
        atk.con["last_" + atk.data.command] = cfn.moveSearchByName(def.con.used)[5]
        txt = def.con.TN + "　の　" + def.con.name + "の　" + def.con.used +"を　コピーした" + "\n"
        document.battle_log.battle_log.value += txt
    } else if (move[0] == "もりののろい"){
        const type = def.con.type
        if (type == ""){
            def.con.type = "くさ"
        } else {
            def.con.type = type + "、くさ"
        }
        def.con.p_con += "もりののろい" + "\n"
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　の　タイプにくさが追加された！" + "\n")
    } else if (move[0] == "リサイクル"){
        atk.con.item = atk["poke" + cfn.battleNum(atk)].recycle
        atk["poke" + cfn.battleNum(atk)].recycle = ""
        cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　は　" + atk.con.item + "を　拾ってきた" + "\n")
        bfn.berryPinch(atk, def)
        bfn.berryAbnormal(atk, def)
    }
}

