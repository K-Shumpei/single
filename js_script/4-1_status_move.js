// 変化技の効果処理
function status_move_effect(atk, def, atk_poke, def_poke, move){
    // ランク変化のみ
    rank_change_only_status_move(atk, def, move)
    // ランク変化 + その他の効果のある技
    if (rank_change_etc_status_move(atk, def, move)){return true}
    // 状態異常のみ
    make_abnormal_only_status_move(def, move)
    // 全体の場へ効果をもたらす技
    all_field_status_move(atk, move)
    // 自分の場へ効果をもたらす技
    self_field_status_move(atk, move)
    // 相手の場へ効果をもたらす技
    enemy_field_status_move(def, move)
    // 自分の状態を変化させる技
    self_poke_status_move(atk, atk_poke, move)
    // 相手の状態を変化させる技
    enemy_poke_status_move(atk, def, def_poke, move)
    // 回復系の技
    recover_status_move(atk, def, move)
    // その他の技
    other_status_move(atk, def, move)

}

// ランク変化のみ
function rank_change_only_status_move(atk, def, move){
    for (let i = 0; i < rank_change_status_move_list.length; i++){
        if (move[0] == rank_change_status_move_list[i][0]){
            let team = rank_change_status_move_list[i][1]
            if (team == "s"){
                team = atk
            } else if (team == "e"){
                team = def
            }
            for (let j = 2; j < rank_change_status_move_list[i].length; j++){
                let parameter = rank_change_status_move_list[i][j][0]
                let change = rank_change_status_move_list[i][j][1]
                rank_change(team, parameter, change)
            }
        }
    }
    white_herb(atk)
    white_herb(def)
}

// ランク変化 + その他の効果のある技
function rank_change_etc_status_move(atk, def, move){
    const atk_poke = document.getElementById(atk + "_poke").textContent
    const atk_type = document.getElementById(atk + "_type").textContent
    const def_type = document.getElementById(def + "_type").textContent
    const def_abnormal = document.getElementById(def + "_abnormal").textContent
    const atk_f_con = document.battle[atk + "_field_condition"].value
    const atk_full_HP = Number(document.getElementById(atk + "_HP").textContent)
    const atk_HP_last = Number(document.getElementById(atk + "_HP_last").textContent)
    if (move[0] == "いばる"){
        rank_change(def, "A", 2)
        make_abnormal_attack_or_ability(def, "こんらん", 100, move)
    } else if (move[0] == "おだてる"){
        rank_change(def, "C", 1)
        make_abnormal_attack_or_ability(def, "こんらん", 100, move)
    } else if (move[0] == "すてゼリフ" || move[0] == "テレポート"){
        come_back_pokemon(atk)
        document.battle[atk + "_field_condition"].value += "選択中・・・" + CR
        txt = atk + "チームは　戦闘に出すポケモンを選んでください" + CR
        document.battle_log.battle_log.value += txt
        return true
    } else if (move[0] == "せいちょう"){
        if (atk_f_con.includes("にほんばれ") && new get(atk).item != "ばんのうがさ" && !(new get("A").ability == "エアロック" || new get("A").ability == "ノーてんき" || new get("B").ability == "エアロック" || new get("B").ability == "ノーてんき")){
            rank_change(atk, "A", 2)
            rank_change(atk, "C", 2)
        } else {
            rank_change(atk, "A", 1)
            rank_change(atk, "C", 1)
        }
    } else if (move[0] == "ソウルビート"){
        document.getElementById(atk + "_HP_last").textContent = atk_HP_last - Math.floor(atk_full_HP / 3)
        txt = atk + "チームの　" + atk_poke + "は　体力を削って力を得た！" + CR
        document.battle_log.battle_log.value += txt
        for (const i of ["A", "B", "C", "D", "S"]){
            rank_change(atk, i, 1)
        }
        if (new get(atk).item == "のどスプレー" && music_move_list.includes(move[0]) && new get(atk).C_rank < 6){
            rank_change_not_status(atk, "C", 1, 100, "のどスプレー")
            set_recycle_item(atk)
        }
    } else if (move[0] == "たがやす"){
        if (atk_type.includes("くさ") && grounded_check(atk)){
            rank_change(atk, "A", 1)
            rank_change(atk, "C", 1)
        }
        if (def_type.includes("くさ") && grounded_check(def)){
            rank_change(def, "A", 1)
            rank_change(def, "C", 1)
        }
    } else if (move[0] == "つぼをつく"){
        const random = Math.random()
        const parameter = [["A", 0], ["B", 1/7], ["C", 2/7], ["D", 3/7], ["S", 4/7], ["accuracy", 5/7], ["evasiveness", 6/7]]
        let check = ""
        for (let i = 0; i < 7; i++){
            if (random > parameter[i][1]){
                check = parameter[i][0]
            }
        }
        rank_change(atk, check, 2)
    } else if (move[0] == "どくのいと") {
        rank_change(def, "S", -1)
        if (!def_type.includes("どく") && def_abnormal == ""){
            make_abnormal(def, "どく")
        }
    } else if (move[0] == "はらだいこ"){
        HP_change(atk, Math.floor(atk_full_HP / 2), "-")
        txt = atk + "チームの　" + atk_poke + "は　体力を削ってパワー全開！" + CR
        document.battle_log.battle_log.value += txt
        document.getElementById(atk + "_rank_A").textContent = 6
    } else if (move[0] == "バトンタッチ"){
        const atk_p_con = document.battle[atk + "_poke_condition"].value
        const rank = new get(atk).A_rank + "/" + new get(atk).B_rank + "/" + new get(atk).C_rank + "/" + new get(atk).D_rank 
        + "/" + new get(atk).S_rank + "/" + new get(atk).accuracy_rank + "/" + new get(atk).evasiveness_rank + CR
        come_back_pokemon(atk)
        for (let i = 0; i < atk_p_con.split("\n").length; i++){
            for (let j = 0; j < baton_pass_condition_list.length; j++){
                if (atk_p_con.split("\n")[i].includes(baton_pass_condition_list[j])){
                    document.battle[atk + "_poke_condition"].value += atk_p_con.split("\n")[i] + CR
                }
            }
        }
        document.battle[atk + "_poke_condition"].value += "バトンタッチ：" + rank
        document.battle[atk + "_field_condition"].value += "選択中・・・" + CR
        txt = atk + "チームは　戦闘に出すポケモンを選んでください" + CR
        document.battle_log.battle_log.value += txt
        return true
    } else if (move[0] == "フラワーガード"){
        if (atk_type.includes("くさ")){
            rank_change(atk, "B", 1)
        }
        if (def_type.includes("くさ")){
            rank_change(def, "B", 1)
        }
    } else if (move[0] == "ほおばる"){
        eating_berry_effect(atk, new get(atk).item)
        rank_change(atk, "B", 2)
    }
    white_herb(atk)
    white_herb(def)
}


// 状態異常のみ
function make_abnormal_only_status_move(def, move){
    for (let i = 0; i < abnormal_status_move_list.length; i++){
        if (move[0] == abnormal_status_move_list[i][0]){
            let abnormal = abnormal_status_move_list[i][1]
            make_abnormal(def, abnormal)
        }
    }
}


// 自分の場へ効果をもたらす技
function self_field_status_move(atk, move){
    const atk_item = document.getElementById(atk + "_item").textContent
    for (let i = 0; i < self_field_status_move_list.length; i++){
        if (move[0] == self_field_status_move_list[i][0]){
            document.battle_log.battle_log.value += self_field_status_move_list[i][1] + CR
            if (self_field_status_move_list[i][2] == "おいかぜ"){
                document.battle[atk + "_field_condition"].value += "おいかぜ　4/4" + CR
            } else if (self_field_status_move_list[i][2] == "壁"){
                if (atk_item == "ひかりのねんど"){
                    document.battle[atk + "_field_condition"].value += move[0] + "　8/8" + CR
                } else {
                    document.battle[atk + "_field_condition"].value += move[0] + "　5/5" + CR
                }
            } else {
                document.battle[atk + "_field_condition"].value += move[0] + "　5/5" + CR
            }
        }
    }
}

// 相手の場へ効果をもたらす技
function enemy_field_status_move(def, move){
    for (let i = 0; i < enemy_field_status_move_list.length; i++){
        if (move[0] == enemy_field_status_move_list[i][0]){
            txt = enemy_field_status_move_list[i][1] + CR
            document.battle_log.battle_log.value += txt
            const condition = document.battle[def + "_field_condition"].value
            if (move[0] == "どくびし"){
                if (condition.includes("どくびし　1回目")){
                    document.battle[def + "_field_condition"].value = ""
                    for (let j = 0; j < condition.split("\n").length - 1; j++){
                        if (condition.split("\n")[j] == "どくびし　1回目"){
                            document.battle[def + "_field_condition"].value += "どくびし　2回目" + CR
                        } else {
                            document.battle[def + "_field_condition"].value += condition.split("\n")[j] + CR
                        }
                    }
                } else {
                    document.battle[def + "_field_condition"].value += "どくびし　1回目" + CR
                }
            } else if (move[0] == "まきびし"){
                if (condition.includes("まきびし")){
                    document.battle[def + "_field_condition"].value = ""
                    for (let j = 0; j < condition.split("\n").length - 1; j++){
                        if (condition.split("\n")[j] == "まきびし　1回目"){
                            document.battle[def + "_field_condition"].value += "まきびし　2回目" + CR
                        } else if (condition.split("\n")[j] == "まきびし　2回目"){
                            document.battle[def + "_field_condition"].value += "まきびし　3回目" + CR
                        } else {
                            document.battle[def + "_field_condition"].value += condition.split("\n")[j] + CR
                        }
                    }
                } else {
                    document.battle[def + "_field_condition"].value += "まきびし　1回目" + CR
                }
            } else {
                document.battle[def + "_field_condition"].value += move[0] + CR
            }
        }
    }
}

// 自分の状態を変化させる技
function self_poke_status_move(atk, atk_poke, move){
    const atk_p_con = document.battle[atk + "_poke_condition"].value
    const atk_full_HP = Number(document.getElementById(atk + "_HP").textContent)
    const atk_HP_last = Number(document.getElementById(atk + "_HP_last").textContent)
    for (let i = 0; i < self_change_status_move_list.length; i++){
        if (move[0] == self_change_status_move_list[i][0]){
            document.battle_log.battle_log.value += atk + "チームの　" + atk_poke + "は　"
            if (move[0] == "じゅうでん"){
                rank_change(atk, "D", 1)
                if (!atk_p_con.includes("じゅうでん")){
                    document.battle[atk + "_poke_condition"].value += "じゅうでん　開始" + CR
                }
            } else if (move[0] == "たくわえる"){
                rank_change(atk, "B", 1)
                rank_change(atk, "D", 1)
                if (atk_p_con.includes("たくわえる")){
                    document.battle[atk + "_poke_condition"].value = ""
                    if (atk_p_con.includes("たくわえる　1回目")){
                        for (let j = 0; j < atk_p_con.split("\n").length - 1; j++){
                            if (atk_p_con.split("\n")[j].includes("たくわえる")){
                                document.battle[atk + "_poke_condition"].value += "たくわえる　2回目" + CR
                                document.battle_log.battle_log.value += "2つ　"
                            } else {
                                document.battle[atk + "_poke_condition"].value += atk_p_con.split("\n")[j] + CR
                            }
                        }
                    } else if (atk_p_con.includes("たくわえる　2回目")){
                        for (let j = 0; j < atk_p_con.split("\n").length - 1; j++){
                            if (atk_p_con.split("\n")[j].includes("たくわえる")){
                                document.battle[atk + "_poke_condition"].value += "たくわえる　3回目" + CR
                                document.battle_log.battle_log.value += "3つ　"
                            } else {
                                document.battle[atk + "_poke_condition"].value += atk_p_con.split("\n")[j] + CR
                            }
                        }
                    }
                } else {
                    document.battle[atk + "_poke_condition"].value += "たくわえる　1回目" + CR
                    document.battle_log.battle_log.value += "1つ　"
                }
    
            } else if (move[0] == "はいすいのじん"){
                for (const j of ["A", "B", "C", "D", "S"]){
                    rank_change(atk, j, 1)
                    if (!new get(atk).p_con.includes("はいすいのじん")){
                        document.battle[atk + "_poke_condition"].value += "逃げられない：はいすいのじん" + CR
                    }
                }
            } else if (move[0] == "まるくなる"){
                rank_change(atk, "B", 1)
                if (!atk_p_con.includes("まるくなる")){
                    document.battle[atk + "_poke_condition"].value += "まるくなる" + CR
                }
            } else if (move[0] == "パワートリック"){
                const A_AV = new get(atk).A_AV
                const B_AV = new get(atk).B_AV
                document.getElementById(atk + "_A_AV").textContent = B_AV
                document.getElementById(atk + "_B_AV").textContent = A_AV
                if (atk_p_con.includes("パワートリック")){
                    txt = "自分の攻撃と防御を　元に戻した！" + CR
                    document.battle_log.battle_log.value += txt
                    document.battle[atk + "_poke_condition"].value = ""
                    for (let i = 0; i < atk_p_con.split("\n").length - 1; i++){
                        if (atk_p_con.split("\n")[i] != "パワートリック"){
                            document.battle[atk + "_poke_condition"].value += atk_p_con.split("\n")[i] + CR
                        }
                    }
                } else {
                    txt = "自分の攻撃と防御を　入れ替えた！" + CR
                    document.battle_log.battle_log.value += txt
                    document.battle[atk + "_poke_condition"].value += "パワートリック" + CR
                }
            } else if (move[0] == "みがわり"){
                // バインド状態の解除
                document.battle[atk + "_poke_condition"].value = ""
                for (let i = 0; i < atk_p_con.split("\n").length - 1; i++){
                    if (!atk_p_con.split("\n")[i].includes("バインド")){
                        document.battle[atk + "_poke_condition"].value += atk_p_con.split("\n")[i] + CR
                    }
                }
                // 身代わりの発生
                const substitute_HP = Math.floor(atk_full_HP / 4)
                document.getElementById(atk + "_HP_last").textContent = atk_HP_last - substitute_HP
                document.battle[atk + "_poke_condition"].value += "みがわり：" + substitute_HP + "/" + substitute_HP + CR
            } else if (move[0] == "ボディパージ"){
                rank_change(atk, "S", 2)
                if (atk_p_con.includes("ボディパージ")){
                    document.battle[atk + "_poke_condition"].value = ""
                    for (let j = 0; j < atk_p_con.split("\n").length - 1; j++){
                        if (atk_p_con.split("\n")[j].includes("ボディパージ")){
                            const num = Number(atk_p_con.split("\n")[j].replace(/[^0-9]/g, "")) + 1
                            document.battle[atk + "_poke_condition"].value += "ボディパージ　" + num + "回目" + CR
                        } else {
                            document.battle[atk + "_poke_condition"].value += atk_p_con.split("\n")[j] + CR
                        }
                    }
                } else {
                    document.battle[atk + "_poke_condition"].value += "ボディパージ　1回目" + CR
                }
            } else {
                if (!atk_p_con.includes(move[0])){
                    document.battle[atk + "_poke_condition"].value += self_change_status_move_list[i][1] + CR
                }
            }
            document.battle_log.battle_log.value += self_change_status_move_list[i][2] + CR
        }
    }
}

// 相手の状態を変化させる技
function enemy_poke_status_move(atk, def, def_poke, move){
    const atk_type = document.getElementById(atk + "_type").textContent
    const def_ability = document.getElementById(def + "_ability").textContent
    const atk_full_HP = Number(document.getElementById(atk + "_HP").textContent)
    for (let i = 0; i < enemy_change_status_move_list.length; i++){
        if (move[0] == enemy_change_status_move_list[i][0]){
            if (move[0] == "のろい" && !atk_type.includes("ゴースト")){
                rank_change(atk, "A", 1)
                rank_change(atk, "B", 1)
                rank_change(atk, "S", -1)
                white_herb(atk)
            } else {
                if (move[0] == "アンコール"){
                    document.battle[def + "_poke_condition"].value += "アンコール　3/3：" + document.battle[def + "_used_move"].value + CR
                } else if (move[0] == "いえき"){
                    if (new get(def).ability != ""){
                        document.battle[def + "_poke_condition"].value += "特性なし：" + def_ability + CR
                        document.getElementById(def + "_ability").textContent = ""
                    } else {
                        for (let i = 0; i < new get(def).p_len; i++){
                            if (new get(def).p_list[i].includes("かがくへんかガス")){
                                document.battle[def + "_poke_condition"].value += "特性なし：" + new get(def).p_list[i].slice(9) + CR
                            }
                        }
                    }
                } else if (move[0] == "かなしばり"){
                    document.battle[def + "_poke_condition"].value += "かなしばり　4/4：" + document.battle[def + "_used_move"].value + CR
                } else if (move[0] == "たこがため"){
                    document.battle[def + "_poke_condition"].value += "たこがため" + CR
                    document.battle[def + "_poke_condition"].value += "逃げられない" + CR
                } else if (move[0] == "のろい"){
                    document.battle[def + "_poke_condition"].value += "のろい" + CR
                    HP_change_not_attack(atk, Math.floor(atk_full_HP / 2), "-", "のろい")
                } else {
                    document.battle[def + "_poke_condition"].value += enemy_change_status_move_list[i][1] + CR
                }
                txt = def + "チームの　" + def_poke + "は　" + enemy_change_status_move_list[i][2] + CR
                document.battle_log.battle_log.value += txt
                if (new get(def).item == "メンタルハーブ" && (new get(def).p_con.includes("アンコール") || new get(def).p_con.includes("いちゃもん") || new get(def).p_con.includes("かいふくふうじ") 
                || new get(def).p_con.includes("かなしばり") || new get(def).p_con.includes("ちょうはつ") || new get(def).p_con.includes("メロメロ"))){
                    condition_remove(def, "poke", "アンコール")
                    condition_remove(def, "poke", "いちゃもん")
                    condition_remove(def, "poke", "かいふくふうじ")
                    condition_remove(def, "poke", "かなしばり")
                    condition_remove(def, "poke", "ちょうはつ")
                    condition_remove(def, "poke", "メロメロ")
                    set_recycle_item(def)
                    txt = def + "チームの　" + new get(def).name + "の　メンタルハーブが発動した" + CR
                    document.battle_log.battle_log.value += txt
                }
                if (move[0] == "メロメロ" && new get(def).item == "あかいいと"){
                    txt = def + "チームの　" + new get(def).name + "の　あかいいとが発動した" + CR
                    document.battle_log.battle_log.value += txt
                    document.battle[atk + "_poke_condition"].value += "メロメロ" + CR
                    txt = atk + "チームの　" + new get(atk).name + "は　メロメロになった" + CR
                    document.battle_log.battle_log.value += txt
                    if (new get(atk).item == "メンタルハーブ"){
                        condition_remove(atk, "poke", "メロメロ")
                        set_recycle_item(atk)
                        txt = atk + "チームの　" + new get(atk).name + "の　メンタルハーブが発動した" + CR
                        document.battle_log.battle_log.value += txt
                    }
                }
            }
        }
    }
}

// 回復系の技
function recover_status_move(atk, def, move){
    const atk_full_HP = Number(document.getElementById(atk + "_HP").textContent)
    const def_full_HP = Number(document.getElementById(def + "_HP").textContent)
    const atk_HP_last = Number(document.getElementById(atk + "_HP_last").textContent)
    const atk_p_con = document.battle[atk + "_poke_condition"].value
    const atk_f_con = document.battle[atk + "_field_condition"].value
    const atk_poke = document.getElementById(atk + "_poke").textContent
    const def_poke = document.getElementById(def + "_poke").textContent
    const def_abnormal = document.getElementById(def + "_abnormal").textContent
    const atk_abnormal = document.getElementById(atk + "_abnormal").textContent
    const atk_ability = document.getElementById(atk + "_ability").textContent
    const atk_type = document.getElementById(atk + "_type").textContent

    if (recover_status_move_list.includes(move[0])){
        if (move[0] == "かいふくしれい" || move[0] == "じこさいせい" || move[0] == "タマゴうみ" || move[0] == "なまける" || move[0] == "はねやすめ" || move[0] == "ミルクのみ"){
            HP_change(atk, Math.ceil(atk_full_HP / 2), "+")
            if (move[0] == "はねやすめ" && atk_type.includes("ひこう")){
                document.battle[atk + "_poke_condition"].value += "はねやすめ：" + atk_type + CR
                document.getElementById(atk + "_type").textContent = atk_type.replace("ひこう", "")
                if (document.getElementById(atk + "_type").textContent == ""){
                    document.getElementById(atk + "_type").textContent = "ノーマル"
                }
            }
        } else if (move[0] == "あさのひざし" || move[0] == "こうごうせい" || move[0] == "つきのひかり"){
            if (atk_f_con.includes("にほんばれ") && new get(atk).item != "ばんのうがさ" && !(new get("A").ability == "エアロック" || new get("A").ability == "ノーてんき" || new get("B").ability == "エアロック" || new get("B").ability == "ノーてんき")){
                HP_change(atk, five_cut(atk_full_HP * 2732 / 4096), "+")
            } else if ((atk_f_con.includes("あめ") && new get(atk).item != "ばんのうがさ") || atk_f_con.includes("すなあらし") || atk_f_con.includes("あられ") && !(new get("A").ability == "エアロック" || new get("A").ability == "ノーてんき" || new get("B").ability == "エアロック" || new get("B").ability == "ノーてんき")){
                HP_change(atk, five_cut(atk_full_HP / 4), "+")
            } else {
                HP_change(atk, five_cut(atk_full_HP / 2), "+")
            }
        } else if (move[0] == "すなあつめ"){
            if (atk_f_con.includes("すなあらし")){
                HP_change(atk, five_cut(atk_full_HP * 2732 / 4096), "+")
            } else {
                HP_change(atk, five_cut(atk_full_HP / 2), "+")
            }
        } else if (move[0] == "フラワーヒール"){
            if (atk_f_con.includes("グラスフィールド")){
                HP_change(def, five_cut(def_full_HP * 2732 / 4096), "+")
            } else {
                HP_change(def, five_cut(def_full_HP / 2), "+")
            }
        } else if (move[0] == "じょうか"){
            txt = def + "チームの　" + def_poke + "は　" + def_abnormal + "が　なおった！" + CR
            document.battle_log.battle_log.value += txt
            document.getElementById(def + "_abnormal").textContent = ""
                HP_change(atk, Math.floor(atk_full_HP / 2), "+")
        } else if (move[0] == "ちからをすいとる"){
            let recover = 0
            if (new get(def).A_rank > 0){
                recover = Math.floor(new get(def).A_AV * (new get(def).A_rank + 2) / 2)
            } else {
                recover = Math.floor(new get(def).A_AV * 2 / (2 - new get(def).A_rank))
            }
            if (new get(def).ability == "ミラーアーマー"){
                txt = def + "チームの　" + def_poke + "　の　ミラーアーマーが　発動した！" + CR
                document.battle_log.battle_log.value += txt
                rank_change(atk, "A", -1)
                white_herb(atk)
            } else {
                rank_change(def, "A", -1)
                white_herb(def)
            }
            if (new get(def).ability == "ヘドロえき"){
                HP_change(atk, recover, "-")
            } else {
                HP_change(atk, recover, "+")
            }
        } else if (move[0] == "のみこむ"){
            let recover = atk_full_HP
            let num = 0
            if (atk_p_con.includes("たくわえる　1回目")){
                recover = five_cut(recover / 4)
                num = -1
            } else if (atk_p_con.includes("たくわえる　2回目")){
                recover = five_cut(recover / 2)
                num = -2
            } else if (atk_p_con.includes("たくわえる　3回目")){
                recover = five_cut(recover)
                num = -3
            }
            HP_change(atk, recover, "+")
            rank_change(atk, "B", num)
            rank_change(atk, "D", num)
            txt = atk + "チームの　" + atk_poke + "は　たくわえが　なくなった！" + CR
            document.battle_log.battle_log.value += txt
            document.battle[atk + "_poke_condition"].value = ""
            for (let i = 0; i < atk_p_con.split("\n").length - 1; i++){
                if (!atk_p_con.split("\n")[i].includes("たくわえる")){
                    document.battle[atk + "_poke_condition"].value += atk_p_con.split("\n")[i] + CR
                }
            }
        } else if (move[0] == "ねむる"){
            document.getElementById(atk + "_abnormal").textContent = "ねむり"
            document.battle[atk + "_poke_condition"].value += "ねむる　2/2" + CR
            HP_change(atk, atk_full_HP, "+")
            txt = atk + "チームの　" + atk_poke + "は　眠って元気になった！" + CR
            document.battle_log.battle_log.value += txt
        } else if (move[0] == "ねがいごと"){
            document.battle[atk + "_field_condition"].value += "ねがいごと　" + Math.floor(atk_full_HP / 2) + "回復：ねがいごと宣言ターン" + CR
            txt = atk + "チームの　" + atk_poke + "は　願い事をした！" + CR
            document.battle_log.battle_log.value += txt
        } else if (move[0] == "いやしのすず"){
            if (atk_abnormal == "やけど" || atk_abnormal.includes("どく") || atk_abnormal == "まひ"){
                document.getElementById(atk + "_abnormal").textContent = ""
                document.battle_log.battle_log.value += "鈴の音が響き渡った！" + CR
                txt = atk + "チームの　" + atk_poke + "は　" + atk_abnormal + "が　治った！" + CR
                document.battle_log.battle_log.value += txt
            }
        } else if (move[0] == "アロマセラピー" || move[0] == "リフレッシュ"){
            if (atk_abnormal != ""){
                document.getElementById(atk + "_abnormal").textContent = ""
                document.battle_log.battle_log.value += "心地よい香りが広がった！" + CR
                txt = atk + "チームの　" + atk_poke + "は　" + atk_abnormal + "が　治った！" + CR
                document.battle_log.battle_log.value += txt
            }
        } else if (move[0] == "いやしのねがい"){
            document.battle[atk + "_field_condition"].value += "いやしのねがい" + CR
            HP_change(atk, atk_HP_last, "-")
        } else if (move[0] == "みかづきのまい"){
            document.battle[atk + "_field_condition"].value += "みかづきのまい" + CR
            document.getElementById(atk + "_HP_last").textContent = 0
            fainted_process(atk)
        } else if (move[0] == "いのちのしずく"){
            HP_change(atk, Math.round(atk_full_HP / 4), "+")
        } else if (move[0] == "いやしのはどう"){
            if (atk_ability == "メガランチャー"){
                HP_change(def, Math.ceil(def_full_HP * 3 / 4), "+")
            } else {
                HP_change(def, Math.ceil(def_full_HP / 2), "+")
            }
        } else if (move[0] == "ジャングルヒール"){
            if (atk_HP_last < atk_full_HP){
                HP_change(atk, Math.floor(atk_full_HP / 4), "+")
            }
            if (atk_abnormal != ""){
                document.getElementById(atk + "_abnormal").textContent = ""
                txt = atk + "チームの　" + atk_poke + "は　" + atk_abnormal + "が　治った！" + CR
                document.battle_log.battle_log.value += txt
            }
        }
    }
}

// その他の技
function other_status_move(atk, def, move){
    const atk_poke = document.getElementById(atk + "_poke").textContent
    const def_poke = document.getElementById(def + "_poke").textContent
    const def_item = document.getElementById(def + "_item").textContent
    const atk_abnormal = document.getElementById(atk + "_abnormal").textContent
    const atk_ability = document.getElementById(atk + "_ability").textContent
    const def_ability = document.getElementById(def + "_ability").textContent
    const atk_full_HP = Number(document.getElementById(atk + "_HP").textContent)
    const def_full_HP = Number(document.getElementById(def + "_HP").textContent)
    const atk_HP_last = Number(document.getElementById(atk + "_HP_last").textContent)
    const def_HP_last = Number(document.getElementById(def + "_HP_last").textContent)
    const def_used_move = document.battle[def + "_used_move"].value
    const atk_p_con = document.battle[atk + "_poke_condition"].value
    const def_p_con = document.battle[def + "_poke_condition"].value
    const atk_f_con = document.battle[atk + "_field_condition"].value
    const def_f_con = document.battle[def + "_field_condition"].value

    if (move[0] == "いたみわけ"){
        document.battle_log.battle_log.value += "お互いのHPを　分け合った！" + CR
        document.getElementById(atk + "_HP_last").textContent = Math.min(Math.floor((atk_HP_last + def_HP_last) / 2), atk_full_HP)
        document.getElementById(def + "_HP_last").textContent = Math.min(Math.floor((atk_HP_last + def_HP_last) / 2), def_full_HP)
    } else if (move[0] == "うらみ") {
        for (let i = 0; i < 4; i++){
            if (def_used_move == document.getElementById(def + "_move_" + i).textContent){
                const PP_now = Number(document.getElementById(def + "_move_" + i + "_last").textContent)
                document.getElementById(def + "_move_" + i + "_last").textContent = Math.max(PP_now - 4, 0)
                document.battle_log.battle_log.value += "最後に使った技の　PPを減らした！" + CR
            }
        }
    } else if (move[0] == "おいわい"){
        document.battle_log.battle_log.value += "おめでとう！" + CR
    } else if (move[0] == "おきみやげ"){
        document.getElementById(atk + "_HP_last").textContent = 0
        fainted_process(atk)
    } else if (move[0] == "おちゃかい"){
        for (const team of ["A", "B"]){
            if (berry_item_list.includes(new get(team).item)){
                eating_berry_effect(team, new get(team).item)
                set_belch(team)
                set_recycle_item(team)
                if (new get(team).ability == "かるわざ"){
                    document.battle[team + "_poke_condition"].value += "かるわざ" + CR
                }
            }
        }
    } else if (move[0] == "ガードシェア"){
        document.battle_log.battle_log.value += "お互いの　防御と　特防を　共有した！" + CR
        document.getElementById(atk + "_B_AV").textContent = Math.floor((new get(atk).B_AV + new get(def).B_AV) / 2)
        document.getElementById(def + "_B_AV").textContent = Math.floor((new get(atk).B_AV + new get(def).B_AV) / 2)
        document.getElementById(atk + "_D_AV").textContent = Math.floor((new get(atk).D_AV + new get(def).D_AV) / 2)
        document.getElementById(def + "_D_AV").textContent = Math.floor((new get(atk).D_AV + new get(def).D_AV) / 2)
    } else if (move[0] == "ガードスワップ"){
        document.battle_log.battle_log.value += "お互いの　防御ランクと　特防ランクを　入れ替えた！" + CR
        const atk_B = new get(atk).B_rank
        const atk_D = new get(atk).D_rank
        const def_B = new get(def).B_rank
        const def_D = new get(def).D_rank
        document.getElementById(atk + "_rank_B").textContent = def_B
        document.getElementById(atk + "_rank_D").textContent = def_D
        document.getElementById(def + "_rank_B").textContent = atk_B
        document.getElementById(def + "_rank_D").textContent = atk_D
    } else if (move[0] == "きりばらい"){
        let check = 0
        if (!def_p_con.includes("みがわり")){
            if (new get(def).ability == "ミラーアーマー"){
                txt = def + "チームの　" + def_poke + "　の　ミラーアーマーが　発動した！" + CR
                document.battle_log.battle_log.value += txt
                rank_change(atk, "evasiveness", -1)
                white_herb(atk)
                check += 1
            } else {
                rank_change(def, "evasiveness", -1)
                white_herb(def)
                check += 1
            }
        }
        document.battle[def + "_field_condition"].value = ""
        for (let i = 0; i < def_f_con.split("\n").length - 1; i++){
            if (!(def_f_con.split("\n")[i].includes("しろいきり") 
            || def_f_con.split("\n")[i].includes("ひかりのかべ") 
            || def_f_con.split("\n")[i].includes("リフレクター") 
            || def_f_con.split("\n")[i].includes("しんぴのまもり") 
            || def_f_con.split("\n")[i].includes("オーロラベール") 
            || def_f_con.split("\n")[i].includes("まきびし") 
            || def_f_con.split("\n")[i].includes("どくびし") 
            || def_f_con.split("\n")[i].includes("ステルスロック") 
            || def_f_con.split("\n")[i].includes("ねばねばネット") 
            || def_f_con.split("\n")[i].includes("キョダイコウジン") 
            || def_f_con.split("\n")[i].includes("エレキフィールド") 
            || def_f_con.split("\n")[i].includes("グラスフィールド") 
            || def_f_con.split("\n")[i].includes("サイコフィールド") 
            || def_f_con.split("\n")[i].includes("ミストフィールド"))){
                document.battle[def + "_field_condition"].value += def_f_con.split("\n")[i] + CR
            } else {
                txt = def_f_con.split("\n")[i].slice(0, def_f_con.split("\n")[i].indexOf("　")) + "が　なくなった" + CR
                document.battle_log.battle_log.value += txt
                check += 1
            }
        }
        document.battle[atk + "_field_condition"].value = ""
        for (let i = 0; i < atk_f_con.split("\n").length - 1; i++){
            if (!(atk_f_con.split("\n")[i].includes("まきびし") 
            || atk_f_con.split("\n")[i].includes("どくびし") 
            || atk_f_con.split("\n")[i].includes("ステルスロック") 
            || atk_f_con.split("\n")[i].includes("ねばねばネット") 
            || atk_f_con.split("\n")[i].includes("キョダイコウジン") 
            || atk_f_con.split("\n")[i].includes("エレキフィールド") 
            || atk_f_con.split("\n")[i].includes("グラスフィールド") 
            || atk_f_con.split("\n")[i].includes("サイコフィールド") 
            || atk_f_con.split("\n")[i].includes("ミストフィールド"))){
                document.battle[atk + "_field_condition"].value += atk_f_con.split("\n")[i] + CR
            } else {
                txt = atk_f_con.split("\n")[i].slice(0, atk_f_con.split("\n")[i].indexOf("　")) + "が　なくなった" + CR
                document.battle_log.battle_log.value += txt
                check += 1
            }
        }
        if (check == 0){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
        }
    } else if (move[0] == "ギフトパス"){
        document.battle_log.battle_log.value += "持ち物を　プレゼントした" + CR
        document.getElementById(def + "_item").textContent = new get(atk).item
        document.getElementById(atk + "_item").textContent = ""
    } else if (move[0] == "くろいきり"){
        document.battle_log.battle_log.value += "くろいきりに　包まれた" + CR
        for (const team of ["A", "B"]){
            for (const parameter of ["A", "B", "C", "D", "S", "accuracy", "evasiveness"]){
                document.getElementById(team + "_rank_" + parameter).textContent = 0
            }
        }
    } else if (move[0] == "コートチェンジ"){
        const atk_f_con = document.battle[atk + "_field_condition"].value
        const def_f_con = document.battle[def + "_field_condition"].value
        let atk_list = []
        let def_list = []
        document.battle[atk + "_field_condition"].value = ""
        document.battle[def + "_field_condition"].value = ""
        for (let i = 0; i < atk_f_con.split("\n").length - 1; i++){
            let check = 0
            for (let j = 0; j < court_change_list.length; j++){
                if (atk_f_con.split("\n")[i].includes(court_change_list[j])){
                    atk_list.push(atk_f_con.split("\n")[i])
                    check += 1
                }
            }
            if (check == 0){
                document.battle[atk + "_field_condition"].value += atk_f_con.split("\n")[i] + CR
            }
        }
        for (let i = 0; i < def_f_con.split("\n").length - 1; i++){
            let check = 0
            for (let j = 0; j < court_change_list.length; j++){
                if (def_f_con.split("\n")[i].includes(court_change_list[j])){
                    def_list.push(def_f_con.split("\n")[i])
                    check += 1
                }
            }
            if (check == 0){
                document.battle[def + "_field_condition"].value += def_f_con.split("\n")[i] + CR
            }
        }
        for (let i = 0; i < def_list.length; i++){
            document.battle[atk + "_field_condition"].value += def_list[i] + CR
        }
        for (let i = 0; i < atk_list.length; i++){
            document.battle[def + "_field_condition"].value += atk_list[i] + CR
        }
    } else if (move[0] == "サイコシフト"){
        document.getElementById(def + "_abnormal").textContent = atk_abnormal
        document.getElementById(atk + "_abnormal").textContent = ""
        document.battle_log.battle_log.value += atk_abnormal + "を　移した" + CR
    } else if (move[0] == "さしおさえ"){
        document.battle[def + "_poke_condition"].value += "さしおさえ　5/5：" + def_item + CR
        document.getElementById(def + "_item").textContent = ""
        document.battle_log.battle_log.value += def + "チームの　" + def_poke + "は　道具を差し押さえられた" + CR
    } else if (move[0] == "シンプルビーム"){
        change_ability(def, atk, 3, "たんじゅん")
    } else if (move[0] == "じこあんじ"){
        for (const parameter of ["A", "B", "C", "D", "S", "accuracy", "evasiveness"]){
            document.getElementById(atk + "_rank_" + parameter).textContent = new get(def)[parameter + "_rank"]
        }
        document.battle_log.battle_log.value += def + "チームの　" + def_poke + "の　能力変化を　コピーした" + CR
    } else if (move[0] == "スキルスワップ"){
        change_ability(atk, def, 2, "NA")
    } else if (move[0] == "スケッチ"){
        const move_list = move_search_by_name(def_used_move)
        const num = String(document.getElementById("battle")[atk + "_move"].value)
        document.getElementById(atk + "_move_" + num).textContent = move_list[0]
        document.getElementById(atk + "_move_" + num + "_PP").textContent = move_list[5]
        document.getElementById(atk + "_move_" + num + "_last").textContent = move_list[5]
        document.battle_log.battle_log.value += def + "チームの　" + def_poke + "の　" + def_used_move + "を　スケッチした" + CR
    } else if (move[0] == "スピードスワップ"){
        const atk_S = document.getElementById(atk + "_S_AV").textContent
        const def_S = document.getElementById(def + "_S_AV").textContent
        document.getElementById(atk + "_S_AV").textContent = def_S
        document.getElementById(def + "_S_AV").textContent = atk_S
        txt = "お互いの　素早さを入れ替えた！" + CR
        document.battle_log.battle_log.value += txt
    } else if (move[0] == "すりかえ" || move[0] == "トリック"){
        const atk_item = document.getElementById(atk + "_item").textContent
        const def_item = document.getElementById(def + "_item").textContent
        document.getElementById(atk + "_item").textContent = def_item
        document.getElementById(def + "_item").textContent = atk_item
        txt = "お互いの　持ち物を入れ替えた！" + CR
        document.battle_log.battle_log.value += txt
        if (new get(atk).ability == "かるわざ" && new get(atk).item == ""){
            document.battle[atk + "_poke_condition"].value += "かるわざ" + CR
        }
        if (new get(def).ability == "かるわざ" && new get(def).item == ""){
            document.battle[def + "_poke_condition"].value += "かるわざ" + CR
        }
    } else if (move[0] == "テクスチャー"){
        const move_0 = document.getElementById(atk + "_move_0").textContent
        let move_0_type = move_search_by_name(move_0)[1]
        if (move_0 == "のろい" && !new get(atk).type.includes("ゴースト")){
            move_0_type = "ノーマル"
        }
        document.getElementById(atk + "_type").textContent = move_0_type
        txt = atk + "チームの　" + atk_poke + "は　" + move_0_type + "タイプに　なった！" + CR
        document.battle_log.battle_log.value += txt
    } else if (move[0] == "テクスチャー2"){
        const move_type = move_search_by_name(def_used_move)[1]
        let check = []
        for (let i = 0; i < 18; i++){
            if (compatibility[0][i] == move_type){
                for (let j = 0; j < 18; j++){
                    if (compatibility[i+1][j] < 1){
                        check.push(compatibility[0][j])
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
        document.getElementById(atk + "_type").textContent = change_type
        txt = atk + "チームの　" + atk_poke + "は　" + change_type + "タイプに　なった！" + CR
        document.battle_log.battle_log.value += txt
    } else if (move[0] == "てをつなぐ"){
        txt = atk + "チームの　" + atk_poke + "と　" + def + "チームの　" + def_poke + "は　手を繋いだ！" + CR
        document.battle_log.battle_log.value += txt
    } else if (move[0] == "なかまづくり"){
        change_ability(atk, def, 1, "NA")
    } else if (move[0] == "なやみのタネ"){
        change_ability(def, atk, 3, "ふみん")
    } else if (move[0] == "なりきり"){
        change_ability(def, atk, 1, "NA")
    } else if (move[0] == "ハートスワップ"){
        for (const parameter of ["A", "B", "C", "D", "S", "accuracy", "evasiveness"]){
            let A_rank = new get("A")[parameter + "_rank"]
            let B_rank = new get("B")[parameter + "_rank"]
            document.getElementById("A_rank_" + parameter).textContent = B_rank
            document.getElementById("B_rank_" + parameter).textContent = A_rank
            txt = "お互いの　能力変化を入れ替えた！" + CR
            document.battle_log.battle_log.value += txt
        }
    } else if (move[0] == "ハッピータイム"){
        txt = "あたりが幸せに包まれた！" + CR
        document.battle_log.battle_log.value += txt
    } else if (move[0] == "ハロウィン"){
        if (new get(def).type = ""){
            document.getElementById(def + "_type").textContent += "ゴースト"
        } else {
            document.getElementById(def + "_type").textContent += "、ゴースト"
        }
        document.battle[def + "_poke_condition"].value += "ハロウィン" + CR
        txt = def + "チームの　" + def_poke + "の　タイプにゴーストが追加された！" + CR
        document.battle_log.battle_log.value += txt
    } else if (move[0] == "パワーシェア"){
        const A_A = new get("A").A_AV
        const B_A = new get("B").A_AV
        const A_C = new get("A").C_AV
        const B_C = new get("B").C_AV
        document.getElementById("A_A_AV").textContent = Math.floor((A_A + B_A) / 2)
        document.getElementById("B_A_AV").textContent = Math.floor((A_A + B_A) / 2)
        document.getElementById("A_C_AV").textContent = Math.floor((A_C + B_C) / 2)
        document.getElementById("B_C_AV").textContent = Math.floor((A_C + B_C) / 2)
        txt = "お互いの　攻撃と特攻を分け合った！" + CR
        document.battle_log.battle_log.value += txt
    } else if (move[0] == "パワースワップ"){
        const A_A = new get("A").A_rank
        const B_A = new get("B").A_rank
        const A_C = new get("A").C_rank
        const B_C = new get("B").C_rank
        document.getElementById("A_rank_A").textContent = B_A
        document.getElementById("B_rank_A").textContent = A_A
        document.getElementById("A_rank_C").textContent = B_C
        document.getElementById("B_rank_C").textContent = A_C
        txt = "お互いの　攻撃ランクを特攻ランクを入れ替えた！" + CR
        document.battle_log.battle_log.value += txt
    } else if (move[0] == "ひっくりかえす"){
        for (const parameter of ["A", "B", "C", "D", "S", "accuracy", "evasiveness"]){
            document.getElementById(def + "_rank_" + parameter).textContent = -new get(def)[parameter + "_rank"]
        }
        txt = def + "チームの　" + def_poke + "の　能力ランクをひっくり返した！" + CR
        document.battle_log.battle_log.value += txt
    } else if (move[0] == "ふしょくガス"){
        txt = def + "チームの　" + def_poke + "の　" + new get(def).item +  "を溶かした！" + CR
        document.battle_log.battle_log.value += txt
        document.getElementById(def + "_item").textContent = ""
    } else if (move[0] == "ほごしょく"){
        if (atk_f_con.includes("グラスフィールド")){
            document.getElementById(atk + "_type").textContent = "くさ"
            txt = atk + "チームの　" + atk_poke + "の　タイプが　くさになった！" + CR
            document.battle_log.battle_log.value += txt
        } else if (atk_f_con.includes("エレキフィールド")){
            document.getElementById(atk + "_type").textContent = "でんき"
            txt = atk + "チームの　" + atk_poke + "の　タイプが　でんきになった！" + CR
            document.battle_log.battle_log.value += txt
        } else if (atk_f_con.includes("ミストフィールド")){
            document.getElementById(atk + "_type").textContent = "フェアリー"
            txt = atk + "チームの　" + atk_poke + "の　タイプが　フェアリーになった！" + CR
            document.battle_log.battle_log.value += txt
        } else if (atk_f_con.includes("サイコフィールド")){
            document.getElementById(atk + "_type").textContent = "エスパー"
            txt = atk + "チームの　" + atk_poke + "の　タイプが　エスパーになった！" + CR
            document.battle_log.battle_log.value += txt
        } else {
            document.getElementById(atk + "_type").textContent = "ノーマル"
            txt = atk + "チームの　" + atk_poke + "の　タイプが　ノーマルになった！" + CR
            document.battle_log.battle_log.value += txt
        }
    } else if (move[0] == "ふきとばし" || move[0] == "ほえる"){
        txt = def + "チームの　" + new get(def).name + "は　手持ちに戻された！" + CR
        document.battle_log.battle_log.value += txt
        let hand = []
        for (let i = 0; i < 3; i++){
            if (document.getElementById(def + "_" + i + "_existence").textContent == "控え"){
                hand.push(i)
            }
        }
        come_back_pokemon(def)
        let battle = hand[0]
        if (hand.length == 2 && Math.random() < 0.5){
            battle = hand[1]
        }
        document.getElementById(def + "_" + battle + "_button").checked = true
        pokemon_replace(def)
        summon_pokemon(1, def)
    } else if (move[0] == "へんしん" && !new get(def).p_con.includes("みがわり") && !new get(def).p_con.includes("へんしん")){
        for (const i of ["_sex", "_type", "_nature", "_ability", 
        "_A_AV", "_B_AV", "_C_AV", "_D_AV", "_S_AV", 
        "_rank_A", "_rank_B", "_rank_C", "_rank_D", "_rank_S", "_rank_accuracy", "_rank_evasiveness", 
        "_move_0", "_move_1", "_move_2", "_move_3"]){
            document.getElementById(atk + i).textContent = document.getElementById(def + i).textContent
        }
        for (let i = 0; i < 4; i++){
            document.getElementById(atk + "_move_" + i + "_PP").textContent = 5
            document.getElementById(atk + "_move_" + i + "_last").textContent = 5
        }
        condition_remove(atk, "poke", "きゅうしょアップ")
        condition_remove(atk, "poke", "とぎすます")
        condition_remove(atk, "poke", "キョダイシンゲキ")
        condition_remove(atk, "poke", "ボディパージ")
        for (let i = 0; i < new get(def).p_len; i++){
            if (new get(def).p_list[i].includes("きゅうしょアップ") || new get(def).p_list[i].includes("とぎすます") || new get(def).p_list[i].includes("キョダイシンゲキ") || new get(def).p_list[i].includes("ボディパージ")){
                document.battle[atk + "_poke_condition"].value += new get(def).p_list[i] + CR
            }
        }
        // 画像の設定
        for (let i = 0; i < pokemon.length; i++){
            if (document.getElementById(def + "_poke").textContent == pokemon[i][1]){
                document.getElementById(atk + "_image").src = "poke_figure/" + pokemon[i][0] + ".gif"
            }
        }
        txt = atk + "チームの　" + new get(atk).name + "は　" + new get(def).name + "に　へんしんした" + CR
        document.battle_log.battle_log.value += txt
        document.battle[atk + "_poke_condition"].value += "へんしん" + CR
        summon_pokemon(1, atk)
    } else if (move[0] == "ほろびのうた"){
        if (!atk_p_con.includes("ほろびカウント")){
            document.battle[atk + "_poke_condition"].value += "ほろびカウント　4" + CR
        }
        if (!def_p_con.includes("ほろびカウント")){
            document.battle[def + "_poke_condition"].value += "ほろびカウント　4" + CR
        }
        txt = "ほろびのうたが響き渡った！" + CR
        document.battle_log.battle_log.value += txt
    } else if (move[0] == "まほうのこな"){
        document.getElementById(def + "_type").textContent = "エスパー"
        txt = def + "チームの　" + def_poke + "は　エスパータイプになった！" + CR
        document.battle_log.battle_log.value += txt
    } else if (move[0] == "みずびたし"){
        document.getElementById(def + "_type").textContent = "みず"
        txt = def + "チームの　" + def_poke + "は　みずタイプになった！" + CR
        document.battle_log.battle_log.value += txt
    } else if (move[0] == "ミラータイプ"){
        document.getElementById(atk + "_type").textContent = new get(def).type
        txt = atk + "チームの　" + atk_poke + "の　タイプが変わった！" + CR
        document.battle_log.battle_log.value += txt
    } else if (move[0] == "ものまね") {
        num = String(document.getElementById("battle")[atk + "_move"].value)
        document.getElementById(atk + "_move_" + num).textContent = def_used_move
        document.getElementById(atk + "_move_" + num + "_PP").textContent = move_search_by_name(def_used_move)[5]
        document.getElementById(atk + "_move_" + num + "_last").textContent = move_search_by_name(def_used_move)[5]
        txt = def + "チームの　" + new get(def).name + "の　" + def_used_move +"を　コピーした" + CR
        document.battle_log.battle_log.value += txt
    } else if (move[0] == "もりののろい"){
        if (new get(def).type = ""){
            document.getElementById(def + "_type").textContent += "くさ"
        } else {
            document.getElementById(def + "_type").textContent += "、くさ"
        }
        document.battle[def + "_poke_condition"].value += "もりののろい" + CR
        txt = def + "チームの　" + def_poke + "の　タイプにくさが追加された！" + CR
        document.battle_log.battle_log.value += txt
    } else if (move[0] == "リサイクル"){
        for (let i = 0; i < 3; i++){
            if (document.getElementById(atk + "_" + i + "_existence").textContent == "戦闘中"){
                document.getElementById(atk + "_item").textContent = document.getElementById(atk + "_" + i + "_recycle").textContent
                document.getElementById(atk + "_" + i + "_recycle").textContent = ""
            }
        }
        txt = atk + "チームの　" + new get(atk).name + "　は　" + new get(atk).item + "を　拾ってきた" + CR
        document.battle_log.battle_log.value += txt
        berry_in_pinch(atk)
    }
}

