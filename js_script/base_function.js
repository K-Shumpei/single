// jsファイルの読み込み
const afn = require("./function")
const cfn = require("./law_function")
const efn = require("./ex_function")
const moveEff = require("./move_effect")
const summon = require("./1_summon")
const itemEff = require("./item_effect")


exports.berryPinch = function(team, enemy){
    let con = team.con
    const TN = team.con.TN

    if (enemy.con.ability == "きんちょうかん" || enemy.con.ability == "じんばいったい"){
        return
    }
    let berry_check = 0
    if (con.last_HP > 0 && con.last_HP <= con.full_HP / 2){
        if (con.item == "きのみジュース"){
            afn.HPchangeMagic(team, enemy, 20, "+", con.item)
            berry_check += 2
        } else if (con.item == "オレンのみ"){
            berry_check += 1
            if (con.ability == "じゅくせい"){
                afn.HPchangeMagic(team, enemy, 20, "+", con.item)
            } else {
                afn.HPchangeMagic(team, enemy, 10, "+", con.item)
            }
        } else if (con.item == "オボンのみ"){
            berry_check += 1
            if (con.ability == "じゅくせい"){
                afn.HPchangeMagic(team, enemy, Math.floor(con.full_HP / 2), "+", con.item)
            } else {
                afn.HPchangeMagic(team, enemy, Math.floor(con.full_HP / 4), "+", con.item)
            }
        }
    }
    if (con.last_HP > 0){
        let HP_border = con.full_HP / 4
        if (con.ability == "くいしんぼう"){
            HP_border = con.full_HP / 2
        }
        if (con.last_HP <= HP_border){
            if (con.item == "フィラのみ" || con.item == "ウイのみ" || con.item == "マゴのみ" || con.item == "バンジのみ" || con.item == "イアのみ"){
                berry_check += 1
                if (con.ability == "じゅくせい"){
                    afn.HPchangeMagic(team, enemy, Math.floor(con.full_HP * 2 / 3), "+", con.item)
                } else {
                    afn.HPchangeMagic(team, enemy, Math.floor(con.full_HP / 3), "+", con.item)
                }
                if ((con.item== "フィラのみ" && (con.nature == "ずぶとい" || con.nature == "ひかえめ" || con.nature == "おだやか" || con.nature == "おくびょう")) 
                || (con.item == "イアのみ" && (con.nature == "さみしがり" || con.nature == "おっとり" || con.nature == "おとなしい" || con.nature == "せっかち")) 
                || (con.item == "ウイのみ" && (con.nature == "いじっぱり" || con.nature == "わんぱく" || con.nature == "しんちょう" || con.nature == "ようき")) 
                || (con.item == "バンジのみ" && (con.nature == "やんちゃ" || con.nature == "のうてんき" || con.nature == "うっかりや" || con.nature == "むじゃき")) 
                || (con.item == "マゴのみ" && (con.nature == "ゆうかん" || con.nature == "のんき" || con.nature == "れいせい" || con.nature == "なまいき"))){
                    if (!con.p_con.includes("こんらん")){
                        afn.makeAbnormal(team, enemy, "こんらん", 100, con.item)
                    }
                }
            } else if (con.item == "チイラのみ"){
                berry_check += 1
                if (con.ability == "じゅくせい"){
                    afn.rankChange(team, enemy, "A", 2, 100, con.item, false)
                } else {
                    afn.rankChange(team, enemy, "A", 1, 100, con.item, false)
                }
            } else if (con.item == "リュガのみ"){
                berry_check += 1
                if (con.ability == "じゅくせい"){
                    afn.rankChange(team, enemy, "B", 2, 100, con.item, false)
                } else {
                    afn.rankChange(team, enemy, "B", 1, 100, con.item, false)
                }
            } else if (con.item == "ヤタピのみ"){
                berry_check += 1
                if (con.ability == "じゅくせい"){
                    afn.rankChange(team, enemy, "C", 2, 100, con.item, false)
                } else {
                    afn.rankChange(team, enemy, "C", 1, 100, con.item, false)
                }
            } else if (con.item == "ズアのみ"){
                berry_check += 1
                if (con.ability == "じゅくせい"){
                    afn.rankChange(team, enemy, "D", 2, 100, con.item, false)
                } else {
                    afn.rankChange(team, enemy, "D", 1, 100, con.item, false)
                }
            } else if (con.item == "カムラのみ"){
                berry_check += 1
                if (con.ability == "じゅくせい"){
                    afn.rankChange(team, enemy, "S", 2, 100, con.item, false)
                } else {
                    afn.rankChange(team, enemy, "S", 1, 100, con.item, false)
                }
            } else if (con.item == "サンのみ" && !con.p_con.includes("きゅうしょアップ")){
                berry_check += 1
                con.p_con += "きゅうしょアップ" + "\n"
                cfn.logWrite(team, enemy, TN + "　の　" + con.name + "は　サンのみを食べて　張り切り出した！" + "\n")
            } else if (con.item == "スターのみ"){
                berry_check += 1
                const random = Math.random()
                let parameter = ""
                const convert = [[0, "A"], [0.2, "B"], [0.4, "C"], [0.6, "D"], [0.8, "S"]]
                for (let i = 0; i < 5; i++){
                    if (random > convert[i][0]){
                        parameter = convert[i][1]
                    }
                }
                if (con.ability == "じゅくせい"){
                    afn.rankChange(team, enemy, parameter, 4, 100, con.item, false)
                } else {
                    afn.rankChange(team, enemy, parameter, 2, 100, con.item, false)
                }
            } else if (con.item == "ミクルのみ"){
                berry_check += 1
                con.p_con += "ミクルのみ" + "\n"
                cfn.logWrite(team, enemy, TN + "　の　" + con.name + "は　ミクルのみを食べて　命中率が上がった！" + "\n")
            }
        }
    }

    if (berry_check == 1){
        cfn.setBelch(team)
        cfn.setRecycle(team)
        if (con.ability == "ほおぶくろ"){
            afn.HPchangeMagic(team, enemy, Math.floor(con.full_HP / 3), "+", "ほおぶくろ")
        }
    } else if (berry_check == 2){
        cfn.setRecycle(team)
    }
}


exports.berryAbnormal = function(team, enemy){
    let con = team.con
    if (enemy.con.ability != "きんちょうかん"){
        if ((con.abnormal == "やけど" && con.item == "チーゴのみ") 
        || (con.abnormal.includes("どく") && con.item == "モモンのみ") 
        || (con.abnormal == "まひ" && con.item == "クラボのみ") 
        || (con.abnormal == "ねむり" && con.item == "カゴのみ") 
        || (con.abnormal == "こおり" && con.item == "ナナシのみ") 
        || (con.p_con == "こんらん" && con.item == "キーのみ") 
        || ((con.abnormal != "" || con.p_con == "こんらん") && con.item == "ラムのみ")){
            if (con.abnormal.includes("どく")){
                cfn.conditionRemove(con, enemy.con, "もうどく")
            }
            if (con.item == "キーのみ"){
                cfn.conditionRemove(con, "poke", "こんらん")
            } else {
                con.abnormal = ""
                if (con.item == "モモンのみ"){
                    cfn.conditionRemove(con, "poke", "もうどく")
                } else if (con.item == "カゴのみ"){
                    cfn.conditionRemove(con, "poke", "ねむり")
                    cfn.conditionRemove(con, "poke", "ねむる")
                } else if (con.item == "ラムのみ"){
                    cfn.conditionRemove(con, "poke", "こんらん")
                    cfn.conditionRemove(con, "poke", "ねむり")
                    cfn.conditionRemove(con, "poke", "ねむる")
                }
            }
            cfn.logWrite(team, enemy, team.con.TN + "　の　" + con.name + "　は　" + con.item + "を　食べて状態異常が治った！" + "\n")
            cfn.setRecycle(team)
            cfn.setBelch(team)
            if (con.ability == "ほおぶくろ"){
                fn.HPchangeMagic(team, enemy, Math.floor(con.full_HP / 3), "+", "ほおぶくろ")
            }
        }
    }
}




// 全体の場へ効果をもたらす技
exports.allFieldStatus = function(atk, def, move){
    const list = moveEff.allField()
    for (let i = 0; i < list.length; i++){
        if (move[0] == list[i][0]){
            cfn.logWrite(atk, def, list[i][2] + "\n")
            if (list[i][3] == "天候"){
                for (const con of [atk.con, def.con]){
                    let turn = 5
                    if ((move[0] == "にほんばれ" && con.item == "あついいわ") 
                    || (move[0] == "あめふらし" && con.item == "しめったいわ") 
                    || (move[0] == "すなおこし" && con.item == "さらさらいわ") 
                    || (move[0] == "あられ" && con.item == "つめたいいわ")){
                        turn = 8
                    }
                    cfn.conditionRemove(con, "field", "にほんばれ")
                    cfn.conditionRemove(con, "field", "あめ")
                    cfn.conditionRemove(con, "field", "すなあらし")
                    cfn.conditionRemove(con, "field", "あられ")
                    con.f_con += list[i][1] + "　" + turn + "/" + turn + "\n"
                }
                efn.weatherAbility(atk, def)
                efn.weatherAbility(def, atk)
            } else if (list[i][3] == "フィールド"){
                for (const team of [atk.con, def.con]){
                    cfn.conditionRemove(team, "field", "フィールド")
                    let turn = 5
                    if (atk.con.item == "グランドコート"){
                        turn = 8
                    }
                    team.f_con += list[i][1] + "　" + turn + "/" + turn + "\n"
                }
                for (const team of [[atk, def], [def, atk]]){
                    if ((move[0] == "エレキフィールド" && team[0].con.item == "エレキシード") || (move[0] == "グラスフィールド" && team[0].con.item == "グラスシード")){
                        afn.rankChange(team[0], team[1], "B", 1, 100, team[0].con.item, false)
                        set_recycle_item(team[0])
                    } else if ((move[0] == "サイコフィールド" && team[0].con.item == "サイコシード") || (move[0] == "ミストフィールド" && team[0].con.item == "ミストシード")){
                        afn.rankChange(team[0], team[1], "D", 1, 100, team[0].con.item, false)
                        cfn.setRecycle(team[0])
                    }
                }
                for (const con of [atk.con, def.con]){
                    if (con.ability == "ぎたい"){
                        if (con.f_con.includes("エレキフィールド")){
                            con.type = "でんき"
                        } else if (con.f_con.includes("グラスフィールド")){
                            con.type = "くさ"
                        } else if (con.f_con.includes("サイコフィールド")){
                            con.type = "エスパー"
                        } else if (con.f_con.includes("ミストフィールド")){
                            con.type = "フェアリー"
                        }
                        cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　ぎたいでタイプが変わった" + "\n")
                        if (con.p_con.includes("もりののろい") && con.type != "くさ"){
                            con.type += "、くさ"
                        }
                        if (con.p_con.includes("ハロウィン")){
                            con.type += "、ゴースト"
                        }
                    }
                }
            } else if (list[i][3] == "ルーム"){
                for (const team of [[atk, def], [def,atk]]){
                    if (team[0].con.f_con.includes(move[0])){
                        cfn.conditionRemove(team[0].con, "field", move[0])
                        if (move[0] == "マジックルーム"){
                            team[0].con.item = team[0]["poke" + cfn.battleNum(team[0])].item
                        }
                        if (move[0] == "トリックルーム" && team[0].con.item == "ルームサービス"){
                            afn.rankChange(team[0], team[1], "S", -1, 100, "ルームサービス", false)
                            cfn.setRecycle(team[0])
                        }
                    } else {
                        team[0].con.f_con += move[0] + "　5/5" + "\n"
                        if (move[0] == "マジックルーム"){
                            team[0].con.item = ""
                        }
                    }
                }
            } else if (move[0] == "プラズマシャワー"){
                atk.con.f_con += move[0] + "\n"
                def.con.f_con += move[0] + "\n"
            } else if (move[0] == "じゅうりょく"){
                for (const con of [atk.con, def.con]){
                    con.f_con += "じゅうりょく　5/5" + "\n"
                    if (con.p_con.includes("空を飛ぶ")){
                        cfn.conditionRemove(con, "poke", "空を飛ぶ")
                        cfn.conditionRemove(con, "poke", "溜め技")
                    }
                    cfn.conditionRemove(con, "poke", "テレキネシス")
                    cfn.conditionRemove(con, "poke", "でんじふゆう")
                }
            } else if (move[0] == "フェアリーロック"){
                atk.con.f_con += list[i][1] + "　開始" + "\n"
                def.con.f_con += list[i][1] + "　開始" + "\n"
            }
        }
    }
}

// 優先度
exports.priorityDegree = function(con, move){
    const list = moveEff.prioDeg()
    const recover = moveEff.recover()
    let priority = 0
    for (let i = 0; i < list.length; i++){
        if (move[0] == list[i][0]){
            priority += list[i][1]
        }
    }
    if ((con.ability == "いたずらごころ" && move[2] == "変化") 
    || (move[0] == "グラススライダー" && con.f_con.includes("グラスフィールド") && cfn.groundedCheck(con))
    || (con.ability == "はやてのつばさ" && move[1] == "ひこう" && con.last_HP == con.full_HP)){
        priority += 1
    }
    if (con.ability == "ヒーリングシフト" && recover.includes(move[0])){
        priority += 3
    }

    return priority
}

// 体重
exports.weight = function(con){
    let weight = cfn.pokeSearch(con.name)[14]

    for (let i = 0; i < con.p_con.split("\n").length; i++){
        if (con.p_con.split("\n")[i].includes("ボディパージ")){
            const num = Number(con.p_con.split("\n")[i].replace(/[^0-9]/g, ""))
            weight -= num * 100
        }
    }

    if (con.item == "かるいし" || con.ability == "ライトメタル"){
        weight = Math.round(weight * 5) / 10
    }
    if (con.ability == "ヘヴィメタル"){
        weight *= 2
    }
    return Math.max(weight, 0.1)
}

// きのみ即時食べ
exports.eatingBerry = function(team, enemy, berry){
    let con = team.con
    cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　は　" + berry + "を　食べた！" + "\n")
    if (berry == "オレンのみ"){
        if (con.ability == "じゅくせい"){
            afn.HPchangeMagic(team, enemy, 20, "+", berry)
        } else {
            afn.HPchangeMagic(team, enemy, 10, "+", berry)
        }
    } else if (berry == "オボンのみ" || berry == "ナゾのみ"){
        if (con.ability == "じゅくせい"){
            afn.HPchangeMagic(team, enemy, Math.floor(con.full_HP / 2), "+", berry)
        } else {
            afn.HPchangeMagic(team, enemy, Math.floor(con.full_HP / 4), "+", berry)
        }
    } else if (berry == "クラボのみ" && con.abnormal == "まひ"){
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　の　痺れが取れた！" + "\n")
        con.abnormal = ""
    } else if (berry == "カゴのみ" && con.abnormal == "ねむり"){
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　は　目を覚ました！" + "\n")
        con.abnormal = ""
        cfn.conditionRemove(con, "poke", "ねむり")
        cfn.conditionRemove(con, "poke", "ねむる")
    } else if (berry == "モモンのみ" && con.abnormal.includes("どく")){
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　の　どくが取れた！" + "\n")
        con.abnormal = ""
        condition_remove(team, "poke", "もうどく")
    } else if (berry == "チーゴのみ" && con.abnormal == "やけど"){
        txt = team + "チームの　" + con.name + "の　やけどが治った！" + "\n"
        document.battle_log.battle_log.value += txt
        con.abnormal = ""
    } else if (berry == "ナナシのみ" && con.abnormal == "こおり"){
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　の　こおりが溶けた！" + "\n")
        con.abnormal = ""
    } else if (berry == "ヒメリのみ"){
        for (let i = 0; i < 4; i++){
            if (con["last_" + i] < con["PP_ " + i]){
                if (con.ability == "じゅくせい"){
                    con["last_" + i] = Math.min(con["PP_" + i], con["last_" + i] + 20)
                } else {
                    con["last_" + i] = Math.min(con["PP_" + i], con["last_" + i] + 10)
                }
                cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　は　" + con["move_" + i] + "の　PPを回復した" + "\n")
                break
            }
        }
    } else if (berry == "キーのみ" && con.p_con.includes("こんらん")){
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　の　こんらんが解けた！" + "\n")
        cfn.conditionRemove(con, "poke", "こんらん")
    } else if (berry == "ラムのみ" && (con.abnormal != "" || con.p_con.includes("こんらん"))){
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　の　状態異常が治った！" + "\n")
        con.abnormal = ""
        cfn.conditionRemove(con, "poke", "こんらん")
    } else if (berry == "フィラのみ" || berry == "イアのみ" || berry == "ウイのみ" || berry == "バンジのみ" || berry == "マゴのみ"){
        if (con.ability == "じゅくせい"){
            afn.HPchangeMagic(team, enemy, Math.floor(con.full_HP * 2 / 3), "+", berry)
        } else {
            afn.HPchangeMagic(team, enemy, Math.floor(con.full_HP / 3), "+", berry)
        }
        if ((berry == "フィラのみ" && (con.nature == "ずぶとい" || con.nature == "ひかえめ" || con.nature == "おだやか" || con.nature == "おくびょう")) 
        || (berry == "イアのみ" && (con.nature == "さみしがり" || con.nature == "おっとり" || con.nature == "おとなしい" || con.nature == "せっかち")) 
        || (berry == "ウイのみ" && (con.nature == "いじっぱり" || con.nature == "わんぱく" || con.nature == "しんちょう" || con.nature == "ようき")) 
        || (berry == "バンジのみ" && (con.nature == "やんちゃ" || con.nature == "のうてんき" || con.nature == "うっかりや" || con.nature == "むじゃき")) 
        || (berry == "マゴのみ" && (con.nature == "ゆうかん" || con.nature == "のんき" || con.nature == "れいせい" || con.nature == "なまいき"))){
            if (!con.p_con.includes("こんらん")){
                afn.makeAbnormal(team, enemy, "こんらん", 100, berry)
            }
        }
    } else if (berry == "チイラのみ"){
        if (con.ability == "じゅくせい"){
            afn.rankChange(team, enemy, "A", 2, 100, berry, false)
        } else {
            afn.rankChange(team, enemy, "A", 1, 100, berry, false)
        }
    } else if (berry == "リュガのみ" || berry == "アッキのみ"){
        if (con.ability == "じゅくせい"){
            afn.rankChange(team, enemy, "B", 2, 100, berry, false)
        } else {
            afn.rankChange(team, enemy, "B", 1, 100, berry, false)
        }
    } else if (berry == "ヤタピのみ"){
        if (con.ability == "じゅくせい"){
            afn.rankChange(team, enemy, "C", 2, 100, berry, false)
        } else {
            afn.rankChange(team, enemy, "C", 1, 100, berry, false)
        }
    } else if (berry == "ズアのみ" || berry == "タラプのみ"){
        if (con.ability == "じゅくせい"){
            afn.rankChange(team, enemy, "D", 2, 100, berry, false)
        } else {
            afn.rankChange(team, enemy, "D", 1, 100, berry, false)
        }
    } else if (berry == "カムラのみ"){
        if (con.ability == "じゅくせい"){
            afn.rankChange(team, enemy, "S", 2, 100, berry, false)
        } else {
            afn.rankChange(team, enemy, "S", 1, 100, berry, false)
        }
    } else if (berry == "サンのみ" && !con.p_con.includes("きゅうしょアップ")){
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　は　張り切り出した！" + "\n")
        con.p_con += "きゅうしょアップ" + "\n"
    } else if (berry == "スターのみ"){
        const random = Math.random()
        const parameter = [["A", 0], ["B", 1/5], ["C", 2/5], ["D", 3/5], ["S", 4/5]]
        let check = ""
        for (let i = 0; i < 5; i++){
            if (random > parameter[i][1]){
                check = parameter[i][0]
            }
        }
        if (con.ability == "じゅくせい"){
            afn.rankChange(team, enemy, check, 4, 100, berry, false)
        } else {
            afn.rankChange(team, enemy, check, 2, 100, berry, false)
        }
    } else if (berry == "ミクルのみ"){
        con.p_con += "ミクルのみ" + "\n"
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　は　命中率が上がった！" + "\n")
    }
    if (con.ability == "ほおぶくろ"){
        afn.HPchangeMagic(team, enemy, Math.floor(con.full_HP / 3), "+", "ほおぶくろ")
    }
}


// 54.命中判定による技の無効化
exports.accuracyFailure = function(atk, def, move, order){
    if (atk.con.ability == "ノーガード" || def.con.ability == "ノーガード"){
        return
    }
    if (atk.con.p_con.includes("ロックオン")){
        cfn.conditionRemove(atk.con, "poke", "ロックオン")
        return
    }
    if (def.con.p_con.includes("ちいさくなる") && moveEff.minimize().includes(move[0])){
        return
    }
    if (def.con.p_con.includes("テレキネシス") && !moveEff.oneShot().includes(move[0])){
        return
    }
    if ((move[4] == "-") 
    || ((move[0] == "かみなり" || move[0] == "ぼうふう") && atk.con.f_con.includes("あめ") && cfn.isWeather(atk.con, def.con)) 
    || (move[0] == "ふぶき" && atk.con.f_con.includes("あられ") && cfn.isWeather(atk.con, def.con)) 
    || (move[0] == "どくどく" && atk.con.type.includes("どく"))){
        return
    }
    if ((move[0] == "かみなり" || move[0] == "ぼうふう") && atk.con.f_con.includes("にほんばれ") && cfn.isWeather(atk.con, def.con)){
        move[4] = 50
    }
    if (def.con.ability == "ミラクルスキン" && move[2] == "変化" && move[4] > 50){
        move[4] = 50
    }
    if (moveEff.oneShot().includes(move[0])){
        move[4] = 30 + atk.con.level - def.con.level
    }

    // 命中補正の初期値
    let correction = 4096
    // 場の状態
    if(atk.con.f_con.includes("じゅうりょく") && !moveEff.oneShot().includes(move[0])){
        correction = Math.round(correction * 6840 / 4096)
    }
    // 相手の特性
    if (def.con.ability == "ちどりあし" && atk.con.p_con.includes("こんらん") && !moveEff.oneShot().includes(move[0])){
        correction = Math.round(correction * 2048 / 4096)
    } else if (cfn.isWeather(atk.con, def.con) && ((def.con.ability == "すながくれ" && atk.con.f_con.includes("すなあらし")) || (def.con.ability == "ゆきがくれ" && atk.con.f_con.includes("あられ"))) && !moveEff.oneShot().includes(move[0])){
        correction = Math.round(correction * 3277 / 4096)
    }
    // 自分の特性
    if (atk.con.ability == "はりきり" && move[2] == "物理" && !moveEff.oneShot().includes(move[0])){
        correction = Math.round(correction * 3277 / 4096)
    } else if (atk.con.ability == "ふくがん" && !moveEff.oneShot().includes(move[0])){
        correction = Math.round(correction * 5325 / 4096)
    } else if (atk.con.ability == "しょうりのほし" && !moveEff.oneShot().includes(move[0])){
        correction = Math.round(correction * 4506 / 4096)
    }
    // 相手のもちもの
    if (def.con.item == "ひかりのこな" || def.con.item == "のんきのおこう" && !moveEff.oneShot().includes(move[0])){
        correction = Math.round(correction * 3686 / 4096)
    }
    // 自分のもちもの
    if (atk.con.item == "こうかくレンズ" && !moveEff.oneShot().includes(move[0])){
        correction = Math.round(correction * 4505 / 4096)
    } else if (atk.con.item == "フォーカスレンズ" && atk == order[1] && !moveEff.oneShot().includes(move[0])){
        correction = Math.round(correction * 4915 / 4096)
    }

    // 技の命中率 * 命中補正
    let check = cfn.fiveCut(move[4] * correction / 4096)

    // ランク補正
    let rank = atk.con.X_rank - def.con.Y_rank
    if (atk.con.ability == "てんねん" || atk.con.ability == "するどいめ" || def.con.p_con.includes("みやぶられている") || move[0] == "せいなるつるぎ" || move[0] == "DDラリアット" || move[0] == "なしくずし" || def.con.p_con.includes("ミラクルアイ")){
        rank += def.con.Y_rank
    }
    if (def.con.ability == "てんねん"){
        rank -= atk.con.X_rank
    }
    rank = Math.min(rank, 6)
    rank = Math.max(rank, -6)

    if (rank > 0){
        check = Math.floor(check * (3 + rank) / 3)
    } else {
        check = Math.floor(check * 3) / (3 - rank)
    }

    if (atk.con.p_con.includes("ミクルのみ") && !moveEff.oneShot().includes(move[0])){
        check = cfn.fiveCut(check * 4915 / 4096)
        cfn.conditionRemove(atk.con, "poke", "ミクルのみ")
    }

    check = Math.min(check, 100)
    const random = Math.random() * 100
    if (random >= check){
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　には当たらなかった" + "\n")
        if (atk.con.item == "からぶりほけん" && !moveEff.oneShot.includes(move[0]) && atk.con.S_rank != 6){
            afn.rankChange(atk, def, "S", 2, 100, "からぶりほけん", false)
            cfn.setRecycle(atk)
        }
        if (move[0] == "とびげり" || move[0] == "とびひざげり"){
            afn.HPchangeMagic(atk, def, Math.floor(atk.con.full_HP / 2), "-", move[0])
        }
        return true
    }
}

// しろいハーブ
exports.whiteHerb = function(team, enemy){
    let con = team.con
    if (con.item == "しろいハーブ"){
        let check = 0
        for (const parameter of ["A", "B", "C", "D", "S", "X", "Y"]){
            if (con[parameter + "_rank"] < 0){
                con[parameter + "_rank"] = 0
                check += 1
            }
        }
        if (check > 0){
            cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　は　しろいハーブで　下がった能力を元に戻した" + "\n")
            cfn.setRecycle(team)
        }
    }
}

exports.processAtFailure = function(team){
    cfn.conditionRemove(team.con, "poke", "アイスボール")
    cfn.conditionRemove(team.con, "poke", "ころがる")
    cfn.conditionRemove(team.con, "poke", "さわぐ")
    cfn.conditionRemove(team.con, "poke", "れんぞくぎり")
    cfn.conditionRemove(team.con, "poke", "がまん")
    cfn.conditionRemove(team.con, "field", "参照項目")

    // かたやぶりなどの特性無視終了？
    for (let i = 0; i < team.con.p_con.split("\n").length; i++){
        if (team.con.p_con.split("\n")[i].includes("かたやぶり：")){
            team.con.ability = team.con.p_con.split("\n")[i].slice(6)
        }
    }
    cfn.conditionRemove(team.con, "poke", "かたやぶり：")

    afn.specialButton(team)
}


exports.moveSearch = function(user){
    let move_org = "" // 技の元データを代入

    if (user.con.p_con.includes("反動で動けない")){
        for (let i = 0; i < user.con.p_con.split("\n").length - 1; i++){
            if (user.con.p_con.split("\n")[i].includes("反動で動けない")){
                move_org = cfn.moveSearchByName(user.con.p_con.split("\n")[i].slice(8))
            }
        }
    } else if (user.con.p_con.includes("溜め技")){
        for (let i = 0; i < user.con.p_con.split("\n").length - 1; i++){
            if (user.con.p_con.split("\n")[i].includes("溜め技")){
                move_org = cfn.moveSearchByName(user.con.p_con.split("\n")[i].slice(4))
            }
        }
    } else if (user.con.p_con.includes("あばれる")){
        for (let i = 0; i < user.con.p_con.split("\n").length - 1; i++){
            if (user.con.p_con.split("\n")[i].includes("あばれる")){
                move_org = cfn.moveSearchByName(user.con.p_con.split("\n")[i].slice(5, -7))
            }
        }
    } else if (user.con.p_con.includes("アイスボール")){
        move_org = cfn.moveSearchByName("アイスボール")
    } else if (user.con.p_con.includes("ころがる")){
        move_org = cfn.moveSearchByName("ころがる")
    } else if (user.con.p_con.includes("がまん")){
        move_org = cfn.moveSearchByName("がまん")
    } else if (user.con.p_con.includes("がまん")){
        move_org = cfn.moveSearchByName("さわぐ")
    } else if (user.con.p_con.includes("アンコール")){
        for (let i = 0; i < user.con.p_con.split("\n").length - 1; i++){
            if (user.con.p_con.split("\n")[i].includes("アンコール")){
                move_org = cfn.moveSearchByName(user.con.p_con.split("\n")[i].slice(10))
            }
        }
    } else if (user.data.command == "わるあがき"){
        move_org = cfn.moveSearchByName("わるあがき")
    } else {
        const move_name = user.con["move_" + user.data.command]
        if (move_name.includes("Z")){
            move_org = cfn.moveSearchByName(move_name.replace("Z", "")).concat()
            move_org[0] = move_name
        } else {
            move_org = cfn.moveSearchByName(move_name)
        }
    }

    let move = move_org.concat() // 技データのコピー、こっちをいじる

    if (user.con.ability == "えんかく" && move[2] != "変化"){
        move[6] = "間接"
    }

    return move
}


// 選択ボタンの有効化
exports.buttonValidation = function(team){
    // 技選択を全て有効化
    for (let i = 0; i < 4; i++){
        if (team.con["move_" + i] != ""){
            team.data["radio_" + i] = false
        }
    }
    // 交換ボタンの有効化
    for (let i = 0; i < 3; i++){
        if (team["poke" + i].life == "控え"){
            team.data["radio_" + Number(i + 4)] = false
        }
    }

    // ゲップ：備考欄に「ゲップ」の文字がなければ使用不能に
    for (let i = 0; i < 4; i++){
        if (team.con["move_" + i] == "ゲップ" && team["poke" + cfn.battleNum(team)].belch != "ゲップ"){
            team.data["radio_" + i] = true
        }
    }
    // ほおばる：きのみを持っていない場合、使用不能に
    for (let i = 0; i < 4; i++){
        if (team.con["move_" + i] == "ほおばる" && !itemEff.berryList().includes(team.con.item)){
            team.data["radio_" + i] = true
        }
    }
    // いちゃもん：いちゃもんで使用不能だった技を使用可能に
    if (team.con.p_con.includes("いちゃもん")){
        for (let i = 0; i < 4; i++){
            if (team.con["move_" + i] == team.con.used){
                team.data["radio_" + i] = true
            }
        }
    }
}