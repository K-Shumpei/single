// ターン終了時の処理順

// 0.その他の終了
    // まもる、みきり、ニードルガード、トーチカ
    // キングシールド、ブロッキング
    // ファストガード、ワイドガード、トリックガード
    // たたみがえし
    // ふんじん



function end_process(){

    document.battle_log.battle_log.value += "---------- 終了時の処理 ----------" + CR

    // 素早さ判定
    let order = ["A", "B"]
    const speed = speed_check()
    if (speed[0] > speed[1]){
        order =  trick_room(["A", "B"])
    } else if (speed[0] < speed[1]){
        order =  trick_room(["B", "A"])
    } else {
        // 6.乱数
        if (Math.random() < 0.5){
            order =  ["A", "B"]
        } else {
            order =  ["B", "A"]
        }
    }
    const reverse = [order[1], order[0]]

    // 1.てんきの効果
    weather_effect(order)
    // 2.みらいよち/はめつのねがい: 技が使用された順に発動
    future_attack(order)
    // 3.ねがいごと
    wish_recover(order)
    // 4.場の状態・特性・もちものによる回復・ダメージ
    field_ability_item_damage(order)
    // 5.アクアリング
    aqua_ring(order)
    // 6.ねをはる
    ingrain(order)
    // 7.やどりぎのタネ
    leech_seed(order)
    // 8 どく/もうどく/ポイズンヒール
    acid_check(order)
    // 9 やけど
    burn_check(order)
    // 10.あくむ
    nightmare(order)
    // 11.のろい
    curse(order)
    // 12.バインド
    bind_check(order)
    // 13.たこがため
    octolock(order)
    // 14.ちょうはつの終了
    taunt_end(order)
    // 15.アンコールの終了
    encore_end(order)
    // 16.かなしばりの終了
    disable_end(order)
    // 17.でんじふゆうの終了
    magnet_rise_end(order)
    // 18.テレキネシスの終了
    telekinesis_end(order)
    // 19.かいふくふうじの終了
    heal_block_end(order)
    // 20.さしおさえの終了
    embargo_end(order)
    // 21.ねむけ
    sleep_check(order)
    // 22.ほろびのうた
    perish_song(order)
    // 23.片側の場の状態の継続/終了: ホスト側の状態が先にすべて解除された後に、ホストでない側の状態が解除される。
    one_side_field_end(order)
    // 24.全体の場の状態の継続/終了
    both_side_field_end(order)
    // 25.はねやすめ解除
    roost_end(order)
    // 26.その他の状態・特性・もちもの
    other_condition_ability_item(order)
        // a. さわぐ
        // b. ねむりによるあばれるの中断
        // c. かそく/ムラっけ/スロースタート/ナイトメア
        // d. くっつきバリ/どくどくだま/かえんだま
        // e. ものひろい/しゅうかく/たまひろい
    // 27.ダルマモード
    zen_mode(order)
    // 28.リミットシールド
    shields_down(order)
    // 29.スワームチェンジ
    power_construct(order)
    // 30.ぎょぐん
    // 31.はらぺこスイッチ
    hunger_switch(order)

    // A.その他の終了
    other_end(order)
    // B.その他の処理
    other_process(order)

    document.battle.battle_button.disabled = false
    document.battle_log.battle_log.value += "---------- ターン終了 ----------" + CR

    // C.ひんしのポケモンがいる時、交換する
    return_fainted_pokemon(order)
    // D.次ターンの、選択ボタンの無効化
    cannot_choose_action(order, reverse)
}

// A.その他の終了
function other_end(order){
    // ポケモンの状態の終了
    for (const team of order){
        for (let text of end_process_poke_condition){
            condition_remove(team, "poke", text)
        }
    }
    // フィールドの状態の終了
    for (const team of order){
        for (let text of end_process_field_condition){
            condition_remove(team, "field", text)
        }
    }

    // じごくづきのターン消費
    for (const team of order){
        let p_con = new get(team).p_con
        document.battle[team + "_poke_condition"].value = ""
        for (let i = 0; i < p_con.split("\n").length - 1; i++){
            if (p_con.split("\n")[i] == "じごくづき　2/2"){
                document.battle[team + "_poke_condition"].value += "じごくづき　1/2" + CR
            } else if (p_con.split("\n")[i] == "じごくづき　1/2"){
                txt = team + "チームの　" + new get(team).name + "は　じごくづきの効果が切れた！" + CR
                document.battle_log.battle_log.value += txt
            } else {
                document.battle[team + "_poke_condition"].value += p_con.split("\n")[i] + CR
            }
        }
    }
    // じゅうでんのテキスト変更
    for (const team of order){
        let p_con = new get(team).p_con
        document.battle[team + "_poke_condition"].value = ""
        for (let i = 0; i < p_con.split("\n").length - 1; i++){
            if (p_con.split("\n")[i] == "じゅうでん　開始"){
                document.battle[team + "_poke_condition"].value += "じゅうでん" + CR
            } else if (p_con.split("\n")[i] != "じゅうでん"){
                document.battle[team + "_poke_condition"].value += p_con.split("\n")[i] + CR
            }
        }
    }
    // とぎすますのテキスト変更
    for (const team of order){
        let p_con = new get(team).p_con
        document.battle[team + "_poke_condition"].value = ""
        for (let i = 0; i < p_con.split("\n").length - 1; i++){
            if (p_con.split("\n")[i] == "とぎすます　開始"){
                document.battle[team + "_poke_condition"].value += "とぎすます" + CR
            } else if (p_con.split("\n")[i] != "とぎすます"){
                document.battle[team + "_poke_condition"].value += p_con.split("\n")[i] + CR
            }
        }
    }
    // フェアリーロックのテキスト変更
    for (const team of order){
        let f_con = new get(team).f_con
        document.battle[team + "_field_condition"].value = ""
        for (let i = 0; i < f_con.split("\n").length - 1; i++){
            if (f_con.split("\n")[i] == "逃げられない：フェアリーロック　開始"){
                document.battle[team + "_field_condition"].value += "逃げられない：フェアリーロック" + CR
            } else if (f_con.split("\n")[i] == "逃げられない：フェアリーロック"){

            } else {
                document.battle[team + "_field_condition"].value += f_con.split("\n")[i] + CR
            }
        }
    }
    // かたやぶりなどの特性無視の終了
    for (const team of order){
        let p_con = document.battle[team + "_poke_condition"].value
        document.battle[team + "_poke_condition"].value = ""
        for (let i = 0; i < p_con.split("\n").length - 1; i++){
            if (p_con.split("\n")[i].includes("特性無視：")){
                document.getElementById(team + "_ability").textContent = p_con.split("\n")[i].slice(5)
            } else {
                document.battle[team + "_poke_condition"].value += p_con.split("\n")[i] + CR
            }
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
    'とぎすます', 
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
function other_process(order){
    for (const team of order){
        const p_con = document.battle[team + "_poke_condition"].value
        const f_con = document.battle[team + "_field_condition"].value
        // エコーボイスのターン経過
        if (f_con.includes("エコーボイス")){
            document.battle[team + "_field_condition"].value = ""
            for (let i = 0; i < f_con.split("\n").length - 1; i++){
                if (f_con.split("\n")[i].includes("エコーボイス")){
                    const num = Number(f_con.split("\n")[i].slice(8))
                    if (num % 1 != 0){
                        document.battle[team + "_field_condition"].value += "エコーボイス　+" + Math.ceil(num) +　CR
                    }
                } else {
                    document.battle[team + "_field_condition"].value += f_con.split("\n")[i] + CR
                }
            }
        }
    }
}

// C.ひんしのポケモンがいる時、交換する
function return_fainted_pokemon(order){
    let check = 0
    for (const team of order){
        if (new get(team).f_con.includes("ひんし")){
            document.battle_log.battle_log.value += team + "チームは　戦闘に出すポケモンを選んでください" + CR
            check += 1
        }
    }
    if (check > 0){
        document.battle.battle_button.disabled = true
    }
}

// D.次ターンの、選択ボタンの無効化
function cannot_choose_action(order, reverse){
    for (const team of [order, reverse]){
        // 全ての選択ボタンのチェックを外す
        for (let i = 0; i < 3; i++){
            document.getElementById(team[0] + "_" + i + "_button").checked = false
        }
        for (let i = 0; i < 4; i++){
            document.getElementById(team[0] + "_radio_" + i).checked = false
        }
        // ほおばる：きのみを持っている場合、技選択が可能になる
        for (let i = 0; i < 4; i++){
            if (document.getElementById(team[0] + "_move_" + i).textContent == "ほおばる"){
                if (berry_item_list.includes(new get(team[0]).item)){
                    document.getElementById(team[0] + "_radio_" + i).disabled = false
                } else {
                    document.getElementById(team[0] + "_radio_" + i).disabled = true
                }
            }
        }
        // ゲップ：備考欄に「ゲップ」の文字があれば使用可能になる
        for (let i = 0; i < 4; i++){
            if (document.getElementById(team[0] + "_move_" + i).textContent == "ゲップ"){
                for (let j = 0; j < 3; j++){
                    if (document.getElementById(team[0] + "_" + j + "_existence").textContent == "戦闘中" && document.getElementById(team[0] + "_" + j + "_belch").textContent == "ゲップ"){
                        document.getElementById(team[0] + "_radio_" + i).disabled = false
                    }
                }
            }
        }
        // いちゃもん
        if (new get(team[0]).p_con.includes("いちゃもん")){
            for (let i = 0; i < 4; i++){
                if (document.getElementById(team[0] + "_move_" + i).textContent == document.battle[team[0] + "_used_move"].value){
                    document.getElementById(team[0] + "_radio_" + i).disabled = true
                    document.getElementById(team[0] + "_radio_" + i).checked = false
                }
            }
        }
        // こだわりロック
        if (!new get(team[0]).item.includes("こだわり")){
            condition_remove(team[0], "poke", "こだわりロック")
        }
        for (let i = 0; i < new get(team[0]).p_len; i++){
            if (new get(team[0]).p_list[i].includes("こだわりロック")){
                for (let j = 0; j < 4; j++){
                    if (document.getElementById(team[0] + "_move_" + j).textContent != new get(team[0]).p_list[i].slice(8)){
                        document.getElementById(team[0] + "_radio_" + j).disabled = true
                    }
                }
            }
        }
        // とつげきチョッキ
        if (new get(team[0]).item == "とつげきチョッキ"){
            for (let i = 0; i < 4; i++){
                if (document.getElementById(team[0] + "_move_" + i).textContent != ""){
                    if (move_search_by_name(document.getElementById(team[0] + "_move_" + i).textContent)[2] == "変化"){
                        document.getElementById(team[0] + "_radio_" + i).disabled = true
                    }
                }
            }
        }
        // 逃げられない状態、バインド状態による交換ボタンの無効化
        if (new get(team[0]).p_con.includes("逃げられない") || new get(team[0]).p_con.includes("バインド") || new get(team[0]).p_con.includes("ねをはる") || new get(team[0]).f_con.includes("フェアリーロック") 
        || (new get(team[1]).ability == "ありじごく" && grounded_check(team[0])) 
        || (new get(team[1]).ability == "かげふみ" && new get(team[0]).ability != "かげふみ") 
        || (new get(team[1]).ability == "じりょく" && new get(team[0]).type.includes("はがね"))){
            if (new get(team[0]).item != "きれいなぬけがら" && !new get(team[0]).type.includes("ゴースト")){
                for (let i = 0; i < 3; i++){
                    document.getElementById(team[0] + "_" + i + "_button").disabled = true
                    document.getElementById(team[0] + "_" + i + "_button").checked = false
                }
            }
        }
        // 反動で動けなくなる技の反動ターン
        // 溜め技の攻撃ターン
        // 数ターン行動する技の使用中
        if (new get(team[0]).p_con.includes("反動で動けない") || new get(team[0]).p_con.includes("溜め技") || new get(team[0]).p_con.includes("あばれる") 
        || new get(team[0]).p_con.includes("アイスボール") || new get(team[0]).p_con.includes("ころがる") || new get(team[0]).p_con.includes("がまん")){
            for (let i = 0; i < 3; i++){
                document.getElementById(team[0] + "_" + i + "_button").disabled = true
                document.getElementById(team[0] + "_" + i + "_button").checked = false
            }
            for (let i = 0; i < 4; i++){
                document.getElementById(team[0] + "_radio_" + i).disabled = true
                document.getElementById(team[0] + "_radio_" + i).checked = false
            }
        }
        if (new get(team[0]).p_con.includes("姿を隠す：フリーフォール（防御）")){
            for (let i = 0; i < 3; i++){
                document.getElementById(team[0] + "_" + i + "_button").disabled = true
                document.getElementById(team[0] + "_" + i + "_button").checked = false
            }
        }
    }
}


// 1.てんきの効果
function weather_effect(order){
    // a. にほんばれ/あめ/すなあらし/あられの終了
    for (const team of order){
        if (!new get(team).f_con.includes("おおひでり") && !new get(team).f_con.includes("おおあめ")){
            decrease_per_turn(team, "にほんばれ", "field")
            decrease_per_turn(team, "あめ", "field")
            decrease_per_turn(team, "すなあらし", "field")
            decrease_per_turn(team, "あられ", "field")
        }
    }
    // b. すなあらし/あられのダメージ
    for (const team of order){
        if (new get(team).last_HP > 0 && new get(team).ability != "ぼうじん" && new get(team).item != "ぼうじんゴーグル" && !(new get("A").ability == "エアロック" || new get("A").ability == "ノーてんき" || new get("B").ability == "エアロック" || new get("B").ability == "ノーてんき")){
            if (new get(team).f_con.includes("すなあらし") && !(new get(team).type.includes("いわ") || new get(team).type.includes("じめん") || new get(team).type.includes("はがね") || new get(team).ability == "すながくれ" || new get(team).ability == "すなかき" || new get(team).ability == "すなのちから")){
                HP_change_not_attack(team, Math.floor(new get(team).full_HP / 16), "-", "すなあらし")
            } else if (new get(team).f_con.includes("あられ") && !(new get(team).type.includes("こおり") || new get(team).ability == "アイスボディ" || new get(team).ability == "ゆきかき" || new get(team).ability == "ゆきがくれ")){
                HP_change_not_attack(team, Math.floor(new get(team).full_HP / 16), "-", "あられ")
            }
        }
    }
    // c. かんそうはだ/サンパワー/あめうけざら/アイスボディ
    for (const team of order){
        if (new get(team).last_HP > 0 && !(new get("A").ability == "エアロック" || new get("A").ability == "ノーてんき" || new get("B").ability == "エアロック" || new get("B").ability == "ノーてんき")){
            if (new get(team).ability == "かんそうはだ" && new get(team).f_con.includes("にほんばれ")){
                HP_change_not_attack(team, Math.floor(new get(team).full_HP / 8), "-", "かんそうはだ")
            } else if (new get(team).ability == "かんそうはだ" && new get(team).f_con.includes("あめ")){
                HP_change_not_attack(team, Math.floor(new get(team).full_HP / 8), "+", "かんそうはだ")
            } else if (new get(team).ability == "サンパワー" && new get(team).f_con.includes("にほんばれ")){
                HP_change_not_attack(team, Math.floor(new get(team).full_HP / 8), "-", "サンパワー")
            } else if (new get(team).ability == "あめうけざら" && new get(team).f_con.includes("あめ")){
                HP_change_not_attack(team, Math.floor(new get(team).full_HP / 16), "+", "あめうけざら")
            } else if (new get(team).ability == "アイスボディ" && new get(team).f_con.includes("あられ")){
                HP_change_not_attack(team, Math.floor(new get(team).full_HP / 16), "+", "アイスボディ")
            }
        }
    }
}

// 2.みらいよち/はめつのねがい: 技が使用された順に発動
function future_attack(order){
    for (const team of order){
        let enemy = "B"
        if (team == "B"){
            enemy = "A"
        }
        let f_con = new get(enemy).f_con
        document.battle[enemy + "_field_condition"].value = ""
        let move_name = ""
        for (let i = 0; i < f_con.split("\n").length - 1; i++){
            if (f_con.split("\n")[i].includes("みらいよち") || f_con.split("\n")[i].includes("はめつのねがい")){
                let turn = Number(f_con.split("\n")[i].slice(-3, -2))
                document.battle[enemy + "_field_condition"].value += f_con.split("\n")[i].slice(0, -3) + (turn - 1) + "/3" + CR
                if (turn == 1){
                    move_name = f_con.split("\n")[i].slice(0, -7)
                }
            } else {
                document.battle[enemy + "_field_condition"].value += f_con.split("\n")[i] + CR
            }
        }
        if (move_name != "" && new get(enemy).last_HP > 0){
            txt = enemy + "チームの　" + new get(enemy).name + "は　未来の攻撃を受けた！" + CR
            document.battle_log.battle_log.value += txt
            if (accuracy_failure(team, enemy, move_search_by_name(move_name), order)){
                txt = enemy + "チームの　" + new get(enemy).name + "　には当たらなかった" + CR
                document.battle_log.battle_log.value += txt
            } else {
                move_process(team, enemy, move_search_by_name(move_name), order)
            }
            condition_remove(enemy, "field", move_name)
        }
    }
}

// 3.ねがいごと
function wish_recover(order){
    for (const team of order){
        const f_con = document.battle[team + "_field_condition"].value
        if (f_con.includes("ねがいごと")){
            document.battle[team + "_field_condition"].value = ""
            for (let i = 0; i < f_con.split("\n").length - 1; i++){
                if (f_con.split("\n")[i].includes("ねがいごと宣言ターン")){
                    document.battle[team + "_field_condition"].value += f_con.split("\n")[i].substring(0, f_con.split("\n")[i].indexOf("：") + 1) + "回復ターン" + CR
                } else if (f_con.split("\n")[i].includes("回復ターン") && new get(team).last_HP > 0){
                    txt = "願いが叶った！" + CR
                    document.battle_log.battle_log.value += txt
                    let damage = Number(f_con.split("\n")[i].replace(/[^0-9]/g, ""))
                    HP_change_not_attack(team, damage, "+", "ねがいごと")
                } else if (f_con.split("\n")[i].includes("回復ターン") && new get(team).last_HP == 0){
                    txt = "願いは叶わなかった！" + CR
                    document.battle_log.battle_log.value += txt
                } else {
                    document.battle[team + "_field_condition"].value += f_con.split("\n")[i] + CR
                }
            }
        }
    }
}

// 4.場の状態・特性・もちものによる回復・ダメージ
function field_ability_item_damage(order){
    // a. ひのうみ/キョダイベンタツ/キョダイゴクエン/キョダイホウゲキ/キョダイフンセキ(ダメージ): 技が使用された順に発動。
    // b. グラスフィールド(回復)
    if (new get("A").f_con.includes("グラスフィールド")){
        for (const team of order){
            if (grounded_check(team) && new get(team).last_HP > 0){
                HP_change(team, Math.floor(new get(team).full_HP / 16), "+", "グラスフィールド")
            }
        }
    }
    // c. うるおいボディ/だっぴ/いやしのこころ
    for (const team of order){
        if (new get(team).last_HP > 0){
            if (new get(team).ability == "うるおいボディ" && new get(team).f_con.includes("あめ") && new get(team).abnormal != "" && !(new get("A").ability == "エアロック" || new get("A").ability == "ノーてんき" || new get("B").ability == "エアロック" || new get("B").ability == "ノーてんき")){
                txt = team + "チームの　" + new get(team).name + "は　うるおいボディで状態異常が回復！" + CR
                document.battle_log.battle_log.value += txt
                document.getElementById(team + "_abnormal").textContent = ""
                document.getElementById(team + "_" + battle_poke_num(team) + "_abnormal").textContent = ""
            } else if (new get(team).ability == "だっぴ" && new get(team).abnormal != ""){
                let random = Math.random()
                if (random < 0.3){
                    txt = team + "チームの　" + new get(team).name + "は　だっぴで状態異常が回復！" + CR
                    document.battle_log.battle_log.value += txt
                    document.getElementById(team + "_abnormal").textContent = ""
                    document.getElementById(team + "_" + battle_poke_num(team) + "_abnormal").textContent = ""
                }
            }
        }
    }
    // b. たべのこし/くろいヘドロ
    for (const team of order){
        if (new get(team).item == "たべのこし" && new get(team).last_HP > 0){
            HP_change_not_attack(team, Math.floor(new get(team).full_HP / 16), "+", "たべのこし")
        } else if (new get(team).item == "くろいヘドロ" && new get(team).last_HP > 0){
            if (new get(team).type.includes("どく")){
                HP_change_not_attack(team, Math.floor(new get(team).full_HP / 16), "+", "くろいヘドロ")
            } else {
                HP_change_not_attack(team, Math.floor(new get(team).full_HP / 8), "-", "くろいヘドロ")
            }
        }
    }
}

// 5.アクアリング
function aqua_ring(order){
    for (const team of order){
        if (new get(team).p_con.includes("アクアリング")){
            let change = Math.floor(new get(team).full_HP / 16)
            if (new get(team).item == "おおきなねっこ"){
                change = five_cut(change * 5324 / 4096)
            }
            HP_change_not_attack(team, change, "+", "アクアリング")
        }
    }
}

// 6.ねをはる
function ingrain(order){
    for (const team of order){
        if (new get(team).p_con.includes("ねをはる")){
            let change = Math.floor(new get(team).full_HP / 16)
            if (new get(team).item == "おおきなねっこ"){
                change = five_cut(change * 5324 / 4096)
            }
            HP_change_not_attack(team, change, "+", "ねをはる")
        }
    }
}

// 7.やどりぎのタネ
function leech_seed(order){
    let reverse = [order[1], order[0]]
    for (const team of [order, reverse])
    if (new get(team[0]).p_con.includes("やどりぎのタネ") && new get(team[1]).last_HP > 0){
        let change = Math.floor(new get(team[0]).full_HP / 8)
        HP_change_not_attack(team[0], change, "-", "やどりぎのタネ")
        if (new get(team[1]).item == "おおきなねっこ"){
            change = five_cut(change * 5324 / 4096)
        }
        if (new get(team[0]).ability == "ヘドロえき"){
            HP_change_not_attack(team[1], change, "-", "やどりぎのタネ")
        } else {
            HP_change_not_attack(team[1], change, "+", "やどりぎのタネ")
        }
    }
}

// 8 どく/もうどく/ポイズンヒール
function acid_check(order){
    for (const team of order){
        let condition = document.battle[team + "_poke_condition"].value
        if (new get(team).abnormal == "どく" && new get(team).last_HP > 0){
            if (new get(team).ability == "ポイズンヒール"){
                HP_change_not_attack(team, Math.floor(new get(team).full_HP / 8), "+", "ポイズンヒール")   
            } else {
                HP_change_not_attack(team, Math.floor(new get(team).full_HP / 8), "-", "どく")   
            }   
        }
        if (new get(team).abnormal == "もうどく" && new get(team).last_HP > 0){
            document.battle[team + "_poke_condition"].value = ""
            for (let i = 0; i < condition.split("\n").length - 1; i++){
                if (condition.split("\n")[i].includes("もうどく")){
                    const turn = Number(condition.split("\n")[i].replace(/[^0-9]/g, ""))
                    document.battle[team + "_poke_condition"].value += "もうどく　" + String(turn + 1) + "ターン目" + CR
                    if (new get(team).ability == "ポイズンヒール"){
                        HP_change_not_attack(team, Math.floor(new get(team).full_HP / 8), "+", "ポイズンヒール")
                    } else {
                        HP_change_not_attack(team, Math.floor(new get(team).full_HP * turn / 16), "-", "もうどく")
                    }
                } else {
                    document.battle[team + "_poke_condition"].value += condition.split("\n")[i] + CR
                }
            }
        }
    }
}

// 9 やけど
function burn_check(order){
    for (const team of order){
        if (new get(team).abnormal == "やけど" && new get(team).last_HP > 0){
            if (new get(team).ability == "たいねつ"){
                HP_change_not_attack(team, Math.floor(new get(team).full_HP / 32), "-", "やけど")
            } else {
                HP_change_not_attack(team, Math.floor(new get(team).full_HP / 16), "-", "やけど")
            }
        }
    }
}

// 10.あくむ
function nightmare(order){
    for (const team of order){
        if (new get(team).p_con.includes("あくむ")){
            HP_change_not_attack(team, Math.floor(new get(team).full_HP / 4), "-", "あくむ")
        }
    }
}

// 11.のろい
function curse(order){
    for (const team of order){
        if (new get(team).p_con.includes("のろい")){
            HP_change_not_attack(team, Math.floor(new get(team).full_HP / 4), "-", "のろい")
        }
    }
}

// 12.バインド
function bind_check(order){
    for (const team of order){
        const poke = document.getElementById(team + "_poke").textContent
        const p_con = document.battle[team + "_poke_condition"].value
        const full_HP = Number(document.getElementById(team + "_HP").textContent)
        document.battle[team + "_poke_condition"].value = ""
        for (let i = 0; i < p_con.split("\n").length - 1; i++){
            if (p_con.split("\n")[i].includes("バインド（長）")){
                const turn = Number(p_con.split("\n")[i].replace(/[^0-9]/g, ""))
                if (turn < 7){
                    document.battle[team + "_poke_condition"].value += "バインド（長）　" + (turn + 1) + "ターン目" + CR
                    HP_change_not_attack(team, Math.floor(full_HP / 8), "-", "バインド")
                } else if (turn == 7){
                    txt = team + "チームの　" + poke + "は　バインドから　解放された！" + CR
                    document.battle_log.battle_log.value += txt
                }
            } else if (p_con.split("\n")[i].includes("バインド")){
                const turn = Number(p_con.split("\n")[i].replace(/[^0-9]/g, ""))
                if (turn < 4){
                    document.battle[team + "_poke_condition"].value += p_con.split("\n")[i].slice(0, -5) + (turn + 1) + "ターン目" + CR
                    if (p_con.split("\n")[i].includes("バインド（強）")){
                        HP_change_not_attack(team, Math.floor(full_HP / 6), "-", "バインド")
                    } else {
                        HP_change_not_attack(team, Math.floor(full_HP / 8), "-", "バインド")
                    }
                } else if (turn == 4){
                    const random = Math.random()
                    if(random < 0.5){
                        document.battle[team + "_poke_condition"].value += p_con.split("\n")[i].slice(0, -5) + "5ターン目" + CR
                        if (p_con.split("\n")[i].includes("バインド（強）")){
                            HP_change_not_attack(team, Math.floor(full_HP / 6), "-", "バインド")
                        } else {
                            HP_change_not_attack(team, Math.floor(full_HP / 8), "-", "バインド")
                        }
                    } else {
                        txt = team + "チームの　" + poke + "は　バインドから　解放された！" + CR
                        document.battle_log.battle_log.value += txt
                    }
                } else if (turn == 5){
                    txt = team + "チームの　" + poke + "は　バインドから　解放された！" + CR
                    document.battle_log.battle_log.value += txt
                }
            } else {
                document.battle[team + "_poke_condition"].value += p_con.split("\n")[i] + CR
            }
        }
    }
}

// 13.たこがため
function octolock(order){
    for (const team of order){
        if (new get(team).p_con.includes("たこがため")){
            txt = team + "チームの　" + new get(team).name + "は　たこがためを　受けている！" + CR
            document.battle_log.battle_log.value += txt
            rank_change(team, "B", -1)
            rank_change(team, "D", -1)
        }
    }
}

// 14.ちょうはつの終了
function taunt_end(order){
    for (const team of order){
        let poke = document.getElementById(team + "_poke").textContent
        let p_con = document.battle[team + "_poke_condition"].value
        let check = 0
        if (p_con.includes("ちょうはつ")){
            document.battle[team + "_poke_condition"].value = ""
            for (let i = 0; i < p_con.split("\n").length - 1; i++){
                if (p_con.split("\n")[i] == "ちょうはつ　3/3"){
                    document.battle[team + "_poke_condition"].value += "ちょうはつ　2/3" + CR
                    check += 1
                } else if (p_con.split("\n")[i] == "ちょうはつ　2/3"){
                    document.battle[team + "_poke_condition"].value += "ちょうはつ　1/3" + CR
                    check += 1
                } else if (p_con.split("\n")[i] == "ちょうはつ　1/3"){
                    txt = team + "チームの　" + poke + "の　ちょうはつが　とけた！" + CR
                    document.battle_log.battle_log.value += txt
                } else {
                    document.battle[team + "_poke_condition"].value += p_con.split("\n")[i] + CR
                }
            }
        }
        if (check > 0){
            for (let i = 0; i < 4; i++){
                let move = document.getElementById(team + "_move_" + i).textContent
                if (move_search_by_name(move)[2] == "変化"){
                    document.getElementById(team + "_radio_" + i).disabled = true
                    document.getElementById(team + "_radio_" + i).checked = false
                }
            }
        }
    }
}

// 15.アンコールの終了
function encore_end(order){
    for (const team of order){
        let check = 0
        if (new get(team).p_con.includes("アンコール")){
            if (new get(team).p_con.includes("アンコール　0/3")){
                check += 1
            } else {
                // アンコールが終わらなかった時、次のターンの技の固定
                for (let i = 0; i < new get(team).p_len; i++){
                    if (new get(team).p_list[i].includes("アンコール")){
                        const move = new get(team).p_list[i].slice(10)
                        for (let j = 0; j < 4; j++){
                            if (move == document.getElementById(team + "_move_" + j).textContent){
                                const PP_now = Number(document.getElementById(team + "_move_" + j + "_last").textContent)
                                document.getElementById(team + "_radio_" + j).disabled = false
                                if (PP_now == 0){
                                    check += 1
                                }
                            } else {
                                document.getElementById(team + "_radio_" + j).disabled = true
                            }
                        }
                    }
                }
            }
        }
        if (check > 0){
            txt = team + "チームの　" + new get(team).name + "　の　アンコールが　とけた！" + CR
            document.battle_log.battle_log.value += txt
            condition_remove(team, "poke", "アンコール")
            for (let i = 0; i < 4; i++){
                document.getElementById(team + "_radio_" + i).disabled = false
            }
        }
    }
}

// 16.かなしばりの終了
function disable_end(order){
    for (const team of order){
        if (new get(team).p_con.includes("かなしばり")){
            for (let i = 0; i < new get(team).p_len; i++){
                if (new get(team).p_list[i].includes("かなしばり")){
                    const move = new get(team).p_list[i].slice(10)
                    for (let j = 0; j < 4; j++){
                        if (move == document.getElementById(team + "_move_" + j).textContent){
                            if (new get(team).p_list[i].includes("かなしばり　0/4")){
                                condition_remove(team, "poke", "かなしばり")
                                txt = team + "チームの　" + new get(team).name + "の　かなしばりが　とけた！" + CR
                                document.battle_log.battle_log.value += txt
                                document.getElementById(team + "_radio_" + j).disabled = false
                            } else {
                                document.getElementById(team + "_radio_" + j).disabled = true
                                document.getElementById(team + "_radio_" + j).checked = false
                            }
                        }
                    }
                }
            }
        }
    }
}

// 17.でんじふゆうの終了
function magnet_rise_end(order){
    for (const team of order){
        decrease_per_turn(team, "でんじふゆう", "poke")
    }
}

// 18.テレキネシスの終了
function telekinesis_end(order){
    for (const team of order){
        decrease_per_turn(team, "テレキネシス", "poke")
    }
}

// 19.かいふくふうじの終了
function heal_block_end(order){
    for (const team of order){
        decrease_per_turn(team, "かいふくふうじ", "poke")
    }
}

// 20.さしおさえの終了
function embargo_end(order){
    for (const team of order){
        let poke = document.getElementById(team + "_poke").textContent
        let p_con = document.battle[team + "_poke_condition"].value
        if (p_con.includes("さしおさえ")){
            document.battle[team + "_poke_condition"].value = ""
            for (let i = 0; i < p_con.split("\n").length - 1; i++){
                if (p_con.split("\n")[i].includes("さしおさえ　5/5：")){
                    document.battle[team + "_poke_condition"].value += "さしおさえ　4/5：" + p_con.split("\n")[i].slice(10) + CR
                } else if (p_con.split("\n")[i].includes("さしおさえ　4/5：")){
                    document.battle[team + "_poke_condition"].value += "さしおさえ　3/5：" + p_con.split("\n")[i].slice(10) + CR
                } else if (p_con.split("\n")[i].includes("さしおさえ　3/5：")){
                    document.battle[team + "_poke_condition"].value += "さしおさえ　2/5：" + p_con.split("\n")[i].slice(10) + CR
                } else if (p_con.split("\n")[i].includes("さしおさえ　2/5：")){
                    document.battle[team + "_poke_condition"].value += "さしおさえ　1/5：" + p_con.split("\n")[i].slice(10) + CR
                } else if (p_con.split("\n")[i].includes("さしおさえ　1/5：")){
                    txt = team + "チームの　" + poke + "の　さしおさえが　とけた！" + CR
                    document.battle_log.battle_log.value += txt
                    document.getElementById(team + "_item").textContent = p_con.split("\n")[i].slice(10)
                } else {
                    document.battle[team + "_poke_condition"].value += p_con.split("\n")[i] + CR
                }
            }
        }
    }
}

// 21.ねむけ
function sleep_check(order){
    for (const team of order){
        let p_con = document.battle[team + "_poke_condition"].value
        if (p_con.includes("ねむけ　宣言ターン")){
            document.battle[team + "_poke_condition"].value = ""
            for (let i = 0; i < p_con.split("\n").length - 1; i++){
                if (p_con.split("\n")[i] == "ねむけ　宣言ターン"){
                    document.battle[team + "_poke_condition"].value += "ねむけ" + CR
                } else {
                    document.battle[team + "_poke_condition"].value += p_con.split("\n")[i] + CR
                }
            }
        } else if (p_con.includes("ねむけ")){
            make_abnormal_attack_or_ability(team, "ねむり", 100, "ねむけ")
            condition_remove(team, "poke", "ねむけ")
        }
    }
}

// 22.ほろびのうた
function perish_song(order){
    for (const team of order){
        let poke = document.getElementById(team + "_poke").textContent
        let p_con = document.battle[team + "_poke_condition"].value
        if (p_con.includes("ほろびカウント")){
            document.battle[team + "_poke_condition"].value = ""
            for (let i = 0; i < p_con.split("\n").length - 1; i++){
                if (p_con.split("\n")[i].includes("ほろびカウント")){
                    const turn = Number(p_con.split("\n")[i].slice(8))
                    if (turn > 1){
                        document.battle[team + "_poke_condition"].value += "ほろびカウント　" + (turn - 1) + CR
                        txt = team + "チームの　" + poke + "は　ほろびのカウントが　" + (turn - 1) + "になった！" + CR
                        document.battle_log.battle_log.value += txt
                    } else {
                        txt = team + "チームの　" + poke + "は　ほろびのカウントが　0になった！" + CR
                        document.battle_log.battle_log.value += txt
                        document.getElementById(team + "_HP").textContent = 0
                        fainted_process(team)
                    }
                } else {
                    document.battle[team + "_poke_condition"].value += p_con.split("\n")[i] + CR
                }
            }
        }
    }
}

// 23.片側の場の状態の継続/終了: ホスト側の状態が先にすべて解除された後に、ホストでない側の状態が解除される。
function one_side_field_end(order){
    for (const team of order){
        // a. リフレクター
        decrease_per_turn(team, "リフレクター", "field")
        // b. ひかりのかべ
        decrease_per_turn(team, "ひかりのかべ", "field")
        // c. しんぴのまもり
        decrease_per_turn(team, "しんぴのまもり", "field")
        // d. しろいきり
        decrease_per_turn(team, "しろいきり", "field")
        // e. おいかぜ
        decrease_per_turn(team, "おいかぜ", "field")
        // f. おまじない
        decrease_per_turn(team, "おまじない", "field")
        // g. にじ
        decrease_per_turn(team, "にじ", "field")
        // h. ひのうみ
        decrease_per_turn(team, "ひのうみ", "field")
        // i. しつげん
        decrease_per_turn(team, "しつげん", "field")
        // j. オーロラベール
        decrease_per_turn(team, "オーロラベール", "field")
    }
}

// 24.全体の場の状態の継続/終了
function both_side_field_end(order){
    for (const team of order){
        // a. トリックルーム
        decrease_per_turn(team, "トリックルーム", "field")
        // b. じゅうりょく
        decrease_per_turn(team, "じゅうりょく", "field")
        // c. みずあそび
        decrease_per_turn(team, "みずあそび", "poke")
        // d. どろあそび
        decrease_per_turn(team, "どろあそび", "poke")
        // e. ワンダールーム
        decrease_per_turn(team, "ワンダールーム", "field")
        // f. マジックルーム
        decrease_per_turn(team, "マジックルーム", "field")
        // g. エレキフィールド/グラスフィールド/ミストフィールド/サイコフィールド
        decrease_per_turn(team, "エレキフィールド", "field")
        decrease_per_turn(team, "グラスフィールド", "field")
        decrease_per_turn(team, "ミストフィールド", "field")
        decrease_per_turn(team, "サイコフィールド", "field")
    }
}

// 25.はねやすめ解除
function roost_end(order){
    for (const team of order){
        let p_con = document.battle[team + "_poke_condition"].value
        if (p_con.includes("はねやすめ")){
            document.battle[team + "_poke_condition"].value = ""
            for (let i = 0; i < p_con.split("\n").length - 1; i++){
                if (p_con.split("\n")[i].includes("はねやすめ")){
                    document.getElementById(team + "_type").textContent = p_con.split("\n")[i].slice(6)
                } else {
                    document.battle[team + "_poke_condition"].value += p_con.split("\n")[i]
                }
            }
        }
    }
}

// 26.その他の状態・特性・もちもの
function other_condition_ability_item(order){
    for (const team of order){
        let enemy = "A"
        if (team == "A"){
            enemy = "B"
        }
        // a. さわぐ
        let p_con = document.battle[team + "_poke_condition"].value
        document.battle[team + "_poke_condition"].value = ""
        for (let i = 0; i < p_con.split("\n").length - 1; i++){
            if (p_con.split("\n")[i] == "さわぐ　1ターン目"){
                document.battle[team + "_poke_condition"].value += "さわぐ　2ターン目" + CR
                txt = team + "チームの　" + new get(team).name + "は　さわいでいる" + CR
                document.battle_log.battle_log.value += txt
            } else if (p_con.split("\n")[i] == "さわぐ　2ターン目"){
                document.battle[team + "_poke_condition"].value += "さわぐ　3ターン目" + CR
                txt = team + "チームの　" + new get(team).name + "は　さわいでいる" + CR
                document.battle_log.battle_log.value += txt
            } else if (p_con.split("\n")[i] == "さわぐ　3ターン目"){
                txt = team + "チームの　" + new get(team).name + "は　おとなしくなった" + CR
                document.battle_log.battle_log.value += txt
            }
            else {
                document.battle[team + "_poke_condition"].value += p_con.split("\n")[i] + CR
            }
        }
        // b. ねむりによるあばれるの中断
        // c. かそく/ムラっけ/スロースタート/ナイトメア
        if (new get(team).ability == "かそく"){
            rank_change_not_status(team, "S", 1, 100, "かそく")
        } else if (new get(team).ability == "ムラっけ"){
            const parameter = ["A", "B", "C", "D", "S"]
            const plus = Math.floor(Math.random() * 5)
            rank_change_not_status(team, parameter[plus], 2, 100, "ムラっけ")
            parameter.pop(plus)
            const minus = Math.floor(Math.random() * 4)
            rank_change_not_status(team, parameter[minus], -1, 100, "ムラっけ")
        } else if (new get(team).ability == "スロースタート"){
            decrease_per_turn(team, "スロースタート", "poke")
        } else if (new get(team).ability == "ナイトメア" && new get(enemy).abnormal == "ねむり"){
            HP_change_not_attack(enemy, Math.floor(new get(enemy).full_HP / 8), "-", "ナイトメア")
        }
        // d. くっつきバリ/どくどくだま/かえんだま
        if (new get(team).item == "くっつきバリ"){
            HP_change_not_attack(team, Math.floor(new get(team).full_HP / 8), "-", new get(team).item)
        } else if (new get(team).item == "どくどくだま"){
            make_abnormal_attack_or_ability(team, "もうどく", 100, new get(team).item)
        } else if (new get(team).item == "かえんだま"){
            make_abnormal_attack_or_ability(team, "やけど", 100, new get(team).item)
        }
        // e. ものひろい/しゅうかく/たまひろい
        if (new get(team).ability == "ものひろい" && new get(team).item == ""){

        }
        if (new get(team).ability == "しゅうかく" && !new get(team).f_con.includes("ひんし") && new get(team).item == "" && berry_item_list.includes(document.getElementById(team + "_" + battle_poke_num(team) + "_recycle").textContent)){
            if (new get(team).f_con.includes("にほんばれ") || Math.random() < 0.5){
                txt = team + "チームの　" + new get(team).name + "は　しゅうかくで　" + document.getElementById(team + "_" + battle_poke_num(team) + "_recycle").textContent +"を　拾ってきた" + CR
                document.battle_log.battle_log.value += txt
                document.getElementById(team + "_item").textContent = document.getElementById(team + "_" + battle_poke_num(team) + "_recycle").textContent
                document.getElementById(team + "_" + battle_poke_num(team) + "_recycle").textContent = ""
                berry_in_pinch(team)
                berry_in_abnormal(team)
            }
        }
    }
}

// 27.ダルマモード
function zen_mode(order){
    for (const team of order){
        if (!new get(team).f_con.includes("ひんし") && new get(team).last_HP <= new get(team).full_HP / 2){
            if (new get(team).ability == "ダルマモード" && new get(team).name == "ヒヒダルマ"){
                txt = team + "チームの　" + new get(team).name + "　の　ダルマモード！" + CR
                document.battle_log.battle_log.value += txt
                form_chenge(team, "ヒヒダルマ(ダルマモード)")
            } else if (new get(team).ability == "ダルマモード" && new get(team).name == "ヒヒダルマ(ガラルのすがた)"){
                txt = team + "チームの　" + new get(team).name + "　の　ダルマモード！" + CR
                document.battle_log.battle_log.value += txt
                form_chenge(team, "ヒヒダルマ(ダルマモード(ガラルのすがた))")
            }
        } else if (!new get(team).f_con.includes("ひんし") && new get(team).last_HP > new get(team).full_HP / 2){
            if (new get(team).ability == "ダルマモード" && new get(team).name == "ヒヒダルマ(ダルマモード)"){
                txt = team + "チームの　" + new get(team).name + "　の　ダルマモード！" + CR
                document.battle_log.battle_log.value += txt
                form_chenge(team, "ヒヒダルマ")
            } else if (new get(team).ability == "ダルマモード" && new get(team).name == "ヒヒダルマ(ダルマモード(ガラルのすがた))"){
                txt = team + "チームの　" + new get(team).name + "　の　ダルマモード！" + CR
                document.battle_log.battle_log.value += txt
                form_chenge(team, "ヒヒダルマ(ガラルのすがた)")
            }
        }
    }
}

// 28.リミットシールド
function shields_down(order){
    for (const team of order){
        if (new get(team).ability == "リミットシールド" && new get(team).last_HP <= new get(team).full_HP / 2 && new get(team).name == "メテノ(りゅうせいのすがた)"){
            txt = team + "チームの　" + new get(team).name + "　の　リミットシールド！" + CR
            document.battle_log.battle_log.value += txt
            form_chenge(team, "メテノ(コア)")
        } else if (new get(team).ability == "リミットシールド" && new get(team).last_HP > new get(team).full_HP / 2 && new get(team).name == "メテノ(コア)"){
            txt = team + "チームの　" + new get(team).name + "　の　リミットシールド！" + CR
            document.battle_log.battle_log.value += txt
            form_chenge(team, "メテノ(りゅうせいのすがた)")
        }
    }
}

// 29.スワームチェンジ
function power_construct(order){
    for (const team of order){
        if (new get(team).ability == "スワームチェンジ" && new get(team).last_HP <= new get(team).full_HP / 2){
            document.battle_log.battle_log.value += "たくさんの　気配を　感じる・・・！" + CR
            form_chenge(team, "ジガルデ(パーフェクトフォルム)")
        }
    }
}

// 31.はらぺこスイッチ
function hunger_switch(order){
    for (const team of order){
        if (new get(team).ability == "はらぺこスイッチ"){
            document.battle_log.battle_log.value += team + "チームの　" + new get(team).name + "　の　はらぺこスイッチ！" + CR
            if (new get(team).p_con.includes("はらぺこもよう")){
                condition_remove(team, "poke", "はらぺこもよう")
                document.battle[team + "_poke_condition"].value += "まんぷくもよう" + CR
            } else if (new get(team).p_con.includes("まんぷくもよう")){
                condition_remove(team, "poke", "まんぷくもよう")
                document.battle[team + "_poke_condition"].value += "はらぺこもよう" + CR
            }
        }
    }
}


function decrease_per_turn(team, content, position){
    const condition = document.battle[team + "_" + position + "_condition"].value
    if (condition.includes(content)){
        document.battle[team + "_" + position + "_condition"].value = ""
        for (let i = 0; i < condition.split("\n").length - 1; i++){
            if (condition.split("\n")[i].includes(content)){
                const turn = Number(condition.split("\n")[i].slice(-3, -2))
                if (turn > 1){
                    txt = content + "　" + String(turn - 1) + "/" + condition.split("\n")[i].slice(-1) + CR
                    document.battle[team + "_" + position + "_condition"].value += txt
                } else {
                    txt = team + "チームの　" + content + "は　終了した！" + CR
                    document.battle_log.battle_log.value += txt
                    if (content.includes("フィールド") && new get(team).ability == "ぎたい"){
                        txt = team + "チームの　" + new get(team).name + "　は　元のタイプに戻った" + CR
                        document.battle_log.battle_log.value += txt
                        let num = battle_poke_num(team)
                        document.getElementById(team + "_type").textContent = document.getElementById(team + "_" + num + "_type").textContent
                        if (new get(team).p_con.includes("もりののろい")){
                            document.getElementById(team + "_type").textContent += "、くさ"
                        }
                        if (new get(team).p_con.includes("ハロウィン")){
                            document.getElementById(team + "_type").textContent += "、ゴースト"
                        }
                    }
                }
            } else {
                document.battle[team + "_" + position + "_condition"].value += condition.split("\n")[i] + CR
            }
        }
    }
}
