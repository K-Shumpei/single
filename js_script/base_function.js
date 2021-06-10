// jsファイルの読み込み
const afn = require("./function")
const cfn = require("./law_function")


exports.berryPinch = function(team, enemy, log){
    let con = team.con
    const TN = team.con.TN

    if (enemy.con.ability != "きんちょうかん"){
        let berry_check = 0
        if (con.last_HP > 0 && con.last_HP <= con.full_HP / 2){
            if (con.item == "きのみジュース"){
                afn.HPchangeMagic(team, 20, "+", con.item, log)
                berry_check += 2
            } else if (con.item == "オレンのみ"){
                berry_check += 1
                if (con.ability == "じゅくせい"){
                    afn.HPchangeMagic(team, 20, "+", con.item, log)
                } else {
                    afn.HPchangeMagic(team, 10, "+", con.item, log)
                }
            } else if (con.item == "オボンのみ"){
                berry_check += 1
                if (con.ability == "じゅくせい"){
                    afn.HPchangeMagic(team, Math.floor(con.full_HP / 2), "+", con.item, log)
                } else {
                    afn.HPchangeMagic(team, Math.floor(con.full_HP / 4), "+", con.item. log)
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
                        afn.HPchangeMagic(team, Math.floor(con.full_HP * 2 / 3), "+", con.item, log)
                    } else {
                        fan.HPchangeMagic(team, Math.floor(con.full_HP / 3), "+", con.item, log)
                    }
                    if ((con.item== "フィラのみ" && (con.nature == "ずぶとい" || con.nature == "ひかえめ" || con.nature == "おだやか" || con.nature == "おくびょう")) 
                    || (con.item == "イアのみ" && (con.nature == "さみしがり" || con.nature == "おっとり" || con.nature == "おとなしい" || con.nature == "せっかち")) 
                    || (con.item == "ウイのみ" && (con.nature == "いじっぱり" || con.nature == "わんぱく" || con.nature == "しんちょう" || con.nature == "ようき")) 
                    || (con.item == "バンジのみ" && (con.nature == "やんちゃ" || con.nature == "のうてんき" || con.nature == "うっかりや" || con.nature == "むじゃき")) 
                    || (con.item == "マゴのみ" && (con.nature == "ゆうかん" || con.nature == "のんき" || con.nature == "れいせい" || con.nature == "なまいき"))){
                        if (!con.p_con.includes("こんらん")){
                            afn.makeAbnormal(team, enemy, "こんらん", 100, con.item, log)
                        }
                    }
                } else if (con.item == "チイラのみ"){
                    berry_check += 1
                    if (con.ability == "じゅくせい"){
                        afn.rankChange(team, "A", 2, 100, con.item, log)
                    } else {
                        fan.rankChange(team, "A", 1, 100, con.item, log)
                    }
                } else if (con.item == "リュガのみ"){
                    berry_check += 1
                    if (con.ability == "じゅくせい"){
                        afn.rankChange(team, "B", 2, 100, con.item, log)
                    } else {
                        afn.rankChange(team, "B", 1, 100, con.item, log)
                    }
                } else if (con.item == "ヤタピのみ"){
                    berry_check += 1
                    if (con.ability == "じゅくせい"){
                        afn.rankChange(team, "C", 2, 100, con.item, log)
                    } else {
                        afn.rankChange(team, "C", 1, 100, con.item, log)
                    }
                } else if (con.item == "ズアのみ"){
                    berry_check += 1
                    if (con.ability == "じゅくせい"){
                        afn.rankChange(team, "D", 2, 100, con.item, log)
                    } else {
                        afn.rankChange(team, "D", 1, 100, con.item, log)
                    }
                } else if (con.item == "カムラのみ"){
                    berry_check += 1
                    if (con.ability == "じゅくせい"){
                        afn.rankChange(team, "S", 2, 100, con.item, log)
                    } else {
                        afn.rankChange(team, "S", 1, 100, con.item, log)
                    }
                } else if (con.item == "サンのみ" && !con.p_con.includes("きゅうしょアップ")){
                    berry_check += 1
                    con.p_con += "きゅうしょアップ" + CR
                    log += TN + "　の　" + con.name + "は　張り切り出した！" + CR
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
                        afn.rankChange(team, parameter, 4, 100, con.item, log)
                    } else {
                        afn.rankChange(team, parameter, 2, 100, con.item, log)
                    }
                } else if (con.item == "ミクルのみ"){
                    berry_check += 1
                    con.p_con += "ミクルのみ" + CR
                    log += TN + "　の　" + con.name + "は　命中率が上がった！" + CR
                }
            }
        }

        if (berry_check == 1){
            cfn.setBelch(team)
            cfn.setRecycle(team)
            if (con.ability == "ほおぶくろ"){
                afn.HPchangeMagic(team, Math.floor(con.full_HP / 3), "+", "ほおぶくろ", log)
            }
        } else if (berry_check == 2){
            setRecycle(team)
        }
    }
}


exports.berryAbnormal = function(team, enemy, log){
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
                cfn.conditionRemove(con.p_con, "こんらん")
            } else {
                con.abnormal = ""
                if (con.item == "モモンのみ"){
                    cfn.conditionRemove(con.p_con, "もうどく")
                } else if (con.item == "カゴのみ"){
                    cfn.conditionRemove(con.p_con, "ねむり")
                    cfn.conditionRemove(con.p_con, "ねむる")
                } else if (con.item == "ラムのみ"){
                    cfn.conditionRemove(con.p_con, "こんらん")
                    cfn.conditionRemove(con.p_con, "ねむり")
                    cfn.conditionRemove(con.p_con, "ねむる")
                }
            }
            log += team.con.TN + "　の　" + con.name + "　は　" + con.item + "を　食べて状態異常が治った！" + CR
            cfn.setRecycle(team)
            cfn.setBelch(team)
            if (con.ability == "ほおぶくろ"){
                fn.HPchangeMagic(team, Math.floor(con.full_HP / 3), "+", "ほおぶくろ", log)
            }
        }
    }
}




// 全体の場へ効果をもたらす技
exports.allFieldStatus = function(atk, def, move, log){
    const list = moveEff.allField()
    for (let i = 0; i < list.length; i++){
        if (move[0] == list[i][0]){
            log += list[i][2] + CR
            if (list[i][3] == "天候"){
                for (const con of [atk.con, def.con]){
                    let turn = 5
                    if ((move[0] == "にほんばれ" && con.item == "あついいわ") 
                    || (move[0] == "あめふらし" && con.item == "しめったいわ") 
                    || (move[0] == "すなおこし" && con.item == "さらさらいわ") 
                    || (move[0] == "あられ" && con.item == "つめたいいわ")){
                        turn = 8
                    }
                    cfn.conditionRemove(con.f_con, "にほんばれ")
                    cfn.conditionRemove(con.f_con, "あめ")
                    cfn.conditionRemove(con.f_con, "すなあらし")
                    cfn.conditionRemove(con.f_con, "あられ")
                    con += list[i][1] + "　" + turn + "/" + turn + CR
                }
                if (move[0] == "あられ"){
                    for (const team of [atk, def]){
                        if (team.con.ability == "アイスフェイス" && team.con.name == "コオリッポ(ナイスフェイス)"){
                            log += team.con.TN + "　の　" + team.con.name + "の　アイスフェイス！" + CR
                            form_chenge(team, "コオリッポ(アイスフェイス)")
                        }
                    }
                }
            } else if (list[i][3] == "フィールド"){
                for (const con of [atk.con, def.con]){
                    cfn.conditionRemove(con.f_con, "フィールド")
                    let turn = 5
                    if (con.item == "グランドコート"){
                        turn = 8
                    }
                    con.f_con += list[i][1] + "　" + turn + "/" + turn + CR
                }
                for (const team of [atk, def]){
                    if ((move[0] == "エレキフィールド" && team.con.item == "エレキシード") || (move[0] == "グラスフィールド" && team.con.item == "グラスシード")){
                        afn.rankChange(team, "B", 1, 100, team.con.item, log)
                        set_recycle_item(team)
                    } else if ((move[0] == "サイコフィールド" && team.con.item == "サイコシード") || (move[0] == "ミストフィールド" && team.con.item == "ミストシード")){
                        afn.rankChange(team, "D", 1, 100, team.con.item, log)
                        cfn.setRecycle(team)
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
                        log += con.TN + "　の　" + con.name + "　は　ぎたいでタイプが変わった" + CR
                        if (con.p_con.includes("もりののろい") && con.type != "くさ"){
                            con.type += "、くさ"
                        }
                        if (con.p_con.includes("ハロウィン")){
                            con.type += "、ゴースト"
                        }
                    }
                }
            } else if (list[i][3] == "ルーム"){
                for (const team of [atk, def]){
                    if (team.f_con.includes(move[0])){
                        cfn.conditionRemove(team.con.f_con, move[0])
                        if (move[0] == "マジックルーム"){
                            team.con.item = team["poke" + cfn.battleNum(team)].item
                        }
                        if (move[0] == "トリックルーム" && team.con.item == "ルームサービス"){
                            afn.rankChange(team, "S", -1, 100, "ルームサービス", log)
                            cfn.setRecycle(team)
                        }
                    } else {
                        team.con.f_con += move[0] + "　5/5" + CR
                        if (move[0] == "マジックルーム"){
                            team.con.item = ""
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
                        cfn.conditionRemove(con.p_con, "空を飛ぶ")
                        cfn.conditionRemove(con.p_con, "溜め技")
                    }
                    cfn.conditionRemove(con.p_con, "テレキネシス")
                    cfn.conditionRemove(con.p_con, "でんじふゆう")
                }
            } else if (move[0] == "フェアリーロック"){
                atk.con.f_con += list[i][1] + "　開始" + CR
                def.con.f_con += list[i][1] + "　開始" + CR
            }
        }
    }
}