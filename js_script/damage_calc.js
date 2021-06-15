function damage_calculation_process(atk, def, move, order){
    if (!fixed_damage_move_list.includes(move[0])){
        // 最終威力
        const power = power_calculation(atk, def, move, order)
        // 急所判定
        const critical = get_critical(atk, def, move)
        // 攻撃と防御の実数値取得　
        const status = get_status(atk, def, move, critical)
        // 最終攻撃
        const attack = attack_calculation(status, atk, def, move)
        // 最終防御
        const defense = defense_calculation(status, atk, def, move)
        // 最終ダメージ
        const damage = damage_calculation(atk, def, power, attack, defense, move, critical)

        return damage
    } else { // ダメージ固定技の時
        return fixed_damage_move(atk, def, move, order)
    }
    
}

function get_status(atk, def, move, critical){
    let A_AV = new get(atk).A_AV
    let B_AV = new get(def).B_AV
    let A_rank = new get(atk).A_rank
    let B_rank = new get(def).B_rank
    let C_AV = new get(atk).C_AV
    let D_AV = new get(def).D_AV
    let C_rank = new get(atk).C_rank
    let D_rank = new get(def).D_rank

    if (new get(atk).f_con.includes("ワンダールーム")){
        B_AV = new get(def).D_AV
        D_AV = new get(def).B_AV
    }
    if (move[0] == "フォトンゲイザー"){
        if (A_rank > 0){
            A_AV = Math.floor((A_AV * (2 + A_rank)) / 2)
        } else {
            A_AV = Math.floor((A_AV * 2) / (2 - A_rank))
        }
        if (C_rank > 0){
            C_AV = Math.floor((C_AV * (2 + C_rank)) / 2)
        } else {
            C_AV = Math.floor((C_AV * 2) / (2 - C_rank))
        }
        // 物理攻撃の方が高ければ、物理技になる
        if (A_AV > C_AV){
            move[2] = "物理"
        }
    }
    if (move[2] == "物理"){
        if (move[0] == "イカサマ"){
            A_AV = new get(def).A_AV
            A_rank = new get(def).A_rank
        }
        if (move[0] == "せいなるつるぎ" || move[0] == "DDラリアット" || move[0] == "なしくずし"){
            B_rank = 0
            D_rank = 0
        }
        if (move[0] == "ボディプレス"){
            A_AV = new get(atk).B_AV
            A_rank = new get(atk).B_rank
            if (new get(atk).f_con.includes("ワンダールーム")){
                A_rank = new get(atk).D_rank
            }
        }
        
        if (critical){ //急所に当たった時
            if (A_rank > 0){
                A_AV = Math.floor((A_AV * (2 + A_rank)) / 2)
            } 
            if (B_rank < 0){
                B_AV = Math.floor((B_AV * 2) / (2 - B_rank))
            } 
            return [A_AV, B_AV]
        } else { // 急所に当たらなかった時
            if (A_rank > 0){
                A_AV = Math.floor((A_AV * (2 + A_rank)) / 2)
            } else {
                A_AV = Math.floor((A_AV * 2) / (2 - A_rank))
            }
            if (B_rank > 0){
                B_AV = Math.floor((B_AV * (2 + B_rank)) / 2)
            } else {
                B_AV = Math.floor((B_AV * 2) / (2 - B_rank))
            }
            return [A_AV, B_AV]
        }
    } else if (move[2] == "特殊"){
        if (move[0] == "サイコショック" || move[0] == "サイコブレイク" || move[0] == "しんぴのつるぎ"){
            if (!new get(atk).f_con.includes("ワンダールーム")){
                D_AV = new get(def).B_AV
            }
            D_rank = new get(def).B_rank
        } else if (move[0] == "はめつのねがい" || move[0] == "みらいよち"){
            for (let i = 0; i < new get(def).f_len; i++){
                if (new get(def).f_list[i].includes(move[0])){
                    let num = Number(new get(def).f_con.split("\n")[i].slice(-6, -5))
                    if (document.getElementById(atk + "_" + num + "_existence").textContent != "戦闘中"){
                        C_AV = Number(document.getElementById(atk + "_" + num + "_C_AV").textContent)
                    }
                }
            }
        }
        if (critical){ //急所に当たった時
            if (C_rank > 0){
                C_AV = Math.floor((C_AV * (2 + C_rank)) / 2)
            } 
            if (D_rank < 0){
                D_AV = Math.floor((D_AV * 2) / (2 - D_rank))
            } 
            return [C_AV, D_AV]
        } else { // 急所に当たらなかった時
            if (C_rank > 0){
                C_AV = Math.floor((C_AV * (2 + C_rank)) / 2)
            } else {
                C_AV = Math.floor((C_AV * 2) / (2 - C_rank))
            }
            if (D_rank > 0){
                D_AV = Math.floor((D_AV * (2 + D_rank)) / 2)
            } else {
                D_AV = Math.floor((D_AV * 2) / (2 - D_rank))
            }
            return [C_AV, D_AV]
        }
    }
}

function get_critical(atk, def, move){

    let critical = 0

    if (new get(atk).p_con.includes("きゅうしょアップ")){
        critical += 2
    }
    if (new get(atk).p_con.includes("とぎすます")){
        critical += 3
    }
    for (let i = 0; i < new get(atk).p_len; i++){
        if (new get(atk).p_list[i].includes("キョダイシンゲキ")){
            critical += Number(new get(atk).p_list[i].substrings(9, 10))
        }
    }
    if (new get(atk).p_con.includes("とぎすます")){
        critical += 3
    }
    if (new get(atk).ability == "きょううん"){
        critical += 1
    }
    if (new get(atk).item == "ピントレンズ" || new get(atk).item == "するどいツメ"){
        critical += 1
    }
    if (new get(atk).name == "ラッキー" && new get(atk).item == "ラッキーパンチ"){
        critical += 2
    }
    if ((new get(atk).name.includes("カモネギ") || new get(atk).name == "ネギガナイト") && new get(atk).item == "ながねぎ"){
        critical += 2
    }
    if (new get(atk).ability == "ひとでなし" && new get(def).abnormal.includes("どく")){
        critical += 3   
    }
    for (let i = 0; i < critical_move_list.length; i++){
        if (move[0] == critical_move_list[i][0]){
            critical += critical_move_list[i][1]
        }
    }

    if (new get(def).f_con.includes("おまじない") || new get(def).ability == "カブトアーマー" || new get(def).ability == "シェルアーマー"){
        return false
    }

    const random = Math.random()

    if (critical == 0 && random < 1 / 24){
        return true
    } else if (critical == 1 && random < 1 / 8){
        return true
    } else if (critical == 2 && random < 1 / 2){
        return true
    } else if (critical > 2){
        return true
    }

    return false
}



function power_calculation(atk, def, move, order){
    // 基礎威力の変化
    if (move[0] == "きしかいせい" || move[0] == "じたばた"){
        if (new get(atk).last_HP < new get(atk).full_HP * 2 / 48){
            move[3] = 200
        } else if (new get(atk).last_HP < new get(atk).full_HP * 5 / 48){
            move[3] = 150
        } else if (new get(atk).last_HP < new get(atk).full_HP * 10 / 48){
            move[3] = 100
        } else if (new get(atk).last_HP < new get(atk).full_HP * 17 / 48){
            move[3] = 80
        } else if (new get(atk).last_HP < new get(atk).full_HP * 33 / 48){
            move[3] = 40
        } else {
            move[3] = 20
        }
    } else if (move[0] == "しおふき" || move[0] == "ふんか" || move[0] == "ドラゴンエナジー"){
        move[3] = Math.max(Math.floor(150 * new get(atk).last_HP / new get(atk).full_HP), 1)
    } else if (move[0] == "しぼりとる" || move[0] == "にぎりつぶす"){
        move[3] = Math.max(Math.floor(120 * new get(def).last_HP / new get(def).full_HP), 1)
    } else if (move[0] == "アシストパワー" || move[0] == "つけあがる"){
        let power = 0
        for (const parameter of ["A", "B", "C", "D", "S", "accuracy", "evasiveness"]){
            let rank = Number(document.getElementById(atk + "_rank_" + parameter).textContent)
            if (rank > 0){
                power += rank
            }
        }
        move[3] = 20 * (power + 1)
    } else if (move[0] == "おしおき"){
        let power = 0
        for (const parameter of ["A", "B", "C", "D", "S", "accuracy", "evasiveness"]){
            let rank = Number(document.getElementById(def + "_rank_" + parameter).textContent)
            if (rank > 0){
                power += rank
            }
        }
        move[3] = Math.min(20 * (power + 3), 200)
    } else if (move[0] == "うっぷんばらし" && new get(atk).p_con.includes("ランク下降")){
        move[3] = 150
    } else if (move[0] == "エレキボール"){
        let atk_speed = 0
        let def_speed = 0
        const data = speed_check()
        if (atk == "A"){
            atk_speed = data[0]
            def_speed = data[1]
        } else if (atk == "B"){
            atk_speed = data[1]
            def_speed = data[0]
        }
        if (atk_speed >= def_speed * 4){
            move[3] = 150
        } else if (atk_speed >= def_speed * 3){
            move[3] = 120
        } else if (atk_speed >= def_speed * 2){
            move[3] = 80
        } else if (atk_speed >= def_speed){
            move[3] = 60
        } else {
            move[3] = 40
        }
    } else if (move[0] == "ジャイロボール"){
        let atk_speed = 0
        let def_speed = 0
        const data = speed_check()
        if (atk == "A"){
            atk_speed = data[0]
            def_speed = data[1]
        } else if (atk == "B"){
            atk_speed = data[1]
            def_speed = data[0]
        }
        move[3] = Math.floor((25 * def_speed / atk_speed) + 1)
    } else if (move[0] == "きりふだ"){
        const num = String(document.getElementById("battle")[atk + "_move"].value)
        const PP = Number(document.getElementById(atk + "_move_" + num + "_last").textContent)
        if (PP == 0){
            move[3] = 200
        } else if (PP == 1){
            move[3] = 80
        } else if (PP == 2){
            move[3] = 60
        } else if (PP == 3){
            move[3] = 50
        } else {
            move[3] = 40
        }
    } else if (move[0] == "くさむすび" || move[0] == "けたぐり"){
        const def_weight = weight_search(def)
        if (def_weight >= 200){
            move[3] = 120
        } else if (def_weight >= 100){
            move[3] = 100
        } else if (def_weight >= 50){
            move[3] = 80
        } else if (def_weight >= 25){
            move[3] = 60
        } else if (def_weight >= 10){
            move[3] = 40
        } else {
            move[3] = 20
        }
    } else if (move[0] == "ヒートスタンプ" || move[0] == "ヘビーボンバー"){
        const atk_weight = weight_search(atk)
        const def_weight = weight_search(def)
        if (atk_weight >= def_weight * 5){
            move[3] = 120
        } else if (atk_weight >= def_weight * 4){
            move[3] = 100
        } else if (atk_weight >= def_weight * 3){
            move[3] = 80
        } else if (atk_weight >= def_weight * 2){
            move[3] = 60
        } else {
            move[3] = 40
        }
    } else if ((move[0] == "きつけ" && new get(def).abnormal == "まひ") || (move[0] == "めざましビンタ" && new get(def).abnormal == "ねむり")){
        move[3] = 140
    } else if (move[0] == "たたりめ" && new get(def).abnormal != ""){
        move[3] = 130
    } else if (move[0] == "ウェザーボール" && ((new get(atk).f_con.includes("にほんばれ") && new get(atk).item != "ばんのうがさ") || (new get(atk).f_con.includes("あめ") && new get(atk).item != "ばんのうがさ") || new get(atk).f_con.includes("すなあらし") || new get(atk).f_con.includes("あられ")) 
    && !(new get("A").ability == "エアロック" || new get("A").ability == "ノーてんき" || new get("B").ability == "エアロック" || new get("B").ability == "ノーてんき")){
        move[3] = 100
    } else if (move[0] == "だいちのはどう" && grounded_check(atk) && new get(atk).f_con.includes("フィールド")){
        move[3] = 100
    } else if (move[0] == "ライジングボルト" && grounded_check(def) && new get(atk).f_con.includes("エレキフィールド")){
        move[3] = 140
    } else if ((move[0] == "かぜおこし" || move[0] == "たつまき") && (new get(def).p_con.includes("そらをとぶ") || new get(def).p_con.includes("フリーフォール"))){
        move[3] = 80
    } else if (move[0] == "アクロバット" && new get(atk).item == ""){
        move[3]  = 110
    } else if (move[0] == "しぜんのめぐみ"){
        for (let i = 0; i < natural_gift_item_list.length; i++){
            if (new get(atk).item == natural_gift_item_list[i][0]){
                move[3] = natural_gift_item_list[i][2]
            }
        }
    } else if (move[0] == "なげつける"){
        txt = atk + "チームの　" + new get(atk).name + "　は　" + new get(atk).item + "を　投げつけた！" + CR
        document.battle_log.battle_log.value += txt
        if (berry_item_list.includes(new get(atk).item) || new get(atk).item.includes("おこう") || fling_pow_10.includes(new get(atk).item)){
            move[3] = 10
        } else if (fling_pow_30.includes(new get(atk).item)){
            move[3] = 30
        } else if (fling_pow_40.includes(new get(atk).item)){
            move[3] = 40
        } else if (fling_pow_50.includes(new get(atk).item) || new get(atk).item.includes("メモリ")){
            move[3] = 50
        } else if (fling_pow_60.includes(new get(atk).item)){
            move[3] = 60
        } else if (fling_pow_70.includes(new get(atk).item) || new get(atk).item.includes("カセット") || new get(atk).item.includes("パワー")){
            move[3] = 70
        } else if (fling_pow_80.includes(new get(atk).item) || new get(atk).item.includes("ナイト")){
            move[3] = 80
        } else if (fling_pow_90.includes(new get(atk).item) || new get(atk).item.includes("プレート")){
            move[3] = 90
        } else if (fling_pow_100.includes(new get(atk).item)){
            move[3] = 100
        } else if (fling_pow_130.includes(new get(atk).item)){
            move[3] = 130
        }
    } else if (move[0] == "アイスボール" || move[0] == "ころがる"){
        if (new get(atk).p_con.includes("まるくなる")){
            move[3] *= 2
        }
        for (let i = 0; i < new get(atk).p_con.split("\n").length - 1; i++){
            if (new get(atk).p_con.split("\n")[i].includes(move[0])){
                const num = Number(new get(atk).p_con.split("\n")[i].replace(/[^0-9]/g, ""))
                move[3] *= 2 ** (num - 1)
            }
        }
    } else if (move[0] == "エコーボイス"){
        for (let i = 0; i < new get(atk).f_con.split("\n").length - 1; i++){
            if (new get(atk).f_con.split("\n")[i].includes("エコーボイス")){
                const num = Math.floor(Number(new get(atk).f_con.split("\n")[i].slice(8)))
                move[3] = Math.min(40 * (num + 1), 200)
            }
        }
    } else if (move[0] == "はきだす"){
        let num = 0
        if (new get(atk).p_con.includes("たくわえる　1回目")){
            move[3] = 100
            num = -1
        } else if (new get(atk).p_con.includes("たくわえる　2回目")){
            move[3] = 200
            num = -2
        } else if (new get(atk).p_con.includes("たくわえる　3回目")){
            move[3] = 300
            num = -3
        }
        rank_change(atk, "B", num)
        rank_change(atk, "D", num)
        txt = atk + "チームの　" + new get(atk).name + "は　たくわえが　なくなった！" + CR
        document.battle_log.battle_log.value += txt
        document.battle[atk + "_poke_condition"].value = ""
        for (let i = 0; i < new get(atk).p_con.split("\n").length - 1; i++){
            if (!new get(atk).p_con.split("\n")[i].includes("たくわえる")){
                document.battle[atk + "_poke_condition"].value += new get(atk).p_con.split("\n")[i] + CR
            }
        }
    } else if (move[0] == "れんぞくぎり"){
        for (let i = 0; i < new get(atk).p_con.split("\n").length - 1; i++){
            if (new get(atk).p_con.split("\n")[i].includes("れんぞくぎり")){
                const num = Number(new get(atk).p_con.split("\n")[i].slice(8))
                move[3] = Math.min(40 * num, 160)
            }
        }
    } else if ((move[0] == "エラがみ" || move[0] == "でんげきくちばし") && atk == order[0]){
        move[3] = 170
    } else if (move[0] == "おいうち"){

    } else if (move[0] == "しっぺがえし" && atk == order[1]){
        move[3] = 100
    } else if (move[0] == "ダメおし" && new get(def).p_con.includes("ダメおし")){
        move[3] *= 2
    } else if ((move[0] == "ゆきなだれ" || move[0] == "リベンジ") && new get(atk).p_con.includes("ダメージ")){
        move[3] *= 2
    }


    // 威力補正初期値
    let correction = 4096

    // オーラブレイク、とうそうしん弱化　* 3072 / 4096 → 四捨五入
    if ((((new get(atk).ability == "オーラブレイク" && new get(def).ability == "ダークオーラ") || (new get(def).ability == "オーラブレイク" && new get(atk).ability == "ダークオーラ")) && move[1] == "あく") 
    || (((new get(atk).ability == "オーラブレイク" && new get(def).ability == "フェアリーオーラ") || (new get(def).ability == "オーラブレイク" && new get(atk).ability == "フェアリーオーラ")) && move[1] == "フェアリー")){
        correction = Math.round(correction * 3072 / 4096)
    }
    if (new get(atk).ability == "とうそうしん"){
        if ((new get(atk).sex == " ♂ " && new get(def).sex == " ♀ ") || (new get(atk).sex == " ♀ " && new get(def).sex == " ♂ ")){
            correction = Math.round(correction * 3072 / 4096)
        }
    }
    // スキン特性、てつのこぶし、すてみ * 4915 / 4096 → 四捨五入
    if (new get(atk).p_con.includes("スキン") 
    || (new get(atk).ability == "てつのこぶし" && iron_fist_move_list.includes(move[0])) 
    || (new get(atk).ability == "すてみ" && reckless_move_list.includes(move[0]))){
        correction = Math.round(correction * 4915 / 4096)
        condition_remove(atk, "poke", "スキン")
    }
    // とうそうしん強化 * 5120 / 4096 → 四捨五入
    if (new get(atk).ability == "とうそうしん"){
        if ((new get(atk).sex == " ♂ " && new get(def).sex == " ♂ ") || (new get(atk).sex == " ♀ " && new get(def).sex == " ♀ ")){
            correction = Math.round(correction * 5120 / 4096)
        }
    }
    // バッテリー、パワースポット * 5325 / 4096 → 四捨五入
    // アナライズ、かたいツメ、すなのちから、ちからづく、パンクロック * 5325 / 4096 → 四捨五入
    if ((new get(atk).ability == "アナライズ" && atk == order[1]) 
    || (new get(atk).ability == "かたいツメ" && move[6] == "直接") 
    || (new get(atk).ability == "すなのちから" && new get(atk).f_con.includes("すなあらし") && (move[1] == "いわ" || move[1] == "じめん" || move[1] == "はがね") && !(new get("A").ability == "エアロック" || new get("A").ability == "ノーてんき" || new get("B").ability == "エアロック" || new get("B").ability == "ノーてんき")) 
    || (new get(atk).ability == "パンクロック" && music_move_list.includes(move[0]))){
        correction = Math.round(correction * 5325 / 4096)
    }
    // ダークオーラ、フェアリーオーラ * 5448 / 4096 → 四捨五入
    if ((((new get(atk).ability == "ダークオーラ" && new get(def).ability != "オーラブレイク") || (new get(atk).ability != "オーラブレイク" && new get(def).ability == "ダークオーラ")) && move[1] == "あく") 
    || (((new get(atk).ability == "フェアリーオーラ" && new get(def).ability != "オーラブレイク") || (new get(atk).ability != "オーラブレイク" && new get(def).ability == "フェアリーオーラ")) && move[1] == "フェアリー") ){
        correction = Math.round(correction * 5448 / 4096)
    }
    // がんじょうあご、テクニシャン、どくぼうそう、ねつぼうそう、はがねのせいしん、メガランチャー * 6144 / 4096 → 四捨五入
    if ((new get(atk).ability == "がんじょうあご" && bite_move_list.includes(move[0])) 
    || (new get(atk).ability == "テクニシャン" && move[3] <= 60) 
    || (new get(atk).ability == "どくぼうそう" && new get(atk).abnormal.includes("どく") && move[2] == "物理") 
    || (new get(atk).ability == "ねつぼうそう" && new get(atk).abnormal == "やけど" && move[2] == "特殊") 
    || (new get(atk).ability == "はがねのせいしん" && move[1] == "はがね") 
    || (new get(atk).ability == "メガランチャー" && mega_launcher_move_list.includes(move[0]))){
        correction = Math.round(correction * 6144 / 4096)
    }
    // たいねつ * 2048 / 4096 → 四捨五入
    if (new get(def).ability == "たいねつ" && move[1] == "ほのお"){
        correction = Math.round(correction * 2048 / 4096)
    }
    // かんそうはだ * 5120 / 4096 → 四捨五入
    if (new get(def).ability == "かんそうはだ" && move[1] == "ほのお"){
        correction = Math.round(correction * 5120 / 4096)
    }
    // ちからのハチマキ、ものしりメガネ * 4505 / 4096 → 四捨五入
    if ((new get(atk).item == "ちからのハチマキ" && move[2] == "物理") 
    || (new get(atk).item == "ものしりメガネ" && move[2] == "特殊")){
        correction = Math.round(correction * 4505 / 4096)
    }
    // プレート類、特定タイプの威力UPアイテム（おこう含む）、こころのしずく、こんごうだま、しらたま、はっきんだま * 4915 / 4096 → 四捨五入
    if (new get(atk).item.includes("プレート")){
        for (let i = 0; i < judgement_plate.length; i++){
            if (new get(atk).item == judgement_plate[i][0]){
                if (judgement_plate[i][1] == move[1]){
                    correction = Math.round(correction * 4915 / 4096)
                }
            }
        }
    } else if (new get(atk).item != ""){
        for (let i = 0; i < incense_item_list.length; i++){
            if (new get(atk).item == incense_item_list[i][0] && move[1] == incense_item_list[i][1]){
                correction = Math.round(correction * 4915 / 4096)
            }
        }
    } else if ((new get(atk).item == "こころのしずく" && (new get(atk).name == "ラティアス" || new get(atk).name == "ラティオス") && (move[1] == "ドラゴン" || move[1] == "エスパー")) 
    || (new get(atk).item == "こんごうだま" && new get(atk).name == "ディアルガ" && (move[1] == "はがね" || move[1] == "ドラゴン")) 
    || (new get(atk).item == "しらたま" && new get(atk).name == "パルキア" && (move[1] == "みず" || move[1] == "ドラゴン")) 
    || (new get(atk).item == "はっきんだま" && new get(atk).name == "ギラティナ" && (move[1] == "ゴースト" || move[1] == "ドラゴン"))){
        correction = Math.round(correction * 4915 / 4096)
    }
    // ジュエル * 5325 / 4096 → 四捨五入
    if (new get(atk).p_con.includes("ジュエル")){
        correction = Math.round(correction * 5325 / 4096)
        condition_remove(atk, "poke", "ジュエル")
    }
    // ソーラービーム、ソーラーブレード * 2048 / 4096 → 四捨五入
    if ((move[0] == "ソーラービーム" || move[0] == "ソーラーブレード") && new get(atk).item != "ばんのうがさ" && (new get(atk).f_con.includes("あめ") || new get(atk).f_con.includes("すなあらし") || new get(atk).f_con.includes("あられ")) 
    && !(new get("A").ability == "エアロック" || new get("A").ability == "ノーてんき" || new get("B").ability == "エアロック" || new get("B").ability == "ノーてんき")){
        correction = Math.round(correction * 2048 / 4096)
    }
    // はたきおとす、Gのちから、ワイドフォース、ミストバースト * 6144 / 4096 → 四捨五入
    if ((move[0] == "はたきおとす" && new get(def).item != "" 
    && !(new get(def).name == "シルヴァディ" && new get(def).item.includes("メモリ")) 
    && !(new get(def).name == "アルセウス" && new get(def).item.includes("プレート"))
    && !(new get(def).name.includes("ザシアン") && new get(def).item　== "くちたけん") 
    && !(new get(def).name.includes("ザマゼンタ") && new get(def).item　== "くちたたて")) 
    || (move[0] == "Gのちから" && new get(atk).f_con.includes("じゅうりょく")) 
    || (move[0] == "ワイドフォース" && new get(atk).f_con.includes("サイコフィールド")) 
    || (move[0] == "ミストバースト" && new get(atk).f_con.includes("ミストフィールド") && grounded_check(atk))){
        correction = Math.round(correction * 6144 / 4096)
    }
    // てだすけ * 6144 / 4096 → 四捨五入
    // さきどり * 6144 / 4096 → 四捨五入
    if (new get(atk).p_con.includes("さきどり")){
        correction = Math.round(correction * 6144 / 4096)
        document.battle[atk + "_poke_condition"].value = ""
        for (let i = 0; i < new get(atk).p_con.split("\n").length - 1; i++){
            if (new get(atk).p_con.split("\n")[i] != "さきどり"){
                document.battle[atk + "_poke_condition"].value += new get(atk).p_con.split("\n")[i] + CR
            }
        }
    }
    // じゅうでん * 8192 / 4096 → 四捨五入
    if (new get(atk).p_con.includes("じゅうでん") && move[1] == "でんき"){
        correction = Math.round(correction * 8192 / 4096)
    }
    // かたきうち、からげんき、しおみず、ベノムショック、クロスサンダー、クロスフレイム * 8192 / 4096 → 四捨五入
    if (move[0] == "かたきうち"){
        for (let i = 0; i < turn_log().length; i++){
            if (turn_log()[i].includes(atk + "チームの　") && turn_log()[i].includes("は　たおれた　!")){
                correction = Math.round(correction * 8192 / 4096)
            }
        }
    }
    if ((move[0] == "からげんき" && (new get(atk).abnormal.includes("どく") || new get(atk).abnormal == "やけど") || new get(atk).abnormal == ("まひ")) 
    || (move[0] == "しおみず" && new get(def).last_HP <= new get(def).full_HP / 2) 
    || (move[0] == "ベノムショック" && new get(def).abnormal.includes("どく"))){
        correction = Math.round(correction * 8192 / 4096)
    }
    // フィールド弱化 * 2048 / 4096 → 四捨五入
    if ((new get(atk).f_con.includes("グラスフィールド") && grounded_check(def) && (move[0] == "じしん" || move[0] == "じならし" || move[0] == "マグニチュード")) 
    || (new get(atk).f_con.includes("ミストフィールド") && grounded_check(def) && move[1] == "ドラゴン")){
        correction = Math.round(correction * 2048 / 4096)
    }
    // フィールド強化 * 5325 / 4096 → 四捨五入
    if ((new get(atk).f_con.includes("エレキフィールド") && grounded_check(atk) && move[1] == "でんき") 
    || (new get(atk).f_con.includes("グラスフィールド") && grounded_check(atk) && move[1] == "くさ") 
    || (new get(atk).f_con.includes("サイコフィールド") && grounded_check(atk) && move[1] == "エスパー")){
        correction = Math.round(correction * 5325 / 4096)
    }
    // どろあそび、みずあそび * 1352 / 4096 → 四捨五入
    if (((new get(atk).p_con.includes("どろあそび") || new get(def).p_con.includes("どろあそび")) && move[1] == "でんき") 
    || ((new get(atk).p_con.includes("みずあそび") || new get(def).p_con.includes("みずあそび")) && move[1] == "ほのお")){
        correction = Math.round(correction * 1352 / 4096)
    }


    // 最終威力 1より小さければ1になる
    if (five_cut(move[3] * correction / 4096) < 1){
        return 1
    } else {
        return five_cut(move[3] * correction / 4096)
    }
}

// 最終攻撃力
function attack_calculation(status, atk, def, move){

    let attack = status[0]

    // はりきり
    if (new get(atk).ability == "はりきり" && move[2] == "物理"){
        attack = Math.floor(attack * 6144 / 4096)
    }
    
    // 初期値
    attack = attack * 4096

    // スロースタート、よわき
    if ((new get(atk).p_con.includes("スロースタート") && move[2] == "物理") 
    || (new get(atk).ability == "よわき" && new get(atk).last_HP <= new get(atk).full_HP / 2)){
        attack = Math.round(attack * 2048 / 4096)
    }
    // フラワーギフト、こんじょう、しんりょく、もうか、げきりゅう、むしのしらせ、もらいび、サンパワー、プラス、マイナス、はがねつかい、ごりむちゅう、トランジスタ、りゅうのあぎと
    if ((new get(atk).ability == "フラワーギフト" && new get(atk).f_con.includes("にほんばれ") && move[2] == "物理" && !(new get("A").ability == "エアロック" || new get("A").ability == "ノーてんき" || new get("B").ability == "エアロック" || new get("B").ability == "ノーてんき")) 
    || (new get(atk).ability == "こんじょう" && new get(atk).abnormal != "" && move[2] == "物理") 
    || (new get(atk).ability == "しんりょく" && new get(atk).last_HP <= new get(atk).full_HP / 3 && move[1] == "くさ") 
    || (new get(atk).ability == "もうか" && new get(atk).last_HP <= new get(atk).full_HP / 3 && move[1] == "ほのお") 
    || (new get(atk).ability == "げきりゅう" && new get(atk).last_HP <= new get(atk).full_HP / 3 && move[1] == "みず") 
    || (new get(atk).ability == "むしのしらせ" && new get(atk).last_HP <= new get(atk).full_HP / 3 && move[1] == "むし") 
    || (new get(atk).p_con.includes("もらいび") && move[1] == "ほのお") 
    || (new get(atk).ability == "サンパワー" && new get(atk).f_con.includes("にほんばれ") && move[2] == "特殊" && !(new get("A").ability == "エアロック" || new get("A").ability == "ノーてんき" || new get("B").ability == "エアロック" || new get("B").ability == "ノーてんき")) 
    || (new get(atk).ability == "はがねつかい" && move[1] == "はがね") 
    || (new get(atk).ability == "ごりむちゅう" && move[2] == "物理") 
    || (new get(atk).ability == "トランジスタ" && move[1] == "でんき") 
    || (new get(atk).ability == "りゅうのあぎと" && move[1] == "ドラゴン")){
        attack = Math.round(attack * 6144 / 4096)
    }
    // ちからもち、ヨガパワー、すいほう強化、はりこみ
    if ((new get(atk).ability == "ちからもち" && move[2] == "物理") 
    || (new get(atk).ability == "ヨガパワー" && move[2] == "物理") 
    || (new get(atk).ability == "すいほう" && move[1] == "みず")){
        attack = Math.round(attack * 8192 / 4096)
    }
    if (new get(atk).ability == "はりこみ"){
        const log = this_turn_log()
        if (log.includes("(" + def + "行動)")){
            if (log[log.indexOf("(" + def + "行動)") + 1].includes(def + "チームは") && log[log.indexOf("(" + def + "行動)") + 1].includes("引っ込めた")){
                attack = Math.round(attack * 8192 / 4096)
            }
        }
    }
    // あついしぼう、すいほう弱化
    if ((new get(def).ability == "あついしぼう" && (move[1] == "ほのお" || move[1] == "こおり")) 
    || (new get(def).ability == "すいほう" && move[1] == "ほのお")){
        attack = Math.round(attack * 2048 / 4096)
    }
    // こだわりハチマキ、こだわりメガネ
    if ((new get(atk).item == "こだわりハチマキ" && move[2] == "物理") 
    || (new get(atk).item == "こだわりメガネ" && move[2] == "特殊")){
        attack = Math.round(attack * 6144 / 4096)
    }
    // ふといホネ、しんかいのキバ、でんきだま
    if ((new get(atk).item == "ふといホネ" && (new get(atk).name == "カラカラ" || new get(atk).name.includes("ガラガラ")) && move[2] == "物理") 
    || (new get(atk).item == "しんかいのキバ" && new get(atk).name == "パールル" && move[2] == "特殊") 
    || (new get(atk).item == "でんきだま" && new get(atk).name == "ピカチュウ")){
        attack = Math.round(attack * 8192 / 4096)
    }

    // 最終攻撃 1より小さかったら1にする
    if (five_cut(attack / 4096) < 1){
        return 1
    } else {
        return five_cut(attack / 4096)
    }
}

// 最終防御
function　defense_calculation(status, atk, def, move){

    let defense = status[1]

    let phys = "物理"
    if (new get(def).p_con.includes("ワンダールーム")){
        phys = "特殊"
    }
    let spec = "特殊"
    if (new get(def).p_con.includes("ワンダールーム")){
        spec = "物理"
    }

    // すなあらしの時、岩タイプの特防が上がる
    if (new get(def).f_con.includes("すなあらし") && new get(def).type.includes("いわ") && move[2] == spec && !(new get("A").ability == "エアロック" || new get("A").ability == "ノーてんき" || new get("B").ability == "エアロック" || new get("B").ability == "ノーてんき")){
        defense = Math.floor(defense * 6144 / 4096)
    }

    // 初期値
    defense = defense * 4096
    
    // フラワーギフト、ふしぎなうろこ、くさのけがわ
    if ((new get(def).ability == "フラワーギフト" &&  new get(def).f_con.includes("にほんばれ") && move[2] == spec && !(new get("A").ability == "エアロック" || new get("A").ability == "ノーてんき" || new get("B").ability == "エアロック" || new get("B").ability == "ノーてんき")) 
    || (new get(def).ability == "ふしぎなうろこ" && new get(def).abnormal != "" && move[2] == phys) 
    || (new get(def).ability == "くさのけがわ" && new get(def).f_con.includes("グラスフィールド") && move[2] == phys)){
        defense = Math.floor(defense * 6144 / 4096)
    }
    // ファーコート
    if (new get(def).ability == "ファーコート" && move[2] == phys){
        defense = Math.floor(defense * 8192 / 4096)
    }
    // しんかのきせき、とつげきチョッキ
    if ((new get(def).item == "しんかのきせき") 
    || (new get(def).item == "とつげきチョッキ" && move[2] == spec)){
        defense = Math.floor(defense * 6144 / 4096)
    }
    // しんかいのウロコ、メタルパウダー
    if ((new get(def).item == "しんかいのウロコ" && new get(def).name == "パールル" && move[2] == spec) 
    || (new get(def).item == "メタルパウダー" && new get(def).name == "メタモン" && move[2] == phys)){
        defense = Math.floor(defense * 8192 / 4096)
    }

    // 最終防御　1より小さかったら1にする
    return Math.max(five_cut(defense / 4096), 1)

}

// 最終ダメージ
function damage_calculation(atk, def, power, attack, defense, move, critical){
    let damage = Math.floor(new get(atk).level * 2 / 5 + 2)
    damage = Math.floor(damage * power * attack / defense)
    damage = Math.floor(damage / 50 + 2)

    // 複数対象補正
    // おやこあい補正

    if (new get(def).item != "ばんのうがさ" && !(new get("A").ability == "エアロック" || new get("A").ability == "ノーてんき" || new get("B").ability == "エアロック" || new get("B").ability == "ノーてんき")){
        // 天気弱化補正
        if ((new get(atk).f_con.includes("あめ") && move[1] == "ほのお") 
        || (new get(atk).f_con.includes("にほんばれ") && move[1] == "みず")){
            damage = five_cut(damage * 2048 / 4096)
        }
        // 天気強化補正
        if ((new get(atk).f_con.includes("あめ") && move[1] == "みず") 
        || (new get(atk).f_con.includes("にほんばれ") && move[1] == "ほのお")){
            damage = five_cut(damage * 6144 / 4096)
        }
    }
    // 急所補正
    if (critical){
        damage = five_cut(damage * 6144 / 4096)
    }
    // ダメージ乱数補正
    const random = (Math.floor(Math.random() * 16 + 85)) / 100
    damage = parseInt(damage * random)
    // タイプ一致補正
    if (new get(atk).type.includes(move[1])){
        if (new get(atk).ability == "てきおうりょく"){
            damage = five_cut(damage * 8192 / 4096)
        } else {
            damage = five_cut(damage * 6144 / 4096)
        }
    }
    // タイプ相性補正
    const compatibility_rate = compatibility_check(atk, def, move)
    damage = Math.floor(damage * compatibility_rate)
    // やけど補正
    if (new get(atk).abnormal == "やけど" && move[2] == "物理" && move[0] != "からげんき" && new get(atk).ability != "こんじょう"){
        damage = five_cut(damage * 2048 / 4096)
    }
    // 壁補正
    if (!critical && new get(atk).ability != "すりぬけ"){
        if (((new get(def).f_con.includes("リフレクター") || new get(def).f_con.includes("オーロラベール")) && move[2] == "物理") 
        || ((new get(def).f_con.includes("ひかりのかべ") || new get(def).f_con.includes("オーロラベール")) && move[2] == "特殊")){
            damage = Math.round(damage * 2048 / 4096)
        }
    }
    // ブレインフォース補正
    if (new get(atk).ability == "ブレインフォース" && compatibility_rate > 1){
        damage = Math.round(damage * 5120 / 4096)
    }
    // スナイパー補正
    if (new get(atk).ability == "スナイパー" && critical){
        damage = Math.round(damage * 6144 / 4096)
    }
    // いろめがね補正
    if (new get(atk).ability == "いろめがね" && compatibility_rate < 1){
        damage = Math.round(damage * 8192 / 4096)
    }
    // もふもふほのお補正
    if (new get(def).ability == "もふもふ" && move[1] == "ほのお"){
        damage = Math.round(damage * 8192 / 4096)
    }
    // ダメージ半減特性補正
    if ((new get(def).ability == "こおりのりんぷん" && move[2] == "特殊") 
    || (new get(def).ability == "パンクロック" && music_move_list.includes(move[0])) 
    || ((new get(def).ability == "ファントムガード" || new get(def).ability == "マルチスケイル") && (new get(def).full_HP == new get(def).last_HP)) 
    || (new get(def).ability == "もふもふ" && move[6] == "直接")){
        damage = Math.round(damage * 2048 / 4096)
    }
    // 効果抜群ダメージ軽減特性補正
    if ((new get(atk).ability == "ハードロック" || new get(atk).ability == "フィルター" || new get(atk).ability == "プリズムアーマー") && compatibility_rate > 1){
        damage = Math.round(damage * 3072 / 4096)
    }
    // フレンドガード補正
    // たつじんのおび補正
    if (new get(atk).item == "たつじんのおび" && compatibility_rate > 1){
        damage = Math.round(damage * 4915 / 4096)
    }
    // メトロノーム補正
    // いのちのたま補正
    if (new get(atk).item == "いのちのたま"){
        damage = Math.floor(damage * 5324 / 4096)
    }
    // 半減きのみ補正
    for (let i = 0; i < half_damage_berry_list.length; i++){
        if (new get(def).item == half_damage_berry_list[i][0] && move[1] == half_damage_berry_list[i][1]){
            if (move[1] == "ノーマル" || compatibility_check(atk, def, move) > 1){
                if (new get(def).ability == "じゅくせい"){
                    damage = Math.round(damage * 1024 / 4096)
                } else {
                    damage = Math.round(damage * 2048 / 4096)
                }
                txt = def + "チームの　" + new get(def).name + "　の　" + new get(def).item + "が　威力を弱めた" + CR
                document.battle_log.battle_log.value += txt
                set_recycle_item(def)
                set_belch(def)
            }
        }
    }
    // ちいさくなる、あなをほる、ダイマックス状態への攻撃補正
    if ((new get(def).p_con.includes("ちいさくなる") && minimize_move_list.includes(move[0])) 
    || (new get(def).p_con.includes("あなをほる") && (move[0] == "じしん" || move[0] == "マグニチュード")) 
    || (new get(def).p_con.includes("ダイビング") && move[0] == "なみのり")){
        damage = Math.round(damage * 8192 / 4096)
    }
    // まもる状態貫通補正

    // 最終ダメージ
    return [Math.max(damage, 1), compatibility_rate, critical]
}

// ダメージ固定技
function fixed_damage_move(atk, def, move, order){
    if (move[0] == "ソニックブーム"){
        return [20, 1, false]
    } else if (move[0] == "りゅうのいかり"){
        return [40, 1, false]
    } else if (move[0] == "ちきゅうなげ" || move[0] == "ナイトヘッド"){
        return [new get(atk).level, 1, false]
    } else if (move[0] == "サイコウェーブ"){
        return [Math.floor(new get(atk).level * (Math.floor(Math.random() * 101) * 0.01 + 0.5)), 1, false]
    } else if (move[0] == "いかりのまえば" || move[0] == "しぜんのいかり"){
        return [Math.floor(new get(def).last_HP / 2), 1, false]
    } else if (move[0] == "がむしゃら"){
        return [new get(def).last_HP - new get(atk).last_HP, 1, false]
    } else if (move[0] == "カウンター"){
        let damage = 0
        for (let i = 0; i < new get(atk).p_len; i++){
            if (new get(atk).p_list[i].includes("物理ダメージ")){
                damage = Number(new get(atk).p_list[i].slice(7))
            }
        }
        condition_remove(atk, "poke", "物理ダメージ")
        return [damage * 2, 1, false]
    } else if (move[0] == "ミラーコート"){
        let damage = 0
        for (let i = 0; i < new get(atk).p_len; i++){
            if (new get(atk).p_list[i].includes("特殊ダメージ")){
                damage = Number(new get(atk).p_list[i].slice(7))
            }
        }
        condition_remove(atk, "poke", "特殊ダメージ")
        return [damage * 2, 1, false]
    } else if (move[0] == "がまん"){
        return [move[3] * 2, 1, false]
    } else if (move[0] == "メタルバースト"){
        let damage = 0
        for (let i = 0; i < new get(atk).p_len; i++){
            if (new get(atk).p_list[i].includes("ダメージ")){
                damage = Number(new get(atk).p_list[i].slice(7))
            }
        }
        condition_remove(atk, "poke", "ダメージ")
        return [Math.floor(damage * 1.5), 1, false]
    } else if (move[0] == "いのちがけ"){
        return [new get(atk).last_HP, 1, false]
    } else if (move[0] == "ハサミギロチン" || move[0] == "つのドリル" || move[0] == "じわれ" || move[0] == "ぜったいれいど"){
        document.battle_log.battle_log.value += "一撃必殺！" + CR
        return [new get(def).last_HP, 1, false]
    } else if (move[0] == "ガーディアン・デ・アローラ"){
        return [Math.floor(new get(def).last_HP * 0.75), 1, false]
    }
}



function damage_declaration(atk, team, damage, move){
    // damage = [与えたダメージ, タイプ相性, 急所判定, 発生したダメージ]
    const poke = document.getElementById(team + "_poke").textContent
    const HP_last = Number(document.getElementById(team + "_HP_last").textContent)
    const p_con = document.battle[team + "_poke_condition"].value

    if (p_con.includes("みがわり：") && !music_move_list.includes(move[0]) && move[0] != "シャドースチール" && new get(atk).ability != "すりぬけ"){
        document.battle[team + "_poke_condition"].value = ""
        let check = damage[0]
        for (let i = 0; i < p_con .split("\n").length - 1; i++){
            if (p_con.split("\n")[i].includes("みがわり：")){
                const now_HP = Number(p_con.split("\n")[i].slice(5).split("/")[0])
                if (damage[0] < now_HP){
                    txt = team + "チームの　みがわりに　" + damage[0] + "　のダメージ" + CR
                    document.battle_log.battle_log.value += txt
                    document.battle[team + "_poke_condition"].value += "みがわり：" + (now_HP - damage[0]) + p_con.split("\n")[i].slice(-3) + CR
                } else {
                    txt = team + "チームの　みがわりに　" + p_con.split("\n")[i].slice(5).split("/")[0] + "（" +  damage[0] + "）　のダメージ" + CR
                    document.battle_log.battle_log.value += txt
                    txt = team + "チームの　みがわりは　壊れてしまった" + CR
                    document.battle_log.battle_log.value += txt
                    check = p_con.split("\n")[i].slice(5).split("/")[0]
                }
            } else {
                document.battle[team + "_poke_condition"].value += p_con.split("\n")[i] + CR
            }
            if (damage[1] < 1){
                txt = "効果は今ひとつのようだ" + CR
                document.battle_log.battle_log.value += txt
            } else if (damage[1] > 1){
                txt = "効果は抜群だ！" + CR
                document.battle_log.battle_log.value += txt
            }
            if (damage[2] == 1){
                txt = "急所に　当たった！" + CR
                document.battle_log.battle_log.value += txt
            }
            return check
        }
    } else {
        txt = team + "チームの　" + poke + "　に　" + damage[0] + "　(" + damage[3] + ")　のダメージ" + CR
        document.battle_log.battle_log.value += txt

        // ダメおし用
        condition_remove(team, "poke", "ダメおし")
        document.battle[team + "_poke_condition"].value += "ダメおし" + CR
        // ゆきなだれ、リベンジ用
        condition_remove(team, "poke", "ダメージ")
        document.battle[team + "_poke_condition"].value += move[2] + "ダメージ：" + damage[0] + CR
        // がまん用
        if (new get(team).p_con.includes("がまん")){
            const p_con = document.battle[team + "_poke_condition"].value
            document.battle[team + "_poke_condition"].value = ""
            for (let i = 0; i < p_con.split("\n").length - 1; i++){
                if (p_con.split("\n")[i].includes("がまん")){
                    const log = Number(p_con.split("\n")[i].slice(8)) + damage[0]
                    document.battle[team + "_poke_condition"].value += p_con.split("\n")[i].slice(0, 8) + log + CR
                } else {
                    document.battle[team + "_poke_condition"].value += p_con.split("\n")[i] + CR
                }
            }
        }
        
        // 残りのHPを表示
        document.getElementById(team + "_HP_last").textContent = Math.max(HP_last - damage[0], 0)
        document.getElementById(team + "_" + battle_poke_num(team) + "_last_HP").textContent = Math.max(HP_last - damage[0], 0)

        if (damage[1] < 1){
            txt = "効果は今ひとつのようだ" + CR
            document.battle_log.battle_log.value += txt
        } else if (damage[1] > 1){
            txt = "効果は抜群だ！" + CR
            document.battle_log.battle_log.value += txt
        }
        if (damage[2] == 1){
            txt = "急所に　当たった！" + CR
            document.battle_log.battle_log.value += txt
        }

        return damage[0]
    }
}

function reflection_check(def, move, damage, order){
    const def_p_con = document.battle[def + "_poke_condition"].value
    if (def_p_con.includes("きあいパンチ") && damage[0] > 0){
        document.battle[def + "_poke_condition"].value = ""
        for (let i = 0; i < def_p_con.split("\n").length - 1; i++){
            if (def_p_con.split("\n")[i].includes("きあいパンチ")){
                document.battle[def + "_poke_condition"].value += "きあいパンチ　失敗" + CR
            } else {
                document.battle[def + "_poke_condition"].value += def_p_con.split("\n")[i] + CR
            }
        }
    } else if (def_p_con.includes("トラップシェル") && move[2] == "物理"){
        document.battle[def + "_poke_condition"].value = ""
        for (let i = 0; i < def_p_con.split("\n").length - 1; i++){
            if (def_p_con.split("\n")[i].includes("トラップシェル：不発")){
                document.battle[def + "_poke_condition"].value += "トラップシェル：成功" + CR
            } else {
                document.battle[def + "_poke_condition"].value += def_p_con.split("\n")[i] + CR
            }
        }
        const move = move_success_judge(order[1], order[0], order)
        if (move != false){
            move_process(order[1], order[0], move, order)
        }
    }
}