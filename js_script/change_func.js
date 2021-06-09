// 変化技でランク変化する時
// 無効判定は事前に行っているのでいらない
// 技名も事前に宣言している
function rank_change(team, parameter, change){
    const poke = document.getElementById(team + "_poke").textContent
    const convert = [["A", "攻撃"], ["B", "防御"], ["C", "特攻"], ["D", "特防"], ["S", "素早さ"], ["accuracy", "命中率"], ["evasiveness", "回避率"]]
    const now = Number(document.getElementById(team + "_rank_" + parameter).textContent)
    if (new get(team).ability == "あまのじゃく"){
        change *= -1
    }
    if (new get(team).ability == "たんじゅん"){
        change *= 2
    }
    let result = now + change
    if (result > 6){result = 6}
    if (result < -6){result = -6}
    document.getElementById(team + "_rank_" + parameter).textContent = result
    for (let i = 0; i < convert.length; i++){
        if (parameter == convert[i][0]){
            const text = convert[i][1]
            if (change > 0){
                if (result - now == 0){
                    txt = team + "チームの　" + poke + "　の　" + text + "　は　これ以上　上がらない" + CR
                    document.battle_log.battle_log.value += txt
                } else if (result - now == 1){
                    txt = team + "チームの　" + poke + "　の　" + text + "　が　上がった！" + CR
                    document.battle_log.battle_log.value += txt
                    document.battle[team + "_poke_condition"].value += "ランク上昇" + CR
                } else if (result - now == 2){
                    txt = team + "チームの　" + poke + "　の　" + text + "　が　ぐーんと上がった！" + CR
                    document.battle_log.battle_log.value += txt
                    document.battle[team + "_poke_condition"].value += "ランク上昇" + CR
                } else if (result - now > 2){
                    txt = team + "チームの　" + poke + "　の　" + text + "　が　ぐぐーんと上がった！" + CR
                    document.battle_log.battle_log.value += txt
                    document.battle[team + "_poke_condition"].value += "ランク上昇" + CR
                }
            } else if (change < 0){
                if (result - now == 0){
                    txt = team + "チームの　" + poke + "　の　" + text + "　は　これ以上　下がらない" + CR
                    document.battle_log.battle_log.value += txt
                } else if (result - now == -1){
                    txt = team + "チームの　" + poke + "　の　" + text + "　が　下がった！" + CR
                    document.battle_log.battle_log.value += txt
                    document.battle[team + "_poke_condition"].value += "ランク下降" + CR
                } else if (result - now == -2){
                    txt = team + "チームの　" + poke + "　の　" + text + "　が　がくっと下がった！" + CR
                    document.battle_log.battle_log.value += txt
                    document.battle[team + "_poke_condition"].value += "ランク下降" + CR
                } else if (result - now < -2){
                    txt = team + "チームの　" + poke + "　の　" + text + "　が　がくーんと下がった！" + CR
                    document.battle_log.battle_log.value += txt
                    document.battle[team + "_poke_condition"].value += "ランク下降" + CR
                }
                if (new get(team).ability == "かちき"){
                    rank_change_not_status(team, "C", 2, 100, "かちき")
                } else if (new get(team).ability == "まけんき"){
                    rank_change_not_status(team, "A", 2, 100, "まけんき")
                }
            }
        }
    }
}

// 技の追加効果、持ち物、特性、場の状態などにより、ランク変化する時
// 技の追加効果の時は、原因の宣言はいらない
// それ以外は原因を宣言する
// 無効判定も必要、向こうになった時はメッセージがでない
function rank_change_not_status(team, parameter, change, probability, cause){
    const ability = document.getElementById(team + "_ability").textContent
    const f_con = document.battle[team + "_field_condition"].value
    const random = Math.random() * 100
    if (random < probability){
        if (!(change < 0 && (f_con.includes("しろいきり") || ability == "しろいけむり" || ability == "クリアボディ" || ability == "メタルプロテクト" || (ability == "フラワーベール" && type.includes("くさ")) || ability == "ミラーアーマー"))){
            if (parameter == "A" && !(ability == "かいりきバサミ" && change < 0)){
                if (typeof cause == "string"){
                    txt = cause + "が　発動した！" + CR
                    document.battle_log.battle_log.value += txt
                    rank_change(team, parameter, change)
                } else {
                    rank_change(team, parameter, change)
                }
            } else if (parameter == "B" && !(ability == "はとむね" && change < 0)){
                if (typeof cause == "string"){
                    txt = cause + "が　発動した！" + CR
                    document.battle_log.battle_log.value += txt
                    rank_change(team, parameter, change)
                } else {
                    rank_change(team, parameter, change)
                }
            } else if (parameter == "accuracy" && !(ability == "するどいめ" && change < 0)){
                if (typeof cause == "string"){
                    txt = cause + "が　発動した！" + CR
                    document.battle_log.battle_log.value += txt
                    rank_change(team, parameter, change)
                } else {
                    rank_change(team, parameter, change)
                }
            } else {
                if (typeof cause == "string"){
                    txt = cause + "が　発動した！" + CR
                    document.battle_log.battle_log.value += txt
                    rank_change(team, parameter, change)
                } else {
                    rank_change(team, parameter, change)
                }
            }
        }
    }
}

// Z技の追加効果によるランク変化、あまのじゃくが効かない
function rank_change_Z(team, parameter, change){
    const poke = document.getElementById(team + "_poke").textContent
    const convert = [["A", "攻撃"], ["B", "防御"], ["C", "特攻"], ["D", "特防"], ["S", "素早さ"], ["accuracy", "命中率"], ["evasiveness", "回避率"]]
    const now = Number(document.getElementById(team + "_rank_" + parameter).textContent)
    let result = now + change
    if (result > 6){result = 6}
    if (result < -6){result = -6}
    document.getElementById(team + "_rank_" + parameter).textContent = result
    for (let i = 0; i < convert.length; i++){
        if (parameter == convert[i][0]){
            const text = convert[i][1]
            if (change > 0){
                if (result - now == 0){
                    txt = team + "チームの　" + poke + "　の　" + text + "　は　これ以上　上がらない" + CR
                    document.battle_log.battle_log.value += txt
                } else if (result - now == 1){
                    txt = team + "チームの　" + poke + "　の　" + text + "　が　上がった！" + CR
                    document.battle_log.battle_log.value += txt
                    document.battle[team + "_poke_condition"].value += "ランク上昇" + CR
                } else if (result - now == 2){
                    txt = team + "チームの　" + poke + "　の　" + text + "　が　ぐーんと上がった！" + CR
                    document.battle_log.battle_log.value += txt
                    document.battle[team + "_poke_condition"].value += "ランク上昇" + CR
                } else if (result - now > 2){
                    txt = team + "チームの　" + poke + "　の　" + text + "　が　ぐぐーんと上がった！" + CR
                    document.battle_log.battle_log.value += txt
                    document.battle[team + "_poke_condition"].value += "ランク上昇" + CR
                }
            } else if (change < 0){
                if (result - now == 0){
                    txt = team + "チームの　" + poke + "　の　" + text + "　は　これ以上　下がらない" + CR
                    document.battle_log.battle_log.value += txt
                } else if (result - now == -1){
                    txt = team + "チームの　" + poke + "　の　" + text + "　が　下がった！" + CR
                    document.battle_log.battle_log.value += txt
                    document.battle[team + "_poke_condition"].value += "ランク下降" + CR
                } else if (result - now == -2){
                    txt = team + "チームの　" + poke + "　の　" + text + "　が　がくっと下がった！" + CR
                    document.battle_log.battle_log.value += txt
                    document.battle[team + "_poke_condition"].value += "ランク下降" + CR
                } else if (result - now < -2){
                    txt = team + "チームの　" + poke + "　の　" + text + "　が　がくーんと下がった！" + CR
                    document.battle_log.battle_log.value += txt
                    document.battle[team + "_poke_condition"].value += "ランク下降" + CR
                }
            }
        }
    }
}

function HP_change(team, damage, pm){
    const poke = document.getElementById(team + "_poke").textContent
    const full_HP = Number(document.getElementById(team + "_HP").textContent)
    const HP_last = Number(document.getElementById(team + "_HP_last").textContent)
    if (pm == "+" && !new get(team).p_con.includes("かいふくふうじ")){
        txt = team + "チームの　" + poke + "　は　" + damage + "　の　HP　を回復した" + CR
        document.battle_log.battle_log.value += txt
        if (full_HP < HP_last + damage){
            document.getElementById(team + "_HP_last").textContent = full_HP
        } else {
            document.getElementById(team + "_HP_last").textContent = HP_last + damage
        }
    } else if (pm == "-"){
        txt = team + "チームの　" + poke + "　に　" + damage + "　の　ダメージ" + CR
        document.battle_log.battle_log.value += txt
        // ダメおし用
        document.battle[team + "_poke_condition"].value += "ダメおし" + CR
        // 残りHPの表示
        document.getElementById(team + "_HP_last").textContent = Math.max(0, HP_last - damage)
        document.getElementById(team + "_" + battle_poke_num(team) + "_last_HP").textContent = Math.max(0, HP_last - damage)
        if (HP_last - damage > 0){
            // HPが減った時のきのみ等の発動
            berry_in_pinch(team)
        }
    }
    if (document.getElementById(team + "_HP_last").textContent == 0){
        fainted_process(team)
    }
}

function HP_change_not_attack(team, damage, pm, cause){
    const poke = document.getElementById(team + "_poke").textContent
    const ability = document.getElementById(team + "_ability").textContent
    const full_HP = Number(document.getElementById(team + "_HP").textContent)
    const HP_last = Number(document.getElementById(team + "_HP_last").textContent)
    if (pm == "+" && !new get(team).p_con.includes("かいふくふうじ")){
        txt = team + "チームの　" + poke + "　は　" + cause + "で　" + damage + "　の　HP　を回復した" + CR
        document.battle_log.battle_log.value += txt
        if (full_HP < HP_last + damage){
            document.getElementById(team + "_HP_last").textContent = full_HP
        } else {
            document.getElementById(team + "_HP_last").textContent = HP_last + damage
        }
    } else if (pm == "-"){
        if (ability != "マジックガード"){
            txt = team + "チームの　" + poke + "　に　" + cause + "で　" + damage + "　の　ダメージ" + CR
            document.battle_log.battle_log.value += txt
            document.battle[team + "_poke_condition"].value += "ダメおし" + CR
            // 残りHPの表示
            document.getElementById(team + "_HP_last").textContent = Math.max(0, HP_last - damage)
            document.getElementById(team + "_" + battle_poke_num(team) + "_last_HP").textContent = Math.max(0, HP_last - damage)
            if (HP_last - damage > 0){
                // HPが減った時のきのみ等の発動
                berry_in_pinch(team)
            }
        }
    }
    
    // ひんし宣言
    if (document.getElementById(team + "_HP_last").textContent == 0){
        fainted_process(team)
    }
}

function make_abnormal(def, abnormal){
    // こんらん以外は状態異常欄に追加
    if (abnormal != "こんらん"){
        document.getElementById(def + "_abnormal").textContent = abnormal
    }

    const def_poke = document.getElementById(def + "_poke").textContent
    if (abnormal == "やけど"){
        txt = def + "チームの　" + def_poke + "　は　やけどをおった！" + CR
        document.battle_log.battle_log.value += txt
    } else if (abnormal == "どく"){
        txt = def + "チームの　" + def_poke + "　は　どくをあびた！" + CR
        document.battle_log.battle_log.value += txt
    } else if (abnormal == "もうどく"){
        txt = def + "チームの　" + def_poke + "　は　もうどくをあびた！" + CR
        document.battle_log.battle_log.value += txt
        document.battle[def + "_poke_condition"].value += "もうどく　1ターン目" + CR
    } else if (abnormal == "まひ"){
        txt = def + "チームの　" + def_poke + "　は　しびれて　技が出にくくなった！" + CR
        document.battle_log.battle_log.value += txt
    } else if (abnormal == "こおり"){
        txt = def + "チームの　" + def_poke + "　は　こおりづけになった！" + CR
        document.battle_log.battle_log.value += txt
    } else if (abnormal == "ねむり"){
        txt = def + "チームの　" + def_poke + "　は　眠ってしまった！" + CR
        document.battle_log.battle_log.value += txt
        document.battle[def + "_poke_condition"].value += "ねむり　1ターン目" + CR
    } else if (abnormal == "こんらん"){
        txt = def + "チームの　" + def_poke + "　は　こんらんした！" + CR
        document.battle_log.battle_log.value += txt
        document.battle[def + "_poke_condition"].value += "こんらん　1ターン目" + CR
    }
    berry_in_abnormal(def)
}

function make_abnormal_attack_or_ability(team, text, probability, cause){
    const random = Math.random() * 100
    if (random < probability && !(grounded_check(team) && new get(team).f_con.includes("ミストフィールド"))){
        if (text == "こんらん" && new get(team).ability != "マイペース" && !new get(team).p_con.includes("こんらん") && random < probability){
            document.battle[team + "_poke_condition"].value += "こんらん　1ターン目" + CR
            if (typeof cause == "string"){
                txt = team + "チームの　" + new get(team).name + "　は　" + cause + "により　こんらんした！" + CR
                document.battle_log.battle_log.value += txt
            } else {
                txt = team + "チームの　" + new get(team).name + "　は　こんらんした！" + CR
                document.battle_log.battle_log.value += txt
            }
        } else if (new get(team).abnormal == "" && new get(team).ability != "ぜったいねむり" 
        && !(new get(team).f_con.includes("にほんばれ") && new get(team).ability == "リーフガード" && !(new get("A").ability == "エアロック" || new get("A").ability == "ノーてんき" || new get("B").ability == "エアロック" || new get("B").ability == "ノーてんき")) 
        && !(new get(team).type.includes("くさ") && new get(team).ability == "フラワーベール") && new get(team).name != "メテノ(りゅうせいのすがた)"){
            if (text == "まひ" && !new get(team).type.includes("でんき") && new get(team).ability != "じゅうなん"){
                document.getElementById(team + "_abnormal").textContent = text
                if (typeof cause == "string"){
                    txt = team + "チームの　" + new get(team).name + "　は　" + cause + "により　しびれて　技が出にくくなった！" + CR
                    document.battle_log.battle_log.value += txt
                } else {
                    txt = team + "チームの　" + new get(team).name + "　は　しびれて　技が出にくくなった！" + CR
                    document.battle_log.battle_log.value += txt
                }
            } else if (text == "どく" && !new get(team).type.includes("どく") && !new get(team).type.includes("はがね") && new get(team).ability != "めんえき" && new get(team).ability != "パステルベール"){
                document.getElementById(team + "_abnormal").textContent = text
                if (typeof cause == "string"){
                    txt = team + "チームの　" + new get(team).name + "　は　" + cause + "により　どくをあびた！" + CR
                    document.battle_log.battle_log.value += txt
                } else {
                    txt = team + "チームの　" + new get(team).name + "　は　どくをあびた！" + CR
                    document.battle_log.battle_log.value += txt
                }
            } else if (text == "もうどく" && !new get(team).type.includes("どく") && !new get(team).type.includes("はがね") && new get(team).ability != "めんえき" && new get(team).ability != "パステルベール"){
                document.getElementById(team + "_abnormal").textContent = text
                document.battle[team + "_poke_condition"].value += "もうどく　1ターン目" + CR
                if (typeof cause == "string"){
                    txt = team + "チームの　" + new get(team).name + "　は　" + cause + "により　もうどくをあびた！" + CR
                    document.battle_log.battle_log.value += txt
                } else {
                    txt = team + "チームの　" + new get(team).name + "　は　もうどくをあびた！" + CR
                    document.battle_log.battle_log.value += txt
                }
            } else if (text == "やけど" && !new get(team).type.includes("ほのお") && new get(team).ability != "みずのベール" && new get(team).ability != "すいほう"){
                document.getElementById(team + "_abnormal").textContent = text
                if (typeof cause == "string"){
                    txt = team + "チームの　" + new get(team).name + "　は　" + cause + "により　やけどをおった！" + CR
                    document.battle_log.battle_log.value += txt
                } else {
                    txt = team + "チームの　" + new get(team).name + "　は　やけどをおった！" + CR
                    document.battle_log.battle_log.value += txt
                }
            } else if (text == "こおり" && new get(team).ability != "マグマのよろい" && !new get(team).f_con.includes("にほんばれ") && !(new get("A").ability == "エアロック" || new get("A").ability == "ノーてんき" || new get("B").ability == "エアロック" || new get("B").ability == "ノーてんき")){
                document.getElementById(team + "_abnormal").textContent = text
                if (typeof cause == "string"){
                    txt = team + "チームの　" + new get(team).name + "　は　" + cause + "により　こおりづけになった！" + CR
                    document.battle_log.battle_log.value += txt
                } else {
                    txt = team + "チームの　" + new get(team).name + "　は　こおりづけになった！" + CR
                    document.battle_log.battle_log.value += txt
                }
            } else if (text == "ねむり" && !new get(team).f_con.includes("エレキフィールド") && new get(team).ability != "スイートベール" && new get(team).ability != "やるき" && new get(team).ability != "ふみん"){
                document.getElementById(team + "_abnormal").textContent = text
                document.battle[team + "_poke_condition"].value += "ねむり　1ターン目" + CR
                if (typeof cause == "string"){
                    txt = team + "チームの　" + new get(team).name + "　は　" + cause + "により　ねむってしまった！" + CR
                    document.battle_log.battle_log.value += txt
                } else {
                    txt = team + "チームの　" + new get(team).name + "　は　ねむってしまった！" + CR
                    document.battle_log.battle_log.value += txt
                }
            }
        }
        berry_in_abnormal(team)
    }
}



function berry_in_pinch(team){
    let enemy = "A"
    if (team == "A"){
        enemy = "B"
    }
    if (new get(enemy).ability != "きんちょうかん"){
        const poke = document.getElementById(team + "_poke").textContent
        const item = document.getElementById(team + "_item").textContent
        const p_con = document.battle[team + "_poke_condition"].value
        let berry_check = 0
        if (new get(team).last_HP > 0 && new get(team).last_HP <= new get(team).full_HP / 2){
            if (item == "きのみジュース"){
                HP_change_not_attack(team, 20, "+", item)
                berry_check += 2
            } else if (item == "オレンのみ"){
                berry_check += 1
                if (new get(team).ability == "じゅくせい"){
                    HP_change_not_attack(team, 20, "+", item)
                } else {
                    HP_change_not_attack(team, 10, "+", item)
                }
            } else if (item == "オボンのみ"){
                berry_check += 1
                if (new get(team).ability == "じゅくせい"){
                    HP_change_not_attack(team, Math.floor(new get(team).full_HP / 2), "+", item)
                } else {
                    HP_change_not_attack(team, Math.floor(new get(team).full_HP / 4), "+", item)
                }
            }
        } else if (new get(team).last_HP > 0){
            let HP_border = new get(team).full_HP / 4
            if (new get(team).ability == "くいしんぼう"){
                HP_border = new get(team).full_HP / 2
            }
            if (new get(team).last_HP <= HP_border){
                if (item == "フィラのみ" || item == "ウイのみ" || item == "マゴのみ" || item == "バンジのみ" || item == "イアのみ"){
                    berry_check += 1
                    if (new get(team).ability == "じゅくせい"){
                        HP_change_not_attack(team, Math.floor(new get(team).full_HP * 2 / 3), "+", item)
                    } else {
                        HP_change_not_attack(team, Math.floor(new get(team).full_HP / 3), "+", item)
                    }
                    if ((item== "フィラのみ" && (new get(team).nature == "ずぶとい" || new get(team).nature == "ひかえめ" || new get(team).nature == "おだやか" || new get(team).nature == "おくびょう")) 
                    || (item == "イアのみ" && (new get(team).nature == "さみしがり" || new get(team).nature == "おっとり" || new get(team).nature == "おとなしい" || new get(team).nature == "せっかち")) 
                    || (item == "ウイのみ" && (new get(team).nature == "いじっぱり" || new get(team).nature == "わんぱく" || new get(team).nature == "しんちょう" || new get(team).nature == "ようき")) 
                    || (item == "バンジのみ" && (new get(team).nature == "やんちゃ" || new get(team).nature == "のうてんき" || new get(team).nature == "うっかりや" || new get(team).nature == "むじゃき")) 
                    || (item == "マゴのみ" && (new get(team).nature == "ゆうかん" || new get(team).nature == "のんき" || new get(team).nature == "れいせい" || new get(team).nature == "なまいき"))){
                        if (!new get(team).p_con.includes("こんらん")){
                            make_abnormal(team, "こんらん")
                        }
                    }
                } else if (item == "チイラのみ"){
                    berry_check += 1
                    if (new get(team).ability == "じゅくせい"){
                        rank_change_not_status(team, "A", 2, 100, item)
                    } else {
                        rank_change_not_status(team, "A", 1, 100, item)
                    }
                } else if (item == "リュガのみ"){
                    berry_check += 1
                    if (new get(team).ability == "じゅくせい"){
                        rank_change_not_status(team, "B", 2, 100, item)
                    } else {
                        rank_change_not_status(team, "B", 1, 100, item)
                    }
                } else if (item == "ヤタピのみ"){
                    berry_check += 1
                    if (new get(team).ability == "じゅくせい"){
                        rank_change_not_status(team, "C", 2, 100, item)
                    } else {
                        rank_change_not_status(team, "C", 1, 100, item)
                    }
                } else if (item == "ズアのみ"){
                    berry_check += 1
                    if (new get(team).ability == "じゅくせい"){
                        rank_change_not_status(team, "D", 2, 100, item)
                    } else {
                        rank_change_not_status(team, "D", 1, 100, item)
                    }
                } else if (item == "カムラのみ"){
                    berry_check += 1
                    if (new get(team).ability == "じゅくせい"){
                        rank_change_not_status(team, "S", 2, 100, item)
                    } else {
                        rank_change_not_status(team, "S", 1, 100, item)
                    }
                } else if (item == "サンのみ" && !p_con.includes("きゅうしょアップ")){
                    berry_check += 1
                    document.battle[team + "_poke_condition"].value += "きゅうしょアップ" + CR
                    txt = team + "チームの　" + poke + "は　張り切り出した！" + CR
                    document.battle_log.battle_log.value += txt
                } else if (item == "スターのみ"){
                    berry_check += 1
                    const random = Math.random()
                    let parameter = ""
                    const convert = [[0, "A"], [0.2, "B"], [0.4, "C"], [0.6, "D"], [0.8, "S"]]
                    for (let i = 0; i < 5; i++){
                        if (random > convert[i][0]){
                            parameter = convert[i][1]
                        }
                    }
                    if (new get(team).ability == "じゅくせい"){
                        rank_change_not_status(team, parameter, 4, 100, item)
                    } else {
                        rank_change_not_status(team, parameter, 2, 100, item)
                    }
                } else if (item == "ミクルのみ"){
                    berry_check += 1
                    document.battle[team + "_poke_condition"].value += item + CR
                    txt = team + "チームの　" + poke + "は　命中率が上がった！" + CR
                    document.battle_log.battle_log.value += txt
                }
            }
        }

        if (berry_check == 1){
            set_belch(team)
            set_recycle_item(team)
            if (new get(team).ability == "ほおぶくろ"){
                HP_change_not_attack(team, Math.floor(new get(team).full_HP / 3), "+", "ほおぶくろ")
            }
        } else if (berry_check == 2){
            set_recycle_item(team)
        }
    }
}

function berry_in_abnormal(team){
    let enemy = "A"
    if (team == "A"){
        enemy = "B"
    }
    if (new get(enemy).ability != "きんちょうかん"){
        if ((new get(team).abnormal == "やけど" && new get(team).item == "チーゴのみ") 
        || (new get(team).abnormal.includes("どく") && new get(team).item == "モモンのみ") 
        || (new get(team).abnormal == "まひ" && new get(team).item == "クラボのみ") 
        || (new get(team).abnormal == "ねむり" && new get(team).item == "カゴのみ") 
        || (new get(team).abnormal == "こおり" && new get(team).item == "ナナシのみ") 
        || (new get(team).p_con == "こんらん" && new get(team).item == "キーのみ") 
        || ((new get(team).abnormal != "" || new get(team).p_con == "こんらん") && new get(team).item == "ラムのみ")){
            if (new get(team).item == "キーのみ"){
                condition_remove(team, "poke", "こんらん")
            } else {
                document.getElementById(team + "_abnormal").textContent = ""
                if (new get(team).item == "モモンのみ"){
                    condition_remove(team, "poke", "もうどく")
                } else if (new get(team).item == "カゴのみ"){
                    condition_remove(team, "poke", "ねむり")
                    condition_remove(team, "poke", "ねむる")
                } else if (new get(team).item == "ラムのみ"){
                    condition_remove(team, "poke", "こんらん")
                    condition_remove(team, "poke", "ねむり")
                    condition_remove(team, "poke", "ねむる")
                }
            }
            txt = team + "チームの　" + new get(team).name + "　は　" + new get(team).item + "を　食べて状態異常が治った！" + CR
            document.battle_log.battle_log.value += txt
            set_recycle_item(team)
            set_belch(team)
            if (new get(team).ability == "ほおぶくろ"){
                HP_change_not_attack(team, Math.floor(new get(team).full_HP / 3), "+", "ほおぶくろ")
            }
        }
    }
}

function fainted_process(team){
    let enemy = "B"
    if (team == "B"){
        enemy = "A"
    }

    txt = team + "チームの　" + new get(team).name + "　は　たおれた　!" + CR
    document.battle_log.battle_log.value += txt
    document.battle[team + "_poke_condition"].value = ""
    document.battle[team + "_field_condition"].value += "ひんし" + CR

    
    document.getElementById(team + "_" + battle_poke_num(team) + "_item").textContent = document.getElementById(team + "_item").textContent
    document.getElementById(team + "_" + battle_poke_num(team) + "_abnormal").textContent = document.getElementById(team + "_abnormal").textContent
    document.getElementById(team + "_" + battle_poke_num(team) + "_button").disabled = true
    document.getElementById(team + "_" + battle_poke_num(team) + "_existence").textContent = "ひんし"

    condition_remove(enemy, "poke", "メロメロ")

    document.battle[team + "_used_move"].value = ""

    if (new get(enemy).ability == "ソウルハート" && !new get(enemy).p_con.includes("ひんし")){
        rank_change_not_status(enemy, "C", 1, 100, "ソウルハート")
    }
}

function set_recycle_item(team){
    for (let i = 0; i < 3; i++){
        if (document.getElementById(team + "_" + i + "_existence").textContent == "戦闘中"){
            document.getElementById(team + "_" + i + "_recycle").textContent = new get(team).item
            break
        }
    }
    document.getElementById(team + "_item").textContent = ""
    if (new get(team).ability == "かるわざ"){
        document.battle[team + "_poke_condition"].value += "かるわざ" + CR
    }
}

function set_belch(team){
    for (let i = 0; i < 3; i++){
        if (document.getElementById(team + "_" + i + "_existence").textContent == "戦闘中"){
            document.getElementById(team + "_" + i + "_belch").textContent = "ゲップ"
        }
    }
}

// フォルムチェンジ
function form_chenge(team, name){
    poke = poke_search(name)
    txt = team + "チームの　" + new get(team).name + "　は　" + poke[1] + "　に　なった!" + CR
    document.battle_log.battle_log.value += txt
    const rate = nature_check(new get(team).nature)
    for (let i = 0; i < 3; i++){
        if (document.getElementById(team + "_" + i + "_existence").textContent == "戦闘中"){
            // 実数値の書き換え
            const parameter = ["A", "B", "C", "D", "S"]
            for (let k = 0; k < 5; k++){
                let BS = Number(poke[k + 3])
                let IV = Number(document.getElementById(team + "_" + i + "_" + parameter[k] + "_IV").textContent)
                let EV = Number(document.getElementById(team + "_" + i + "_" + parameter[k] + "_EV").textContent)
                let AV = parseInt((parseInt(((BS*2 + IV + parseInt(EV/4)) * new get(team).level)/100) + 5) * rate[k])
                document.getElementById(team + "_" + parameter[k] + "_AV").textContent = AV
                document.getElementById(team + "_" + i + "_" + parameter[k] + "_AV").textContent = AV
            }
            // H実数値の書き換え
            if (poke[1] == "ジガルデ(パーフェクトフォルム)"){
                const dif_H = 216 - poke_search(new get(team).name)[2]
                document.getElementById(team + "_HP").textContent = new get(team).full_HP + Math.floor(dif_H * 2 * new get(team).level / 100)
                document.getElementById(team + "_HP_last").textContent = new get(team).last_HP + Math.floor(dif_H * 2 * new get(team).level / 100)
                document.getElementById(team + "_" + i + "_full_HP").textContent = document.getElementById(team + "_HP").textContent
                document.getElementById(team + "_" + i + "_last_HP").textContent = document.getElementById(team + "_HP_last").textContent
            }
            // 名前の書き換え
            document.getElementById(team + "_poke").textContent = poke[1]
            document.getElementById(team + "_" + i + "_name").textContent = poke[1]

            // 特性の書き換え
            if (new get(team).name.includes("ヒヒダルマ")){
                document.getElementById(team + "_ability").textContent = "ダルマモード"
                document.getElementById(team + "_" + i + "_ability").textContent = "ダルマモード"
            } else {
                document.getElementById(team + "_ability").textContent = poke[15]
                document.getElementById(team + "_" + i + "_ability").textContent = poke[15]
            }

            // タイプの書き換え
            if (poke[10] == ""){
                document.getElementById(team + "_type").textContent = poke[9]
                document.getElementById(team + "_" + i + "_type").textContent = poke[9]
            } else {
                document.getElementById(team + "_type").textContent = poke[9] + "、" + poke[10]
                document.getElementById(team + "_" + i + "_type").textContent = poke[9] + "、" + poke[10]
            }
        }
    }
    // 特性の発動
    summon_pokemon(1, team)
    // 画像の設定
    for (let i = 0; i < pokemon.length; i++){
        if (new get(team).name == pokemon[i][1]){
            document.getElementById(team + "_image").src = "poke_figure/" + pokemon[i][0] + ".gif"
        }
    }
}

// 特性の入れ替え
function change_ability(copy, org, num, ability){
    // copy：コピーされるチーム
    // org：コピーするチーム
    // num：対象のポケモンの数　1ならorgがcopyをコピーする　2なら両方を入れ替える 3ならcopyチームの特性をabilityにする
    if (num == 1){
        let copy_ability = document.getElementById(copy + "_ability").textContent
        for (let i = 0; i < new get(copy).p_len; i++){
            if (new get(copy).p_list[i].includes("特性なし")){
                copy_ability = new get(copy).p_list[i].slice(5)
            } else if (new get(copy).p_list[i].includes("かがくへんかガス")){
                copy_ability = new get(copy).p_list[i].slice(9)
            }
        }
        txt = org + "チームの　" + new get(org).name + "　の　特性が　" + copy_ability + "に　なった"  + CR
        document.battle_log.battle_log.value += txt
        condition_remove(org, "poke", "スロースタート　")
        document.getElementById(org + "_ability").textContent = copy_ability
        const p_con = document.battle[org + "_poke_condition"].value
        document.battle[org + "_poke_condition"].value = ""
        for (let i = 0; i < p_con.split("\n").length - 1; i++){
            if (p_con.split("\n")[i].includes("特性なし")){
                document.battle[org + "_poke_condition"].value += "特性なし：" + copy_ability + CR
                document.getElementById(org + "_ability").textContent = ""
            } else if (p_con.split("\n")[i].includes("かがくへんかガス")){
                document.battle[org + "_poke_condition"].value += "かがくへんかガス：" + copy_ability + CR
                document.getElementById(org + "_ability").textContent = ""
            } else {
                document.battle[org + "_poke_condition"].value = p_con.split("\n")[i] + CR
            }
        }
        summon_pokemon(1, org)
    } else if (num == 2){
        txt = "お互いの　特性を入れ替えた！" + CR
        document.battle_log.battle_log.value += txt
        let copy_ability = document.getElementById(copy + "_ability").textContent
        for (let i = 0; i < new get(copy).p_len; i++){
            if (new get(copy).p_list[i].includes("特性なし")){
                copy_ability = new get(copy).p_list[i].slice(5)
            } else if (new get(copy).p_list[i].includes("かがくへんかガス")){
                copy_ability = new get(copy).p_list[i].slice(9)
            }
        }
        let org_ability = document.getElementById(org + "_ability").textContent
        for (let i = 0; i < new get(org).p_len; i++){
            if (new get(org).p_list[i].includes("特性なし")){
                org_ability = new get(org).p_list[i].slice(5)
            } else if (new get(org).p_list[i].includes("かがくへんかガス")){
                org_ability = new get(org).p_list[i].slice(9)
            }
        }
        condition_remove(org, "poke", "スロースタート　")
        document.getElementById(copy + "_ability").textContent = org_ability
        const copy_p_con = document.battle[copy + "_poke_condition"].value
        document.battle[copy + "_poke_condition"].value = ""
        for (let i = 0; i < copy_p_con.split("\n").length - 1; i++){
            if (copy_p_con.split("\n")[i].includes("特性なし")){
                document.battle[copy + "_poke_condition"].value += "特性なし：" + org_ability + CR
                document.getElementById(copy + "_ability").textContent = ""
            } else if (copy_p_con.split("\n")[i].includes("かがくへんかガス")){
                document.battle[copy + "_poke_condition"].value += "かがくへんかガス：" + org_ability + CR
                document.getElementById(copy + "_ability").textContent = ""
            } else {
                document.battle[copy + "_poke_condition"].value = copy_p_con.split("\n")[i] + CR
            }
        }
        condition_remove(copy, "poke", "スロースタート　")
        document.getElementById(org + "_ability").textContent = copy_ability
        const org_p_con = document.battle[org + "_poke_condition"].value
        document.battle[org + "_poke_condition"].value = ""
        for (let i = 0; i < org_p_con.split("\n").length - 1; i++){
            if (org_p_con.split("\n")[i].includes("特性なし")){
                document.battle[org + "_poke_condition"].value += "特性なし：" + copy_ability + CR
                document.getElementById(org + "_ability").textContent = ""
            } else if (org_p_con.split("\n")[i].includes("かがくへんかガス")){
                document.battle[org + "_poke_condition"].value += "かがくへんかガス：" + copy_ability + CR
                document.getElementById(org + "_ability").textContent = ""
            } else {
                document.battle[org + "_poke_condition"].value = org_p_con.split("\n")[i] + CR
            }
        }
        summon_pokemon(2, "all")
    } else if (num == 3){
        txt = copy + "チームの　" + new get(copy).name + "の　特性が　" + ability + "に　なった！" + CR
        document.battle_log.battle_log.value += txt
        condition_remove(copy, "poke", "スロースタート　")
        document.getElementById(copy + "_ability").textContent = ability
        const copy_p_con = document.battle[copy + "_poke_condition"].value
        document.battle[copy + "_poke_condition"].value = ""
        for (let i = 0; i < copy_p_con.split("\n").length - 1; i++){
            if (copy_p_con.split("\n")[i].includes("特性なし")){
                document.battle[copy + "_poke_condition"].value += "特性なし：" + ability + CR
                document.getElementById(copy + "_ability").textContent = ""
            } else if (copy_p_con.split("\n")[i].includes("かがくへんかガス")){
                document.battle[copy + "_poke_condition"].value += "かがくへんかガス：" + ability + CR
                document.getElementById(copy + "_ability").textContent = ""
            } else {
                document.battle[copy + "_poke_condition"].value = copy_p_con.split("\n")[i] + CR
            }
        }
        summon_pokemon(1, copy)
    }
}