// 追加効果の処理順

function move_process(atk, def, move, order){
    const atk_poke = document.getElementById(atk + "_poke").textContent
    const def_poke = document.getElementById(def + "_poke").textContent

    // 2-A. 変化技の効果処理（？）予想ではここだが、明確なソースがない
    if (move[2] == "変化"){ 
        if (status_move_effect(atk, def, atk_poke, def_poke, move)){return "stop"}
    } else { // 攻撃技の処理
        const org_def_HP = new get(def).last_HP
        // 1.ダメージ計算 [与えたダメージ, タイプ相性, 急所判定, 発生したダメージ]
        const damage = HP_decrease_operation(atk, def, def_poke, move, order)
        let substitute = new get(def).p_con.includes("みがわり")
        // 2.追加効果などの発動
        additional_effect_etc(atk, def, atk_poke, def_poke, move, order, damage, substitute)
        // 3.防御側の特性
        defense_ability(atk, def, atk_poke, def_poke, move, damage, substitute)
        // 4.防御側のもちもの
        defense_item(atk, def, atk_poke, def_poke, move, damage, substitute)
        // 5.防御側のばけのかわ/アイスフェイス
        disguise_iceface(atk, def, atk_poke, def_poke, move, substitute)
        // 6.ひんし判定
        dying_judge(atk, def, atk_poke, def_poke, move)
        // 7.ひんしできんちょうかん/かがくへんかガスが解除されたことによる封じられていた効果の発動 (おわりのだいち、はじまりのうみの解除 wikiにない)
        // 8.連続攻撃技である場合、以下の処理を行う(おやこあいも含む)。
        continuous_move(atk, def, atk_poke, def_poke, move, order, substitute)
        // 9.技の効果
        move_effect(atk, def, atk_poke, def_poke, move, damage, substitute)
        // 10.特性の効果
        ability_effect(atk, def, atk_poke, def_poke, move)
        // 11.防御側のもちものの効果
        defense_item_effect(atk, def, atk_poke, def_poke, move)
        // 12.コンビネーションわざの効果
        // 13.いにしえのうた/きずなへんげによるフォルムチェンジ
        form_chenge_ability(atk, def, move)
        // 14.いのちのたまの反動/かいがらのすずの回復
        lifeorb_shellbell(atk, damage)
        // 15.オボンのみなど回復のきのみ/チイラのみ/リュガのみ/ヤタピのみ/ズアのみ/カムラのみ/サンのみ/スターのみ/ミクルのみ/きのみジュース
        recover_berry(def)
        // 16.ききかいひ/にげごしによって手持ちに戻るまで
        emergency_exit(def, org_def_HP)
        // 17.とんぼがえり/ボルトチェンジ/クイックターンによって手持ちに戻るまで
        come_back_move(atk, def, move)
        // 18.アイアンローラーによるフィールドの消失
        steel_roller(move) 
        // 19.レッドカードによる交代先の繰り出し
        red_card(atk, def, substitute)
        // 20.わるいてぐせ
        pickpocket(atk, def, atk_poke, def_poke, move)
        // 21.一部の技の効果
        some_move_effect(atk, def, atk_poke, def_poke, move)
        // 22.ヒメリのみ/しろいハーブ/のどスプレー/だっしゅつパックによって手持ちに戻るまで
        other_item_effect(atk, def, move)
        // 23.とんぼがえり/ボルトチェンジ/クイックターン/ききかいひ/にげごし/だっしゅつボタン/だっしゅつパックによる交代先の選択・交代
        if (return_battle(atk, def, move)){return "stop"}
        // 24.きょうせい
    }
    // 25.おどりこ
    ability_dancer(atk, def, move, order)
    // 26.次のポケモンの行動
        // 3,4.の効果で攻撃側のポケモンがひんしになる場合、
            // 第七世代以降は、6.で防御側が倒れた後に攻撃側が倒れるため、相打ち時は攻撃側の勝ちとなる。
            // 9.以降の反動ダメージで攻撃側がひんしになった場合、世代に依らず攻撃側の勝ちとなる。
}


// 1.ダメージ計算
function HP_decrease_operation(atk, def, def_poke, move, order){
    if (move[0] == "みずしゅりけん" && new get(atk).name == "ゲッコウガ(サトシゲッコウガ)"){
        move[3] = 20
    }
    
    const damage = damage_calculation_process(atk, def, move, order) // [ダメージ量、タイプ相性、急所判定]
    
    // ダメージをHP1で食いしばる場合、以下の優先順位で発動する。
    if (new get(def).last_HP - damage[0] <= 0 && !new get(def).p_con.includes("みがわり")){
        // 1.こらえる
        if (new get(def).p_con.includes("こらえる")){
            txt = def + "チームの　" + def_poke + "は　攻撃をこらえた！"
            document.battle_log.battle_log.value += txt + CR
            return [new get(def).last_HP - 1, damage[1], damage[2], damage[0]]
        }
        // 2.がんじょう
        if (new get(def).ability == "がんじょう" && new get(def).last_HP == new get(def).full_HP){
            txt = def + "チームの　" + def_poke + "は　がんじょうで　攻撃をこらえた！"
            document.battle_log.battle_log.value += txt + CR
            return [new get(def).last_HP - 1, damage[1], damage[2], damage[0]]
        }
        // 3.きあいのタスキ/きあいのハチマキ
        if (new get(def).item == "きあいのタスキ" && new get(def).last_HP == new get(def).full_HP){
            txt = def + "チームの　" + def_poke + "は　きあいのタスキで　持ちこたえた！"
            document.battle_log.battle_log.value += txt + CR
            set_recycle_item(def)
            return [new get(def).last_HP - 1, damage[1], damage[2], damage[0]]
        } else if (new get(def).item == "きあいのハチマキ"){
            const random = Math.random()
            if (random < 0.1){
                txt = def + "チームの　" + def_poke + "は　きあいのハチマキで　持ちこたえた！"
                document.battle_log.battle_log.value += txt + CR
                return [new get(def).last_HP - 1, damage[1], damage[2], damage[0]]
            }
        }
        // 4.てかげん、みねうちの時(wikiにない)
        if (move[0] == "てかげん" || move[0] == "みねうち"){
            return [new get(def).last_HP - 1, damage[1], damage[2], damage[0]]
        }
    }
    // 5.ばけのかわ
    if (new get(def).p_con.includes("ばけたすがた")){
        return [0, damage[1], damage[2], damage[0]]
    }

    return [Math.min(damage[0], new get(def).last_HP), damage[1], damage[2], damage[0]]
}

// 2.追加効果などの発動
function additional_effect_etc(atk, def, atk_poke, def_poke, move, order, damage, substitute){
    const def_abnormal = document.getElementById(def + "_abnormal").textContent
    const def_ability = document.getElementById(def + "_ability").textContent
    const def_type = document.getElementById(def + "_type").textContent
    const atk_p_con = document.battle[atk + "_poke_condition"].value
    const def_p_con = document.battle[def + "_poke_condition"].value
    const atk_used_move = document.battle[atk + "_used_move"].value

    damage[0] = damage_declaration(atk, def, damage, move) // ダメージ量とタイプ相性の宣言

    // 反射技が選択されている時、ダメージの記録
    reflection_check(def, move, damage, order)

    const def_HP_last = Number(document.getElementById(def + "_HP_last").textContent)

    // 0.「反動で動けない状態」などの付与　（wikiにはない）
    for (let i = 0; i < cannot_move_list.length; i++){
        if (move[0] == cannot_move_list[i]){
            txt = "反動で動けない：" + move[0] + CR
            document.battle[atk + "_poke_condition"].value += txt
        }
    }
    if ((move[0] == "あばれる" || move[0] == "はなびらのまい" || move[0] == "げきりん") && !new get(atk).p_con.includes("あばれる")){
        document.battle[atk + "_poke_condition"].value += "あばれる（" + move[0] + "）　1ターン目" + CR
    }
    if (move[0] == "さわぐ" && !new get(atk).p_con.includes("さわぐ")){
        document.battle[atk + "_poke_condition"].value += "さわぐ　1ターン目" + CR
    }
    if (move[0] == "なみのり" && new get(atk).ability == "うのミサイル" && !(new get(atk).p_con.includes("うのみのすがた") || new get(atk).p_con.includes("まるのみのすがた"))){
        if (new get(atk).last_HP > new get(atk).full_HP / 2){
            document.battle[atk + "_poke_condition"].value += "うのみのすがた" + CR
            txt = atk + "チームの　" + atk_poke + "　は　うのみのすがたに　姿を変えた！"
            document.battle_log.battle_log.value += txt + CR
        } else {
            document.battle[atk + "_poke_condition"].value += "まるのみのすがた" + CR
            txt = atk + "チームの　" + atk_poke + "　は　まるのみのすがたに　姿を変えた！"
            document.battle_log.battle_log.value += txt + CR
        }
    }
    condition_remove(atk, "poke", "がまん")

    // 1.追加効果 (ひみつのちから/オリジンズスーパーノヴァ/ぶきみなじゅもんを除く)
    for (let i = 0; i < additional_effect_move_list.length; i++){
        if (move[0] == additional_effect_move_list[i][0]){
            // 自身のランクを変化させる技
            if (additional_effect_move_list[i][1] == "s"){
                if (move[0] == "あやしいかぜ" || move[0] == "ぎんいろのかぜ" || move[0] == "げんしのちから"){
                    if (Math.random() < 0.1){
                        rank_change(atk, "A", 1)
                        rank_change(atk, "B", 1)
                        rank_change(atk, "C", 1)
                        rank_change(atk, "D", 1)
                        rank_change(atk, "S", 1)
                    }
                } else {
                    const probability = additional_effect_move_list[i][2]
                    const parameter = additional_effect_move_list[i][3][0]
                    const change = additional_effect_move_list[i][3][1]
                    rank_change_not_status(atk, parameter, change, probability, move)
                }
            }
        }
    }
    // その他の追加効果の発動条件：防御側がひんしでない、身代わりでない、身代わりかつ音技
    if (def_HP_last > 0 && (!substitute || music_move_list.includes(move[0]) || new get(atk).ability == "すりぬけ")){ 
        for (let i = 0; i < additional_effect_move_list.length; i++){
            if (move[0] == additional_effect_move_list[i][0]){
                // 相手のランクを変化させる技
                if (additional_effect_move_list[i][1] == "e"){
                    const probability = additional_effect_move_list[i][2]
                    for (let j = 3; j < additional_effect_move_list[i].length; j++){
                        let parameter = additional_effect_move_list[i][j][0]
                        let change = additional_effect_move_list[i][j][1]
                        if (new get(def).ability == "ミラーアーマー"){
                            txt = def + "チームの　" + new get(def).name + "の　ミラーアーマーが　発動した！" + CR
                            document.battle_log.battle_log.value += txt
                            rank_change_not_status(def, parameter, change, probability, move)
                        } else {
                            rank_change_not_status(def, parameter, change, probability, move)
                        }
                    }
                }
                // 相手を状態異常にする技
                if (additional_effect_move_list[i][1] == "a"){ 
                    const probability = additional_effect_move_list[i][2]
                    const abnormal = additional_effect_move_list[i][3]
                    make_abnormal_attack_or_ability(def, abnormal, probability, move)
                }
                // ひるみ状態にする技
                if (additional_effect_move_list[i][1] == "f" && new get(def).ability != "せいしんりょく"){ 
                    const probability = additional_effect_move_list[i][2]
                    const random = Math.random() * 100
                    if (random < probability){
                        document.battle[def + "_poke_condition"].value += "ひるみ" + CR
                    }
                }
                if (move[0] == "うたかたのアリア" && def_abnormal == "やけど"){
                    txt = def + "チームの　" + def_poke + "　は　やけどがなおった　！" + CR
                    document.battle_log.battle_log.value += txt
                    document.getElementById(def + "_abnormal").textContent = ""
                } else if ((move[0] == "かげぬい" || move[0] == "アンカーショット") && !def_p_con.includes("逃げられない") && !def_type.includes("ゴースト")){ 
                    txt = def + "チームの　" + def_poke + "　は　逃げられなくなった　！" + CR
                    document.battle_log.battle_log.value += txt
                    document.battle[def + "_poke_condition"].value += "逃げられない" + CR
                } else if (move[0] == "しっとのほのお" && !def_p_con.includes("ランク上昇")){ 
                    make_abnormal_attack_or_ability(def, "やけど", 100, move)
                } else if (move[0] == "じごくづき" && !def_p_con.includes("じごくづき")){ 
                    txt = def + "チームの　" + def_poke + "　は　音技が出せなくなった　！" + CR
                    document.battle_log.battle_log.value += txt
                    document.battle[def + "_poke_condition"].value += "じごくづき　2/2" + CR
                } else if (move[0] == "トライアタック"){ 
                    const probability = Math.random()
                    if (probability < 0.2){
                        const random = Math.random()
                        if (random < 1 / 3){
                            make_abnormal_attack_or_ability(def, "まひ", 100, move)
                        } else if (random < 2 / 3){
                            make_abnormal_attack_or_ability(def, "こおり", 100, move)
                        } else if (random < 1){
                            make_abnormal_attack_or_ability(def, "やけど", 100, move)
                        }
                    }
                } else if (move[0] == "なげつける"){
                    if (new get(atk).item == "でんきだま"){
                        make_abnormal_attack_or_ability(def, "まひ", 100, new get(atk).item)
                    } else if (new get(atk).item == "かえんだま"){
                        make_abnormal_attack_or_ability(def, "やけど", 100, new get(atk).item)
                    } else if (new get(atk).item == "どくバリ"){
                        make_abnormal_attack_or_ability(def, "どく", 100, new get(atk).item)
                    } else if (new get(atk).item == "どくどくだま"){
                        make_abnormal_attack_or_ability(def, "もうどく", 100, new get(atk).item)
                    } else if ((new get(atk).item == "おうじゃのしるし" || new get(atk).item == "するどいキバ") && new get(def).ability != "せいしんりょく"){
                        document.battle[def + "_poke_condition"].value += "ひるみ" + CR
                    } else if (new get(atk).item == "メンタルハーブ"){
                        condition_remove(def, "poke", "アンコール")
                        condition_remove(def, "poke", "いちゃもん")
                        condition_remove(def, "poke", "かいふくふうじ")
                        condition_remove(def, "poke", "かなしばり")
                        condition_remove(def, "poke", "ちょうはつ")
                        condition_remove(def, "poke", "メロメロ")
                    } else if (new get(atk).item == "しろいハーブ"){
                        for (const parameter of ["A", "B", "C", "D", "S", "accuracy", "evasiveness"]){
                            if (new get(def)[parameter + "_rank"] < 0){
                                document.getElementById(def + "_rank_" + parameter).textContent = 0
                            }
                        }
                    } else if (berry_item_list.includes(new get(atk).item)){
                        eating_berry_effect(def, new get(atk).item)
                    }
                    set_recycle_item(atk)
                }
            }
        }
    }
    // 2.自分のランクが下がる技の効果/HP吸収技の吸収効果/はじけるほのおによる火花のダメージ/コアパニッシャーによる効果
    for (let i = 0; i < other_effect_move_list.length; i++){
        if (move[0] == other_effect_move_list[i][0] && move[0] != "スケイルショット"){
            // 自分のランクが下がる技
            if (other_effect_move_list[i][1] == "d"){ 
                for (j = 2; j < other_effect_move_list[i].length; j++){
                    let parameter = other_effect_move_list[i][j][0]
                    let change = other_effect_move_list[i][j][1]
                    rank_change(atk, parameter, change)
                }
            }
            // HP吸収技
            if (other_effect_move_list[i][1] == "r"){ 
                const rate = other_effect_move_list[i][2]
                let change = Math.round(damage[0] * rate)
                if (new get(atk).item == "おおきなねっこ"){
                    change = five_cut(change * 5324 / 4096)
                }
                if (new get(def).ability == "ヘドロえき"){
                    HP_change(atk, change, "-")
                } else {
                    HP_change(atk, change, "+")
                }
            }
            // コアパニッシャーによる効果
            if (move[0] == "コアパニッシャー" && atk == order[1] && !def_p_con.includes("特性なし")){
                if (!gastro_acid_enemy_ability_list.includes(def_ability)){
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
                    txt = def + "チームの　" + def_poke + "　は　特性が消された！" + CR
                    document.battle_log.battle_log.value += txt
                }
            }
        }
    }
    // 3.ダイマックスわざの効果
    // 4.防御側のいかり
    if (def_p_con.includes("いかり") && move[2] != "変化" && (!substitute || music_move_list.includes(move[0]) || new get(atk).ability == "すりぬけ")){
        rank_change_not_status(def, "A", 1, 100, "いかり")
    }
    // 5.防御側のナゾのみ
    if (new get(def).item == "ナゾのみ" && compatibility_check(atk, def, move) > 1 && (!substitute || music_move_list.includes(move[0]) || new get(atk).ability == "すりぬけ")){
        HP_change_not_attack(def, Math.floor(new get(def).full_HP / 4), "+", "ナゾのみ")
        set_recycle_item(def)
        set_belch(def)
    }
    // 6.防御側のくちばしキャノン
    if (new get(def).p_con.includes("くちばしキャノン") && move[6] == "直接" && new get(atk).item != "ぼうごパット" && (!substitute || music_move_list.includes(move[0]) || new get(atk).ability == "すりぬけ")){
        make_abnormal_attack_or_ability(atk, "やけど", 100, "くちばしキャノン")
    }
    // 7.やきつくす/クリアスモッグの効果　こちこちフロストの効果（wikiにはなかった）
    if (move[0] == "やきつくす" && (!substitute || music_move_list.includes(move[0]) || new get(atk).ability == "すりぬけ") && new get(def).ability != "ねんちゃく" ){
        if (berry_item_list.includes(new get(def).item) || new get(def).item.includes("ジュエル")){
            txt = def + "チームの　" + def_poke + "の　" + new get(def).item + "は　焼き尽くされた！" + CR
            document.battle_log.battle_log.value += txt
            document.getElementById(def + "_item").textContent = ""
            if (new get(def).ability == "かるわざ"){
                document.battle[def + "_poke_condition"].value += "かるわざ" + CR
            }
        }
    }
    if (move[0] == "クリアスモッグ" && (!substitute || music_move_list.includes(move[0]) || new get(atk).ability == "すりぬけ")){
        txt = atk + "チームの　" + atk_poke + "の　能力変化が元に戻った　！" + CR
        document.battle_log.battle_log.value += txt
        for (const parameter of ["A", "B", "C", "D", "S", "accuracy", "evasiveness"]){
            document.getElementById(def + "_rank_" + parameter).textContent = 0
        }
    }
    if (move[0] == "こちこちフロスト"){
        txt = atk + "チームの　" + atk_poke + "の　能力変化が元に戻った　！" + CR
        document.battle_log.battle_log.value += txt
        for (const team of ["A", "B"]){
            for (const parameter of ["A", "B", "C", "D", "S", "accuracy", "evasiveness"]){
                document.getElementById(team + "_rank_" + parameter).textContent = 0
            }
        }
    }
    if (move[0] == "すくすくボンバー" && !def_p_con.includes("やどりぎのタネ") && (!substitute || music_move_list.includes(move[0]) || new get(atk).ability == "すりぬけ")){
        document.battle[def + "_poke_condition"].value = "やどりぎのタネ" + CR
        txt = def + "チームの　" + def_poke + "に　タネを植え付けた　！" + CR
        document.battle_log.battle_log.value += txt
    }
    if (move[0] == "どばどばオーラ" && !atk_p_con.includes("ひかりのかべ")){
        if (new get(atk).item == "ひかりのねんど"){
            document.battle[atk + "_field_condition"].value = "ひかりのかべ　8/8" + CR
        } else {
            document.battle[atk + "_field_condition"].value = "ひかりのかべ　5/5" + CR
        }
        txt = "ひかりのかべが　現れた！" + CR
        document.battle_log.battle_log.value += txt
    }
    if (move[0] == "わるわるゾーン" && !atk_p_con.includes("リフレクター")){
        if (new get(atk).item == "ひかりのねんど"){
            document.battle[atk + "_field_condition"].value = "リフレクター　8/8" + CR
        } else {
            document.battle[atk + "_field_condition"].value = "リフレクター　5/5" + CR
        }
        txt = "リフレクターが　現れた！" + CR
        document.battle_log.battle_log.value += txt
    }
    // 8.防御側のおんねん
    if (def_p_con.includes("おんねん") && def_HP_last == 0){
        for (let i = 0; i < 4; i++){
            if (atk_used_move == document.getElementById(atk + "_move_" + i).textContent){
                const PP_now = document.getElementById(atk +"_move_" + i + "_last").textContent
                if (PP_now != 0){
                    document.getElementById(atk +"_move_" + i + "_last").textContent = 0
                    txt = atk + "チームの　" + atk_poke + "　は　おんねんで　PPが0になった　！" + CR
                    document.battle_log.battle_log.value += txt
                }
            }
        }
    }
    // 9.攻撃側のどくしゅ
    if (new get(atk).ability == "どくしゅ" && move[6] == "直接"&& (!substitute || music_move_list.includes(move[0]) || new get(atk).ability == "すりぬけ")){
        make_abnormal_attack_or_ability(def, "どく", 30, "どくしゅ")
    }
    // 10.攻撃側のするどいキバ：wikiにない
    if ((new get(atk).item == "おうじゃのしるし" || new get(atk).item == "するどいキバ" || new get(atk).ability == "あくしゅう") && Math.random() < 0.1 && (!substitute || music_move_list.includes(move[0]) || new get(atk).ability == "すりぬけ") && new get(def).ability != "せいしんりょく"){
        document.battle[def + "_poke_condition"].value += "ひるみ" + CR
    }
}


// 3.防御側の特性
function defense_ability(atk, def, atk_poke, def_poke, move, damage, substitute){
    // ゆうばく: 直接攻撃を受けてひんしになったとき
    if (new get(def).ability == "ゆうばく" && new get(def).last_HP == 0 && move[6] == "直接" && new get(atk).item != "ぼうごパット" && new get(atk).ability != "しめりけ" && (!substitute || music_move_list.includes(move[0]) || new get(atk).ability == "すりぬけ")){
        HP_change_not_attack(atk, Math.floor(new get(atk).full_HP / 4), "-", "ゆうばく")
    }
    // とびだすなかみ: ひんしになったとき
    // シンクロ: 状態異常になったとき
    // てつのトゲ/さめはだ/ほうし/どくのトゲ/せいでんき/ほのおのからだ/メロメロボディ/ミイラ/ぬめぬめ/カーリーヘアー/さまようたましい/ほろびのボディ: 直接攻撃を受けたとき
    if (move[6] == "直接" && new get(atk).item != "ぼうごパット" && (!substitute || music_move_list.includes(move[0]) || new get(atk).ability == "すりぬけ")){
        const random = Math.random() * 100
        if (new get(def).ability == "てつのトゲ" || new get(def).ability == "さめはだ"){
            HP_change_not_attack(atk, Math.floor(new get(atk).full_HP / 8), "-", new get(def).ability)
        } else if (new get(def).ability == "ほうし" && new get(atk).ability != "ぼうじん" && new get(atk).item != "ぼうじんゴーグル" && !new get(atk).type.includes("くさ")){
            if (random < 9){
                make_abnormal_attack_or_ability(atk, "どく", 100, new get(def).ability)
            } else if (random < 19){
                make_abnormal_attack_or_ability(atk, "まひ", 100, new get(def).ability)
            } else if (random < 30){
                make_abnormal_attack_or_ability(atk, "ねむり", 100, new get(def).ability)
            }
        } else if (new get(def).ability == "どくのトゲ"){
            make_abnormal_attack_or_ability(atk, "どく", 30, new get(def).ability)
        } else if (new get(def).ability == "せいでんき"){
            make_abnormal_attack_or_ability(atk, "まひ", 30, new get(def).ability)
        } else if (new get(def).ability == "ほのおのからだ"){
            make_abnormal_attack_or_ability(atk, "やけど", 30, new get(def).ability)
        } else if (new get(def).ability == "メロメロボディ" && random < 30 && ((new get(atk).sex == " ♂ " && new get(def).sex == " ♀ ") || (new get(atk).sex == " ♀ " && new get(def).sex == " ♂ ")) && !new get(atk).p_con.includes("メロメロ")){
            document.battle[atk + "_poke_conrition"].value += "メロメロ" + CR
            txt = atk + "チームの　" + atk_poke + "は　メロメロに　なってしまった！" + CR
            document.battle_log.battle_log.value += txt
            if (new get(atk).item == "メンタルハーブ"){
                condition_remove(atk, "poke", "メロメロ")
                set_recycle_item(atk)
                txt = atk + "チームの　" + new get(atk).name + "の　メンタルハーブが発動した" + CR
                document.battle_log.battle_log.value += txt
            }
        } else if (new get(def).ability == "ミイラ" && !mummy_self_ability_list.includes(new get(atk).ability)){
            change_ability(atk, def, 3, "ミイラ")
            txt = atk + "チームの　" + atk_poke + "は　特性が　ミイラになった！" + CR
            document.battle_log.battle_log.value += txt
        } else if (new get(def).ability == "ぬめぬめ" || new get(def).ability == "カーリーヘアー"){
            if (new get(atk).ability == "ミラーアーマー"){
                txt = atk + "チームの　" + new get(atk).name + "の　ミラーアーマーが　発動した！" + CR
                document.battle_log.battle_log.value += txt
                rank_change_not_status(def, "S", -1, 100, new get(def).ability)
                white_herb(def)
            } else {
                rank_change_not_status(atk, "S", -1, 100, new get(def).ability)
                white_herb(atk)
            }
        } else if (new get(def).ability == "さまようたましい" && !wandering_spirit_self_ability_list.includes(new get(atk).ability)){
            change_ability(atk, def, 2, "NA")
        } else if (new get(def).ability == "ほろびのボディ"){
            const check = 0
            if (!new get(atk).p_con.includes("ほろびカウント")){
                document.battle[atk + "_poke_condition"].value = "ほろびカウント　4" + CR
                check += 1
            }
            if (!new get(def).p_con.includes("ほろびカウント")){
                document.battle[def + "_poke_condition"].value = "ほろびカウント　4" + CR
                check += 1
            }
            if (check > 0){
                txt = def + "チームの　" + def_poke + "の　ほろびのボディが　発動した！" + CR
                document.battle_log.battle_log.value += txt
            }
        }
    }
    // のろわれボディ/イリュージョン/じきゅうりょく/すなはき/わたげ/うのミサイル: 攻撃技を受けたとき
    if (!substitute || music_move_list.includes(move[0]) || new get(atk).ability == "すりぬけ"){
        if (new get(def).ability == "のろわれボディ" && Math.random() < 0.3 && !new get(atk).p_con.includes("かなしばり")){
            document.battle[atk + "_poke_condition"].value += "かなしばり　4/4：" + document.battle[atk + "_used_move"].value + CR
            txt = def + "チームの　" + def_poke + "の　のろわれボディが　発動した！" + CR
            document.battle_log.battle_log.value += txt
            if (new get(atk).item == "メンタルハーブ"){
                condition_remove(atk, "poke", "かなしばり")
                set_recycle_item(atk)
                txt = atk + "チームの　" + new get(atk).name + "の　メンタルハーブが発動した" + CR
                document.battle_log.battle_log.value += txt
            }
        } else if (new get(def).ability == "じきゅうりょく" && new get(def).p_con.includes("ダメージ")){
            rank_change_not_status(def, "B", 1, 100, "じきゅうりょく")
        } else if (new get(def).ability == "すなはき" && !new get(atk).f_con.includes("すなあらし") && new get(def).p_con.includes("ダメージ")){
            txt = def + "チームの　" + def_poke + "の　すなはきが　発動した！" + CR
            document.battle_log.battle_log.value += txt
            all_field_status_move(def, move_search_by_name("すなあらし"))
        } else if (new get(def).ability == "わたげ"){
            if (new get(atk).ability == "ミラーアーマー"){
                txt = atk + "チームの　" + new get(atk).name + "の　ミラーアーマーが　発動した！" + CR
                document.battle_log.battle_log.value += txt
                rank_change_not_status(def, "S", -1, 100, "わたげ")
                white_herb(def)
            } else {
                rank_change_not_status(atk, "S", -1, 100, "わたげ")
                white_herb(atk)
            }
        } else if (new get(def).ability == "うのミサイル"){
            if (new get(def).p_con.includes("うのみのすがた")){
                if (new get(atk).ability == "ミラーアーマー"){
                    txt = atk + "チームの　" + new get(atk).name + "の　ミラーアーマーが　発動した！" + CR
                    document.battle_log.battle_log.value += txt
                    rank_change_not_status(def, "B", -1, 100, "うのミサイル")
                } else {
                    rank_change_not_status(atk, "B", -1, 100, "うのミサイル")
                }
                HP_change(atk, Math.floor(new get(atk).full_HP / 4), "-")
                white_herb(atk)
                berry_in_pinch(atk)
                condition_remove(def, "poke", "うのみのすがた")
            } else if (new get(def).p_con.includes("まるのみのすがた")){
                make_abnormal_attack_or_ability(atk, "まひ", 100, "うのミサイル")
                HP_change(atk, Math.floor(new get(atk).full_HP / 4), "-")
                condition_remove(def, "poke", "まるのみのすがた")
                berry_in_abnormal(atk)
                berry_in_pinch(atk)
            }
        }
    }
    // くだけるよろい: 物理技を受けたとき
    if (move[2] == "物理" && new get(def).ability == "くだけるよろい" && new get(def).last_HP > 0 && (!substitute || new get(atk).ability == "みがわり")){
        rank_change_not_status(def, "B", -1, 100, new get(def).ability)
        rank_change(def, "S", 2)
        white_herb(def)
    }
    // みずがため/せいぎのこころ/びびり/じょうききかん: 特定のタイプの攻撃技を受けたとき
    if (!substitute || music_move_list.includes(move[0]) || new get(atk).ability == "すりぬけ"){
        if (new get(def).ability == "みずがため" && move[1] == "みず"){
            rank_change_not_status(def, "B", 2, 100, new get(def).ability)
        } else if (new get(def).ability == "せいぎのこころ" && move[1] == "あく"){
            rank_change_not_status(def, "A", 1, 100, new get(def).ability)
        } else if (new get(def).ability == "びびり" && (move[1] == "あく" || move[1] == "ゴースト" || move[1] == "むし")){
            rank_change_not_status(def, "S", 1, 100, new get(def).ability)
        } else if (new get(def).ability == "じょうききかん" && (move[1] == "みず" || move[1] == "ほのお")){
            rank_change_not_status(def, "S", 6, 100, new get(def).ability)
        }
    }
    // いかりのつぼ：wikiにない
    if (new get(def).ability == "いかりのつぼ" && new get(def).last_HP > 0 && damage[2] && (!substitute || music_move_list.includes(move[0]) || new get(atk).ability == "すりぬけ")){
        txt = def + "チームの　" + new get(def).name + "　の　いかりのつぼが　発動した！" + CR
        document.battle_log.battle_log.value += txt
        txt = def + "チームの　" + new get(def).name + "　の　攻撃が　最大まで上がった！" + CR
        document.battle_log.battle_log.value += txt
        document.getElementById(def + "_rank_A").textContent = 6
    }
}

// 4.防御側のもちもの
function defense_item(atk, def, atk_poke, def_poke, move, damage, substitute){
    // みがわり状態では発動しない
    if (!substitute){
        // ゴツゴツメット/ジャポのみ/レンブのみ/じゃくてんほけん/じゅうでんち/ゆきだま/きゅうこん/ひかりごけ/くっつきバリ/ふうせん
        if (new get(def).item == "ゴツゴツメット" && move[6] == "直接" && (!substitute || music_move_list.includes(move[0]) || new get(atk).ability == "すりぬけ")){
            HP_change_not_attack(atk, Math.floor(new get(atk).full_HP / 6), "-", new get(def).item)
            if (new get(atk).last_HP > 0){
                berry_in_pinch(atk)
            }
        } else if ((new get(def).item == "ジャポのみ" && move[2] == "物理") || (new get(def).item == "レンブのみ" && move[2] == "特殊")){
            if (new get(def).ability == "じゅくせい"){
                HP_change_not_attack(atk, Math.floor(new get(atk).full_HP / 4), "-", new get(def).item)
            } else {
                HP_change_not_attack(atk, Math.floor(new get(atk).full_HP / 8), "-", new get(def).item)
            }
            set_recycle_item(def)
            set_belch(def)
            if (new get(atk).last_HP > 0){
                berry_in_pinch(atk)
            }
        } else if (new get(def).item == "じゃくてんほけん" && damage[1] > 1 && new get(def).last_HP > 0){
            rank_change_not_status(def, "A", 2, 100, new get(def).item)
            rank_change_not_status(def, "C", 2, 100, new get(def).item)
            set_recycle_item(def)
        } else if (new get(def).item == "じゅうでんち" && move[1] == "でんき" && new get(def).last_HP > 0){
            rank_change_not_status(def, "A", 1, 100, new get(def).item)
            set_recycle_item(def)
        } else if (new get(def).item == "ゆきだま" && move[1] == "こおり" && new get(def).last_HP > 0){
            rank_change_not_status(def, "A", 1, 100, new get(def).item)
            set_recycle_item(def)
        } else if (new get(def).item == "きゅうこん" && move[1] == "みず" && new get(def).last_HP > 0){
            rank_change_not_status(def, "C", 1, 100, new get(def).item)
            set_recycle_item(def)
        } else if (new get(def).item == "ひかりごけ" && move[1] == "みず" && new get(def).last_HP > 0){
            rank_change_not_status(def, "D", 1, 100, new get(def).item)
            set_recycle_item(def)
        } else if (new get(def).item == "くっつきバリ" && move[6] == "直接" && new get(atk).item == ""){
            document.getElementById(atk + "_item").textContent = "くっつきバリ"
            document.getElementById(def + "_item").textContent = ""
        } else if (new get(def).item == "ふうせん" && move[2] != "変化"){
            txt = def + "チームの　" + def_poke + "の　ふうせんがわれた！" + CR
            document.battle_log.battle_log.value += txt
            set_recycle_item(def)
        }
        //(きあいのタスキ/きあいのハチマキはここで発動した旨のメッセージが出るが、ダメージ計算時(1.)で発動している)
    }
}

// 5.防御側のばけのかわ/アイスフェイス
function disguise_iceface(atk, def, atk_poke, def_poke, move, substitute){
    if (!substitute || music_move_list.includes(move[0]) || new get(atk).ability == "すりぬけ"){
        if (new get(def).ability == "ばけのかわ" && new get(def).p_con.includes("ばけたすがた")){
            txt = def + "チームの　" + new get(def).name + "の　化けの皮が剥がれた！" + CR
            document.battle_log.battle_log.value += txt
            HP_change_not_attack(def, Math.floor(new get(def).full_HP / 8), "-", new get(def).ability)
            condition_remove(def, "poke", "ばけたすがた")
            document.battle[def + "_poke_condition"].value += "ばれたすがた" + CR
            document.getElementById(def + "_" + battle_poke_num(def) + "_form").textContent = "ばれたすがた"
        }
        if (new get(def).ability == "アイスフェイス" && new get(def).name == "コオリッポ(アイスフェイス)" && move[2] == "物理"){
            txt = def + "チームの　" + new get(def).name + "の　アイスフェイス！" + CR
            document.battle_log.battle_log.value += txt
            form_chenge(def, "コオリッポ(ナイスフェイス)")
        }
    }
}

// 6.ひんし判定
function dying_judge(atk, def, atk_poke, def_poke, move){
    const def_HP_last = Number(document.getElementById(def + "_HP_last").textContent)
    const def_p_con = document.battle[def + "_poke_condition"].value
    // 1.いのちがけ使用者のひんし
    if (move[0] == "いのちがけ"){
        document.getElementById(atk + "_HP_last").textContent = 0
        fainted_process(atk)
    }
    // 2.技を受けたポケモンのひんし
    if (def_HP_last == 0){
        fainted_process(def)
    }
    // 3.みちづれの発動による攻撃者のひんし
    if (def_HP_last == 0 && def_p_con.includes("みちづれ")){
        txt = "みちづれが　発動した！" + CR
        document.battle_log.battle_log.value += txt
        document.getElementById(atk + "_HP_last").textContent = 0
        fainted_process(atk)
    }
}

// 8.連続攻撃技である場合、以下の処理を行う(おやこあいも含む)。
function continuous_move(atk, def, atk_poke, def_poke, move, order, substitute){
    for (let i = 0; i < continuous_move_list.length; i++){
        if (move[0] == continuous_move_list[i][0]){
            let check = 1
            if (move[0] == "トリプルキック" || move[0] == "トリプルアクセル"){
                for (let j = 0; j < 2; j++){
                    // 1.攻撃側と防御側のポケモンの回復のきのみ・HP1/4で発動するピンチきのみ・きのみジュースの発動判定
                    berry_in_pinch(atk)
                    berry_in_pinch(def)
                    // 2.攻撃側のポケモンがひんし・ねむり状態になった場合、連続攻撃は中断される。
                    let atk_HP_last = Number(document.getElementById(atk + "_HP_last").textContent)
                    let def_HP_last = Number(document.getElementById(def + "_HP_last").textContent)
                    let atk_abnormal = document.getElementById(atk + "_abnormal").textContent
                    if (atk_HP_last > 0 && def_HP_last > 0 && atk_abnormal != "ねむり"){
                        if ((!accuracy_failure(atk, def, move, order) && new get(atk).ability != "スキルリンク") || new get(atk).ability == "スキルリンク"){
                            if (move[0] == "トリプルキック"){
                                move[3] = 10 * (j + 2)
                            } else if (move[0] == "トリプルアクセル"){
                                move[3] = 20 * (j + 2)
                            }
                            // 1.ダメージ計算 [与えたダメージ, タイプ相性, 急所判定, 発生したダメージ]
                            let damage = HP_decrease_operation(atk, def, def_poke, move, order)
                            let substitute = new get(def).p_con.includes("みがわり")
                            // 2.追加効果などの発動
                            additional_effect_etc(atk, def, atk_poke, def_poke, move, order, damage, substitute)
                            // 3.防御側の特性
                            defense_ability(atk, def, atk_poke, def_poke, move, damage, substitute)
                            // 4.防御側のもちもの
                            defense_item(atk, def, atk_poke, def_poke, move, damage, substitute)
                            // 5.防御側のばけのかわ/アイスフェイス
                            disguise_iceface(atk, def, atk_poke, def_poke, move, substitute)
                            // 6.ひんし判定
                            dying_judge(atk, def, atk_poke, def_poke, move)
                            // 7.ひんしできんちょうかん/かがくへんかガスが解除されたことによる封じられていた効果の発動

                            check += 1
                        }
                    }
                }
            } else {
                let number = continuous_move_list[i][1]
                if (continuous_move_list[i][1] == 5){
                    const convert = [[0, 2], [35, 3], [70, 4], [85, 5]]
                    const random = Math.random() * 100
                    for (let j = 0; j < 4; j++){
                        if (random > convert[j][0]){
                            number = convert[j][1]
                        }
                    }
                    if (new get(atk).ability == "スキルリンク"){
                        number = 5
                    }
                }
                if (move[0] == "みずしゅりけん" && new get(atk).name == "ゲッコウガ(サトシゲッコウガ)"){
                    number = 3
                }
                let beat_up = []
                if (move[0] == "ふくろだたき"){
                    for (let i = 0; i < 3; i++){
                        if (document.getElementById(atk + "_" + i + "_existence").textContent == "控え" && document.getElementById(atk + "_" + i + "_abnormal").textContent == ""){
                            number += 1
                            beat_up.push(Math.floor(Number(document.getElementById(atk + "_" + i + "_A_AV").textContent) / 10 + 5))
                        }
                    }
                }
                // 3.攻撃が続く場合は1.からの処理を繰り返す。終了する場合は「○発当たった！」の表示後9.に進む。
                for (let j = 0; j < number - 1; j++){
                    // 1.攻撃側と防御側のポケモンの回復のきのみ・HP1/4で発動するピンチきのみ・きのみジュースの発動判定
                    berry_in_pinch(atk)
                    berry_in_pinch(def)
                    // 2.攻撃側のポケモンがひんし・ねむり状態になった場合、連続攻撃は中断される。
                    let atk_full_HP = Number(document.getElementById(atk + "_HP_last").textContent)
                    let def_HP_last = Number(document.getElementById(def + "_HP_last").textContent)
                    let atk_abnormal = document.getElementById(atk + "_abnormal").textContent
                    if (atk_full_HP > 0  && def_HP_last > 0 && atk_abnormal != "ねむり"){
                        // 1.ダメージ計算 [与えたダメージ, タイプ相性, 急所判定, 発生したダメージ]
                        if (move[0] == "ふくろだたき"){
                            move[3] = beat_up[j]
                        }
                        let damage = HP_decrease_operation(atk, def, def_poke, move, order)
                        let substitute = new get(def).p_con.includes("みがわり")
                        // 2.追加効果などの発動
                        additional_effect_etc(atk, def, atk_poke, def_poke, move, order, damage, substitute)
                        // 3.防御側の特性
                        defense_ability(atk, def, atk_poke, def_poke, move, damage, substitute)
                        // 4.防御側のもちもの
                        defense_item(atk, def, atk_poke, def_poke, move, damage, substitute)
                        // 5.防御側のばけのかわ/アイスフェイス
                        disguise_iceface(atk, def, atk_poke, def_poke, move, substitute)
                        // 6.ひんし判定
                        dying_judge(atk, def, atk_poke, def_poke, move)
                        // 7.ひんしできんちょうかん/かがくへんかガスが解除されたことによる封じられていた効果の発動
                        check += 1
                    }
                }
            }
            txt = check + "発　当たった！" + CR
            document.battle_log.battle_log.value += txt
            if (move[0] == "スケイルショット"){
                rank_change(atk, "B", -1)
                rank_change(atk, "S", 1)
            }
        }
    }
    
}

// 9.技の効果
function move_effect(atk, def, atk_poke, def_poke, move, damage, substitute){
    const atk_abnormal = document.getElementById(atk + "_abnormal").textContent
    const def_abnormal = document.getElementById(def + "_abnormal").textContent
    const atk_type = document.getElementById(atk + "_type").textContent
    const def_type = document.getElementById(def + "_type").textContent
    const atk_item = document.getElementById(atk + "_item").textContent
    const def_item = document.getElementById(def + "_item").textContent
    const atk_p_con = document.battle[atk + "_poke_condition"].value
    const def_p_con = document.battle[def + "_poke_condition"].value
    const atk_f_con = document.battle[atk + "_field_condition"].value
    const def_used_move = document.battle[def + "_used_move"].value
    const def_HP_last = Number(document.getElementById(def + "_HP_last").textContent)

    // 技の効果による反動ダメージ
    for (i = 0; i < recoil_move_list.length; i++){
        if (move[0] == recoil_move_list[i][0] && new get(atk).ability != "いしあたま"){
            const rate = recoil_move_list[i][1]
            const recoil = Math.round(damage[0] * rate)
            HP_change_not_attack(atk, recoil, "-", "反動")
            berry_in_pinch(atk)
        }
    }
    // バインド状態
    if (bind_move_list.includes(move[0]) && !def_p_con.includes("バインド") && !substitute && def_HP_last > 0){
        txt = def + "チームの　" + def_poke + "　は　しめつけられた！" + CR
        document.battle_log.battle_log.value += txt
        if (atk_item == "ねばりのかぎづめ"){
            document.battle[def + "_poke_condition"].value += "バインド（長）　0ターン目" + CR
        } else if (atk_item == "しめつけバンド"){
            document.battle[def + "_poke_condition"].value += "バインド（強）　0ターン目" + CR
        } else {
            document.battle[def + "_poke_condition"].value += "バインド　0ターン目" + CR
        }
        
        
    }
    // とどめばりによるこうげき上昇
    if (new get(def).f_con.includes("ひんし") && move[0] == "とどめばり"){
        rank_change_not_status(atk, "A", 3, 100, "とどめばり")
    }
    // はたきおとす/どろぼう/ほしがる/むしくい/ついばむによるもちものに関する効果
    if (move[0] == "はたきおとす" && def_item != "" && !substitute && new get(def).ability != "ねんちゃく" 
    && !(new get(def).name == "シルヴァディ" && new get(def).item.includes("メモリ"))
    && !(new get(def).name.includes("ザシアン") && new get(def).item　== "くちたけん") 
    && !(new get(def).name.includes("ザマゼンタ") && new get(def).item　== "くちたたて")){
        document.getElementById(def + "_item").textContent = ""
        txt = def + "チームの　" + def_poke + "　は" + def_item + "を　はたき落とされた！" + CR
        document.battle_log.battle_log.value += txt
        if (new get(def).ability == "かるわざ"){
            document.battle[def + "_poke_condition"].value += "かるわざ" + CR
        }
    } else if ((move[0] == "どろぼう" || move[0] == "ほしがる") && atk_item == ""  && def_item != "" && new get(def).ability != "ねんちゃく" 
    && !(new get(def).name == "シルヴァディ" && new get(def).item.includes("メモリ")) 
    && !(new get(def).name.includes("ザシアン") && new get(def).item　== "くちたけん") 
    && !(new get(def).name.includes("ザマゼンタ") && new get(def).item　== "くちたたて")){
        document.getElementById(atk + "_item").textContent = def_item
        document.getElementById(def + "_item").textContent = ""
        txt = def + "チームの　" + def_poke + "　の" + def_item + "を　奪った！" + CR
        document.battle_log.battle_log.value += txt
        if (new get(def).ability == "かるわざ"){
            document.battle[def + "_poke_condition"].value += "かるわざ" + CR
        }
    } else if ((move[0] == "むしくい" || move[0] == "ついばむ") && berry_item_list.includes(def_item) && new get(def).ability != "ねんちゃく" ){
        eating_berry_effect(atk, def_item)
        set_belch(team)
        if (new get(def).ability == "かるわざ"){
            document.battle[def + "_poke_condition"].value += "かるわざ" + CR
        }
    }
    // ドラゴンテール/ともえなげによる交代・交代先の繰り出し
    if (document.getElementById(def + "_0_existence").textContent == "控え" || document.getElementById(def + "_1_existence").textContent == "控え" || document.getElementById(def + "_2_existence").textContent == "控え"){
        if ((move[0] == "ドラゴンテール" || move[0] == "ともえなげ") && !substitute && new get(def).ability != "きゅうばん"){
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
        }
    }
    // うちおとす/サウザンアローによるうちおとす状態
    if ((move[0] == "うちおとす" || move[0] == "サウザンアロー") && !def_p_con.includes("うちおとす") && !grounded_check(def) && def_HP_last > 0 && !substitute){
        document.battle[def + "_poke_condition"].value += "うちおとす" + CR
        txt = def + "チームの　" + def_poke + "　は　地面に撃ち落とされた！" + CR
        document.battle_log.battle_log.value += txt
        condition_remove(def, "poke", "でんじふゆう")
        condition_remove(def, "poke", "テレキネシス")
        condition_remove(def, "poke", "空を飛ぶ")
        condition_remove(def, "poke", "姿を隠す")
    }
    // サウザンウェーブ/くらいつくによるにげられない状態
    if ((move[0] == "サウザンウェーブ") && !def_p_con.includes("逃げられない") && !substitute && def_HP_last > 0){
        document.battle[def + "_poke_condition"].value += "逃げられない" + CR
        txt = def + "チームの　" + def_poke + "　は　逃げられなくなった！" + CR
        document.battle_log.battle_log.value += txt
    }
    if (move[0] == "くらいつく" && def_HP_last > 0 && !substitute){
        if (!(atk_p_con.includes("逃げられない") || def_p_con.includes("逃げられない"))){
            if (!(atk_type.includes("ゴースト") || def_type.includes("ゴースト"))){
                document.battle[atk + "_poke_condition"].value += "逃げられない" + CR
                document.battle[def + "_poke_condition"].value += "逃げられない" + CR
                txt = "お互いのポケモン　は　逃げられなくなった！" + CR
                document.battle_log.battle_log.value += txt
            }
        }
    }
    // プラズマフィストによるプラズマシャワー状態
    if (move[0] == "プラズマフィスト" && !atk_f_con.includes("プラズマシャワー")){
        document.battle.A_field_condition.value += "プラズマシャワー" + CR
        document.battle.B_field_condition.value += "プラズマシャワー" + CR
        txt = "電気が駆け巡る！" + CR
        document.battle_log.battle_log.value += txt
    }
    // オリジンズスーパーノヴァによるサイコフィールド状態
    if (move[0] == "オリジンズスーパーノヴァ") {
        document.battle.A_field_condition.value += "サイコフィールド　5/5" + CR
        document.battle.B_field_condition.value += "サイコフィールド　5/5" + CR
        document.battle_log.battle_log.value += "足元が　不思議な感じに　包まれた" + CR
    }
    // こうそくスピン/ラジアルエッジストームによる場の状態の解除
    if (move[0] == "こうそくスピン"){
        document.battle[atk + "_poke_condition"].value = ""
        for (let i = 0; i < atk_p_con.split("\n").length - 1; i++){
            if (!(atk_p_con.split("\n")[i].includes("バインド") || atk_p_con.split("\n")[i].includes("やどりぎのタネ"))){
                document.battle[atk + "_poke_condition"].value += atk_p_con.split("\n")[i] + CR
            }
        }
        document.battle[atk + "_field_condition"].value = ""
        for (let i = 0; i < atk_f_con.split("\n").length - 1; i++){
            if (!(atk_f_con.split("\n")[i].includes("ステルスロック") 
            || atk_f_con.split("\n")[i].includes("どくびし") 
            || atk_f_con.split("\n")[i].includes("まきびし") 
            || atk_f_con.split("\n")[i].includes("ねばねばネット") 
            || atk_f_con.split("\n")[i].includes("キョウダイコウジン"))){
                document.battle[atk + "_field_condition"].value += atk_f_con.split("\n")[i] + CR
            }
        }
        document.battle_log.battle_log.value += "周りのものが　消え去った" + CR
    }
    if (move[0] == "ラジアルエッジストーム" && atk_f_con.includes("フィールド")){
        for (const team of ["A", "B"]){
            let f_con = document.battle[team + "_field_condition"].value
            document.battle[team + "_field_condition"].value = ""
            for (let i = 0; i < f_con.split("\n").length - 1; i++){
                if (!f_con.split("\n")[i].includes("フィールド")){
                    document.battle[team + "_field_condition"].value += f_con.split("\n")[i] + CR
                }
            }
        }
        document.battle_log.battle_log.value += "フィールドが　消え去った" + CR
    }
    // ほのおタイプの攻撃技を受けたことによるこおり状態の回復
    if (def_abnormal == "こおり" && move[1] == "ほのお" && def_HP_last > 0){
        document.getElementById(def + "_abnormal").textContent = ""
        txt = def + "チームの　" + def_poke + "　の　こおりがとけた" + CR
        document.battle_log.battle_log.value += txt
    }
    // ねっさのだいち/ねっとう/スチームバーストを受けたことによるこおり状態の回復
    if (def_abnormal == "こおり" && def_HP_last > 0){
        if (move[0] == "スチームバースト" || move[0] == "ねっさのだいち" || move[0] == "ねっとう"){
            document.getElementById(def + "_abnormal").textContent = ""
            txt = def + "チームの　" + def_poke + "　の　こおりがとけた" + CR
            document.battle_log.battle_log.value += txt
        }
    }
    // きつけを受けたことによるまひ状態の回復
    if (def_abnormal == "まひ" && move[0] == "きつけ" && def_HP_last > 0){
        document.getElementById(def + "_abnormal").textContent = ""
        txt = def + "チームの　" + def_poke + "の　まひが　なおった" + CR
        document.battle_log.battle_log.value += txt
    }
    // めざましビンタを受けたことによるねむり状態の回復
    if (def_abnormal == "ねむり" && move[0] == "めざましビンタ" && def_HP_last > 0){
        document.getElementById(def + "_abnormal").textContent = ""
        txt = def + "チームの　" + def_poke + "の　ねむりが　なおった" + CR
        document.battle_log.battle_log.value += txt
        document.battle[def + "_poke_condition"].value = ""
        for (let i = 0; i < def_p_con.split("\n").length - 1; i++){
            if (!def_p_con.split("\n")[i].includes("ねむり")){
                document.battle[def + "_poke_condition"].value += def_p_con.split("\n")[i] + CR
            }
        }
    }
    // うたかたのアリアを受けたことによるやけど状態の回復
    if (def_abnormal == "やけど" && move[0] == "うたかたのアリア" && def_HP_last > 0){
        document.getElementById(def + "_abnormal").textContent = ""
        txt = def + "チームの　" + def_poke + "の　やけどが　なおった" + CR
        document.battle_log.battle_log.value += txt
    }
    // ひみつのちからの追加効果
    if (move[0] == "ひみつのちから"){
        if (atk_f_con.includes("グラスフィールド")){
            make_abnormal_attack_or_ability(def, "ねむり", 30, move)
        } else if (atk_f_con.includes("エレキフィールド")){
            make_abnormal_attack_or_ability(def, "まひ", 30, move)
        } else if (atk_f_con.includes("ミストフィールド")){
            if (new get(def).ability == "ミラーアーマー"){
                txt = def + "チームの　" + new get(def).name + "の　ミラーアーマーが　発動した！" + CR
                document.battle_log.battle_log.value += txt
                rank_change_not_status(atk, "C", -1, 30, move)
            } else {
                rank_change_not_status(def, "C", -1, 30, move)
            }
        } else if (atk_f_con.includes("サイコフィールド")){
            if (new get(def).ability == "ミラーアーマー"){
                txt = def + "チームの　" + new get(def).name + "の　ミラーアーマーが　発動した！" + CR
                document.battle_log.battle_log.value += txt
                rank_change_not_status(atk, "S", -1, 30, move)
            } else {
                rank_change_not_status(def, "S", -1, 30, move)
            }
        } else {
            make_abnormal_attack_or_ability(def, "まひ", 30, move)
        }
    }
    // きらきらストームが成功したことによる味方の状態異常回復（wikiにない）
    if (atk_abnormal != "" && move[0] == "きらきらストーム"){
        document.getElementById(atk + "_abnormal").textContent = ""
        txt = atk + "チームの　" + atk_poke + "の　" + atk_abnormal + "が　なおった" + CR
        document.battle_log.battle_log.value += txt
    }
    // ぶきみなじゅもんによるPPの減少
    if (move[0] == "ぶきみなじゅもん" &&  def_used_move != "" && def_HP_last > 0){
        for (let i = 0; i < 4; i++){
            if (document.getElementById(def + "_move_" + i).textContent == def_used_move){
                const now_PP = Number(document.getElementById(def + "_move_" + i + "_last").textContent)
                if (now_PP > 0){
                    txt = def + "チームの　" + def_poke + "の　" + def_used_move + "の　PPが減った" + CR
                    document.battle_log.battle_log.value += txt
                    if (now_PP > 2){
                        document.getElementById(def + "_move_" + i + "_last").textContent = now_PP - 3
                    } else {
                        document.getElementById(def + "_move_" + i + "_last").textContent = 0
                    }
                }
            }
        }
    }
        //(ほのおタイプの技によるこおり状態の回復は使用者が場から去っている場合も発動する。それ以外の技の効果は使用者が場から去っていると発動しない)
}

// 10.特性の効果
function ability_effect(atk, def, atk_poke, def_poke, move){
    // 1.攻撃側のマジシャン/じしんかじょう/ビーストブースト/くろのいななき/しろのいななき
    if (new get(atk).ability == "マジシャン" && new get(atk).item == "" && new get(def).item != "" && new get(def).ability != "ねんちゃく" 
    && !(new get(def).name == "シルヴァディ" && new get(def).item.includes("メモリ")) 
    && !(new get(def).name == "アルセウス" && new get(def).item.includes("プレート"))
    && !(new get(def).name.includes("ザシアン") && new get(def).item　== "くちたけん") 
    && !(new get(def).name.includes("ザマゼンタ") && new get(def).item　== "くちたたて")){
        txt = atk + "チームの　" + atk_poke + "の　マジシャンが発動した" + CR
        document.battle_log.battle_log.value += txt
        document.getElementById(atk + "_item").textContent = new get(def).item
        document.getElementById(def + "_item").textContent = ""
    } else if ((new get(atk).ability == "じしんかじょう" || new get(atk).ability == "しろのいななき" || (new get(atk).ability == "じんばいったい" && atk_poke == "バドレックス(はくばじょうのすがた)")) && new get(def).f_con.includes("ひんし")){
        rank_change_not_status(atk, "A", 1, 100, new get(atk).ability)
    } else if ((new get(atk).ability == "くろのいななき" || (new get(atk).ability == "じんばいったい" && atk_poke == "バドレックス(こくばじょうのすがた)")) && new get(def).f_con.includes("ひんし")){
        rank_change_not_status(atk, "C", 1, 100, new get(atk).ability)
    } else if (new get(atk).ability == "ビーストブースト" && new get(def).f_con.includes("ひんし")){
        let check = [new get(atk).A_AV, "A"]
        for (const parameter of ["B", "C", "D", "S"]){
            if (check[0] < new get(atk)[parameter + "_AV"]){
                check = [new get(atk)[parameter + "_AV"], parameter]
            }
        }
        rank_change_not_status(atk, check[1], 1, 100, new get(atk).ability)
    }
    // 2.防御側のへんしょく/ぎゃくじょう
    if (new get(def).ability == "へんしょく" && !new get(def).type.includes(move[1])){
        txt = def + "チームの　" + def_poke + "の　へんしょくが発動した" + CR
        document.battle_log.battle_log.value += txt
        document.getElementById(def + "_type").textContent = move[1]
    }
}

// 11.防御側のもちものの効果
function defense_item_effect(atk, def, atk_poke, def_poke, move){
    const def_item = document.getElementById(def + "_item").textContent
    // アッキのみ/タラプのみ
    if (def_item == "アッキのみ" && move[2] == "物理"){
        if (new get(def).ability == "じゅくせい"){
            rank_change_not_status(def, "B", 2, 100, def_item)
        } else {
            rank_change_not_status(def, "B", 1, 100, def_item)
        }
        set_recycle_item(def)
    } else if (def_item == "タラプのみ" && move[2] == "特殊"){
        if (new get(def).ability == "じゅくせい"){
            rank_change_not_status(def, "D", 2, 100, def_item)
        } else {
            rank_change_not_status(def, "D", 1, 100, def_item)
        }
        set_recycle_item(def)
    }
    // だっしゅつボタン/レッドカードによって手持ちに戻るまで
    if (def_item == "だっしゅつボタン" && new get(def).last_HP > 0){
        txt = def + "チームの　" + new get(def).name + "は　" + def_item + "が発動して　手持ちに戻った" + CR
        document.battle_log.battle_log.value += txt
        set_recycle_item(def)
        document.battle[def + "_field_condition"].value += "選択中・・・" + CR
        come_back_pokemon(def)
    } else if (def_item == "レッドカード" && new get(atk).last_HP > 0){
        txt = atk + "チームの　" + new get(atk).name + "は　" + def_item + "が発動して　手持ちに戻った" + CR
        document.battle_log.battle_log.value += txt
        set_recycle_item(def)
        document.battle[atk + "_field_condition"].value += "選択中（レッドカード）・・・" + CR
        let choose = []
        for (let i = 0; i < 3; i++){
            if (document.getElementById(atk + "_" + i + "_existence").textContent == "控え"){
                choose.push(i)
            }
        }
        let summon = choose[0]
        if (choose.length == 2 && Math.random() < 0.5){
            summon = choose[1]
        }
        document.getElementById(atk + "_" + summon + "_button").checked = true

        come_back_pokemon(atk)
    }
}

// 13.いにしえのうた/きずなへんげによるフォルムチェンジ
function form_chenge_ability(atk, def, move){
    if (new get(atk).ability == "きずなへんげ" && new get(atk).name == "ゲッコウガ" && new get(def).f_con.includes("ひんし")){
        txt = atk + "チームの　ゲッコウガ　に　絆の力が溢れ出した！" + CR
        document.battle_log.battle_log.value += txt
        form_chenge(atk, "ゲッコウガ(サトシゲッコウガ)")
    }
}

// 14.いのちのたまの反動/かいがらのすずの回復
function lifeorb_shellbell(atk, damage){
    if (new get(atk).item == "いのちのたま"){
        HP_change_not_attack(atk, Math.floor(new get(atk).full_HP / 10), "-", new get(atk).item)
        berry_in_pinch(atk)
    } else if (new get(atk).item == "かいがらのすず"){
        HP_change_not_attack(atk, Math.floor(damage[0] / 8), "+", new get(atk).item)
    }
}

// 15.オボンのみなど回復のきのみ/チイラのみ/リュガのみ/ヤタピのみ/ズアのみ/カムラのみ/サンのみ/スターのみ/ミクルのみ/きのみジュース
function recover_berry(def){
    // 攻撃ダメージによって発動する場合のみこの処理順になる
    // (反動やゴツゴツメット等の効果ダメージやだっしゅつボタンによるきんちょうかんの退場ではその直後に割り込んで発動する)
    berry_in_pinch(def)
}

// 16.ききかいひ/にげごしによって手持ちに戻るまで
    // だっしゅつボタンと同時発動した場合は、交代先は両者同時に行う
    // レッドカードと同時発動した場合は、レッドカードの交代が行われた後、ききかいひの交代先を選ぶ
function emergency_exit(def, org_def_HP){
    if ((new get(def).ability == "ききかいひ" || new get(def).ability == "にげごし") 
    && org_def_HP > new get(def).full_HP / 2 && 0 < new get(def).last_HP && new get(def).last_HP <= new get(def).full_HP / 2 && !new get(def).f_con.includes("選択中")){
        txt = def + "チームの　" + new get(def).name + "は　" + new get(def).ability + "で手持ちに戻った" + CR
        document.battle_log.battle_log.value += txt
        document.battle[def + "_field_condition"].value += "選択中・・・" + CR
        come_back_pokemon(def)
    }
}

// 17.とんぼがえり/ボルトチェンジ/クイックターンによって手持ちに戻るまで
    // レッドカードが発動した場合、交代先はランダム
    // だっしゅつボタンやききかいひが発動した場合、交代できない
function come_back_move(atk, def, move){
    if ((move[0] == "とんぼがえり" || move[0] == "ボルトチェンジ" || move[0] == "クイックターン") && new get(atk).last_HP > 0 
    && !new get(atk).f_con.includes("選択中") && !new get(def).f_con.includes("選択中")){
        txt = atk + "チームの　" + new get(atk).name + "は　手持ちに戻った" + CR
        document.battle_log.battle_log.value += txt
        document.battle[atk + "_field_condition"].value += "選択中・・・" + CR
        come_back_pokemon(atk)
    }
}


// 18.アイアンローラーによるフィールドの消失
// 使用者が場から去っている場合も発動する
function steel_roller(move){
    if (move[0] == "アイアンローラー"){
        const atk_f_con = document.battle.A_field_condition.value.split("\n")
        const def_f_con = document.battle.B_field_condition.value.split("\n")
        document.battle.A_field_condition.value = ""
        document.battle.B_field_condition.value = ""
        for (i = 0; i < atk_f_con.length - 1 ;i++){
            if (!atk_f_con[i].includes("フィールド")){
                document.battle.A_field_condition.value += atk_f_con[i] + CR
            } else {
                txt = atk_f_con[i].substring(0, 8) + " が　消え去った！" + CR
                document.battle_log.battle_log.value += txt
            }
        }
        for (i = 0; i < def_f_con.length - 1 ;i++){
            if (!def_f_con[i].includes("フィールド")){
                document.battle.B_field_condition.value += def_f_con[i] + CR
            }
        }
    }
}

// 19.レッドカードによる交代先の繰り出し
function red_card(atk, def, substitute){
    const atk_f_con = new get(atk).f_con
    if (atk_f_con.includes("選択中（レッドカード）・・・")){
        pokemon_replace(atk)
        document.battle[atk + "_field_condition"].value = ""
        for (let i = 0; i < atk_f_con.split("\n").length - 1; i++){
            if (atk_f_con.split("\n")[i] != "選択中（レッドカード）・・・"){
                document.battle[atk + "_field_condition"].value += atk_f_con.split("\n")[i] + CR
            }
        }
    }
}

// 20.わるいてぐせ
function pickpocket(atk, def, atk_poke, def_poke, move){
    const def_ability = document.getElementById(def + "_ability").textContent
    const atk_item = document.getElementById(atk + "_item").textContent
    const def_item = document.getElementById(def + "_item").textContent
    const def_HP_last = Number(document.getElementById(def + "_HP_last").textContent)
    if (def_HP_last > 0 && def_ability == "わるいてぐせ" && atk_item != "" && def_item == "" && move[6] == "直接" && new get(def).ability != "ねんちゃく" 
    && !(new get(atk).name == "シルヴァディ" && new get(atk).item.includes("メモリ")) 
    && !(new get(atk).name == "アルセウス" && new get(atk).item.includes("プレート"))
    && !(new get(atk).name.includes("ザシアン") && new get(atk).item　== "くちたけん") 
    && !(new get(atk).name.includes("ザマゼンタ") && new get(atk).item　== "くちたたて")){
        txt = def + "チームの　" + def_poke + "は　わるいてぐせで　持ち物を奪った" + CR
        document.battle_log.battle_log.value += txt
        document.getElementById(atk + "_item").textContent = ""
        document.getElementById(def + "_item").textContent = atk_item
    }
}

// 21.一部の技の効果
function some_move_effect(atk, def, atk_poke, def_poke, move){
    const atk_type = document.getElementById(atk + "_type").textContent
    const atk_item = document.getElementById(atk + "_item").textContent
    const atk_p_con = document.battle[atk + "_poke_condition"].value
    const def_HP_last = Number(document.getElementById(def + "_HP_last").textContent)
    // もえつきるによるタイプの消失
    if (move[0] == "もえつきる"){
        document.getElementById(atk + "_type").textContent = ""
        for (let i = 0; i < atk_type.split("、").length; i++){
            if (atk_type.split("、")[i] != "ほのお"){
                document.getElementById(atk + "_type").textContent += atk_type.split("、")[i] + "、"
            }
        }
        document.getElementById(atk + "_type").textContent = document.getElementById(atk + "_type").textContent.slice(0, -1)
        
        txt = atk + "チームの　" + atk_poke + "の　炎が燃え尽きた" + CR
        document.battle_log.battle_log.value += txt
    }
    // しぜんのめぐみ使用によるきのみの消費
    if (move[0] == "しぜんのめぐみ"){
        set_recycle_item(atk)
        txt = atk + "チームの　" + atk_poke + "は　" + atk_item + "を　力に変えた" + CR
        document.battle_log.battle_log.value += txt
        for (let i = 0; i < natural_gift_item_list.length; i++){
            if (atk_item == natural_gift_item_list[i][0]){
                move[1] = natural_gift_item_list[i][1]
            }
        }
    }
    // あばれる状態の終了によるこんらん　あばれる（技名）　1ターン目
    if (atk_p_con.includes("あばれる")){
        document.battle[atk + "_poke_condition"].value = ""
        const random = Math.random()
        let check = 0
        for (let i = 0; i < atk_p_con.split("\n").length - 1; i++){
            if (atk_p_con.split("\n")[i].includes("あばれる") && atk_p_con.split("\n")[i].includes("1ターン目")){
                document.battle[atk + "_poke_condition"].value += atk_p_con.split("\n")[i].slice(0, -5) + "2ターン目" + CR
            } else if (atk_p_con.split("\n")[i].includes("あばれる") && atk_p_con.split("\n")[i].includes("2ターン目")){
                if (random < 0.5){
                    check += 1
                } else {
                    document.battle[atk + "_poke_condition"].value += atk_p_con.split("\n")[i].slice(0, -5) + "3ターン目" + CR
                }
            } else if (atk_p_con.split("\n")[i].includes("あばれる") && atk_p_con.split("\n")[i].includes("3ターン目")){
                check += 1
            } else {
                document.battle[atk + "_poke_condition"].value += atk_p_con.split("\n")[i] + CR
            }
        }
        if (check > 0){
            txt = atk + "チームの　" + atk_poke + "は　疲れ果てて　こんらんした" + CR
            document.battle_log.battle_log.value += txt
            document.battle[atk + "_poke_condition"].value += "こんらん　1ターン目" + CR
        }
    }
}

// 22.ヒメリのみ/しろいハーブ/のどスプレー/だっしゅつパックによって手持ちに戻るまで
function other_item_effect(atk, def, move){
    // ヒメリのみ
    if (new get(atk).item == "ヒメリのみ"){
        for (let i = 0; i < 4; i++){
            if (document.getElementById(atk + "_move_" + i + "_last").textContent == 0){
                let full = Number(document.getElementById(atk + "_move_" + i + "_PP").textContent)
                if (new get(atk).ability == "じゅくせい"){
                    document.getElementById(atk + "_move_" + i + "_last").textContent = Math.min(20, full)
                } else {
                    document.getElementById(atk + "_move_" + i + "_last").textContent = Math.min(10, full)
                }
                txt = atk + "チームの　" + new get(atk).name + "は　ヒメリのみで　PPを回復した" + CR
                document.battle_log.battle_log.value += txt
                set_recycle_item(atk)
                set_belch(atk)
                break
            }
        }
    }
    // しろいハーブ
    white_herb(atk)
    white_herb(def)
    // のどスプレー
    if (new get(atk).item == "のどスプレー" && music_move_list.includes(move[0]) && new get(atk).C_rank < 6){
        rank_change_not_status(atk, "C", 1, 100, "のどスプレー")
        set_recycle_item(atk)
    }
    // だっしゅつパック
        // だっしゅつボタンやききかいひが発動している場合、だっしゅつパックは発動しない
    if (new get(atk).item == "だっしゅつパック" && new get(atk).p_con.includes("ランク下降") && !new get(atk).f_con.includes("選択中") && !new get(def).f_con.includes("選択中")){
        txt = atk + "チームの　" + new get(atk).name + "は　だっしゅつパックで手持ちに戻った" + CR
        document.battle_log.battle_log.value += txt
        set_recycle_item(atk)
        document.battle[atk + "_field_condition"].value += "選択中・・・" + CR
        come_back_pokemon(atk)
    }
    if (new get(def).item == "だっしゅつパック" && new get(def).p_con.includes("ランク下降") && !new get(atk).f_con.includes("選択中") && !new get(def).f_con.includes("選択中")){
        txt = def + "チームの　" + new get(def).name + "は　だっしゅつパックで手持ちに戻った" + CR
        document.battle_log.battle_log.value += txt
        set_recycle_item(def)
        document.battle[def + "_field_condition"].value += "選択中・・・" + CR
        come_back_pokemon(def)
    }
    // ヒメリのみは技の使用によってPP0になった場合のみこの処理順になる
        // (ぶきみなじゅもんの効果ではその直後に割り込んで発動する)
    // しろいハーブ/だっしゅつパックは追加効果や反動やダイマックス技効果など技自体の効果によって発動する場合のみこの処理順になる
        // (わたげなど技以外の効果ではその直後に割り込んで発動する)
}


// 23.とんぼがえり/ボルトチェンジ/クイックターン/ききかいひ/にげごし/だっしゅつボタン/だっしゅつパックによる交代先の選択・交代
function return_battle(atk, def, move){
    if (new get(atk).f_con.includes("選択中") && new get(def).f_con.includes("選択中")){
        // 2匹同時交換　ききかいひとだっしゅつボタンが同時発動した時
    } else {
        for (const team of [atk, def]){// 片方だけが交換
            if (new get(team).f_con.includes("選択中")){
                txt = team + "チームは　戦闘に出すポケモンを選んでください" + CR
                document.battle_log.battle_log.value += txt
                return true
            }
        }
    }
}

// 25.おどりこ
function ability_dancer(atk, def, move, order){

}



function eating_berry_effect(team, berry){
    document.getElementById(team + "_item").textContent = ""
    txt = team + "チームの　" + new get(team).name + "　は　" + berry + "を　食べた！" + CR
    document.battle_log.battle_log.value += txt
    if (berry == "オレンのみ"){
        if (new get(team).ability == "じゅくせい"){
            HP_change(team, 20, "+")
        } else {
            HP_change(team, 10, "+")
        }
    } else if (berry == "オボンのみ" || berry == "ナゾのみ"){
        if (new get(team).ability == "じゅくせい"){
            HP_change(team, Math.floor(new get(team).full_HP / 2), "+")
        } else {
            HP_change(team, Math.floor(new get(team).full_HP / 4), "+")
        }
    } else if (berry == "クラボのみ" && new get(team).abnormal == "まひ"){
        txt = team + "チームの　" + new get(team).name + "の　痺れが取れた！" + CR
        document.battle_log.battle_log.value += txt
        document.getElementById(team + "_abnormal").textContent = ""
    } else if (berry == "カゴのみ" && new get(team).abnormal == "ねむり"){
        txt = team + "チームの　" + new get(team).name + "の　目を覚ました！" + CR
        document.battle_log.battle_log.value += txt
        document.getElementById(team + "_abnormal").textContent = ""
        condition_remove(team, "poke", "ねむり")
        condition_remove(team, "poke", "ねむる")
    } else if (berry == "モモンのみ" && new get(team).abnormal.includes("どく")){
        txt = team + "チームの　" + new get(team).name + "の　どくが取れた！" + CR
        document.battle_log.battle_log.value += txt
        document.getElementById(team + "_abnormal").textContent = ""
        condition_remove(team, "poke", "もうどく")
    } else if (berry == "チーゴのみ" && new get(team).abnormal == "やけど"){
        txt = team + "チームの　" + new get(team).name + "の　やけどが治った！" + CR
        document.battle_log.battle_log.value += txt
        document.getElementById(team + "_abnormal").textContent = ""
    } else if (berry == "ナナシのみ" && new get(team).abnormal == "こおり"){
        txt = team + "チームの　" + new get(team).name + "の　こおりが解けた！" + CR
        document.battle_log.battle_log.value += txt
        document.getElementById(team + "_abnormal").textContent = ""
    } else if (berry == "ヒメリのみ"){
        for (let i = 0; i < 4; i++){
            let PP = Number(document.getElementById(team + "_move_" + i + "_PP").textContent)
            let last = Number(document.getElementById(team + "_move_" + i + "_last").textContent)
            let move_name = document.getElementById(team + "_move_" + i).textContent
            if (last < PP){
                if (new get(team).ability == "じゅくせい"){
                    document.getElementById(team + "_move_" + i + "_last").textContent = Math.min(PP, last + 20)
                } else {
                    document.getElementById(team + "_move_" + i + "_last").textContent = Math.min(PP, last + 10)
                }
                txt = team + "チームの　" + new get(team).name + "　は　" + move_name + "の　PPを回復した" + CR
                document.battle_log.battle_log.value += txt
                break
            }
        }
    } else if (berry == "キーのみ" && new get(team).p_con.includes("こんらん")){
        txt = team + "チームの　" + new get(team).name + "の　こんらんが解けた！" + CR
        document.battle_log.battle_log.value += txt
        condition_remove(team, "poke", "こんらん")
    } else if (berry == "ラムのみ" && (new get(team).abnormal != "" || new get(team).p_con.includes("こんらん"))){
        txt = team + "チームの　" + new get(team).name + "の　状態異常が治った！" + CR
        document.battle_log.battle_log.value += txt
        document.getElementById(team + "_abnormal").textContent = ""
        condition_remove(team, "poke", "こんらん")
    } else if (berry == "フィラのみ" || berry == "イアのみ" || berry == "ウイのみ" || berry == "バンジのみ" || berry == "マゴのみ"){
        if (new get(team).ability == "じゅくせい"){
            HP_change(team, Math.floor(new get(team).full_HP * 2 / 3), "+")
        } else {
            HP_change(team, Math.floor(new get(team).full_HP / 3), "+")
        }
        if ((berry == "フィラのみ" && (new get(team).nature == "ずぶとい" || new get(team).nature == "ひかえめ" || new get(team).nature == "おだやか" || new get(team).nature == "おくびょう")) 
        || (berry == "イアのみ" && (new get(team).nature == "さみしがり" || new get(team).nature == "おっとり" || new get(team).nature == "おとなしい" || new get(team).nature == "せっかち")) 
        || (berry == "ウイのみ" && (new get(team).nature == "いじっぱり" || new get(team).nature == "わんぱく" || new get(team).nature == "しんちょう" || new get(team).nature == "ようき")) 
        || (berry == "バンジのみ" && (new get(team).nature == "やんちゃ" || new get(team).nature == "のうてんき" || new get(team).nature == "うっかりや" || new get(team).nature == "むじゃき")) 
        || (berry == "マゴのみ" && (new get(team).nature == "ゆうかん" || new get(team).nature == "のんき" || new get(team).nature == "れいせい" || new get(team).nature == "なまいき"))){
            if (!new get(team).p_con.includes("こんらん")){
                make_abnormal(team, "こんらん")
            }
        }
    } else if (berry == "チイラのみ"){
        if (new get(team).ability == "じゅくせい"){
            rank_change(team, "A", 2)
        } else {
            rank_change(team, "A", 1)
        }
    } else if (berry == "リュガのみ" || berry == "アッキのみ"){
        if (new get(team).ability == "じゅくせい"){
            rank_change(team, "B", 2)
        } else {
            rank_change(team, "B", 1)
        }
    } else if (berry == "ヤタピのみ"){
        if (new get(team).ability == "じゅくせい"){
            rank_change(team, "C", 2)
        } else {
            rank_change(team, "C", 1)
        }
    } else if (berry == "ズアのみ" || berry == "タラプのみ"){
        if (new get(team).ability == "じゅくせい"){
            rank_change(team, "D", 2)
        } else {
            rank_change(team, "D", 1)
        }
    } else if (berry == "カムラのみ"){
        if (new get(team).ability == "じゅくせい"){
            rank_change(team, "S", 2)
        } else {
            rank_change(team, "S", 1)
        }
    } else if (berry == "サンのみ" && !new get(team).p_con.includes("きゅうしょアップ")){
        txt = team + "チームの　" + new get(team).name + "は　張り切り出した！" + CR
        document.battle_log.battle_log.value += txt
        document.battle[team + "_poke_condition"].value += "きゅうしょアップ" + CR
    } else if (berry == "スターのみ"){
        const random = Math.random()
        const parameter = [["A", 0], ["B", 1/5], ["C", 2/5], ["D", 3/5], ["S", 4/5]]
        let check = ""
        for (let i = 0; i < 5; i++){
            if (random > parameter[i][1]){
                check = parameter[i][0]
            }
        }
        if (new get(team).ability == "じゅくせい"){
            rank_change(team, check, 4)
        } else {
            rank_change(team, check, 2)
        }
    } else if (berry == "ミクルのみ"){
        document.battle[team + "_poke_condition"].value += "ミクルのみ" + CR
        txt = team + "チームの　" + new get(team).name + "は　命中率が上がった！" + CR
        document.battle_log.battle_log.value += txt
    }
    if (new get(team).ability == "ほおぶくろ"){
        HP_change_not_attack(team, Math.floor(new get(team).full_HP / 3), "+", "ほおぶくろ")
    }
}


