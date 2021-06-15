// jsファイルの読み込み
const afn = require("./function")
const cfn = require("./law_function")
const moveEff = require("./move_effect")


exports.berryPinch = function(team, enemy){
    let con = team.con
    const TN = team.con.TN

    if (enemy.con.ability != "きんちょうかん"){
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
        } else if (con.last_HP > 0){
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
                        fan.HPchangeMagic(team, enemy, Math.floor(con.full_HP / 3), "+", con.item)
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
                        afn.rankChange(team, enemy, "A", 2, 100, con.item)
                    } else {
                        afn.rankChange(team, enemy, "A", 1, 100, con.item)
                    }
                } else if (con.item == "リュガのみ"){
                    berry_check += 1
                    if (con.ability == "じゅくせい"){
                        afn.rankChange(team, enemy, "B", 2, 100, con.item)
                    } else {
                        afn.rankChange(team, enemy, "B", 1, 100, con.item)
                    }
                } else if (con.item == "ヤタピのみ"){
                    berry_check += 1
                    if (con.ability == "じゅくせい"){
                        afn.rankChange(team, enemy, "C", 2, 100, con.item)
                    } else {
                        afn.rankChange(team, enemy, "C", 1, 100, con.item)
                    }
                } else if (con.item == "ズアのみ"){
                    berry_check += 1
                    if (con.ability == "じゅくせい"){
                        afn.rankChange(team, enemy, "D", 2, 100, con.item)
                    } else {
                        afn.rankChange(team, enemy, "D", 1, 100, con.item)
                    }
                } else if (con.item == "カムラのみ"){
                    berry_check += 1
                    if (con.ability == "じゅくせい"){
                        afn.rankChange(team, enemy, "S", 2, 100, con.item)
                    } else {
                        afn.rankChange(team, enemy, "S", 1, 100, con.item)
                    }
                } else if (con.item == "サンのみ" && !con.p_con.includes("きゅうしょアップ")){
                    berry_check += 1
                    con.p_con += "きゅうしょアップ" + CR
                    cfn.logWrite(team, enemy, TN + "　の　" + con.name + "は　張り切り出した！" + CR)
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
                        afn.rankChange(team, enemy, parameter, 4, 100, con.item)
                    } else {
                        afn.rankChange(team, enemy, parameter, 2, 100, con.item)
                    }
                } else if (con.item == "ミクルのみ"){
                    berry_check += 1
                    con.p_con += "ミクルのみ" + CR
                    cfn.logWrite(team, enemy, TN + "　の　" + con.name + "は　命中率が上がった！" + CR)
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
            setRecycle(team)
        }
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
            cfn.logWrite(team, enemy, team.con.TN + "　の　" + con.name + "　は　" + con.item + "を　食べて状態異常が治った！" + CR)
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
            cfn.logWrite(atk, def, list[i][2] + CR)
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
                    con.f_con += list[i][1] + "　" + turn + "/" + turn + CR
                }
                if (move[0] == "あられ"){
                    for (const team of [atk, def]){
                        if (team.con.ability == "アイスフェイス" && team.con.name == "コオリッポ(ナイスフェイス)"){
                            cfn.logWrite(atk, def, team.con.TN + "　の　" + team.con.name + "の　アイスフェイス！" + CR)
                            form_chenge(team, "コオリッポ(アイスフェイス)")
                        }
                    }
                }
            } else if (list[i][3] == "フィールド"){
                for (const team of [atk.con, def.con]){
                    cfn.conditionRemove(team, "field", "フィールド")
                    let turn = 5
                    if (team.item == "グランドコート"){
                        turn = 8
                    }
                    team.f_con += list[i][1] + "　" + turn + "/" + turn + CR
                }
                for (const team of [[atk, def], [def, atk]]){
                    if ((move[0] == "エレキフィールド" && team[0].con.item == "エレキシード") || (move[0] == "グラスフィールド" && team[0].con.item == "グラスシード")){
                        afn.rankChange(team[0], team[1], "B", 1, 100, team[0].con.item)
                        set_recycle_item(team[0])
                    } else if ((move[0] == "サイコフィールド" && team[0].con.item == "サイコシード") || (move[0] == "ミストフィールド" && team[0].con.item == "ミストシード")){
                        afn.rankChange(team[0], team[1], "D", 1, 100, team[0].con.item)
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
                        cfn.logWrite(atk, def, con.TN + "　の　" + con.name + "　は　ぎたいでタイプが変わった" + CR)
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
                    if (team[0].f_con.includes(move[0])){
                        cfn.conditionRemove(team[0].con, "field", move[0])
                        if (move[0] == "マジックルーム"){
                            team[0].con.item = team[0]["poke" + cfn.battleNum(team[0])].item
                        }
                        if (move[0] == "トリックルーム" && team[0].con.item == "ルームサービス"){
                            afn.rankChange(team[0], team[1], "S", -1, 100, "ルームサービス")
                            cfn.setRecycle(team[0])
                        }
                    } else {
                        team[0].con.f_con += move[0] + "　5/5" + CR
                        if (move[0] == "マジックルーム"){
                            team[0].con.item = ""
                        }
                    }
                }
            } else if (move[0] == "プラズマシャワー"){
                atk.con.f_con += move[0] + CR
                def.con.f_con += move[0] + CR
            } else if (move[0] == "じゅうりょく"){
                for (const con of [atk.con, def.con]){
                    con.f_con += "じゅうりょく　5/5" + CR
                    if (con.p_con.includes("空を飛ぶ")){
                        cfn.conditionRemove(con, "poke", "空を飛ぶ")
                        cfn.conditionRemove(con, "poke", "溜め技")
                    }
                    cfn.conditionRemove(con, "poke", "テレキネシス")
                    cfn.conditionRemove(con, "poke", "でんじふゆう")
                }
            } else if (move[0] == "フェアリーロック"){
                atk.con.f_con += list[i][1] + "　開始" + CR
                def.con.f_con += list[i][1] + "　開始" + CR
            }
        }
    }
}

// 優先度
exports.priorityDegree = function(con, move){
    const list = moveEff.prioDeg()
    let priority = 0
    for (let i = 0; i < list.length; i++){
        if (move[0] == ist[i][0]){
            priority += list[i][1]
        }
    }
    if ((con.ability == "いたずらごころ" && move[2] == "変化") 
    || (move[0] == "グラススライダー" && con.f_con.includes("グラスフィールド") && cfn.groundedCheck(con))
    || (con.ability == "はやてのつばさ" && move[1] == "ひこう" && con.last_HP == con.full_HP)){
        priority += 1
    }
    if (con.ability == "ヒーリングシフト" && list.includes(move[0])){
        priority += 3
    }

    return priority
}