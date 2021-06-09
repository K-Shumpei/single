function turn_start(){
    const current = document.battle_log.battle_log.value
    const num = (current.match( /ターン目/g ) || []).length + 1
    txt = "---------- " + num + "ターン目 ----------" + CR
    document.battle_log.battle_log.value += txt
}


// 戦闘に出す時の特性の発動
function summon_pokemon(num, team){
    // num は、戦闘に出すポケモンの数
    if (num == 1){
        let enemy = "A"
        if (team == "A"){
            enemy = "B"
        }
        // 1.かがくへんかガスの発動
        neutralizing_gas(team, enemy)
        // 2.きんちょうかん/じんばいったいの発動
        unnerve(team, enemy)
        // 3.1~2.状態/ 3.特性/ 4.持ち物の発動
        condition_ability_item_action(team, enemy)
        // 4.リミットシールド/ぎょぐん/ゲンシカイキによるフォルムチェンジ[2][3]
        ability_form_change(team, enemy)
        // 5.エレキシード/グラスシード/ミストシード/サイコシード/ルームサービス
        seed_service(team, enemy)
        // 6.フラワーギフト/てんきや/アイスフェイス
        // 7.しろいハーブ
        white_herb(team)
        // 8.だっしゅつパックによる交代、交代先の繰り出し
        eject_pack(team, enemy)

    } else if (num == 2){
        // 素早さ判定
        let order = speed_check()
        // 1.かがくへんかガスの発動
        neutralizing_gas(order[0], order[1])
        neutralizing_gas(order[1], order[0])
        // 2.きんちょうかん/じんばいったいの発動
        unnerve(order[0], order[1])
        unnerve(order[1], order[0])
        // 3.1~2.状態/ 3.特性/ 4.持ち物の発動
        condition_ability_item_action(order[0], order[1])
        condition_ability_item_action(order[1], order[0])
        // 4.リミットシールド/ぎょぐん/ゲンシカイキによるフォルムチェンジ[2][3]
        ability_form_change(order[0], order[1])
        ability_form_change(order[1], order[0])
        // 5.エレキシード/グラスシード/ミストシード/サイコシード/ルームサービス
        seed_service(order[0], order[1])
        seed_service(order[1], order[0])
        // 6.フラワーギフト/てんきや/アイスフェイス
        // 7.しろいハーブ
        white_herb(order[0])
        white_herb(order[1])
        // 8.だっしゅつパックによる交代、交代先の繰り出し
        eject_pack(order[0], order[1])
        eject_pack(order[1], order[0])
        
    
        // すばやさが高い順に発動する。トリックルームの影響を受ける。
        // 6-2~3において、設置技や特性の効果できのみ/きのみジュース/シード系アイテム、アイスフェイスが発動する場合、他の処理より優先して即座に発動する。
        // 6-2において、設置技の効果でポケモンがひんしになった場合、6-3以降の特性の効果は発動しない。
        // ターン終了時、ひんしになったポケモンの代わりを繰り出す場合、2までお互いが完了してから3以降の処理に進む。入れ替えルールでポケモンを入れ替えるときも同じ。
        // バトルの途中、ポケモンを交代させたときは、上記全ての行動が終わってから他のポケモンの行動が行われる。
        // 複数のポケモンを同時に後出しする場合は、同時に場に出たとはみなされない。全ての手順を終えてから次の交代が行われる。
    
        // ゲンシカイキするときにひでり/あめふらしは発動しない。
    }
}
    

// 1.かがくへんかガスの発動
function neutralizing_gas(team, enemy){
    if (new get(team).ability == "かがくへんかガス"){
        document.battle_log.battle_log.value += "あたりに　かがくへんかガスが　充満した！" + CR
        let p_con = document.battle[enemy + "_poke_condition"].value
        if (!neutralizing_gas_ability_list.includes(new get(enemy).ability) && !new get(enemy).p_con.includes("かがくへんかガス")){
            condition_remove(enemy, "poke", "スロースタート：")
            document.battle[enemy + "_poke_condition"].value += "かがくへんかガス：" + new get(enemy).ability + CR
            document.getElementById(enemy + "_ability").textContent = ""
        }
    }
}

// 2.きんちょうかん/じんばいったいの発動
function unnerve(team, enemy){
    if (new get(team).ability == "きんちょうかん"){
        txt = enemy + "チームは　緊張して　きのみが　食べられなくなった！" + CR
        document.battle_log.battle_log.value += txt
    } else if (new get(team).ability == "じんばいったい"){
        txt = team + "チームの　" + new get(team).name + "は　ふたつの　特性を　あわせ持つ！" + CR
        document.battle_log.battle_log.value += txt
        txt = enemy + "チームは　緊張して　きのみが　食べられなくなった！" + CR
        document.battle_log.battle_log.value += txt
    }
}

// 3.1~2.状態/ 3.特性/ 4.持ち物の発動
function condition_ability_item_action(team, enemy){
    // 1.いやしのねがい/みかづきのまい/Zおきみやげ/Zすてゼリフによる回復
    if (new get(team).f_con.includes("いやしのねがい") && (new get(team).last_HP < new get(team).full_HP || new get(team).abnormal != "")){
        txt = team + "チームの　いやしのねがいが　発動した！" + CR
        document.battle_log.battle_log.value += txt
        document.getElementById(team + "_HP_last").textContent = document.getElementById(team + "_HP").textContent
        document.getElementByIde(team + "_abnormal").textContent = ""
        condition_remove(team, "field", "いやしのねがい")
    }
    if (new get(team).f_con.includes("みかづきのまい") && (new get(team).last_HP < new get(team).full_HP || new get(team).abnormal != "")){
        let check = 0
        for (let i = 0; i < 4; i++){
            if (document.getElementById(team + "_move_" + i + "_last").textContent == document.getElementById(team + "_move_" + i + "_PP").textContent){
                check += 1
            }
        }
        if (check != 4){
            txt = team + "チームの　みかづきのまいが　発動した！" + CR
            document.battle_log.battle_log.value += txt
            document.getElementById(team + "_HP_last").textContent = document.getElementById(team + "_HP").textContent
            document.getElementByIde(team + "_abnormal").textContent = ""
            for (let i = 0; i < 4; i++){
                document.getElementById(team + "_move_" + i + "_last").textContent = document.getElementById(team + "_move_" + i + "_PP").textContent
            }
            condition_remove(team, "field", "みかづきのまい")
        }
    }
    if ((new get(team).f_con.includes("Zおきみやげ") || new get(team).f_con.includes("Zすてゼリフ")) && new get(team).last_HP < new get(team).full_HP){
        txt = team + "チームの　Zおきみやげが　発動した！" + CR
        document.battle_log.battle_log.value += txt
        document.getElementById(team + "_HP_last").textContent = document.getElementById(team + "_HP").textContent
        condition_remove(team, "field", "Zおきみやげ")
        condition_remove(team, "field", "Zすてゼリフ")
    }
    // 2.設置技: 技が使用された順に発動
    if (new get(team).item != "あつぞこブーツ"){
        for (let i = 0; i < new get(team).f_len; i++){
            if (new get(team).f_list[i].includes("まきびし") && grounded_check(team)){
                let num = Number(new get(team).f_list[i].slice(5, 6))
                let damage = Math.floor(new get(team).full_HP / (10 - (num * 2)))
                HP_change_not_attack(team, damage, "-", "まきびし")
            } else if (new get(team).f_list[i].includes("どくびし") && grounded_check(team)){
                let num = Number(new get(team).f_list[i].slice(5, 6))
                if (num == 1){
                    make_abnormal_attack_or_ability(team, "どく", 100, "どくびし")
                } else if (num == 2){
                    make_abnormal_attack_or_ability(team, "もうどく", 100, "どくびし")
                }
            } else if (new get(team).f_list[i].includes("ステルスロック")){
                let rate = compatibility_check(team, enemy, move_search_by_name("アクセルロック"))
                let damage = Math.floor(new get(team).full_HP * rate / 8)
                HP_change_not_attack(team, damage, "-", "ステルスロック")
            } else if (new get(team).f_list[i].includes("ねばねばネット") && grounded_check(team)){
                rank_change_not_status(team, "S", -1, 100, "ねばねばネット")
            } else if (new get(team).f_list[i].includes("キョダイコウジン")){
                let rate = compatibility_check(team, enemy, move_search_by_name("バレットパンチ"))
                let damage = Math.floor(new get(team).full_HP * rate / 8)
                HP_change_not_attack(team, damage, "-", "キョダイコウジン")
            }
        }
    }
    if (new get(team).type.includes("どく") && grounded_check(team) && new get(team).f_con.includes("どくびし")){
        document.battle_log.battle_log.value += "どくびしが　消え去った！" + CR
        condition_remove(team, "field", "どくびし")
    }
    // 3.場に出たときに発動する特性
    if (new get(team).ability == "あめふらし" && !new get(team).f_con.includes("あめ") && !new get(team).f_con.includes("おおひでり") && !new get(team).f_con.includes("らんきりゅう")){
        txt = team + "チームの　" + new get(team).name + "の　あめふらし！" + CR
        document.battle_log.battle_log.value += txt
        all_field_status_move(team, move_search_by_name("あまごい"))
    } else if (new get(team).ability == "いかく"){
        txt = team + "チームの　" + new get(team).name + "の　いかく！" + CR
        document.battle_log.battle_log.value += txt
        if (new get(enemy).ability == "ミラーアーマー"){
            if (!(new get(team).p_con.includes("みがわり") || new get(team).ability == "きもったま" || new get(team).ability == "せいしんりょく" || new get(team).ability == "どんかん" || new get(team).ability == "マイペース")){
                txt = enemy + "チームの　" + new get(enemy).name + "　の　ミラーアーマーが　発動した！" + CR
                document.battle_log.battle_log.value += txt
                rank_change(team, "A", -1, 100)
            }
            if (new get(enemy).item == "ビビリだま" && new get(enemy).S_rank < 6){
                rank_change_not_status(enemy, "S", 1, 100, "ビビリだま")
                set_recycle_item(enemy)
            }
        }
        if (!(new get(enemy).p_con.includes("みがわり") || new get(enemy).ability == "きもったま" || new get(enemy).ability == "せいしんりょく" || new get(enemy).ability == "どんかん" || new get(enemy).ability == "マイペース")){
            rank_change(enemy, "A", -1, 100)
            if (new get(enemy).ability == "びびり"){
                rank_change_not_status(enemy, "S", 1, 100, "びびり")
            }
        }
        if (new get(enemy).item == "ビビリだま" && new get(enemy).S_rank < 6){
            rank_change_not_status(enemy, "S", 1, 100, "ビビリだま")
            set_recycle_item(enemy)
        }
    } else if (new get(team).ability == "エアロック" || new get(team).ability == "ノーてんき"){
        document.battle_log.battle_log.value += "天気の影響がなくなった" + CR
    } else if (new get(team).ability == "エレキメイカー" && !new get(team).f_con.includes("エレキフィールド")){
        txt = team + "チームの　" + new get(team).name + "の　エレキメイカー！" + CR
        document.battle_log.battle_log.value += txt
        all_field_status_move(team, move_search_by_name("エレキフィールド"))
    } else if (new get(team).ability == "オーラブレイク"){
        txt = team + "チームの　" + new get(team).name + "の　オーラブレイクが発動している！" + CR
        document.battle_log.battle_log.value += txt
    } else if (new get(team).ability == "おみとおし" && new get(enemy).item != ""){
        txt = team + "チームの　" + new get(team).name + "の　おみとおし！" + CR
        document.battle_log.battle_log.value += txt
        txt = enemy + "チームの　" + new get(enemy).name + "の　" + new get(enemy).item + "を　お見通しだ！" + CR
        document.battle_log.battle_log.value += txt
    } else if (new get(team).ability == "おわりのだいち" && !new get(team).f_con.includes("おおひでり")){
        txt = team + "チームの　" + new get(team).name + "の　おわりのだいち！" + CR
        document.battle_log.battle_log.value += txt
        document.battle_log.battle_log.value += "日差しがとても強くなった！" + CR
        for (const i of ["A", "B"]){
            condition_remove(i, "field", "あめ")
            condition_remove(i, "field", "にほんばれ")
            condition_remove(i, "field", "すなあらし")
            condition_remove(i, "field", "あられ")
            condition_remove(i, "field", "らんきりゅう")
            document.battle[i + "_field_condition"].value += "にほんばれ（おおひでり）" + CR
        }
    } else if (new get(team).ability == "かたやぶり" || new get(team).ability == "ターボブレイズ" || new get(team).ability == "テラボルテージ"){
        txt = team + "チームの　" + new get(team).name + "は　" + new get(team).ability + "だ！" + CR
        document.battle_log.battle_log.value += txt
    } else if (new get(team).ability == "かわりもの" && !new get(enemy).p_con.includes("みがわり") && !new get(enemy).p_con.includes("へんしん")){
        txt = team + "チームの　" + new get(team).name + "の　かわりもの！" + CR
        document.battle_log.battle_log.value += txt
        for (const i of ["_sex", "_type", "_nature", "_ability", 
        "_A_AV", "_B_AV", "_C_AV", "_D_AV", "_S_AV", 
        "_rank_A", "_rank_B", "_rank_C", "_rank_D", "_rank_S", "_rank_accuracy", "_rank_evasiveness", 
        "_move_0", "_move_1", "_move_2", "_move_3"]){
            document.getElementById(team + i).textContent = document.getElementById(enemy + i).textContent
        }
        for (let i = 0; i < 4; i++){
            if (document.getElementById(team + "_move_" + i).textContent != ""){
                document.getElementById(team + "_move_" + i + "_PP").textContent = 5
                document.getElementById(team + "_move_" + i + "_last").textContent = 5
                document.getElementById(team + "_radio_" + i).disabled = false
            } else {
                ocument.getElementById(team + "_move_" + i + "_PP").textContent = ""
                document.getElementById(team + "_move_" + i + "_last").textContent = ""
                document.getElementById(team + "_radio_" + i).disabled = true
            }
            break
        }
        document.battle[team + "_poke_condition"].value += "へんしん" + CR
        condition_remove(team, "poke", "きゅうしょアップ")
        condition_remove(team, "poke", "とぎすます")
        condition_remove(team, "poke", "キョダイシンゲキ")
        condition_remove(team, "poke", "ボディパージ")
        for (let i = 0; i < new get(enemy).p_len; i++){
            if (new get(enemy).p_list[i].includes("きゅうしょアップ") || new get(enemy).p_list[i].includes("とぎすます") || new get(enemy).p_list[i].includes("キョダイシンゲキ") || new get(enemy).p_list[i].includes("ボディパージ")){
                document.battle[team + "_poke_condition"].value += new get(enemy).p_list[i] + CR
            }
        }
        // 画像の設定
        for (let i = 0; i < pokemon.length; i++){
            if (new get(enemy).name == pokemon[i][1]){
                document.getElementById(team + "_image").src = "poke_figure/" + pokemon[i][0] + ".gif"
            }
        }
        txt = new get(enemy).name + "に　へんしんした" + CR
        document.battle_log.battle_log.value += txt
    } else if (new get(team).ability == "きけんよち"){
        let check = 0
        for (let i = 0; i < 4; i++){
            if (document.getElementById(enemy + "_move_" + i).textContent != ""){
                let move = move_search_by_name(document.getElementById(enemy + "_move_" + i).textContent)
                if ((compatibility_check(team, enemy, move) > 1 && move[2] != "変化") || one_shot_deadly_move_list.includes(move[0])){
                    check += 1
                }
            }
        }
        if (check > 0){
            txt = team + "チームの　" + new get(team).name + "は　身震いした！" + CR
            document.battle_log.battle_log.value += txt
        }
    } else if (new get(team).ability == "きみょうなくすり"){
        
    } else if (new get(team).ability == "グラスメイカー" && !new get(team).f_con.includes("グラスフィールド")){
        txt = team + "チームの　" + new get(team).name + "の　グラスメイカー！" + CR
        document.battle_log.battle_log.value += txt
        all_field_status_move(team, move_search_by_name("グラスフィールド"))
    } else if (new get(team).ability == "サイコメイカー" && !new get(team).f_con.includes("サイコフィールド")){
        txt = team + "チームの　" + new get(team).name + "の　サイコメイカー！" + CR
        document.battle_log.battle_log.value += txt
        all_field_status_move(team, move_search_by_name("サイコフィールド"))
    } else if (new get(team).ability == "スロースタート"){
        txt = team + "チームの　" + new get(team).name + "の　スロースタート！" + CR
        document.battle_log.battle_log.value += txt
        txt = team + "チームの　" + new get(team).name + "は　調子が上がらない！" + CR
        document.battle_log.battle_log.value += txt
        document.battle[team + "_poke_condition"].value += "スロースタート　5/5" + CR
    } else if (new get(team).ability == "すなおこし" && !new get(team).f_con.includes("すなあらし") && !new get(team).f_con.includes("おおあめ") && !new get(team).f_con.includes("おおひでり") && !new get(team).f_con.includes("らんきりゅう")){
        txt = team + "チームの　" + new get(team).name + "の　すなおこし！" + CR
        document.battle_log.battle_log.value += txt
        all_field_status_move(team, move_search_by_name("すなあらし"))
    } else if (new get(team).ability == "ぜったいねむり"){
        txt = team + "チームの　" + new get(team).name + "は　夢うつつの状態！" + CR
        document.battle_log.battle_log.value += txt
    } else if (new get(team).ability == "ダークオーラ"){
        txt = team + "チームの　" + new get(team).name + "の　ダークオーラが発動している！" + CR
        document.battle_log.battle_log.value += txt
    } else if (new get(team).ability == "ダウンロード"){
        let B_AV = 0
        let D_AV = 0
        if (new get(enemy).B_rank > 0){
            B_AV = Math.floor((new get(enemy).B_AV * (2 + new get(enemy).B_rank)) / 2)
        } else {
            B_AV = Math.floor((new get(enemy).B_AV * 2) / (2 - new get(enemy).B_rank))
        }
        if (new get(enemy).D_rank > 0){
            D_AV = Math.floor((new get(enemy).D_AV * (2 + new get(enemy).D_rank)) / 2)
        } else {
            D_AV = Math.floor((new get(enemy).D_AV * 2) / (2 - new get(enemy).D_rank))
        }
        if (B_AV >= D_AV){
            rank_change_not_status(team, "A", 1, 100, "ダウンロード")
        } else {
            rank_change_not_status(team, "C", 1, 100, "ダウンロード")
        }
    } else if (new get(team).ability == "デルタストリーム" && !new get(team).f_con.includes("らんきりゅう")){
        txt = team + "チームの　" + new get(team).name + "の　デルタストリーム！" + CR
        document.battle_log.battle_log.value += txt
        document.battle_log.battle_log.value += "乱気流状態になった！" + CR
        for (const i of ["A", "B"]){
            condition_remove(i, "field", "あめ")
            condition_remove(i, "field", "にほんばれ")
            condition_remove(i, "field", "すなあらし")
            condition_remove(i, "field", "あられ")
            document.battle[i + "_field_condition"].value += "らんきりゅう" + CR
        }
    } else if (new get(team).ability == "トレース" && !trace_ability_list.includes(new get(enemy).ability)){
        txt = team + "チームの　" + new get(team).name + "の　トレース！" + CR
        document.battle_log.battle_log.value += txt
        change_ability(enemy, team, 1, "NA")
    } else if (new get(team).ability == "はじまりのうみ" && !new get(team).f_con.includes("おおあめ")){
        txt = team + "チームの　" + new get(team).name + "の　はじまりのうみ！" + CR
        document.battle_log.battle_log.value += txt
        document.battle_log.battle_log.value += "雨がとても強くなった！" + CR
        for (const i of ["A", "B"]){
            condition_remove(i, "field", "あめ")
            condition_remove(i, "field", "にほんばれ")
            condition_remove(i, "field", "すなあらし")
            condition_remove(i, "field", "あられ")
            condition_remove(i, "field", "らんきりゅう")
            document.battle[i + "_field_condition"].value += "あめ（おおあめ）" + CR
        }
    } else if (new get(team[0]).ability == "バリアフリー"){
        if (new get(team).f_con.includes("リフレクター") || new get(team).f_con.includes("ひかりのかべ") || new get(team).f_con.includes("オーロラベール") 
        || new get(enemy).f_con.includes("リフレクター") || new get(enemy).f_con.includes("ひかりのかべ") || new get(enemy).f_con.includes("オーロラベール")){
            txt = team[0] + "チームの　" + new get(team[0]).name + "の　バリアフリー！" + CR
            document.battle_log.battle_log.value += txt
            document.battle_log.battle_log.value += "お互いの場の壁が破壊された！" + CR
        }
        for (const i of ["A", "B"]){
            condition_remove(i, "field", "リフレクター")
            condition_remove(i, "field", "ひかりのかべ")
            condition_remove(i, "field", "オーロラベール")
        }
    } else if (new get(team).ability == "ひでり" && !new get(team).f_con.includes("にほんばれ") && !new get(team).f_con.includes("おおあめ") && !new get(team).f_con.includes("らんきりゅう")){
        txt = team + "チームの　" + new get(team).name + "の　ひでり！" + CR
        document.battle_log.battle_log.value += txt
        all_field_status_move(team, move_search_by_name("にほんばれ"))
    } else if (new get(team).ability == "フェアリーオーラ"){
        txt = team + "チームの　" + new get(team).name + "の　フェアリーオーラが発動している！" + CR
        document.battle_log.battle_log.value += txt
    } else if (new get(team).ability == "ふくつのたて"){
        rank_change_not_status(team, "B", 1, 100, "ふくつのたて")
    } else if (new get(team).ability == "ふとうのけん"){
        rank_change_not_status(team, "A", 1, 100, "ふとうのけん")
    } else if (new get(team).ability == "ふみん" && new get(team).abnormal == "ねむり"){
        condition_remove(team, "poke", "ねむり")
        condition_remove(team, "poke", "ねむる")
    } else if (new get(team).ability == "プレッシャー"){
        txt = team + "チームの　" + new get(team).name + "は　プレッシャーを放っている！" + CR
        document.battle_log.battle_log.value += txt
    } else if (new get(team).ability == "ミストメイカー" && !new get(team).f_con.includes("ミストフィールド")){
        txt = team + "チームの　" + new get(team).name + "の　ミストメイカー！" + CR
        document.battle_log.battle_log.value += txt
        all_field_status_move(team, move_search_by_name("ミストフィールド"))
    } else if (new get(team).ability == "ゆきふらし" && !new get(team).f_con.includes("あられ") && !new get(team).f_con.includes("おおあめ") && !new get(team).f_con.includes("おおひでり") && !new get(team).f_con.includes("らんきりゅう")){
        txt = team + "チームの　" + new get(team).name + "の　ゆきふらし！" + CR
        document.battle_log.battle_log.value += txt
        all_field_status_move(team, move_search_by_name("あられ"))
    } else if (new get(team[0]).ability == "よちむ"){
        let power = []
        for (let i = 0; i < 4; i++){
            if (document.getElementById(enemy + "_move_" + i).textContent != ""){
                let move = move_search_by_name(document.getElementById(enemy + "_move_" + i).textContent)
                if (move[2] != "変化"){
                    power.push([move[3], move[0]])
                }
            }
        }
        power.sort()
        txt = team + "チームの　" + new get(team).name + "　は　" + power[0][1] + "を　読み取った！" + CR
        document.battle_log.battle_log.value += txt
    }
    // 4.ふうせん/きのみ/きのみジュース/メンタルハーブ
    if (new get(team).item == "ふうせん"){
        txt = team + "チームの　" + new get(team).name + "は　ふうせんで浮いている！" + CR
        document.battle_log.battle_log.value += txt
    } else if (new get(team).item == "メンタルハーブ" && new get(team).p_con.includes("かいふくふうじ")){
        txt = team + "チームの　" + new get(team).name + "は　メンタルハーブで　かいふくふうじが解除された！" + CR
        document.battle_log.battle_log.value += txt
        document.getElementById(team + "_item").textContent = ""
        condition_remove(team, "poke", "かいふくふうじ")
    }
}

// 4.リミットシールド/ぎょぐん/ゲンシカイキによるフォルムチェンジ[2][3]
function ability_form_change(team, enemy){
    if (new get(team).ability == "リミットシールド" && new get(team).last_HP > new get(team).full_HP / 2 && new get(team).name == "メテノ(コア)"){
        txt = team + "チームの　" + new get(team).name + "　の　リミットシールド！" + CR
        document.battle_log.battle_log.value += txt
        form_chenge(team, "メテノ(りゅうせいのすがた)")
    }
}

// 5.エレキシード/グラスシード/ミストシード/サイコシード/ルームサービス
function seed_service(team, enemy){
    if (new get(team).item == "エレキシード" && new get(team).f_con.includes("エレキフィールド")){
        rank_change_not_status(team, "B", 1, 100, "エレキシード")
        set_recycle_item(team)
    } else if (new get(team).item == "グラスシード" && new get(team).f_con.includes("グラスフィールド")){
        rank_change_not_status(team, "B", 1, 100, "グラスシード")
        set_recycle_item(team)
    } else if (new get(team).item == "ミストシード" && new get(team).f_con.includes("ミストフィールド")){
        rank_change_not_status(team, "D", 1, 100, "ミストシード")
        set_recycle_item(team)
    } else if (new get(team).item == "サイコシード" && new get(team).f_con.includes("サイコフィールド")){
        rank_change_not_status(team, "D", 1, 100, "サイコシード")
        set_recycle_item(team)
    } else if (new get(team).item == "ルームサービス" && new get(team).f_con.includes("トリックルーム")){
        rank_change_not_status(team, "S", -1, 100, "ルームサービス")
        set_recycle_item(team)
    }
}

// 7.しろいハーブ
function white_herb(team){
    if (new get(team).item == "しろいハーブ"){
        let check = 0
        for (const parameter of ["A", "B", "C", "D", "S", "accuracy", "evasiveness"]){
            if (new get(team)[parameter + "_rank"] < 0){
                document.getElementById(team + "_rank_" + parameter).textContent = 0
                check += 1
            }
        }
        if (check > 0){
            txt = team + "チームの　" + new get(team).name + "　は　しろいハーブで　下がった能力を元に戻した" + CR
            document.battle_log.battle_log.value += txt
            set_recycle_item(team)
        }
    }
}

// 8.だっしゅつパックによる交代、交代先の繰り出し
function eject_pack(team, enemy){
    if (new get(team).item == "だっしゅつパック" && new get(team).p_con.includes("ランク下降")){
        txt = team + "チームの　" + new get(team).name + "は　だっしゅつパックで手持ちに戻った" + CR
        document.battle_log.battle_log.value += txt
        document.battle[team + "_field_condition"].value += "選択中・・・" + CR
        set_recycle_item(team)
        come_back_pokemon(team)
    
        txt = team + "チームは　戦闘に出すポケモンを選んでください" + CR
        document.battle_log.battle_log.value += txt
        return true
    }
}






function condition_remove(team, place, text){
    const con = document.battle[team + "_" + place + "_condition"].value
    const list = con.split("\n")
    const len = list.length - 1
    document.battle[team + "_" + place + "_condition"].value = ""
    for (let i = 0; i < len; i++){
        if (!list[i].includes(text)){
            document.battle[team + "_" + place + "_condition"].value += list[i] + CR
        }
    }
}