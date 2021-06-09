function move_success_judge(atk, def, order){
    // 0.技の決定
    let move = decide_move(atk)

    const atk_poke = document.getElementById(atk + "_poke").textContent
    const def_poke = document.getElementById(def + "_poke").textContent

    // 1.フリーフォールで行動順を飛ばされる
    if (sky_drop_failure(atk, atk_poke)){return false}
    // 2.(自身のおんねん/いかり状態の解除)
    gradge_rage(atk, def, move)
    // 3.行動の失敗
    if (action_failure(atk, def, atk_poke, move)){
        condition_remove(atk, "poke", "溜め技")
        condition_remove(atk, "poke", "姿を隠す")
        return false
    }
    // 4.ねごと/いびき使用時「ぐうぐう 眠っている」メッセージ
    // 5.Zワザの場合はZパワーを送る。Z変化技の場合は付加効果
    Z_power_activation(atk, move)
    // 6.他の技が出る技により技を置き換え、(3-8~10)の行程を繰り返す
    move_replace(atk, def, move, order)
    // 7.特性バトルスイッチによるフォルムチェンジ
    battle_switch(atk, move)
    // 8.「<ポケモン>の <技>!」のメッセージ。PPが減少することが確約される
    attack_declaration(atk, def, atk_poke, move)
    // 9.わざのタイプが変わる。1→2→3の順にタイプが変わる
    move_type_change(atk, move)
    // 10.技の対象が決まる。若い番号の対象が優先される
    // 11.PPが適切な量引かれる (プレッシャーの効果が考慮される)
    if (PP_decrease(atk, def, move, order)){return false}
    // 12.こだわり系アイテム/ごりむちゅうで技が固定される
    commitment_rock(atk, move)
    // 13.技の仕様による失敗
    if (move_specifications_failure(atk, def, move, order)){return false}
    // 14.自分のこおりを回復するわざにより自身のこおり状態が治る
    self_melt_check(atk, atk_poke, move)
    // 15.おおあめ/おおひでりによる技の失敗
    if (great_weather_failure(atk, move)){
        condition_remove(atk, "poke", "溜め技")
        condition_remove(atk, "poke", "姿を隠す")
        return false
    }
    // 16.ふんじんによるほのお技の失敗とダメージ
    if (powder_failure(atk, atk_poke, move)){return false}
    // 17.トラップシェルが物理技を受けていないことによる失敗
    if (shell_trap(atk, atk_poke, move)){return false}
    // 18.けたぐり/くさむすび/ヘビーボンバー/ヒートスタンプをダイマックスポケモンに使用したことによる失敗
    // 19.特性による失敗
    if (ability_failure(atk, def, move)){return false}
    // 20.中断されても効果が発動する技
    if (remain_effect_move(atk, def, move)){return false}
    // 21.へんげんじざい/リベロの発動
    protean_or_libero(atk, atk_poke, move)
    // 22.溜め技の溜めターンでの動作
    if (accumulation_move_operation(atk, def, atk_poke, def_poke, move)){return false}
    // 23.待機中のよこどりで技が盗まれる。技を奪ったポケモンは13-15の行程を繰り返す
    // 24.だいばくはつ/じばく/ミストバーストによるHP消費が確約される
    // 26.だいばくはつ/じばく/ミストバーストの使用者は対象が不在でもHPを全て失う。使用者がひんしになっても攻撃は失敗しない
    self_destruction(atk, atk_poke, move)
    // 25.対象のポケモンが全員すでにひんしになっていて場にいないことによる失敗
    if (fainted_failure(atk, def, move)){return false}
    // 27.ビックリヘッド/てっていこうせんの使用者はHPを50%失う。対象が不在なら失わない。使用者がひんしになっても攻撃が失敗しない
    mindblown_stealbeam(atk, def, move)
    // 28.マグニチュード使用時は威力が決定される
    // 29.姿を隠していることによる無効化
    if (hide_invalidation(atk, def, def_poke, move)){return false}
    // 30.サイコフィールドによる無効化
    if (phscho_field_invalidation(atk, def, def_poke, move)){return false}
    // 31.ファストガード/ワイドガード/トリックガードによる無効化 (Zワザ/ダイマックスわざならダメージを75%カットする)
    if (other_protect_invalidation(atk, def, def_poke, move)){return false}
    // 32.まもる/キングシールド/ブロッキング/ニードルガード/トーチカによる無効化 (Zワザ/ダイマックスわざなら75%をカットする)
    if (protect_invalidation(atk, def, def_poke, move)){return false}
    // 33.たたみがえしによる無効化 (Zワザ/ダイマックスわざなら75%をカットする)
    if (mat_block(def, def_poke, move)){return false}
    // 34.ダイウォールによる無効化
    // 35.マジックコート状態による反射
    magic_coat_reflection(atk, def, move)
    // 36.テレキネシスの場合、対象がディグダ/ダグトリオ/スナバァ/シロデスナ/メガゲンガー/うちおとす状態/ねをはる状態であることによる失敗
    if (telekinesis_failure(def, def_poke, move)){return false}
    // 37.マジックミラーによる反射　35との区別はないので35と同じにした(wiki通りではない)
    // 38.特性による無効化(その1)
    if (ability_invalidation_1(def, def_poke, move)){return false}
    // 39.相性による無効化
    if (compatibility_invalidation(atk, def, def_poke, move)){return false}
    // 40,ふゆうによる無効化 41とまとまっている
    // 41.でんじふゆう/テレキネシス/ふうせんによる無効化
    if (levitate_invalidation(def, def_poke, move)){return false}
    // 42.ぼうじんゴーグルによる無効化
    if (powder_goggle_invalidation(def, def_poke, move)){return false}
    // 43.特性による無効化(その2)
    if (ability_invalidation_2(def, def_poke, move)){return false}
    // 44.タイプによる技の無効化(その1)
    if (type_invalidation_1(atk, def, def_poke, move)){return false}
    // 45.技の仕様による無効化(その1)
    if (move_specifications_invalidation_1(atk, def, def_poke, move)){return false}
    // 46.技の仕様による無効化(その2)
    if (move_specifications_invalidation_2(atk, def, def_poke, move)){return false}
    // 47.タイプによる技の無効化(その2)
    if (type_invalidation_2(atk, def, def_poke, move)){return false}
    // 48.さわぐによるねむりの無効化
    uproar(atk, def, def_poke, move)
    // 49.しんぴのまもり状態による無効化
    if (safeguard_invalidation(def, move)){return false}
    // 50.エレキフィールド/ミストフィールド状態による状態異常の無効化
    if (field_invalidation(def, def_poke, move)){return false}
    // 51.みがわり状態によるランク補正を下げる技/デコレーションの無効化
    if (substitute_invalidation_1(def, move)){return false}
    // 52.しろいきりによる無効化
    if (mist_invalidation(def, move)){return false}
    // 53.特性による無効化(その3)
    if (ability_invalidation_3(def, def_poke, move)){return false}
    // 54.命中判定による技の無効化
    if (accuracy_failure(atk, def, move, order)){return false}
    // 55.シャドースチールで対象のランク補正を吸収する
    spectral_thief(atk, def ,atk_poke, move)
    // 56.対応するタイプの攻撃技の場合ジュエルが消費される
    use_juwel(atk, atk_poke, move)
    // 57. かわらわり/サイコファング/ネコにこばんの効果が発動する
    wall_break(def, move)
    // 58. ポルターガイストで対象のもちものが表示される
    poltergeist(def, def_poke, move)
    // 59.みがわりによるランク補正を変動させる効果以外の無効化
    if (substitute_invalidation_2(def, move)){return false}
    // 60.ミラーアーマー: ランクを下げる変化技の反射
    if (millor_armer(atk, def, def_poke, move)){return false}
    // 61.ほえる・ふきとばしの無効化
    if (roar_whirlwind(def, def_poke, move)){return false}
    // 62.技の仕様による無効化(その3)
    if (move_specifications_invalidation_3(atk, def, atk_poke, def_poke, move, order)){return false}
    // 63.アロマベール: かなしばり/アンコール/ちょうはつ状態の無効化
    if (aloma_veil_invalidation(def, move)){return false}

    // move を返すと技の成功
    return move
}


// 0.技の決定　その他
function decide_move(atk){

    let move_org = "" // 技の元データを代入

    if (new get(atk).p_con.includes("反動で動けない")){
        for (let i = 0; i < new get(atk).p_len; i++){
            if (new get(atk).p_list[i].includes("反動で動けない")){
                move_org = move_search_by_name(new get(atk).p_list[i].slice(8))
            }
        }
    } else if (new get(atk).p_con.includes("溜め技")){
        for (let i = 0; i < new get(atk).p_len; i++){
            if (new get(atk).p_list[i].includes("溜め技")){
                move_org = move_search_by_name(new get(atk).p_list[i].slice(4))
            }
        }
    } else if (new get(atk).p_con.includes("あばれる")){
        for (let i = 0; i < new get(atk).p_len; i++){
            if (new get(atk).p_list[i].includes("あばれる")){
                move_org = move_search_by_name(new get(atk).p_list[i].slice(0, -7).slice(5))
            }
        }
    } else if (new get(atk).p_con.includes("アイスボール")){
        move_org = move_search_by_name("アイスボール")
    } else if (new get(atk).p_con.includes("ころがる")){
        move_org = move_search_by_name("ころがる")
    } else if (new get(atk).p_con.includes("がまん")){
        move_org = move_search_by_name("がまん")
    } else {
        const num = String(document.getElementById("battle")[atk + "_move"].value)
        const move_name = document.getElementById(atk + "_move_" + num).textContent
        if (move_name.includes("Z")){
            move_org = move_search_by_name(move_name.replace("Z", "")).concat()
            move_org[0] = move_name
        } else {
            move_org = move_search(atk)
        }
    }

    let move = move_org.concat() // 技データのコピー、こっちをいじる

    if (new get(atk).ability == "えんかく"){
        move[6] = "間接"
    }

    txt = "(" + atk + "行動)"
    document.battle_log.battle_log.value += txt + CR

    // かなしばりのターン消費
    let atk_p_con = document.battle[atk + "_poke_condition"].value
    document.battle[atk + "_poke_condition"].value = ""
    for (let i = 0; i < atk_p_con.split("\n").length - 1; i++){
        if (atk_p_con.split("\n")[i].includes("かなしばり　4/4")){
            document.battle[atk + "_poke_condition"].value += "かなしばり　3/4：" + atk_p_con.split("\n")[i].slice(10) + CR
        } else if (atk_p_con.split("\n")[i].includes("かなしばり　3/4")){
            document.battle[atk + "_poke_condition"].value += "かなしばり　2/4：" + atk_p_con.split("\n")[i].slice(10) + CR
        } else if (atk_p_con.split("\n")[i].includes("かなしばり　2/4")){
            document.battle[atk + "_poke_condition"].value += "かなしばり　1/4：" + atk_p_con.split("\n")[i].slice(10) + CR
        } else if (atk_p_con.split("\n")[i].includes("かなしばり　1/4")){
            document.battle[atk + "_poke_condition"].value += "かなしばり　0/4：" + atk_p_con.split("\n")[i].slice(10) + CR
        } else {
            document.battle[atk + "_poke_condition"].value += atk_p_con.split("\n")[i] + CR
        }
    }

    return move
}


// 1.フリーフォールで行動順を飛ばされる
function sky_drop_failure(atk, atk_poke){
    const atk_p_con = document.battle[atk + "_poke_condition"].value
    if (!atk_p_con.includes("反動で動けない")){ // フリーフォールで行動順を飛ばされたときも判定
        if (atk_p_con.includes("フリーフォール（防御）")){
            txt = atk + "チームの　" + atk_poke + "は　空中で身動きが取れない　!" + CR
            document.battle_log.battle_log.value += txt
            return true
        }
    }
}

// 2.(自身のおんねん/いかり状態の解除)
function gradge_rage(atk, def, move){
    const atk_poke = document.getElementById(atk + "_poke").textContent
    const atk_p_con = document.battle[atk + "_poke_condition"].value
    if (atk_p_con.includes("おんねん")){
        document.battle[atk + "_poke_condition"].value = ""
        for (let i = 0; i < atk_p_con.split("\n").length - 1; i++){
            if (atk_p_con.split("\n")[i] != "おんねん"){
                document.battle[atk + "_poke_condition"].value += atk_p_con.split("\n")[i] + CR
            }
        }
    }
    if (atk_p_con.includes("いかり") && move[0] != "いかり"){
        txt = atk + "チームの　" + atk_poke + "は　怒りが静まった　!" + CR
        document.battle_log.battle_log.value += txt
        document.battle[atk + "_poke_condition"].value = ""
        for (let i = 0; i < atk_p_con.split("\n").length - 1; i++){
            if (atk_p_con.split("\n")[i] != "いかり"){
                document.battle[atk + "_poke_condition"].value += atk_p_con.split("\n")[i] + CR
            }
        }
    }
}

// 3.行動の失敗
function action_failure(atk, def, atk_poke, move){
    // みちづれ状態の解除
    condition_remove(atk, "poke", "みちづれ")
    
    const atk_p_con = document.battle[atk + "_poke_condition"].value
    const def_p_con = document.battle[def + "_poke_condition"].value
    const atk_f_con = document.battle[atk + "_field_condition"].value
    const atk_abnormal = document.getElementById(atk + "_abnormal").textContent
    const atk_item = document.getElementById(atk + "_item").textContent

    // 1.技の反動で動けない
        // フリーフォールで行動順を飛ばされたときも判定
    if (new get(atk).p_con.includes("反動で動けない")){
        txt = atk + "チームの　" + new get(atk).name + "は　反動で動けない　!" + CR
        document.battle_log.battle_log.value += txt
        condition_remove(atk, "poke", "反動で動けない")
        // なまけ状態の時は、3-4のなまけ消費まで持っていく
        if (!atk_p_con.includes("なまけ")){
            return true
        }
    }

    // 2.ねむりのカウント消費/こおりの回復判定: 動けない場合メッセージ
        // これらでも使える技を使用した場合は動ける。このときもねむり/こおりの消費/回復判定はある
    if (atk_abnormal == "ねむり"){
        const atk_p_con = document.battle[atk + "_poke_condition"].value
        document.battle[atk + "_poke_condition"].value = ""
        let check = 0
        if (atk_p_con.includes("ねむり")){
            const random = Math.random()
            for (let i = 0; i < atk_p_con.split("\n").length - 1; i++){
                if (atk_p_con.split("\n")[i] == "ねむり　1ターン目"){
                    if (new get(atk).ability == "はやおき"){
                        if (random < 1 / 3){
                            check -= 1
                        } else {
                            document.battle[atk + "_poke_condition"].value += "ねむり　3ターン目" + CR
                            check += 1
                        }
                    } else {
                        document.battle[atk + "_poke_condition"].value += "ねむり　2ターン目" + CR
                        check += 1
                    }
                } else if (atk_p_con.split("\n")[i] == "ねむり　2ターン目"){
                    if (new get(atk).ability == "はやおき"){
                        if (random < 5 / 6){
                            check -= 1
                        } else {
                            document.battle[atk + "_poke_condition"].value += "ねむり　4ターン目" + CR
                            check += 1
                        }
                    } else {
                        if (random < 1 / 3){
                            check -= 1
                        } else {
                            document.battle[atk + "_poke_condition"].value += "ねむり　3ターン目" + CR
                            check += 1
                        }
                    }
                } else if (atk_p_con.split("\n")[i] == "ねむり　3ターン目"){
                    if (new get(atk).ability == "はやおき"){
                        check -= 1
                    } else {
                        if (random < 1 / 2){
                            check -= 1
                        } else {
                            document.battle[atk + "_poke_condition"].value += "ねむり　4ターン目" + CR
                            check += 1
                        }
                    }
                } else if (atk_p_con.split("\n")[i] == "ねむり　4ターン目"){
                    check -= 1
                } else {
                    document.battle[atk + "_poke_condition"].value += atk_p_con.split("\n")[i] + CR
                }
            }
        } else if (atk_p_con.includes("ねむる")){
            for (let i = 0; i < atk_p_con.split("\n").length - 1; i++){
                if (atk_p_con.split("\n")[i] == "ねむる　2/2"){
                    if (new get(atk).ability == "はやおき"){
                        document.battle[atk + "_poke_condition"].value += "ねむる　回復ターン" + CR
                        check += 1
                    } else {
                        document.battle[atk + "_poke_condition"].value += "ねむる　1/2" + CR
                        check += 1
                    }
                } else if (atk_p_con.split("\n")[i] == "ねむる　1/2"){
                    if (new get(atk).ability == "はやおき"){
                        check -= 1
                    } else {
                        document.battle[atk + "_poke_condition"].value += "ねむる　回復ターン" + CR
                        check += 1
                    }
                } else if (atk_p_con.split("\n")[i] == "ねむる　回復ターン"){
                    check -= 1
                } else {
                    document.battle[atk + "_poke_condition"].value += atk_p_con.split("\n")[i] + CR
                }
            }
        }
        

        if (check > 0){
            txt = atk + "チームの　" + atk_poke + "は　ぐうぐう眠っている　!" + CR
            document.battle_log.battle_log.value += txt
            if (move[0] == "いびき" || move[0] == "ねごと"){
                return false
            } else {
                return true
            }
        } else if (check < 0){
            txt = atk + "チームの　" + atk_poke + "は　目を覚ました　!" + CR
            document.battle_log.battle_log.value += txt
            document.getElementById(atk + "_abnormal").textContent = ""

            const atk_p_con_now = document.battle[atk + "_poke_condition"].value
            if (atk_p_con_now.includes("あくむ")){
                document.battle[atk + "_poke_condition"].value = ""
                for (let i = 0; i < atk_p_con_now.split("\n").length - 1; i++){
                    if (atk_p_con_now.split("\n")[i] != "あくむ"){
                        document.battle[atk + "_poke_condition"].value += atk_p_con_now.split("\n")[i]
                    }
                }
                txt = atk + "チームの　" + atk_poke + "は　あくむから解放された　!" + CR
                document.battle_log.battle_log.value += txt
            }
        }
    } else if (atk_abnormal == "こおり"){
        const random = Math.random()
        if(random < 0.8){
            for (i = 0; i < self_melt_move_list.length; i++){
                if (move[0] == self_melt_move_list[i]){
                    return false
                }
            }
            txt = atk + "チームの　" + atk_poke + "は　凍って動けない　!" + CR
            document.battle_log.battle_log.value += txt
            return true
        } else {
            txt = atk + "チームの　" + atk_poke + "の　こおりが溶けた　!" + CR
            document.battle_log.battle_log.value += txt
            document.getElementById(atk + "_abnormal").textContent = ""
            return false
        }
    }

    // 3.PPが残っていない
    const move_num = document.getElementById("battle")[atk + "_move"].value
    if (move_num != ""){
        const PP = Number(document.getElementById(atk + "_move_" + move_num + "_last").textContent)
        if (PP == 0 && !atk_p_con.includes("溜め技")){
            txt = atk + "チームの　" + atk_poke + "　は　PPがなくて技が出せない!" + CR
            document.battle_log.battle_log.value += txt
            return true
        }
    }

    // 4.なまけのカウント消費: 動けない場合メッセージ
        // 反動で動けないときでも消費
    if (new get(atk).p_con.includes("なまけ")){
        condition_remove(atk, "poke", "なまけ")
        txt = atk + "チームの　" + atk_poke + "　は　なまけている" + CR
        document.battle_log.battle_log.value += txt
        return true
    } else if (new get(atk).ability == "なまけ" && !new get(atk).p_con.includes("なまけ")){
        document.battle[atk + "_poke_condition"].value += "なまけ" + CR
    }
    // 5.きあいパンチ使用時、そのターンにダメージを受けていて動けない (ダイマックスポケモンを除く)
    if (atk_p_con.includes("きあいパンチ　失敗")){
        txt = atk + "チームの　" + atk_poke + "は　集中が途切れて　技が出せなかった　!" + CR
        document.battle_log.battle_log.value += txt
        document.battle[atk + "_poke_condition"].value = ""
        for (let i = 0; i < atk_p_con.split("\n").length - 1; i++){
            if (atk_p_con.split("\n")[i] != "きあいパンチ　失敗"){
                document.battle[atk + "_poke_condition"].value += atk_p_con.split("\n")[i] + CR
            }
        }
        return true
    }
    // 6.ひるみで動けない (ダイマックスポケモンを除く)
    if (atk_p_con.includes("ひるみ")){
        txt = atk + "チームの　" + atk_poke + "は　ひるんで　動けない　!" + CR
        document.battle_log.battle_log.value += txt
        if (new get(atk).ability == "ふくつのこころ"){
            rank_change_not_status(atk, "S", 1, 100, "ふくつのこころ")
        }
        return true
    }
    // 7.かなしばりで技が出せない (Zワザを除く)
    if (atk_p_con.includes("かなしばり")){
        for (let i = 0; i < atk_p_con.split("\n").length - 1; i++){
            if (atk_p_con.split("\n")[i].includes("かなしばり") && (atk_p_con.split("\n")[i].slice(10) == move[0])){
                txt = atk + "チームの　" + atk_poke + "は　かなしばりで　技が出せなかった　!" + CR
                document.battle_log.battle_log.value += txt
                return true
            }
        }
    }
    // 8.じゅうりょくで技が出せない
    if (atk_f_con.includes("じゅうりょく") && gravity_move_list.includes(move[0])){
        txt = atk + "チームの　" + atk_poke + "は　じゅうりょくで　技が出せなかった　!" + CR
        document.battle_log.battle_log.value += txt
        return true
    }
    // 9.かいふくふうじで技が出せない (Zワザを除く)
    if (atk_p_con.includes("かいふくふうじ") && recover_move_list.includes(move[0])){
        txt = atk + "チームの　" + atk_poke + "は　かいふくふうじで　技が出せなかった　!" + CR
        document.battle_log.battle_log.value += txt
        return true
    }
    // 10.じごくづきで音技が出せない (Zワザを除く)
    if (atk_p_con.includes("じごくづき") && music_move_list.includes(move[0])){
        txt = atk + "チームの　" + atk_poke + "は　じごくづきで　技が出せなかった　!" + CR
        document.battle_log.battle_log.value += txt
        return true
    }
    // 11.こだわっていない技が出せない (ダイマックスポケモンを除く)
    for (let i = 0; i < new get(atk).p_len; i++){
        if (new get(atk).p_list[i].includes("こだわりロック") && new get(atk).p_list[i].slice(8) != move[0]){
            txt = atk + "チームの　" + new get(atk).name + "は　こだわっているせいで　技が出せなかった　!" + CR
            document.battle_log.battle_log.value += txt
            return true
        }
    }
    // 12.ちょうはつで変化技が出せない (Zワザを除く)
    if (atk_p_con.includes("ちょうはつ") && move[2] == "変化"){
        txt = atk + "チームの　" + atk_poke + "は　挑発されて　技が出せなかった　!" + CR
        document.battle_log.battle_log.value += txt
        return true
    }
    // 13.ふういんで技が出せない (Zワザ/ダイマックスポケモンを除く)
    if (def_p_con.includes("ふういん")){
        let def_move = []
        for (let i = 0; i < 4; i++){
            def_move.push(document.getElementById(def + "_move_" + i).textContent)
        }
        if (def_move.includes(move[0])){
            txt = atk + "チームの　" + atk_poke + "は　封印されて　技が出せなかった　!" + CR
            document.battle_log.battle_log.value += txt
            return true
        }
    }
    // 14.こんらんの自傷の判定
    if (atk_p_con.includes("こんらん")){
        document.battle[atk + "_poke_condition"].value = ""
        const random = Math.random()
        let check = 0
        for (let i = 0; i < atk_p_con.split("\n").length - 1; i++){
            if (atk_p_con.split("\n")[i] == "こんらん　1ターン目"){
                txt = atk + "チームの　" + atk_poke + "は　こんらんしている　!" + CR
                document.battle_log.battle_log.value += txt
                document.battle[atk + "_poke_condition"].value += "こんらん　2ターン目" + CR
                check += 1
            } else if (atk_p_con.split("\n")[i] == "こんらん　2ターン目"){
                if (random < 1 / 3){
                    txt = atk + "チームの　" + atk_poke + "の　こんらん　がとけた　!" + CR
                    document.battle_log.battle_log.value += txt
                    check -= 1
                } else {
                    txt = atk + "チームの　" + atk_poke + "は　こんらんしている　!" + CR
                    document.battle_log.battle_log.value += txt
                    document.battle[atk + "_poke_condition"].value += "こんらん　3ターン目" + CR
                    check += 1
                }
            } else if (atk_p_con.split("\n")[i] == "こんらん　3ターン目"){
                if (random < 1 / 2){
                    txt = atk + "チームの　" + atk_poke + "の　こんらん　がとけた　!" + CR
                    document.battle_log.battle_log.value += txt
                    check -= 1
                } else {
                    txt = atk + "チームの　" + atk_poke + "は　こんらんしている　!" + CR
                    document.battle_log.battle_log.value += txt
                    document.battle[atk + "_poke_condition"].value += "こんらん　4ターン目" + CR
                    check += 1
                }
            } else if (atk_p_con.split("\n")[i] == "こんらん　4ターン目"){
                txt = atk + "チームの　" + atk_poke + "の　こんらん　がとけた　!" + CR
                document.battle_log.battle_log.value += txt
                check -= 1
            } else {
                document.battle[atk + "_poke_condition"].value += atk_p_con.split("\n")[i] + CR
            }
        }
        if (check > 0){
            const random = Math.random()
            if (random < 1 / 3){ // 確率でこんらん自傷
                confuse_self_injured(atk, atk_poke)
                return true
            }
        } else {
            return false
        }
    }
    // 15.まひして技が出せない
    if (atk_abnormal == "まひ"){
        const random = Math.random()
        if (random < 0.25){
            txt = atk + "チームの　" + atk_poke + "は　体がしびれて　動けない　!" + CR
            document.battle_log.battle_log.value += txt
            return true
        }
    }
    // 16.メロメロの判定
    if (atk_p_con.includes("メロメロ")){
        const random = Math.random()
        if (random < 0.5){
            txt = atk + "チームの　" + atk_poke + "は　メロメロで　技が出せなかった　!" + CR
            document.battle_log.battle_log.value += txt
            return true
        } else {
            txt = atk + "チームの　" + atk_poke + "は　メロメロだ　!" + CR
            document.battle_log.battle_log.value += txt
            return false
        }
    }
}

// 5.Zワザの場合はZパワーを送る。Z変化技の場合は付加効果
function Z_power_activation(atk, move){
    let check = 0
    // 普通のZクリスタル（攻撃技）の場合
    for (let i = 0; i < Z_crystal_list.length; i++){
        if (move[0] == Z_crystal_list[i][1]){
            check += 1
            txt = atk + "チームの　" + new get(atk).name + "　は　Zパワーを身に纏った！" + CR
            document.battle_log.battle_log.value += txt
            const poke_num = battle_poke_num(atk)
            const move_num = document.getElementById("battle")[atk + "_move"].value
            const org_move = move_search_by_name(document.getElementById(atk + "_" + poke_num + "_" + move_num + "_move").textContent)
            if (org_move[2] != "変化"){
                if (org_move[3] < 60){
                    move[3] = 100
                } else if (org_move[3] < 70){
                    move[3] = 120
                } else if (org_move[3] < 80){
                    move[3] = 140
                } else if (org_move[3] < 90){
                    move[3] = 160
                } else if (org_move[3] < 100){
                    move[3] = 175
                } else if (org_move[3] < 110){
                    move[3] = 180
                } else if (org_move[3] < 120){
                    move[3] = 185
                } else if (org_move[3] < 130){
                    move[3] = 190
                } else if (org_move[3] < 140){
                    move[3] = 195
                } else {
                    move[3] = 200
                }
            }
        }
    }
    // 普通のZクリスタル（変化技）の場合
    if (move[0].includes("Z")){
        check += 1
        txt = atk + "チームの　" + new get(atk).name + "　は　Zパワーを身に纏った！" + CR
        document.battle_log.battle_log.value += txt
        for (let i = 0; i < Z_status_move.length; i++){
            if (move[0].slice(1) == Z_status_move[i][0]){
                if (move[0].slice(1) == "のろい"){
                    if (new get(atk).type.includes("ゴースト")){
                        txt = atk + "チームの　" + new get(atk).name + "　の　HPが全回復した！" + CR
                        document.battle_log.battle_log.value += txt
                        document.getElementById(atk + "_HP_last").textContent = new get(atk).full_HP
                    } else {
                        rank_change_Z(atk, "A", 1)
                    }
                } else if (Z_status_move[i][1] == "A" || Z_status_move[i][1] == "B" || Z_status_move[i][1] == "C" || Z_status_move[i][1] == "D" 
                || Z_status_move[i][1] == "S" || Z_status_move[i][1] == "accuracy" || Z_status_move[i][1] == "evasiveness"){
                    const change = Z_status_move[i][2]
                    rank_change(atk, Z_status_move[i][1], change)
                } else if (Z_status_move[i][1] == "all"){
                    rank_change_Z(atk, "A", 1)
                    rank_change_Z(atk, "B", 1)
                    rank_change_Z(atk, "C", 1)
                    rank_change_Z(atk, "D", 1)
                    rank_change_Z(atk, "S", 1)
                } else if (Z_status_move[i][1] == "critical"){
                    if (!new get(atk).p_con.includes("きゅうしょアップ")){
                        txt = atk + "チームの　" + new get(atk).name + "　は　技が急所に当たりやすくなった！" + CR
                        document.battle_log.battle_log.value += txt
                        document.battle[atk + "_poke_condition"].value += "きゅうしょアップ" + CR
                    }
                } else if (Z_status_move[i][1] == "clear"){
                    txt = atk + "チームの　" + new get(atk).name + "　の　能力ダウンがリセットされた！" + CR
                    document.battle_log.battle_log.value += txt
                    for (const parameter of ["A", "B", "C", "D", "S", "accuracy", "evasiveness"]){
                        document.getElementById(atk + "_rank_" + parameter).textContent = Math.max(new get(atk)[parameter + "_rank"], 0)
                    }
                } else if (Z_status_move[i][1] == "cure"){
                    txt = atk + "チームの　" + new get(atk).name + "　の　HPが全回復した！" + CR
                    document.battle_log.battle_log.value += txt
                    document.getElementById(atk + "_HP_last").textContent = new get(atk).full_HP
                }
            }
        }
    }
    // 専用Zクリスタルの場合
    for (let i = 0; i < special_Z_crystal_list.length; i++){
        if (move[0] == special_Z_crystal_list[i][1]){
            check += 1
            txt = atk + "チームの　" + new get(atk).name + "　は　Zパワーを身に纏った！" + CR
            document.battle_log.battle_log.value += txt
        }
    }
    if (check > 0){
        document.getElementById(atk + "_Z_move").checked = false
        document.getElementById(atk + "_Z_move").disabled = true
        document.getElementById(atk + "_Z_text").textContent = "Z技：済"
    }
}

// 6.他の技が出る技により技を置き換え、(3-8~10)の行程を繰り返す
// オウムがえし、さきどり、しぜんのちから、ねごと、ねこのて、まねっこ、ゆびをふる
function move_replace(atk, def, move, order){
    const atk_poke = document.getElementById(atk + "_poke").textContent
    const atk_f_con = document.battle[atk + "_field_condition"].value
    const atk_p_con = document.battle[atk + "_poke_condition"].value
    const def_used_move = document.battle[def + "_used_move"].value
    // オウムがえし
    if (move[0].includes("オウムがえし")){
        move[9] = move[0]
        let check = 0
        if (!mirror_move_list.includes(def_used_move)){
            if (def_used_move == "あばれる" || def_used_move == "げきりん" || def_used_move == "はなびらのまい" || def_used_move == "さわぐ" || def_used_move == "メタルバースト" 
            || def_used_move == "トリックルーム" || def_used_move == "ワンダールーム" || def_used_move == "マジックルーム" || def_used_move == "フェアリーロック"){
                check += 1
            } else {
                if (!(move_search_by_name(def_used_move)[8] == "自分" || move_search_by_name(def_used_move)[8].includes("場"))){
                    check += 1
                }
            }
        }
        for (let i = 0; i < 9; i++){
            move[i] = move_search_by_name(def_used_move)[i]
        }
        if (check == 0){
            move.push("失敗")
        }
    }
    // さきどり: 対象が先制した、対象の使用した技がさきどりできない技の時、失敗
    if (move[0].includes("さきどり")){
        move[9] = move[0]
        if (atk = order[0]){
            const num = String(document.getElementById("battle")[def + "_move"].value)
            const def_move = document.getElementById(def + "_move_" + num).textContent
            const def_move_list = move_search_by_name(def_move)
            for (let i = 0; i < 9; i++){
                move[i] = move_search_by_name(def_move)[i]
            }
            if (me_first_move_list.includes(def_move) || def_move_list[2] == "変化"){
                move.push("失敗")
            }
        }
    }
    // しぜんのちから
    if (move[0].includes("しぜんのちから")){
        move[9] = move[0]
        if (atk_f_con.includes("グラスフィールド")){
            for (let i = 0; i < 9; i++){
                move[i] = move_search_by_name("エナジーボール")[i]
            }
        } else if (atk_f_con.includes("エレキフィールド")){
            for (let i = 0; i < 9; i++){
                move[i] = move_search_by_name("10まんボルト")[i]
            }
        } else if (atk_f_con.includes("ミストフィールド")){
            for (let i = 0; i < 9; i++){
                move[i] = move_search_by_name("ムーンフォース")[i]
            }
        } else if (atk_f_con.includes("サイコフィールド")){
            for (let i = 0; i < 9; i++){
                move[i] = move_search_by_name("サイコキネシス")[i]
            }
        } else {
            for (let i = 0; i < 9; i++){
                move[i] = move_search_by_name("トライアタック")[i]
            }
        }
    }
    // ねごと
    if (move[0].includes("ねごと")){
        let check = []
        for (let i = 0; i < 4; i++){
            let move_name = document.getElementById(atk + "_move_" + i).textContent
            if (!sleep_talk_move_list.includes(move_name)){
                check.push(move_name)
            }
        }
        check = check.slice(0, -1)
        let num = 0
        if (check.length == 1){
            num = 0
        } else if (check.length == 2){
            if (Math.random() < 0.5){
                num = 1
            }
        } else if (check.length == 3){
            const random = Math.random()
            if (random < 1 / 3){
                num = 1
            } else if (random < 2 / 3){
                num = 2
            }
        }
        if (new get(atk).abnormal == "ねむり"){
            move[9] = move[0]
            for (let i = 0; i < 9; i++){
                move[i] = move_search_by_name(check[num])[i]
            }
        }
    }
    // ねこのて
    if (move[0].includes("ねこのて")){
        let cat_hand = []
        for (let i = 0; i < 3; i++){
            if (document.getElementById(atk + "_" + i + "_existence").textContent == "控え"){
                for (let j = 0; j < 4; j++){
                    let sample = document.getElementById(atk + "_" + i + "_" + j + "_move").textContent
                    if (!assist_move_list.includes(sample) && sample != ""){
                        cat_hand.push(document.getElementById(atk + "_" + i + "_" + j + "_move").textContent)
                    }
                }
            }
        }
        const random = Math.random()
        if (cat_hand.length > 0){
            let dicide = 0
            for (let i = 0; i < cat_hand.length; i++){
                if (random >= i / cat_hand.length){
                    dicide = i
                }
            }
            move[9] = move[0]
            for (let i = 0; i < 9; i++){
                move[i] = move_search_by_name(cat_hand[Number(dicide)])[i]
            }
        } else {
            move.push("失敗")
        }
    }
    // まねっこ
    if (move[0].includes("まねっこ")){
        const log_list = document.battle_log.battle_log.value.split("\n")
        for (let i = 0; i < log_list.length - 1; i++){
            if (log_list[log_list.length - 1 - i].split("　").length == 5){
                let each = log_list[log_list.length - 1 - i].split("　")[0]
                let poke_name = log_list[log_list.length - 1 - i].split("　")[1]
                let no = log_list[log_list.length - 1 - i].split("　")[2]
                let move_name = log_list[log_list.length - 1 - i].split("　")[3]
                let mark = log_list[log_list.length - 1 - i].split("　")[4]
                if (move_name == "ゆびをふる" || move_name == "オウムがえし" || move_name == "さきどり" || move_name == "まねっこ" || move_name == "ねこのて" || move_name == "ねごと" || move_name == "しぜんのちから"){
                    move_name = log_list[log_list.length - i].split("　")[3]
                }
                let check = 0
                for (let j = 0; j < pokemon.length; j++){
                    if (poke_name == pokemon[j][1]){
                        check += 1
                    }
                }
                for (let j = 0; j < move_list.length; j++){
                    if (move_name == move_list[j][0]){
                        check += 1
                    }
                }
                if (check == 2 && each.includes("チームの") && no == "の" && mark == "！" && !copy_cat_move_list.includes(move_name)){
                    move[9] = move[0]
                    for (let j = 0; j < 9; j++){
                        move[j] = move_search_by_name(move_name)[j]
                    }
                }
            }
        }
        if (move[0].includes("まねっこ")){
            move.push("失敗")
        }
    }
    // ゆびをふる
    if (move[0].includes("ゆびをふる")){
        const random = Math.random()
        const num = metronome_move_list.length
        let metro_move = ""
        for (let i = 0; i < num; i++){
            if (random >= i / num){
                metro_move = metronome_move_list[i]
            }
        }
        move[9] = move[0]
        for (let i = 0; i < 9; i++){
            move[i] = move_search_by_name(metro_move)[i]
        }
    }

    // 8.じゅうりょくで技が出せない
    if (atk_f_con.includes("じゅうりょく") && gravity_move_list.includes(move[0])){
        txt = atk + "チームの　" + atk_poke + "は　じゅうりょくで　技が出せなかった　!" + CR
        document.battle_log.battle_log.value += txt
        return true
    }
    // 9.かいふくふうじで技が出せない (Zワザを除く)
    if (atk_p_con.includes("かいふくふうじ") && recover_move_list.includes(move[0])){
        txt = atk + "チームの　" + atk_poke + "は　かいふくふうじで　技が出せなかった　!" + CR
        document.battle_log.battle_log.value += txt
        return true
    }
    // 10.じごくづきで音技が出せない (Zワザを除く)
    if (atk_p_con.includes("じごくづき") && music_move_list.includes(move[0])){
        txt = atk + "チームの　" + atk_poke + "は　じごくづきで　技が出せなかった　!" + CR
        document.battle_log.battle_log.value += txt
        return true
    }
}

// 7.特性バトルスイッチによるフォルムチェンジ
function battle_switch(atk, move){
    if (new get(atk).ability == "バトルスイッチ"){
        if (new get(atk).name.includes("シールド") && move[2] != "変化"){
            txt = atk + "チームの　" + new get(atk).name + "の　バトルスイッチ!" + CR
            document.battle_log.battle_log.value += txt
            form_chenge(atk, "ギルガルド(ブレードフォルム)")
        } else if (new get(atk).name.includes("ブレード") && move[0] == "キングシールド"){
            txt = atk + "チームの　" + new get(atk).name + "の　バトルスイッチ!" + CR
            document.battle_log.battle_log.value += txt
            form_chenge(atk, "ギルガルド(シールドフォルム)")
        }
    }
}

// 8.「<ポケモン>の <技>!」のメッセージ。PPが減少することが確約される
function attack_declaration(atk, def, atk_poke, move){
    if (move[9] == "オウムがえし" || move[9] == "さきどり" || move[9] == "しぜんのちから" || move[9] == "ねごと" || move[9] == "ねこのて" || move[9] == "まねっこ" || move[9] == "ゆびをふる"){
        txt = atk + "チームの　" + atk_poke + "　の　" + move[9] + "　！" + CR
        document.battle_log.battle_log.value += txt
        txt = move[9] + "で　" + move[0] + "が　でた！" + CR
        document.battle_log.battle_log.value += txt
        document.battle[atk + "_used_move"].value = move[0]
    } else if (move[9] == "Zオウムがえし" || move[9] == "Zさきどり" || move[9] == "Zしぜんのちから" || move[9] == "Zねごと" || move[9] == "Zねこのて" || move[9] == "Zまねっこ" || move[9] == "Zゆびをふる"){
        txt = atk + "チームの　" + atk_poke + "　の　" + move[9] + "　！" + CR
        document.battle_log.battle_log.value += txt
        if (move[2] == "変化"){
            txt = move[9] + "で　" + move[0] + "が　でた！" + CR
            document.battle_log.battle_log.value += txt
            document.battle[atk + "_used_move"].value = move[0]
        } else {
            for (let i = 0; i < Z_crystal_list.length; i++){
                if (move[1] == Z_crystal_list[i][0]){
                    for (let j = 0; j < 9; j++){
                        move[j] = move_search_by_name(Z_crystal_list[i][1])[j]
                    }
                    txt = move[9] + "で　" + move[0] + "が　でた！" + CR
                    document.battle_log.battle_log.value += txt
                    document.battle[atk + "_used_move"].value = move[0]
                }
            }
            if (move[3] < 60){
                move[3] = 100
            } else if (move[3] < 70){
                move[3] = 120
            } else if (move[3] < 80){
                move[3] = 140
            } else if (move[3] < 90){
                move[3] = 160
            } else if (move[3] < 100){
                move[3] = 175
            } else if (move[3] < 110){
                move[3] = 180
            } else if (move[3] < 120){
                move[3] = 185
            } else if (move[3] < 130){
                move[3] = 190
            } else if (move[3] < 140){
                move[3] = 195
            } else {
                move[3] = 200
            }
        }
    } else {
        txt = atk + "チームの　" + atk_poke + "　の　" + move[0] + "　！" + CR
        document.battle_log.battle_log.value += txt
        document.battle[atk + "_used_move"].value = move[0]
        if (move[0] == "プレゼント"){
            const random = Math.random() * 100
            if (random < 10){
                move[3] = 120
            } else if (random < 40){
                move[3] = 80
            } else if (random < 80){
                move[3] = 40
            }
        } else if (move[0] == "ふくろだたき"){
            move[3] = Math.floor(new get(atk).A_AV / 10 + 5)
        }
    }

    // アンコールターンの消費
    let atk_p_con = document.battle[atk + "_poke_condition"].value
    document.battle[atk + "_poke_condition"].value = ""
    for (let i = 0; i < atk_p_con.split("\n").length - 1; i++){
        if (atk_p_con.split("\n")[i].includes("アンコール　3/3")){
            document.battle[atk + "_poke_condition"].value += "アンコール　2/3：" + atk_p_con.split("\n")[i].slice(10) + CR
        } else if (atk_p_con.split("\n")[i].includes("アンコール　2/3")){
            document.battle[atk + "_poke_condition"].value += "アンコール　1/3：" + atk_p_con.split("\n")[i].slice(10) + CR
        } else if (atk_p_con.split("\n")[i].includes("アンコール　1/3")){
            document.battle[atk + "_poke_condition"].value += "アンコール　0/3：" + atk_p_con.split("\n")[i].slice(10) + CR
        } else {
            document.battle[atk + "_poke_condition"].value += atk_p_con.split("\n")[i] + CR
        }
    }

    // アイスボール、ころがるのターン開始
    atk_p_con = document.battle[atk + "_poke_condition"].value
    if (move[0] == "アイスボール" || move[0] == "ころがる"){
        if (atk_p_con.includes(move[0])){
            document.battle[atk + "_poke_condition"].value = ""
            for (let i = 0; i < atk_p_con.split("\n").length - 1; i++){
                if (atk_p_con.split("\n")[i].includes(move[0])){
                    const turn = Number(atk_p_con.split("\n")[i].replace(/[^0-9]/g, "")) + 1
                    document.battle[atk + "_poke_condition"].value += move[0] + "　+" + turn + CR
                } else {
                    document.battle[atk + "_poke_condition"].value += atk_p_con.split("\n")[i] + CR
                }
            }
        } else {
            document.battle[atk + "_poke_condition"].value += move[0] + "　+1" + CR
        }
    }
    // れんぞくぎりの記録
    atk_p_con = document.battle[atk + "_poke_condition"].value
    if (move[0] == "れんぞくぎり"){
        if (atk_p_con.includes("れんぞくぎり")){
            document.battle[atk + "_poke_condition"].value = ""
            for (let i = 0; i < atk_p_con.split("\n").length - 1; i++){
                if (atk_p_con.split("\n")[i].includes("れんぞくぎり")){
                    const turn = Number(atk_p_con.split("\n")[i].replace(/[^0-9]/g, "")) + 1
                    document.battle[atk + "_poke_condition"].value += "れんぞくぎり　+" + turn + CR
                } else {
                    document.battle[atk + "_poke_condition"].value += atk_p_con.split("\n")[i] + CR
                }
            }
        } else {
            document.battle[atk + "_poke_condition"].value += "れんぞくぎり　+1" + CR
        }
    }
    // がまんの記録
    atk_p_con = document.battle[atk + "_poke_condition"].value
    if (move[0] == "がまん"){
        if (atk_p_con.includes("がまん")){
            document.battle[atk + "_poke_condition"].value = ""
            for (let i = 0; i < atk_p_con.split("\n").length - 1; i++){
                if (atk_p_con.split("\n")[i].includes("がまん　2/2：")){
                    const damage = atk_p_con.split("\n")[i].slice(8)
                    document.battle[atk + "_poke_condition"].value += "がまん　1/2：" + damage + CR
                    txt = atk + "チームの　" + new get(atk).name + "　は　がまんを続けている！" + CR
                    document.battle_log.battle_log.value += txt
                    move[2] = "変化"
                } else if (atk_p_con.split("\n")[i].includes("がまん　1/2：")){
                    txt = atk + "チームの　" + new get(atk).name + "　の　がまんが解かれた！" + CR
                    document.battle_log.battle_log.value += txt
                    move[3] = Number(atk_p_con.split("\n")[i].slice(8))
                } else {
                    document.battle[atk + "_poke_condition"].value += atk_p_con.split("\n")[i] + CR
                }
            }
        } else {
            document.battle[atk + "_poke_condition"].value += "がまん　2/2：0" + CR
            txt = atk + "チームの　" + new get(atk).name + "　は　がまんを始めた！" + CR
            document.battle_log.battle_log.value += txt
            move[2] = "変化"
        }
    }
    // シャドーレイ、フォトンゲイザー: 対象の特性を攻撃処理の終わりまで無くす
    if (ability_invalidation_move_list.includes(move[0]) && mold_breaker_ability_list.includes(new get(def).ability)){
        document.battle[def + "_poke_condition"].value += "特性無視：" + new get(def).ability + CR
        document.getElementById(def + "_ability").textContent = ""
    }
}

// 9.わざのタイプが変わる。1→2→3の順にタイプが変わる
function move_type_change(atk, move){
    // 1.技のタイプを変える特性の効果
    if (new get(atk).ability == "うるおいボイス" && music_move_list.includes(move[0])){
        move[1] = "みず"
    } else if (new get(atk).ability == "エレキスキン" && move[1] == "ノーマル"){
        move[1] = "でんき"
        document.battle[atk + "_poke_condition"].value += "スキン" + CR
    } else if (new get(atk).ability == "スカイスキン" && move[1] == "ノーマル"){
        move[1] = "ひこう"
        document.battle[atk + "_poke_condition"].value += "スキン" + CR
    } else if (new get(atk).ability == "ノーマルスキン" && move[1] != "ノーマル"){
        move[1] = "ノーマル"
        document.battle[atk + "_poke_condition"].value += "スキン" + CR
    } else if (new get(atk).ability == "フェアリースキン" && move[1] == "ノーマル"){
        move[1] = "フェアリー"
        document.battle[atk + "_poke_condition"].value += "スキン" + CR
    } else if (new get(atk).ability == "フリーズスキン" && move[1] == "ノーマル"){
        move[1] = "こおり"
        document.battle[atk + "_poke_condition"].value += "スキン" + CR
    }
    // 2.タイプが変わるわざの効果
    if (move[0] == "ウェザーボール" && !(new get("A").ability == "エアロック" || new get("A").ability == "ノーてんき" || new get("B").ability == "エアロック" || new get("B").ability == "ノーてんき")){
        if (new get(atk).f_con.includes("にほんばれ") && new get(atk).item != "ばんのうがさ"){
            move[1] = "ほのお"
        } else if (new get(atk).f_con.includes("あめ") && new get(atk).item != "ばんのうがさ"){
            move[1] = "みず"
        } else if (new get(atk).f_con.includes("あられ")){
            move[1] = "こおり"
        } else if (new get(atk).f_con.includes("すなあらし")){
            move[1] = "いわ"
        }
    } else if (move[0] == "オーラぐるま" && new get(atk).p_con.includes("はらぺこもよう")){
        move[1] = "あく"
    } else if (move[0] == "さばきのつぶて" && new get(atk).item.includes("プレート")){
        for (let i = 0; i < judgement_plate.length; i++){
            if (new get(atk).item == judgement_plate[i][0]){
                move[1] = judgement_plate[i][1]
            }
        }
    } else if (move[0] == "しぜんのめぐみ" && berry_item_list.includes(new get(atk).item)){
        for (let i = 0; i < natural_gift_item_list.length; i++){
            if (new get(atk).item == natural_gift_item_list[i][0]){
                move[1] = natural_gift_item_list[i][1]
            }
        }
    } else if (move[0] == "だいちのはどう" && new get(atk).f_con.includes("フィールド") && grounded_check(atk)){
        if (new get(atk).f_con.includes("エレキフィールド")){
            move[1] = "でんき"
        } else if (new get(atk).f_con.includes("グラスフィールド")){
            move[1] = "くさ"
        } else if (new get(atk).f_con.includes("ミストフィールド")){
            move[1] = "フェアリー"
        } else if (new get(atk).f_con.includes("サイコフィールド")){
            move[1] = "エスパー"
        }
    } else if (move[0] == "テクノバスター" && new get(atk).item.includes("カセット")){
        if (new get(atk).item == "アクアカセット"){
            move[1] = "みず"
        } else if (new get(atk).item == "イナズマカセット"){
            move[1] = "でんき"
        } else if (new get(atk).item == "ブレイズカセット"){
            move[1] = "ほのお"
        } else if (new get(atk).item == "フリーズカセット"){
            move[1] = "こおり"
        }
    } else if (move[0] == "マルチアタック" && new get(atk).item.includes("メモリ") && !new get(atk).p_con.includes("さしおさえ") && !new get(atk).f_con.includes("マジックルーム")){
        for (let i = 0; i < multi_attack_memory.length; i++){
            if (new get(atk).item == multi_attack_memory[i][0]){
                move[1] = multi_attack_memory[i][1]
            }
        }
    } else if (move[0] == "めざめるダンス"){
        move[1] = new get(atk).type.split("、")[0]
    } else if (move[0] == "めざめるパワー"){

    }
    // 3.そうでん/プラズマシャワー状態
    if (new get(atk).p_con.includes("そうでん")){
        move[1] = "でんき"
    } else if (new get(atk).f_con.includes("プラズマシャワー") && move[1] == "ノーマル"){
        move[1] = "でんき"
    }
}

// 11.PPが適切な量引かれる (プレッシャーの効果が考慮される)
function PP_decrease(atk, def, move, order){
    const atk_p_con = document.battle[atk + "_poke_condition"].value
    if (!(atk_p_con.includes("あばれる") || atk_p_con.includes("溜め技") 
    || (atk_p_con.includes("アイスボール") && !atk_p_con.includes("アイスボール　+1")) 
    || (atk_p_con.includes("ころがる") && !atk_p_con.includes("ころがる　+1")) 
    || (atk_p_con.includes("がまん　2/2：") || atk_p_con.includes("がまん　1/2：")))){
        let num = 0
        let PP = 0
        if (move[9].includes("オウムがえし") || move[9].includes("さきどり") || move[9].includes("しぜんのちから") || move[9].includes("ねごと") || move[9].includes("ねこのて") || move[9].includes("まねっこ") || move[9].includes("ゆびをふる")){
            const special = String(document.getElementById("battle")[atk + "_move"].value)
            PP = Number(document.getElementById(atk + "_move_" + special + "_last").textContent)
        } else {
            for (let i = 0; i < 4; i++){
                if (move[0] == document.getElementById(atk + "_move_" + i).textContent){
                    num = i
                    PP = Number(document.getElementById(atk + "_move_" + i + "_last").textContent)
                }
            }
        }
        if (new get(def).ability == "プレッシャー"){
            document.getElementById(atk + "_move_" + num + "_last").textContent = Math.max(PP - 2, 0)
        } else {
            document.getElementById(atk + "_move_" + num + "_last").textContent = PP - 1
        }
        //if (!new get(atk).p_con.includes("へんしん")){
          //  document.getElementById(atk + "_" + battle_poke_num(atk) + "_" + num + "_last").textContent = document.getElementById(atk + "_move_" + num + "_last").textContent
        //}
        // 他の技が出る技の失敗
        if (move.length == 11){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
    }

    // Z技を元の技に戻す
    for (let i = 0; i < Z_crystal_list.length; i++){
        if (move[0] == Z_crystal_list[i][1]){
            const poke_num = battle_poke_num(atk)
            for (let j = 0; j < 4; j++){
                document.getElementById(atk + "_move_" + j).textContent = document.getElementById(atk + "_" + poke_num + "_" + j + "_move").textContent
            }
        }
    }
    // 普通のZクリスタル（変化技）の場合
    if (move[0].includes("Z")){
        move[0] = move[0].replace("Z", "")
        const poke_num = battle_poke_num(atk)
        for (let i = 0; i < 4; i++){
            document.getElementById(atk + "_move_" + i).textContent = document.getElementById(atk + "_" + poke_num + "_" + i + "_move").textContent
        }
    }
    // 専用Zクリスタルの場合
    for (let i = 0; i < special_Z_crystal_list.length; i++){
        if (move[0] == special_Z_crystal_list[i][1]){
            const poke_num = battle_poke_num(atk)
            for (let j = 0; j < 4; j++){
                document.getElementById(atk + "_move_" + j).textContent = document.getElementById(atk + "_" + poke_num + "_" + j + "_move").textContent
            }
        }
    }

    // よこどり状態のポケモンがいる時、よこどりされる
    if (new get(def).p_con.includes("よこどり") && snatch_move_list.includes(move[0])){
        condition_remove(def, "poke", "よこどり")
        txt = def + "チームの　" + new get(def).name + "に　技を横取りされた！" + CR
        document.battle_log.battle_log.value += txt
        atk = order[0]
        def = order[1]

        // 9.わざのタイプが変わる。1→2→3の順にタイプが変わる
        move_type_change(atk, move)
        // 45.技の仕様による無効化(その1)
        if (move_specifications_invalidation_1(atk, def, new get(def).name, move)){return false}
        // 46.技の仕様による無効化(その2)
        if (move_specifications_invalidation_2(atk, def, new get(def).name, move)){return false}
        // 62.技の仕様による無効化(その3)
        if (move_specifications_invalidation_3(atk, def, new get(atk).name, new get(def).name, move, order)){return false}

        move_process(order[0], order[1], move, order)

        return true
    }
}

// 12.こだわり系アイテム/ごりむちゅうで技が固定される
function commitment_rock(atk, move){
    if (new get(atk).item.includes("こだわり") || new get(atk).ability == "ごりむちゅう"){
        if (!document.battle[atk + "_poke_condition"].value.includes("こだわりロック：")){
            document.battle[atk + "_poke_condition"].value += "こだわりロック：" + move[0] + CR
            for (let i = 0; i < move_list.length; i++){
                if (move[9] == move_list[i][0]){
                    condition_remove(atk, "poke", "こだわりロック")
                    document.battle[atk + "_poke_condition"].value += "こだわりロック：" + move[9] + CR
                }
            }
        }
    }
}

// 13.技の仕様による失敗
function move_specifications_failure(atk, def, move, order){
    const atk_poke = document.getElementById(atk + "_poke").textContent
    const def_poke = document.getElementById(def + "_poke").textContent
    const atk_p_con = document.battle[atk + "_poke_condition"].value
    const def_p_con = document.battle[def + "_poke_condition"].value
    const atk_f_con = document.battle[atk + "_field_condition"].value
    const field_condition = document.battle[atk + "_field_condition"].value
    const full_HP = Number(document.getElementById(atk + "_HP").textContent)
    const HP_last = Number(document.getElementById(atk + "_HP_last").textContent)
    const atk_item = document.getElementById(atk + "_item").textContent
    const def_item = document.getElementById(def + "_item").textContent
    const atk_type = document.getElementById(atk + "_type").textContent
    const atk_abnormal = document.getElementById(atk + "_abnormal").textContent
    const atk_ability = document.getElementById(atk + "_ability").textContent
    const def_used_move = document.battle[def + "_used_move"].value
    // アイアンローラー: フィールドが無い
    if (move[0] == "アイアンローラー" && !field_condition.includes("フィールド")){
        document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
        return true
    }
    // いじげんラッシュ/ダークホール/オーラぐるま: 使用者のポケモンの姿が適格でない
    if ((move[0] == "いじげんラッシュ" && atk_poke != "フーパ(ときはなたれしフーパ)") 
    || (move[0] == "ダークホール" && atk_poke != "ダークライ") 
    || (move[0] == "オーラぐるま" && atk_poke != "モルペコ")){
        document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
        return true
    }
    // うらみ: 対象が技を使っていない（wikiには載っていない）
    if (move[0] == "うらみ" && def_used_move == ""){
        document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
        return true
    }
    // がまん: 解き放つダメージが無い
    if (move[0] == "がまん" && move[3] == 0){
        condition_remove(atk, "poke", "がまん")
        document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
        return true
    }
    // カウンター/ミラーコート/メタルバースト: 適格なダメージをそのターンは受けていない
    if ((move[0] == "カウンター" && !new get(atk).p_con.includes("物理ダメージ")) 
    || (move[0] == "ミラーコート" && !new get(atk).p_con.includes("特殊ダメージ")) 
    || (move[0] == "メタルバースト" && !new get(atk).p_con.includes("ダメージ"))){
        document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
        return true
    }
    // ギフトパス: 自分が持ち物を持っていない、対象が持ち物を持っている（wikiには載っていない）
    if (move[0] == "ギフトパス" && (atk_item == "" || def_item != "")){
        document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
        return true
    }
    
    // ソウルビート: 使用者のHPが足りない
    if (move[0] == "ソウルビート" && HP_last < Math.floor(full_HP / 3)){
        txt = "しかし　HPが　足りなかった" + CR
        document.battle_log.battle_log.value += txt
        return true
    }
    // たくわえる: たくわえるカウントがすでに3である
    if (move[0] == "たくわえる" && atk_p_con.includes("たくわえる　3回目")){
        document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
        return true
    }
    // はきだす/のみこむ: たくわえるカウントが0である
    if ((move[0] == "はきだす" || move[0] == "のみこむ") && !atk_p_con.includes("たくわえる")){
        document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
        return true
    }
    // とっておき: 覚えているわざにとっておきがない/とっておき以外の技を覚えていない/使用されてない技がある
    if (move[0] == "とっておき"){
        let check = 0
        for (let i = 0; i < 4; i++){
            if (document.getElementById(atk + "_move_" + i).textContent == "とっておき"){
                check += 1
            }
        }
        if (check == 0){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
        check = 0
        for (let i = 0; i < 4; i++){
            if (document.getElementById(atk + "_move_" + i).textContent == ""){
                check += 1
            }
        }
        if (check == 3){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
        const log_list = document.battle_log.battle_log.value.split("\n")
        let log_data = []
        for (let i = 0; i < log_list.length - 1; i++){
            if (log_list[log_list.length - 1 - i].split("　").length == 5){
                let each = log_list[log_list.length - 1 - i].split("　")[0]
                let poke_name = log_list[log_list.length - 1 - i].split("　")[1]
                let wo = log_list[log_list.length - 1 - i].split("　")[2]
                let summon = log_list[log_list.length - 1 - i].split("　")[3]
                let mark = log_list[log_list.length - 1 - i].split("　")[4]
                let wo_check = 0
                for (let j = 0; j < pokemon.length; j++){
                    if (poke_name == pokemon[j][1]){
                        if (each == atk + "チームは" && wo == "を" && summon == "繰り出した" && mark == "！"){
                            wo_check += 1
                        } else if (each == atk + "チームの" && wo == "の" && mark == "！"){
                            for (let k = 0; k < move_list.length; k++){
                                if (summon == move_list[k][0] && !log_data.includes(summon)){
                                    log_data.push(summon)
                                }
                            }
                        }
                    }
                }
                if (wo_check == 1){
                    break
                }
            }
        }
        if (log_data.length < 4 - check){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
    }
    // ほおばる: きのみを持っていない
    if (move[0] == "ほおばる" && !berry_item_list.includes(atk_item)){
        document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
        return true
    }
    // なげつける/しぜんのめぐみ: 持ち物が無い/特性ぶきよう/さしおさえ/マジックルーム状態である/不適格な持ち物である
    if (move[0] == "なげつける" || move[0] == "しぜんのめぐみ"){
        if (atk_item == "" || atk_ability == "ぶきよう" || atk_p_con.includes("さしおさえ") || atk_p_con.includes("マジックルーム")){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
    }
    // ねこだまし/であいがしら/たたみがえし: すでに行動をした
    if (move[0] == "ねこだまし" || move[0] == "であいがしら" || move[0] == "たたみがえし"){
        const log_list = turn_log()
        for (let i = 0; i < log_list.length - 1; i++){
            if (log_list[log_list.length - 1 - i] == "(" + atk + "行動)" && log_list[log_list.length - i].includes(new get(atk).name)){
                document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
                return true
            }
        }
    }
    // はいすいのじん: すでにはいすいのじんによりにげられない状態になっている
    if (move[0] == "はいすいのじん" && atk_p_con.includes("はいすいのじん")){
        document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
        return true
    }
    // ふいうち: 対象がすでに行動済み/変化技を選択している
    if (move[0] == "ふいうち" && (atk == order[1] || move_search(def)[2] == "変化")){
        document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
        return true
    }
    // ポルターガイスト: 対象が持ち物を持っていない
    if (move[0] == "ポルターガイスト" && def_item == ""){
        document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
        return true
    }
    // まもる/こらえる系: ターンの最後の行動/連続使用による失敗判定
    if (protect_type_move_list.includes(move[0])){
        if (atk == order[1]){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            condition_remove(atk, "poke", "まもる")
            return true
        }
        let turn = 0
        for (let i = 0; i < new get(atk).p_len; i++){
            if (new get(atk).p_list[i].includes("まもる")){
                turn = Number(new get(atk).p_list[i].slice(4, 5))
            }
        }
        if (Math.random() < 1 / Math.pow(3, turn)){
            if (!new get(atk).p_con.includes("まもる")){
                document.battle[atk + "_poke_condition"].value += "まもる　1回成功" + CR
            } else {
                document.battle[atk + "_poke_condition"].value = ""
                for (let i = 0; i < atk_p_con.split("\n").length - 1; i++){
                    if (atk_p_con.split("\n")[i].includes("まもる")){
                        document.battle[atk + "_poke_condition"].value += "まもる　" + (turn + 1) + "回成功" + CR
                    } else {
                        document.battle[atk + "_poke_condition"].value += atk_p_con.split("\n")[i] + CR
                    }
                }
            }
        } else {
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            condition_remove(atk, "poke", "まもる")
            return true
        }
    }
  
    // みちづれ: 前回まで最後に成功した行動がみちづれである
    if (move[0] == "みちづれ"){
        const log = turn_log() 
        for (let i = 0; i < log.length; i++){
            if (log[i] == atk + "チームの　" + atk_poke + "は　道連れにしようとしている"){
                document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
                return true
            }
        }
    }
    // みらいよち/はめつのねがい: 対象の場がすでにみらいにこうげき状態になっている
    if ((move[0] == "みらいよち" || move[0] == "はめつのねがい") && (new get(def).f_con.includes("みらいよち") || new get(def).f_con.includes("はめつのねがい"))){
        document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
        return true
    }
    // もえつきる: 使用者がほのおタイプではない
    if (move[0] == "もえつきる" && !atk_type.includes("ほのお")){
        document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
        return true
    }
    // いびき/ねごと: 使用者がねむり状態でない
    if ((move[0] == "いびき" || move[0] == "ねごと") && atk_abnormal != "ねむり"){
        document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
        return true
    }
    // ねむる
    if (move[0] == "ねむる"){
        // 1.HPが満タンである/ねごとで出たためすでにねむり状態にある
        if (full_HP == HP_last || atk_abnormal == "ねむり"){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
        // 2.使用者がふみん/やるきである
        if (atk_ability == "ふみん" || atk_ability == "やるき"){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
    }
}

// こんらん自傷の攻撃宣言
function confuse_self_injured(atk, atk_poke){
    let A_AV = document.getElementById(atk + "_A_AV").textContent
    let B_AV = document.getElementById(atk + "_B_AV").textContent
    const A_rank = Number(document.getElementById(atk + "_rank_A").textContent)
    const B_rank = Number(document.getElementById(atk + "_rank_B").textContent)
    if (A_rank > 0){
        A_AV = (A_AV * (2 + A_rank)) / 2
    } else {
        A_AV = (A_AV * 2) / (2 - A_rank)
    }
    if (B_rank > 0){
        B_AV = (B_AV * (2 + B_rank)) / 2
    } else {
        B_AV = (B_AV * 2) / (2 - B_rank)
    }
    // こんらんの自傷ダメージは威力40の物理攻撃
    const lv = document.getElementById(atk + "_level").textContent
    const damage = parseInt(parseInt(parseInt((lv * 2) / 5 + 2) * 40 * A_AV / B_AV) / 50 + 2)
    txt = atk + "チームの　" + atk_poke + "　は　訳もわからず　自分を攻撃した" + CR
    document.battle_log.battle_log.value += txt
    HP_change(atk, damage, "-")
} 

// 14.自分のこおりを回復するわざにより自身のこおり状態が治る
function self_melt_check(atk, atk_poke, move){
    const abnormal = document.getElementById(atk + "_abnormal").textContent
    if (abnormal == "こおり"){
        for (i = 0; i < self_melt_move_list.length; i++){
            if (move[0] == self_melt_move_list[i]){
                txt = atk + "チームの　" + atk_poke + "　の　" + move[0] + "　でこおりがとけた　!" + CR
                document.battle_log.battle_log.value += txt
                document.getElementById(atk + "_abnormal").textContent = ""
            }
        }   
    }
}

// 15.おおあめ/おおひでりによる技の失敗
function great_weather_failure(atk, move){
    if (!(new get("A").ability == "エアロック" || new get("A").ability == "ノーてんき" || new get("B").ability == "エアロック" || new get("B").ability == "ノーてんき")){
        if (new get(atk).f_con.includes("おおあめ") && move[1] == "ほのお"){
            txt = "しかし　" + move[0] + "　は　消えてしまった　!" + CR
            document.battle_log.battle_log.value += txt
            return true
        } else if (new get(atk).f_con.includes("おおひでり") && move[1] == "みず"){
            txt = "しかし　" + move[0] + "　は　蒸発してしまった　!" + CR
            document.battle_log.battle_log.value += txt
            return true
        }
    }
}

// 16.ふんじんによるほのお技の失敗とダメージ
function powder_failure(atk, atk_poke, move){
    const condition = document.battle[atk + "_poke_condition"].value
    if (condition.includes("ふんじん")){
        if (move[1] == "ほのお"){
            const full_HP = Number(document.getElementById(atk + "_HP").textContent)
            const damage = Math.round(full_HP / 4)
            txt = atk + "チームの　" + atk_poke + "　は　ふんじんで　技が失敗した　!" + CR
            document.battle_log.battle_log.value += txt
            HP_change(atk, damage, "-")
            return true
        }
    }
}

// 17.トラップシェルが物理技を受けていないことによる失敗
function shell_trap(atk, atk_poke, move){
    if (move[0] == "トラップシェル"){
        const atk_p_con = document.battle[atk + "_poke_condition"].value
        if (atk_p_con.includes("トラップシェル：不発")){
            txt = atk + "チームの　" + atk_poke + "の　トラップシェルは　不発に終わった！"
            document.battle_log.battle_log.value += txt + CR
            document.battle[atk + "_poke_condition"].value = ""
            for (let i = 0; i < atk_p_con.split("\n").length - 1; i++){
                if (!atk_p_con.split("\n")[i].includes("トラップシェル")){
                    document.battle[atk + "_poke_condition"].value += atk_p_con.split("\n")[i] + CR
                }
            }
            return true
        }
        if (atk_p_con.includes("トラップシェル：成功")){
            document.battle[atk + "_poke_condition"].value = ""
            for (let i = 0; i < atk_p_con.split("\n").length - 1; i++){
                if (!atk_p_con.split("\n")[i].includes("トラップシェル")){
                    document.battle[atk + "_poke_condition"].value += atk_p_con.split("\n")[i] + CR
                }
            }
            return true
        }
    }
}

// 19.特性による失敗
function ability_failure(atk, def, move){
    const atk_ability = document.getElementById(atk + "_ability").textContent
    const def_ability = document.getElementById(def + "_ability").textContent
    // しめりけ: 爆発技
    if (atk_ability == "しめりけ" || def_ability == "しめりけ"){
        if (move[0] == "じばく" || move[0] == "だいばくはつ" || move[0] == "ビックリヘッド" || move[0] == "ミストバースト"){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
    }
    // じょおうのいげん/ビビッドボディ: 優先度が高い技
    if ((def_ability == "じょおうのいげん" || def_ability == "ビビッドボディ") && priority_degree(atk, move) > 0 && !(move[8] == "自分" || move[0] == "味方の場" || move[0] == "全体の場")){
        document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
        return true
    }
}

// 20.中断されても効果が発動する技
function remain_effect_move(atk, def, move){
    const atk_p_con = document.battle[atk + "_poke_condition"].value
    const atk_f_con = document.battle[atk + "_field_condition"].value
    const def_f_con = document.battle[def + "_field_condition"].value
    // みらいよち/はめつのねがい: 相手をみらいにこうげき状態にし、行動を終了する
    if (move[0] == "はめつのねがい" || move[0] == "みらいよち"){
        for (let i = 0; i < 3; i++){
            if (document.getElementById(atk + "_" + i + "_existence").textContent == "戦闘中"){
                document.battle[def + "_field_condition"].value += move[0] + "(" + i + ")：3/3" + CR
                txt = atk + "チームの　" + new get(atk).name + "は　未来に攻撃を予知した！" + CR
                document.battle_log.battle_log.value += txt
                return true
            }
        }
    }
    // 誓い技: コンビネーションわざのセッターである場合、現在の行動は失敗し味方の行動順を引き上げる(リストは1から)
    // りんしょう: 行動後、味方のりんしょうによる行動順を引き上げる
    // エコーボイス: 次のターンのエコーボイスの威力が上がる
    if (move[0] == "エコーボイス"){
        if (atk_f_con.includes("エコーボイス")){
            for (const team of ["A", "B"]){
                let f_con = document.battle[team + "_field_condition"].value
                document.battle[team + "_field_condition"].value = ""
                for (let i = 0; i < f_con.split("\n").length - 1; i++){
                    if (f_con.split("\n")[i].includes("エコーボイス")){
                        let num = Number(f_con.split("\n")[i].slice(8))
                        document.battle[team + "_field_condition"].value += "エコーボイス　+" + (num + 0.1) + CR
                    } else {
                        document.battle[team + "_field_condition"].value += f_con.split("\n")[i] + CR
                    }
                }
            }
        } else {
            document.battle.A_field_condition.value += "エコーボイス　0.1" + CR
            document.battle.B_field_condition.value += "エコーボイス　0.1" + CR
        }
    }
    // いかり: いかり状態になる
    if (move[0] == "いかり" && !atk_p_con.includes("いかり")){
        document.battle[atk + "_poke_condition"].value += "いかり" + CR
    }
}

// 21.へんげんじざい/リベロの発動
function protean_or_libero(atk, atk_poke, move){
    if (new get(atk).ability == "へんげんじざい" || new get(atk).ability == "リベロ"){
        if (move[1] != new get(atk).type){
            document.getElementById(atk + "_type").textContent = move[1]
            txt = atk + "チームの　" + atk_poke + "　は　" + new get(atk).ability + "　で　" + move[1] + "　タイプに変わった！" + CR
            document.battle_log.battle_log.value += txt
        }
    }
}

// 22.溜め技の溜めターンでの動作
function　accumulation_move_operation(atk, def, atk_poke, def_poke, move){
    for (let i = 0; i < accumulation_move_list.length; i++){
        if (move[0] == accumulation_move_list[i][0]){
            if (new get(atk).p_con.includes("溜め技")){ //行動ターン
                if (move[0] == "フリーフォール"){
                    condition_remove(atk, "poke", "溜め技")
                    condition_remove(atk, "poke", "姿を隠す")
                    condition_remove(def, "poke", "姿を隠す")
                    if (new get(def).type.includes("ひこう")){
                        document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
                        return true
                    }
                } else {
                    condition_remove(atk, "poke", "溜め技")
                    condition_remove(atk, "poke", "姿を隠す")
                }
            } else if (move[0] == "フリーフォール"){
                // 1.対象が姿を隠していることによる失敗
                // 2.対象がみがわり状態であることによる失敗
                // 3.対象のおもさが200.0kg以上あることによる失敗
                if (new get(def).p_con.includes("姿を隠す") || new get(def).p_con.includes("みがわり") || weight_search(def) >= 200){
                    document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
                    return true
                } else { // 4.相手を空中に連れ去る
                    txt = atk + "チームの　" + atk_poke + "　は　" + def + "チームの　" + def_poke + "を　空へ連れ去った！"
                    document.battle_log.battle_log.value += txt + CR
                    document.battle[atk + "_poke_condition"].value += "溜め技：フリーフォール" + CR
                    document.battle[atk + "_poke_condition"].value += "姿を隠す：フリーフォール（攻撃）" + CR
                    document.battle[def + "_poke_condition"].value += "姿を隠す：フリーフォール（防御）" + CR
                    return true
                }
            } else { // 溜めるターン
                if (accumulation_move_list[i][1] == "s"){ // その場で溜める技
                    document.battle[atk + "_poke_condition"].value += "溜め技：" + move[0] + CR
                    txt = atk + "チームの　" + atk_poke + "　は　力を溜めている！"
                    document.battle_log.battle_log.value += txt + CR
                    if (move[0] == "ロケットずつき"){ // ロケットずつき: ぼうぎょが上がる
                        rank_change(atk, "B", 1)
                    }
                    if (move[0] == "メテオビーム"){ // メテオビーム: とくこうが上がる
                        rank_change(atk, "C", 1)
                    }
                } else if (accumulation_move_list[i][1] == "h"){ // 姿を隠す技
                    // ダイビング: うのミサイルでフォルムチェンジする
                    if (move[0] == "ダイビング" && new get(atk).ability == "うのミサイル" && !(new get(atk).p_con.includes("うのみのすがた") || new get(atk).p_con.includes("まるのみのすがた"))){
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
                    document.battle[atk + "_poke_condition"].value += "溜め技：" + move[0] + CR
                    txt = atk + "チームの　" + atk_poke + "　は　姿を隠した！"
                    document.battle_log.battle_log.value += txt + CR
                    document.battle[atk + "_poke_condition"].value += "姿を隠す：" + accumulation_move_list[i][2] + CR
                }
                
                // パワフルハーブを持つ場合は使用する。それ以外の場合は次のターンまで行動を中断する(失敗したとは見なされない)
                if ((move[0] == "ソーラービーム" || move[0] == "ソーラーブレード") && new get(atk).f_con.includes("にほんばれ") && new get(atk).item != "ばんのうがさ" 
                && !(new get("A").ability == "エアロック" || new get("A").ability == "ノーてんき" || new get("B").ability == "エアロック" || new get("B").ability == "ノーてんき")){
                    txt = atk + "チームの　" + atk_poke + "は　にほんばれで　すぐ技が打てる！"
                    document.battle_log.battle_log.value += txt + CR
                    condition_remove(atk, "poke", "溜め技")
                    condition_remove(atk, "poke", "姿を隠す")
                } else if (new get(atk).item == "パワフルハーブ"){
                    txt = atk + "チームの　" + atk_poke + "は　パワフルハーブで　力がみなぎった！"
                    document.battle_log.battle_log.value += txt + CR
                    condition_remove(atk, "poke", "溜め技")
                    condition_remove(atk, "poke", "姿を隠す")
                    set_recycle_item(atk)
                } else {
                    return true
                }
            }
        }
    }
}

// 25.対象のポケモンが全員すでにひんしになっていて場にいないことによる失敗
function fainted_failure(atk, def, move){
    if ((move[8] == "1体選択" || move[8] == "相手全体" || move[8] == "自分以外") && new get(def).f_con.includes("ひんし")){
        document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
        return true
    }
}

// 26.だいばくはつ/じばく/ミストバーストの使用者は対象が不在でもHPを全て失う。使用者がひんしになっても攻撃は失敗しない
function self_destruction(atk, atk_poke, move){
    if (move[0] == "だいばくはつ" || move[0] == "じばく" || move[0] == "ミストバースト"){
        document.getElementById(atk + "_HP_last").textContent = 0
        document.getElementById(atk + "_" + battle_poke_num(atk) + "_last_HP").textContent = 0
        fainted_process(atk)
    }
}

// 27.ビックリヘッド/てっていこうせんの使用者はHPを50%失う。対象が不在なら失わない。使用者がひんしになっても攻撃が失敗しない
function mindblown_stealbeam(atk, def, move){
    const atk_full_HP = Number(document.getElementById(atk + "_HP").textContent)
    if ((move[0] == "ビックリヘッド" || move[0] == "てっていこうせん") && new get(def).f_con.includes("ひんし")){
        HP_change_not_attack(atk, Math.ceil(atk_full_HP / 2), "-", move[0])
    }
}

// 28.マグニチュード使用時は威力が決定される
function magnitude(move){
    if (move[0] == "マグニチュード"){
        const random = Math.random() * 100
        let mag = 0
        const convert = [[0, 4, 10], [5, 5, 30], [15, 6, 50], [35, 7, 70], [65, 8, 90], [85, 9, 110], [95, 10, 150]]
        for (let i = 0; i < 7; i++){
            if (random >= convert[i][0]){
                mag = convert[i][1]
                move[3] = convert[i][2]
            }
        }
        document.battle_log.battle_log.value += "マグニチュード" + mag + "！" + CR
    }
}

// 29.姿を隠していることによる無効化
function hide_invalidation(atk, def, def_poke, move){
    const def_p_con = document.battle[def + "_poke_condition"].value
    if (def_p_con.includes("姿を隠す") && (move[8] == "1体選択" || move[8] == "相手全体" || move[8] == "自分以外" || move[8] == "全体") && new get(atk).ability != "ノーガード" && new get(def).ability != ""){
        if (def_p_con.includes("あなをほる") && !(move[0] == "じしん" || move[0] == "マグニチュード")){
            txt = def + "チームの　" + def_poke + "　には　当たらなかった！"
            document.battle_log.battle_log.value += txt + CR
            return true
        } else if ((def_p_con.includes("そらをとぶ") || def_p_con.includes("フリーフォール（攻撃）") || def_p_con.includes("フリーフォール（防御）")) && !(move[0] == "かぜおこし" || move[0] == "たつまき" || move[0] == "かみなり" || move[0] == "スカイアッパー" || move[0] == "うちおとす" || move[0] == "ぼうふう" || move[0] == "サウザンアロー")){
            txt = def + "チームの　" + def_poke + "　には　当たらなかった！"
            document.battle_log.battle_log.value += txt + CR
            return true
        } else if (def_p_con.includes("ダイビング") && !(move[0] == "なみのり" || move[0] == "うずしお")){
            txt = def + "チームの　" + def_poke + "　には　当たらなかった！"
            document.battle_log.battle_log.value += txt + CR
            return true
        } else if (def_p_con.includes("シャドーダイブ")){
            txt = def + "チームの　" + def_poke + "　には　当たらなかった！"
            document.battle_log.battle_log.value += txt + CR
            return true
        }
    } 
}

// 30.サイコフィールドによる無効化
function phscho_field_invalidation(atk, def, def_poke, move){
    if (new get(atk).f_con.includes("サイコフィールド") && grounded_check(def) && priority_degree(atk, move) > 0 && !(move[8] == "自分" || move[0] == "味方の場" || move[0] == "全体の場")){
        txt = def + "チームの　" + new get(def).name + "　は　サイコフィールドに　守られている！"
        document.battle_log.battle_log.value += txt + CR
        return true
    }
}

// 31.ファストガード/ワイドガード/トリックガードによる無効化 (Zワザ/ダイマックスわざならダメージを75%カットする)
function other_protect_invalidation(atk, def, def_poke, move){
    const def_p_con = document.battle[def + "_poke_condition"].value
    if (def_p_con.includes("ファストガード") && priority_degree(atk, move) > 0 && !(move[8] == "自分" || move[0] == "味方の場" || move[0] == "全体の場")){
        txt = def + "チームの　" + def_poke + "　は　攻撃を守った！"
        document.battle_log.battle_log.value += txt + CR
        return true
    } else if (def_p_con.includes("ワイドガード") && (move[8] == "相手全体" || move[8] == "全体"|| move[8] == "自分以外")){
        txt = def + "チームの　" + def_poke + "　は　攻撃を守った！"
        document.battle_log.battle_log.value += txt + CR
        return true
    } else if (def_p_con.includes("トリックガード") && (move[8] == "相手全体" || move[8] == "全体" || move[8] == "1体選択") && move[2] == "変化"){
        txt = def + "チームの　" + def_poke + "　は　攻撃を守った！"
        document.battle_log.battle_log.value += txt + CR
        return true
    }
}

// 32.まもる/キングシールド/ブロッキング/ニードルガード/トーチカによる無効化 (Zワザ/ダイマックスわざなら75%をカットする)
function protect_invalidation(atk, def, def_poke, move){
    if (move[8] == "自分以外" || move[8] == "全体" || move[8] == "1体選択" || move[8] == "相手全体"){
        if (new get(atk).ability != "ふかしのこぶし" && !protect_move_list.includes(move[0])){
            if (new get(def).p_con.includes("まもる") || new get(def).p_con.includes("みきり") || new get(def).p_con.includes("ニードルガード") || new get(def).p_con.includes("トーチカ")){
                txt = def + "チームの　" + def_poke + "　は　攻撃を守った！"
                document.battle_log.battle_log.value += txt + CR
                if (new get(def).p_con.includes("ニードルガード") && move[6] == "直接" && new get(atk).item != "ぼうごパット"){
                    HP_change_not_attack(atk, Math.floor(new get(atk).full_HP / 8), "-", "ニードルガード")
                } else if (new get(def).p_con.includes("トーチカ") && move[6] == "直接" && new get(atk).item != "ぼうごパット"){
                    make_abnormal_attack_or_ability(atk, "どく", 100, "トーチカ")
                }
                if (move[0] == "とびげり" || move[0] == "とびひざげり"){
                    HP_change(atk, Math.floor(new get(atk).full_HP / 2), "-")
                }
                return true
            } else if ((new get(def).p_con.includes("キングシールド") || new get(def).p_con.includes("ブロッキング")) && move[2] != "変化"){
                txt = def + "チームの　" + def_poke + "　は　攻撃を守った！"
                document.battle_log.battle_log.value += txt + CR
                if (move[6] == "直接" && new get(def).p_con.includes("キングシールド") && new get(atk).item != "ぼうごパット"){
                    rank_change_not_status(atk, "A", -1, 100, "キングシールド")
                } else if (move[6] == "直接" && new get(def).p_con.includes("ブロッキング") && new get(atk).item != "ぼうごパット"){
                    rank_change_not_status(atk, "B", -2, 100, "ブロッキング")
                }
                if (move[0] == "とびげり" || move[0] == "とびひざげり"){
                    HP_change(atk, Math.floor(new get(atk).full_HP / 2), "-")
                }
                return true
            }
        }
    }
}

// 33.たたみがえしによる無効化 (Zワザ/ダイマックスわざなら75%をカットする)
function mat_block(def, def_poke, move){
    const def_p_con = document.battle[def + "_poke_condition"].value
    if (def_p_con.includes("たたみがえし") && move[2] != "変化"){
        txt = def + "チームの　" + def_poke + "　は　攻撃を守った！"
        document.battle_log.battle_log.value += txt + CR
        return true
    }
}

// 35.マジックコート状態による反射
function magic_coat_reflection(atk, def, move){
    if ((new get(def).p_con.includes("マジックコート") || new get(def).ability == "マジックミラー") && magic_coat_move_list.includes(move[0])){
        txt = move[0] +  "　は　跳ね返された！"
        document.battle_log.battle_log.value += txt + CR
        let save = atk
        atk = def
        def = save
        move[9] = "反射"
    }
}

// 36.テレキネシスの場合、対象がディグダ/ダグトリオ/スナバァ/シロデスナ/メガゲンガー/うちおとす状態/ねをはる状態であることによる失敗
function telekinesis_failure(def, def_poke, move){
    if (move[0] == "テレキネシス"){
        const def_p_con = document.battle[def + "_poke_condition"].value
        if (def_poke == "ディグダ" || def_poke == "ダグトリオ" || def_poke == "スナバァ" || def_poke == "シロデスナ" || def_poke == "メガゲンガー" || def_p_con.includes("うちおとす") || def_p_con.includes("ねをはる")){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
    }
}

// 38.特性による無効化(その1)
function ability_invalidation_1(def, def_poke, move){
    // そうしょく: くさタイプ
    if (new get(def).ability == "そうしょく" && move[1] == "くさ" && !(move[8] == "自分" || move[8].match("場"))){
        rank_change_not_status(def, "A", 1, 100, "そうしょく")
        return true
    }
    // もらいび: ほのおタイプ
    if (new get(def).ability == "もらいび" && move[1] == "ほのお" && !(move[8] == "自分" || move[8].match("場"))){
        txt = def_poke +  "　は　もらいびで　ほのおの威力が上がった！"
        document.battle_log.battle_log.value += txt + CR
        if (!document.battle[def + "_poke_condition"].value.includes("もらいび")){
            document.battle[def + "_poke_condition"].value += "もらいび" + CR
        }
        return true
    }
    // かんそうはだ/よびみず/ちょすい: みずタイプ
    if (move[1] == "みず" && !(move[8] == "自分" || move[8].match("場"))){
        if (new get(def).ability == "かんそうはだ" || new get(def).ability == "よびみず" || new get(def).ability == "ちょすい"){
            txt = move[0] +  "　は　" + def_poke + "　の　" + new get(def).ability + "　で無効になった！"
            document.battle_log.battle_log.value += txt + CR
            if (new get(def).ability == "かんそうはだ" || new get(def).ability == "ちょすい"){
                HP_change(def, Math.floor(new get(def).full_HP / 4), "+")
            } else if (new get(def).ability == "よびみず"){
                rank_change(def, "C", 1)
            }
            return true
        }
    }
    // ひらいしん/でんきエンジン/ちくでん: でんきタイプ
    if (move[1] == "でんき" && !(move[8] == "自分" || move[8].match("場"))){
        if (new get(def).ability == "ひらいしん" || new get(def).ability == "でんきエンジン" || new get(def).ability == "ちくでん"){
            txt = move[0] +  "　は　" + def_poke + "　の　" + new get(def).ability + "　で無効になった！"
            document.battle_log.battle_log.value += txt + CR
            if (new get(def).ability == "ひらいしん"){
                rank_change(def, "C", 1)
            } else if (new get(def).ability == "でんきエンジン"){
                rank_change(def, "S", 1)
            } else if (new get(def).ability == "ちくでん"){
                HP_change(def, Math.floor(new get(def).full_HP / 4), "+")
            }
            if (move[0] == "とびげり" || move[0] == "とびひざげり"){
                HP_change(atk, Math.floor(new get(atk).full_HP / 2), "-")
            }
            return true
        }
    }
    // ぼうおん: 音技
    if (new get(def).ability == "ぼうおん" && music_move_list.includes(move[0]) && move[0] != "ソウルビート"){
        txt = move[0] +  "　は　" + def_poke + "　の　ぼうおん　で無効になった！"
        document.battle_log.battle_log.value += txt + CR
        return true
    }
    // テレパシー:　味方による攻撃技
    // ふしぎなまもり: 効果抜群でない技
    if (new get(def).ability == "ふしぎなまもり"){
        if (compatibility_check(atk, def, move) <= 1){
            txt = move[0] +  "　は　" + def_poke + "　の　ふしぎなまもり　で無効になった！"
            document.battle_log.battle_log.value += txt + CR
            if (move[0] == "とびげり" || move[0] == "とびひざげり"){
                HP_change(atk, Math.floor(new get(atk).full_HP / 2), "-")
            }
            return true
        }
    }
    // ぼうじん: 粉技
    if (new get(def).ability == "ぼうじん" && powder_move_list.includes(move[0])){
        txt = move[0] +  "　は　" + def_poke + "　の　ぼうじん　で無効になった！"
        document.battle_log.battle_log.value += txt + CR
        return true
    }

}

// 39.相性による無効化
function compatibility_invalidation(atk, def, def_poke, move){
    // 変化技でない、あるいはでんじはであり、対象がねらいのまとを持っていない場合
    const item = document.getElementById(def + "_item").textContent
    if ((move[2] != "変化" || move[0] == "でんじは") && item != "ねらいのまと"){
        if (compatibility_check(atk, def, move) == 0){
            txt = def +  "チームの　" + def_poke + "　には　効果がないようだ・・・"
            document.battle_log.battle_log.value += txt + CR
            if (move[0] == "とびげり" || move[0] == "とびひざげり"){
                HP_change(atk, Math.floor(new get(atk).full_HP / 2), "-")
            }
            return true
        }
    }
}

// 40,ふゆうによる無効化
// 41.でんじふゆう/テレキネシス/ふうせんによる無効化
function levitate_invalidation(def, def_poke, move){
    const def_ability = document.getElementById(def + "_ability").textContent
    const def_item = document.getElementById(def + "_item").textContent
    const def_p_con = document.battle[def + "_poke_condition"].value
    if (move[1] == "じめん" && move[2] != "変化" && !def_p_con.includes("ねをはる")){
        if (def_ability == "ふゆう"){
            txt = move[0] +  "　は　" + def_poke + "　の　ふゆう　で無効になった！"
            document.battle_log.battle_log.value += txt + CR
            return true
        } else if (def_p_con.includes("でんじふゆう") || def_p_con.includes("テレキネシス") || def_item == "ふうせん"){
            txt = move[0] +  "　は　" + def_poke + "　には　効果がないようだ・・・"
            document.battle_log.battle_log.value += txt + CR
            return true
        }
    }
}

// 42.ぼうじんゴーグルによる無効化
function powder_goggle_invalidation(def, def_poke, move){
    const item = document.getElementById(def + "_item").textContent
    if (item == "ぼうじんゴーグル" && powder_move_list.includes(move[0])){
        txt = def +  "チームの　" + def_poke + "は　ぼうじんゴーグルで　" + move[0] + "を　受けない！"
        document.battle_log.battle_log.value += txt + CR
        return true
    }
}

// 43.特性による無効化(その2)
function ability_invalidation_2(def, def_poke, move){
    // ぼうだん: 弾の技
    if (new get(def).ability == "ぼうだん" && ball_move_list.includes(move[0])){
        txt = move[0] +  "　は　" + def_poke + "　の　ぼうだん　で無効になった！"
        document.battle_log.battle_log.value += txt + CR
        return true
    }
    // ねんちゃく: トリック/すりかえ/ふしょくガス
    if (new get(def).ability == "ねんちゃく" && (move[0] == "トリック" || move[0] == "すりかえ" || move[0] == "ふしょくガス")){
        document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
        return true
    }
}

// 44.タイプによる技の無効化(その1)
function type_invalidation_1(atk, def, def_poke, move){
    const type = document.getElementById(def + "_type").textContent
    const ability = document.getElementById(atk + "_ability").textContent
    // くさタイプ: 粉技の無効化
    if (type.includes("くさ") && powder_move_list.includes(move[0])){
        txt = def + "チームの　" + def_poke + "には　効果がないようだ・・・"
        document.battle_log.battle_log.value += txt + CR
        return true
    }
    // ゴーストタイプ: にげられない状態にする変化技の無効化
    if (type.includes("ゴースト") && (move[0] == "くろいまなざし" || move[0] == "クモのす" || move[0] == "とおせんぼう")){
        txt = def + "チームの　" + def_poke + "には　効果がないようだ・・・"
        document.battle_log.battle_log.value += txt + CR
        return true
    }
    // あくタイプ: いたずらごころの効果が発動した技の無効化
    if (new get(atk).ability == "いたずらごころ" && new get(def).type.includes("あく") && move[2] == "変化" && !(move[8] == "自分" || move[0] == "味方の場" || move[0] == "全体の場")){
        txt = def + "チームの　" + def_poke + "には　効果がないようだ・・・"
        document.battle_log.battle_log.value += txt + CR
        return true
    }
    // こおりタイプ: ぜったいれいどの無効化
    if (type.includes("こおり") && move[0] == "ぜったいれいど"){
        txt = def + "チームの　" + def_poke + "には　効果がないようだ・・・"
        document.battle_log.battle_log.value += txt + CR
        return true
    }
}

// 45.技の仕様による無効化(その1)
function move_specifications_invalidation_1(atk, def, def_poke, move){
    const atk_sex = document.getElementById(atk + "_sex").textContent
    const def_sex = document.getElementById(def + "_sex").textContent
    // メロメロ: 対象と性別が同じ/対象が性別不明
    if (move[0] == "メロメロ"){
        if (atk_sex == " - " || def_sex == " - " || atk_sex == def_sex){
            txt = def + "チームの　" + def_poke + "には　効果がないようだ・・・"
            document.battle_log.battle_log.value += txt + CR
            return true
        }
    }
    // ゆうわく（wikiには書いていなかったが、勝手に入れた）
    if (move[0] == "ゆうわく"){
        if (!(atk_sex == " ♂ " && def_sex == " ♀ ") || (atk_sex == " ♀ " && def_sex == " ♂ ")){
            txt = def + "チームの　" + def_poke + "には　効果がないようだ・・・"
            document.battle_log.battle_log.value += txt + CR
            return true
        }
    }
    // いちゃもん: 対象がダイマックスしている
    // ベノムトラップ: 対象がどく/もうどく状態でない
    if (move[0] == "ベノムトラップ" && !document.getElementById(def + "_abnormal").textContent.includes("どく")){
        txt = def + "チームの　" + def_poke + "には　効果がないようだ・・・"
        document.battle_log.battle_log.value += txt + CR
        return true
    }
}

// 46.技の仕様による無効化(その2)
function move_specifications_invalidation_2(atk, def, def_poke, move){
    // 重複による無効化
        // あくび: 対象がすでに状態異常/あくび状態になっている
        if (move[0] == "あくび" && (new get(def).abnormal != "" || new get(def).p_con.includes("ねむけ"))){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
        // あくむ: 対象がすでにあくむ状態になっている　（wikiにはなかった）
        if (move[0] == "あくむ" && new get(def).p_con.includes("あくむ")){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
        // いちゃもん: 対象がすでにいちゃもん状態である
        if (move[0] == "いちゃもん" && new get(def).p_con.includes("いちゃもん")){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
        // とぎすます: 自信がすでにとぎすます状態である　（wikiにはなかった）
        if (move[0] == "とぎすます" && new get(atk).p_con.includes("とぎすます")){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
        // オーロラベール: あられ状態でない（wikiには載っていない）
        if (!(new get("A").ability == "エアロック" || new get("A").ability == "ノーてんき" || new get("B").ability == "エアロック" || new get("B").ability == "ノーてんき")){
            if (move[0] == "オーロラベール" && !new get(atk).f_con.includes("あられ")){
                document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
                return true
            }
        }

        // ほごしょく: 自身が同じタイプを持っている (wikiにない)
        if (move[0] == "ほごしょく"){
            if ((new get(atk).f_con.includes("グラスフィールド") && new get(atk).type.includes("くさ")) 
            || (new get(atk).f_con.includes("エレキフィールド") && new get(atk).type.includes("でんき")) 
            || (new get(atk).f_con.includes("ミストフィールド") && new get(atk).type.includes("フェアリー")) 
            || (new get(atk).f_con.includes("サイコフィールド") && new get(atk).type.includes("エスパー")) 
            || (!new get(atk).f_con.includes("フィールド") && new get(atk).type.includes("ノーマル"))){
                document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
                return true
            }
        }
        // なやみのタネ: 対象がすでにふみんである
        if (move[0] == "なやみのタネ" && new get(def).ability == "ふみん"){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
        // ねをはる: 自身がすでにねをはる状態である
        if (move[0] == "ねをはる" && new get(atk).p_con.includes("ねをはる")){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
        // ほろびのうた: 対象がすでにほろびのうた状態である
        if (move[0] == "ほろびのうた" && new get(atk).p_con.includes("ほろびカウント") && new get(def).p_con.includes("ほろびカウント")){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
        // ミラクルアイ: 対象がすでにミラクルアイ状態である
        if (move[0] == "ミラクルアイ" && new get(def).p_con.includes("ミラクルアイ")){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
        // メロメロ: 対象がすでにメロメロ状態である
        if (move[0] == "メロメロ" && new get(def).p_con.includes("メロメロ")){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
        // やどりぎのタネ: 対象がすでにやどりぎのタネ状態である
        if (move[0] == "やどりぎのタネ" && new get(def).p_con.includes("やどりぎのタネ")){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
        // 状態異常にする変化技: 対象がすでに同じ状態異常になっている
        for (let i = 0; i < abnormal_status_move_list.length; i++){
            if (move[0] == abnormal_status_move_list[i][0]){
                const abnormal = abnormal_status_move_list[i][1]
                if ((abnormal == "こんらん" && new get(def).p_con.includes("こんらん")) || (abnormal != "こんらん" && new get(def).abnormal == abnormal)){
                    txt = def + "チームの　" + def_poke + "は　すでに　" + abnormal + "に　なっていた・・・" + CR
                    document.battle_log.battle_log.value += txt
                    return true
                }
            }
        }
        // 状態異常にする変化技: 対象が別の状態異常になっている
        for (let i = 0; i < abnormal_status_move_list.length; i++){
            if (move[0] == abnormal_status_move_list[i][0]){
                const abnormal = abnormal_status_move_list[i][1]
                if (abnormal != "こんらん" && new get(def).abnormal != ""){
                    document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
                    return true
                }
            }
        }
    // ランク補正に関する無効化
        // ランク補正を上げる変化技: ランクがすでに最大である
        // ランク補正を下げる変化技: ランクがすでに最低である
        for (let i = 0; i < rank_change_status_move_list.length; i++){
            if (move[0] == rank_change_status_move_list[i][0]){
                let team = rank_change_status_move_list[i][1]
                if (team == "s"){
                    team = atk
                } else if (team == "e"){
                    team = def
                }
                let check = 0
                for (let j = 2; j < rank_change_status_move_list[i].length; j++){
                    let parameter = rank_change_status_move_list[i][j][0]
                    let change = rank_change_status_move_list[i][j][1]
                    if (change > 0 && document.getElementById(team + "_rank_" + parameter).textContent == 6){
                        check += 1
                    } else if (change < 0 && document.getElementById(team + "_rank_" + parameter).textContent == -6){
                        check += 1
                    }
                }
                if (check == rank_change_status_move_list[i].length - 2){
                    document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
                    return true
                }
            }
        }
        // コーチング: シングルバトルである/対象となる味方がいない
        if (move[0] == "コーチング" || move[0] == "アロマミスト"){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
        // ソウルビート/はいすいのじん: 全能力が最大まで上がっている
        if (move[0] == "ソウルビート" || move[0] == "はいすいのじん"){
            const A = document.getElementById(atk + "_rank_A").textContent
            const B = document.getElementById(atk + "_rank_B").textContent
            const C = document.getElementById(atk + "_rank_C").textContent
            const D = document.getElementById(atk + "_rank_D").textContent
            const S = document.getElementById(atk + "_rank_S").textContent
            if (A == 6 && B == 6 && C == 6 && D == 6 && S == 6){
                document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
                return true
            }
        }
        // ほおばる: ぼうぎょランクがすでに最大である
        if (move[0] == "ほおばる" && document.getElementById(atk + "_rank_B").textContent == 6){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
    // その他
        // がむしゃら: 対象のHPが使用者以下
        if (move[0] == "がむしゃら"){
            if (new get(atk).last_HP >= new get(def).last_HP){
                document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
                return true
            }
        }
        // シンクロノイズ: タイプが合致していない
        if (move[0] == "シンクロノイズ"){
            if (new get(atk).type !=new get(def).type){
                document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
                return true
            }
        }
        // ゆめくい/あくむ: 対象がねむり状態でない
        if ((move[0] == "ゆめくい" || move[0] == "あくむ") && new get(def).abnormal != "ねむり"){
            document.battle_log.battle_log.value += "しかし　" + def + "チームの　" + def_poke + "は　眠っていなかった・・・" + CR
            return true
        }
        // 一撃必殺技: 対象が使用者よりレベルが高い/対象がダイマックスしている
        if (one_shot_deadly_move_list.includes(move[0]) && new get(atk).level < new get(def).level){
            txt =  def + "チームの　" + def_poke + "には　全然効いてない！" + CR
            document.battle_log.battle_log.value += txt
            return true
        }
        // リフレッシュ: 状態異常のポケモンがいない（wikiにない）
        if (move[0] == "リフレッシュ" && !(new get(atk).abnormal == "どく" || new get(atk).abnormal == "やけど" || new get(atk).abnormal == "まひ")){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
}

// 47.タイプによる技の無効化(その2)
function type_invalidation_2(atk, def, def_poke, move){
    const type = document.getElementById(def + "_type").textContent
    // くさタイプ: やどりぎのタネの無効化
    if (type.includes("くさ") && move[0] == "やどりぎのタネ"){
        document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
        return true
    }
    // ほのおタイプ: やけどの無効化
    if (type.includes("ほのお") && move[0] == "おにび"){
        document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
        return true
    }
    // どく/はがねタイプ: どく/もうどくの無効化
    if ((type.includes("どく") || type.includes("はがね")) && (move[0] == "どくガス" || move[0] == "どくどく" || move[0] == "どくのこな") && new get(atk).ability != "ふしょく"){
        document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
        return true
    }
    // でんきタイプ: まひの無効化
    if (type.includes("でんき") && (move[0] == "しびれごな" || move[0] == "でんじは" || move[0] == "へびにらみ")){
        document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
        return true
    }
}

// 48.さわぐによるねむりの無効化
function uproar(atk, def, def_poke, move){
    const atk_p_con = document.battle[atk + "_poke_condition"].value
    const def_p_con = document.battle[def + "_poke_condition"].value
    if (move[0] == "さわぐ" && document.getElementById(def + "_abnormal").textContent == "ねむり"){
        txt = def + "チームの　" + def_poke + "は　騒がしくて　目を覚ました！"
        document.battle_log.battle_log.value += txt + CR
        document.getElementById(def + "_abnormal").textContent = ""
        const condition = document.battle[def + "_poke_condition"].value.split("\n")
        document.battle[def + "_poke_condition"].value = ""
        for (let i = 0; i < condition.length - 1; i++){
            if (!condition[i].includes("ねむり")){
                document.battle[def + "_poke_condition"].value += condition[i] + CR
            }
        }
    }
    for (let i = 0; i < abnormal_status_move_list.length; i++){
        if (move[0] == abnormal_status_move_list[i][0] && abnormal_status_move_list[i][1] == "ねむり" 
        && (atk_p_con.includes("さわぐ") || def_p_con.includes("さわぐ"))){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
    }
}

// 49.しんぴのまもり状態による無効化
function safeguard_invalidation(def, move){
    const condition = document.battle[def + "_field_condition"].value
    if (condition.includes("しんぴのまもり") && new get(atk).ability != "すりぬけ"){
        for (let i = 0; i < abnormal_status_move_list.length; i++){
            if (move[0] == abnormal_status_move_list[i][0]){
                document.battle_log.battle_log.value += "しかし　しんぴのまもりに　防がれた・・・" + CR
                return true   
            }
        }
    }
}

// 50.エレキフィールド/ミストフィールド状態による状態異常の無効化
function field_invalidation(def, def_poke, move){
    if (new get(def).f_con.includes("エレキフィールド") && grounded_check(def)){
        for (let i = 0; i < abnormal_status_move_list.length; i++){
            if (move[0] == abnormal_status_move_list[i][0]){
                if (abnormal_status_move_list[i][1] == "ねむり"){
                    txt = def + "チームの　" + def_poke + "は　エレキフィールドに守られている！" 
                    document.battle_log.battle_log.value += txt + CR
                    return true
                }   
            }
        }
    } else if (new get(def).f_con.includes("ミストフィールド") && grounded_check(def)){
        for (let i = 0; i < abnormal_status_move_list.length; i++){
            if (move[0] == abnormal_status_move_list[i][0]){
                txt = def + "チームの　" + def_poke + "は　ミストフィールドに守られている！" 
                document.battle_log.battle_log.value += txt + CR
                return true 
            }
        }
    }
}

// 51.みがわり状態によるランク補正を下げる技/デコレーションの無効化
function substitute_invalidation_1(def, move){
    const condition = document.battle[def + "_poke_condition"].value
    if (condition.includes("みがわり") && !music_move_list.includes(move[0])){
        for (let i = 0; i < rank_change_status_move_list.length ;i++){
            if (move[0] == rank_change_status_move_list[i][0]){
                if (rank_change_status_move_list[i][1] == "e"){
                    document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
                    return true 
                }
            }
        }
    }
}

// 52.しろいきりによる無効化
function mist_invalidation(def, move){
    const condition = document.battle[def + "_field_condition"].value
    if (condition.includes("しろいきり") && new get(atk).ability != "すりぬけ"){
        for (let i = 0; i < rank_change_status_move_list.length ;i++){
            if (move[0] == rank_change_status_move_list[i][0]){
                if (rank_change_status_move_list[i][1] == "e" && move[0] != "デコレーション"){
                    document.battle_log.battle_log.value += "しかし　しろいきりに　防がれた・・・" + CR
                    return true 
                }
            }
        }
    }
}

// 53.特性による無効化(その3)
function ability_invalidation_3(def, def_poke, move){
    const ability = document.getElementById(def + "_ability").textContent
    const type = document.getElementById(def + "_type").textContent
    const def_f_con = document.battle[def + "_field_condition"].value
    const def_p_con = document.battle[def + "_poke_condition"].value
    // ランク補正に関する無効化
        // クリアボディ/しろいけむり/メタルプロテクト/フラワーベール: 能力を下げる技
        if (ability == "クリアボディ" || ability == "しろいけむり" || ability == "メタルプロテクト" || (ability == "フラワーベール" && type.includes("くさ"))){
            for (let i = 0; i < rank_change_status_move_list.length ;i++){
                if (move[0] == rank_change_status_move_list[i][0]){
                    if (rank_change_status_move_list[i][1] == "e" && move[0] != "デコレーション"){
                        document.battle_log.battle_log.value += ability + " によりランクは下がらない・・・" + CR
                        return true 
                    }
                }
            }
        }
        // かいりきバサミ: こうげきを下げる技
        if (ability == "かいりきバサミ"){
            for (let i = 0; i < rank_change_status_move_list.length ;i++){
                if (move[0] == rank_change_status_move_list[i][0]){
                    if (rank_change_status_move_list[i][1] == "e" && rank_change_status_move_list[i].length == 3){
                        if (rank_change_status_move_list[i][2][0] == "A"){
                            document.battle_log.battle_log.value += "しかし　かいりきバサミにより　攻撃ランクは下がらない・・・" + CR
                            return true 
                        }
                    }
                }
            }
        }
        // はとむね: ぼうぎょを下げる技
        if (ability == "はとむね"){
            for (let i = 0; i < rank_change_status_move_list.length ;i++){
                if (move[0] == rank_change_status_move_list[i][0]){
                    if (rank_change_status_move_list[i][1] == "e" && rank_change_status_move_list[i].length == 3){
                        if (rank_change_status_move_list[i][2][0] == "B"){
                            document.battle_log.battle_log.value += "しかし　はとむねにより　防御ランクは下がらない・・・" + CR
                            return true 
                        }
                    }
                }
            }
        }
        // するどいめ: 命中を下げる技
        if (ability == "するどいめ"){
            for (let i = 0; i < rank_change_status_move_list.length ;i++){
                if (move[0] == rank_change_status_move_list[i][0]){
                    if (rank_change_status_move_list[i][1] == "e" && rank_change_status_move_list[i].length == 3){
                        if (rank_change_status_move_list[i][2][0] == "accuracy"){
                            document.battle_log.battle_log.value += "しかし　するどいめにより　命中率は下がらない・・・" + CR
                            return true 
                        }
                    }
                }
            }
        }
    // 状態異常/状態変化に関する無効化
        // スイートベール/ぜったいねむり/フラワーベール/リーフガード/リミットシールド: 状態異常の無効化
        if (ability == "スイートベール" 
        || ability == "ぜったいねむり" 
        || (ability == "フラワーベール" && type.includes("くさ")) 
        || (ability == "リーフガード" && def_f_con.includes("にほんばれ") && !(new get("A").ability == "エアロック" || new get("A").ability == "ノーてんき" || new get("B").ability == "エアロック" || new get("B").ability == "ノーてんき")) 
        || new get(def).name == "メテノ(りゅうせいのすがた)"){
            for (let i = 0; i < abnormal_status_move_list.length; i++){
                if (move[0] == abnormal_status_move_list[i][0]){
                    txt = def + "チームの　" + def_poke + "は　" + ability + "に　守られている！" 
                    document.battle_log.battle_log.value += txt + CR
                    return true
                }
            }
            if (move[0] == "あくび"){
                txt = def + "チームの　" + def_poke + "は　" + ability + "に　守られている！" 
                document.battle_log.battle_log.value += txt + CR
                return true
            }
        }
        // めんえき/パステルベール: どく・もうどく状態の無効化
        if (ability == "めんえき" || ability == "パステルベール"){
            for (let i = 0; i < abnormal_status_move_list.length; i++){
                if (move[0] == abnormal_status_move_list[i][0]){
                    if (abnormal_status_move_list[i][1].includes("どく")){
                        txt = def + "チームの　" + def_poke + "は　" + ability + "に　守られている！" 
                        document.battle_log.battle_log.value += txt + CR
                        return true
                    }   
                }
            }
        }
        // じゅうなん: まひ状態の無効化
        if (ability == "じゅうなん"){
            for (let i = 0; i < abnormal_status_move_list.length; i++){
                if (move[0] == abnormal_status_move_list[i][0]){
                    if (abnormal_status_move_list[i][1] == "まひ"){
                        txt = def + "チームの　" + def_poke + "は　" + ability + "で　麻痺にならない！" 
                        document.battle_log.battle_log.value += txt + CR
                        return true
                    }   
                }
            }
        }
        // みずのベール/すいほう: やけど状態の無効化
        if (ability == "みずのベール" || ability == "すいほう"){
            for (let i = 0; i < abnormal_status_move_list.length; i++){
                if (move[0] == abnormal_status_move_list[i][0]){
                    if (abnormal_status_move_list[i][1] == "やけど"){
                        txt = def + "チームの　" + def_poke + "は　" + ability + "に　守られている！" 
                        document.battle_log.battle_log.value += txt + CR
                        return true
                    }   
                }
            }
        }
        // ふみん/やるき: ねむり状態の無効化
        if (ability == "ふみん" || ability == "やるき"){
            for (let i = 0; i < abnormal_status_move_list.length; i++){
                if (move[0] == abnormal_status_move_list[i][0]){
                    if (abnormal_status_move_list[i][1] == "ねむり" || move[0] == "あくび"){
                        txt = def + "チームの　" + def_poke + "は　" + ability + "に　守られている！" 
                        document.battle_log.battle_log.value += txt + CR
                        return true
                    }   
                }
            }
        }
        // マグマのよろい: こおり状態の無効化
        if (new get(def).ability == "マグマのよろい"){
            for (let i = 0; i < abnormal_status_move_list.length; i++){
                if (move[0] == abnormal_status_move_list[i][0]){
                    if (abnormal_status_move_list[i][1] == "こおり"){
                        txt = def + "チームの　" + def_poke + "は　" + new get(def).ability + "に　守られている！" 
                        document.battle_log.battle_log.value += txt + CR
                        return true
                    }   
                }
            }
        }
        // マイペース: こんらん状態の無効化
        if (new get(def).ability == "マイペース"){
            for (let i = 0; i < abnormal_status_move_list.length; i++){
                if (move[0] == abnormal_status_move_list[i][0]){
                    if (abnormal_status_move_list[i][1] == "こんらん"){
                        txt = def + "チームの　" + def_poke + "は　" + new get(def).ability + "に　守られている！" 
                        document.battle_log.battle_log.value += txt + CR
                        return true
                    }   
                }
            }
        }
        // どんかん: メロメロ/ちょうはつ状態の無効化　ゆうわく（wikiにない）
        if (new get(def).ability == "どんかん" && (move[0] == "メロメロ" || move[0] == "ちょうはつ" || move[0] == "ゆうわく")){
            txt = def + "チームの　" + def_poke + "は　" + new get(def).ability + "に　守られている！" 
            document.battle_log.battle_log.value += txt + CR
            return true
        }
    // その他
        // アロマベール: メロメロ/いちゃもん/かいふくふうじ状態の無効化
        if (new get(def).ability == "アロマベール"){
            if (move[0] == "メロメロ" || move[0] == "いちゃもん" || move[0] == "かいふくふうじ")
                txt = def + "チームの　" + def_poke + "は　" + new get(def).ability + "に　守られている！" 
                document.battle_log.battle_log.value += txt + CR
                return true
            }
        // がんじょう: 一撃必殺技の無効化
        if (new get(def).ability == "がんじょう" && one_shot_deadly_move_list.includes(move[0])){
            txt = def + "チームの　" + def_poke + "は　" + new get(def).ability + "に　守られている！" 
            document.battle_log.battle_log.value += txt + CR
            return true
        }
}

// 54.命中判定による技の無効化
function accuracy_failure(atk, def, move, order){
    if (new get(atk).ability == "ノーガード" || new get(def).ability == "ノーガード"){
        return false
    }
    if (new get(atk).p_con.includes("ロックオン")){
        condition_remove(atk, "poke", "ロックオン")
        return false
    }
    if (new get(def).p_con.includes("ちいさくなる") && minimize_move_list.includes(move[0])){
        return false
    }
    if (new get(def).p_con.includes("テレキネシス") && !one_shot_deadly_move_list.includes(move[0])){
        return false
    }
    if ((move[4] == "-") 
    || ((move[0] == "かみなり" || move[0] == "ぼうふう") && new get(atk).f_con.includes("あめ") && !(new get("A").ability == "エアロック" || new get("A").ability == "ノーてんき" || new get("B").ability == "エアロック" || new get("B").ability == "ノーてんき")) 
    || (move[0] == "ふぶき" && new get(atk).f_con.includes("あられ") && !(new get("A").ability == "エアロック" || new get("A").ability == "ノーてんき" || new get("B").ability == "エアロック" || new get("B").ability == "ノーてんき")) 
    || (move[0] == "どくどく" && new get(atk).type.includes("どく"))){
        return false
    }
    if ((move[0] == "かみなり" || move[0] == "ぼうふう") && new get(atk).f_con.includes("にほんばれ") && !(new get("A").ability == "エアロック" || new get("A").ability == "ノーてんき" || new get("B").ability == "エアロック" || new get("B").ability == "ノーてんき")){
        move[4] = 50
    }
    if (new get(def).ability == "ミラクルスキン" && move[2] == "変化" && move[4] > 50){
        move[4] = 50
    }
    if (one_shot_deadly_move_list.includes(move[0])){
        move[4] = 30 + new get(atk).level - new get(def).level
    }

    // 命中補正の初期値
    let correction = 4096
    // 場の状態
    if(new get(atk).f_con.includes("じゅうりょく") && !one_shot_deadly_move_list.includes(move[0])){
        correction = Math.round(correction * 6840 / 4096)
    }
    // 相手の特性
    if (new get(def).ability == "ちどりあし" && new get(atk).p_con.includes("こんらん") && !one_shot_deadly_move_list.includes(move[0])){
        correction = Math.round(correction * 2048 / 4096)
    } else if (!(new get("A").ability == "エアロック" || new get("A").ability == "ノーてんき" || new get("B").ability == "エアロック" || new get("B").ability == "ノーてんき") 
    && ((new get(def).ability == "すながくれ" && new get(atk).f_con.includes("すなあらし")) || (new get(def).ability == "ゆきがくれ" && new get(atk).f_con.includes("あられ"))) 
    && !one_shot_deadly_move_list.includes(move[0])){
        correction = Math.round(correction * 3277 / 4096)
    }
    // 自分の特性
    if (new get(atk).ability == "はりきり" && move[2] == "物理" && !one_shot_deadly_move_list.includes(move[0])){
        correction = Math.round(correction * 3277 / 4096)
    } else if (new get(atk).ability == "ふくがん" && !one_shot_deadly_move_list.includes(move[0])){
        correction = Math.round(correction * 5325 / 4096)
    } else if (new get(atk).ability == "しょうりのほし" && !one_shot_deadly_move_list.includes(move[0])){
        correction = Math.round(correction * 4506 / 4096)
    }
    // 相手のもちもの
    if (new get(def).item == "ひかりのこな" || new get(def).item == "のんきのおこう" && !one_shot_deadly_move_list.includes(move[0])){
        correction = Math.round(correction * 3686 / 4096)
    }
    // 自分のもちもの
    if (new get(atk).item == "こうかくレンズ" && !one_shot_deadly_move_list.includes(move[0])){
        correction = Math.round(correction * 4505 / 4096)
    } else if (new get(atk).item == "フォーカスレンズ" && atk == order[1] && !one_shot_deadly_move_list.includes(move[0])){
        correction = Math.round(correction * 4915 / 4096)
    }

    // 技の命中率 * 命中補正
    let check = five_cut(move[4] * correction / 4096)

    // ランク補正
    let rank = new get(atk).accuracy_rank - new get(def).evasiveness_rank
    if (new get(atk).ability == "てんねん" || new get(atk).ability == "するどいめ" || new get(def).p_con.includes("みやぶられている") || move[0] == "せいなるつるぎ" || move[0] == "DDラリアット" || move[0] == "なしくずし" || new get(def).p_con.includes("ミラクルアイ")){
        rank = rank + new get(def).evasiveness_rank
    }
    if (new get(def).ability == "てんねん"){
        rank = rank - new get(atk).accuracy_rank
    }
    if (rank > 6){
        rank = 6
    }
    if (rank < -6){
        rank = -6
    }
    if (rank > 0){
        check = Math.floor(check * (3 + rank) / 3)
    } else {
        check = Math.floor(check * 3) / (3 - rank)
    }

    if (new get(atk).p_con.includes("ミクルのみ") && !one_shot_deadly_move_list.includes(move[0])){
        check = five_cut(check * 4915 / 4096)
        document.battle[atk + "_poke_condition"].value = ""
        for (let i = 0; i < new get(atk).p_con.split("\n").length - 1; i++){
            if (new get(atk).p_con.split("\n")[i] != "ミクルのみ"){
                document.battle[atk + "_poke_condition"].value += new get(atk).p_con.split("\n")[i] + CR
            }
        }
    }

    if (check > 100){check = 100}
    const random = Math.random() * 100
    if (random >= check){
        txt = def + "チームの　" + new get(def).name + "　には当たらなかった" + CR
        document.battle_log.battle_log.value += txt
        if (new get(atk).item == "からぶりほけん" && !one_shot_deadly_move_list.includes(move[0]) && document.getElementById(atk + "_rank_S").textContent != 6){
            rank_change_not_status(atk, "S", 2, 100, new get(atk).item)
            set_recycle_item(atk)
        }
        if (move[0] == "とびげり" || move[0] == "とびひざげり"){
            HP_change(atk, Math.floor(new get(atk).full_HP / 2), "-")
        }
        return true
    }
}

// 55.シャドースチールで対象のランク補正を吸収する
function spectral_thief(atk, def ,atk_poke, move){
    if (move[0] == "シャドースチール"){
        let check = 0
        for (const i of ["A", "B", "C", "D", "S", "accuracy", "evasiveness"]){
            let def_rank = Number(document.getElementById(def + "_rank_" + i).textContent)
            if (def_rank > 0){
                rank_change(atk, i, def_rank)
                rank_change(def, i, -def_rank)
                check += 1
            }
        }
        if (check > 0){
            txt = atk + "チームの　" + atk_poke + "　は　上がった能力を　奪い取った！" + CR
            document.battle_log.battle_log.value += txt
        }
    }
}

// 56.対応するタイプの攻撃技の場合ジュエルが消費される
function use_juwel(atk, atk_poke, move){
    const atk_item = document.getElementById(atk + "_item").textContent
    if (atk_item.includes("ジュエル") && move[2] != "変化" && !one_shot_deadly_move_list.includes(move[0]) && atk_item.includes(move[1])){
        txt = atk + "チームの　" + atk_poke + "　は　ジュエルで威力を高めた！" + CR
        document.battle_log.battle_log.value += txt
        document.getElementById(atk + "_item").textContent = ""
        document.battle[atk + "_poke_condition"].value += "ジュエル" + CR
    }
}

// 57. かわらわり/サイコファング/ネコにこばんの効果が発動する
function wall_break(def, move){
    if (move[0] == "かわらわり" || move[0] == "サイコファング"){
        const def_f_con = document.battle[def + "_field_condition"].value
        if (def_f_con.includes("オーロラベール") || def_f_con.includes("ひかりのかべ") || def_f_con.includes("リフレクター")){
            txt = def + "チームの　壁を　破壊した！" + CR
            document.battle_log.battle_log.value += txt
            document.battle[def + "_field_condition"].value = ""
            for (let i = 0; i < def_f_con.split("\n").length - 1; i++){
                if (!(def_f_con.split("\n")[i].includes("オーロラベール") || def_f_con.split("\n")[i].includes("ひかりのかべ") || def_f_con.split("\n")[i].includes("リフレクター"))){
                    document.battle[def + "_field_condition"].value += def_f_con.split("\n")[i] + CR
                }
            }

        }
    }
}

// 58. ポルターガイストで対象のもちものが表示される
function poltergeist(def, def_poke, move){
    if (move[0] == "ポルターガイスト"){
        const item = document.getElementById(def + "_item").textContent
        txt = def + "チームの　" + def_poke + "に　" + item + "が　襲いかかる！" + CR
        document.battle_log.battle_log.value += txt
    }
}

// 59.みがわりによるランク補正を変動させる効果以外の無効化
function substitute_invalidation_2(def, move){
    const def_p_con = document.battle[def + "_poke_condition"].value
    // みがわり状態であり、変化技であり、音技でなく、身代わり貫通技でない
    if (def_p_con.includes("みがわり") && move[2] == "変化" && !music_move_list.includes(move[0]) && !substitute_through_status_move_list.includes(move[0])){
        // 対象が、1体選択、相手全体、自分以外、全体
        if (move[8] == "1体選択" || move[8] == "相手全体" || move[8] == "自分以外" || move[8] == "全体"){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
    }
}

// 60.ミラーアーマー: ランクを下げる変化技の反射
function millor_armer(atk, def, def_poke, move){
    const ability = document.getElementById(def + "_ability").textContent
    if (ability == "ミラーアーマー"){
        for (let i = 0; i < rank_change_status_move_list.length; i++){
            if (move[0] == rank_change_status_move_list[i][0]){
                if (move[0] != "デコレーション" && rank_change_status_move_list[i][1] == "e"){
                    txt = def + "チームの　" + def_poke + "は　" + ability + "で　跳ね返した！" + CR
                    document.battle_log.battle_log.value += txt
                    for (let j = 2; j < rank_change_status_move_list[i].length; j++){
                        let parameter = rank_change_status_move_list[i][j][0]
                        let change = rank_change_status_move_list[i][j][1]
                        rank_change(atk, parameter, change)
                    }
                    return true
                }
            }
        }
    }
}

// 61.ほえる・ふきとばしの無効化
function roar_whirlwind(def, def_poke, move){
    if (move[0] == "ほえる" || move[0] == "ふきとばし"){
        // 1.ダイマックスによる無効化
        // 2.きゅうばんによる無効化
        if (new get(def).ability == "きゅうばん"){
            txt = def + "チームの　" + def_poke + "は　きゅうばんにより　動かない！" 
            document.battle_log.battle_log.value += txt + CR
            return true
        }
        // 3.ねをはるによる無効化
        if (new get(def).f_con.includes("ねをはる")){
            txt = def + "チームの　" + def_poke + "は　ねをはって　動かない！" 
            document.battle_log.battle_log.value += txt + CR
            return true
        }
    }
}

// 62.技の仕様による無効化(その3)
function move_specifications_invalidation_3(atk, def, atk_poke, def_poke, move, order){
    const atk_abnormal = document.getElementById(atk + "_abnormal").textContent
    const def_abnormal = document.getElementById(def + "_abnormal").textContent
    const atk_type = document.getElementById(atk + "_type").textContent
    const def_type = document.getElementById(def + "_type").textContent
    const atk_item = document.getElementById(atk + "_item").textContent
    const def_item = document.getElementById(def + "_item").textContent
    const atk_ability = document.getElementById(atk + "_ability").textContent
    const def_ability = document.getElementById(def + "_ability").textContent
    const atk_p_con = document.battle[atk + "_poke_condition"].value
    const def_p_con = document.battle[def + "_poke_condition"].value
    const atk_f_con = document.battle[atk + "_field_condition"].value
    const def_f_con = document.battle[def + "_field_condition"].value
    const atk_HP = Number(document.getElementById(atk + "_HP").textContent)
    const atk_HP_last = Number(document.getElementById(atk + "_HP_last").textContent)
    const def_HP = Number(document.getElementById(def + "_HP").textContent)
    const def_HP_last = Number(document.getElementById(def + "_HP_last").textContent)
    const def_used_move = document.battle[def + "_used_move"].value
    // 特性に関する無効化
        // なかまづくり: 対象がダイマックスしている/対象が自身と同じ特性である/自身がコピーできない特性である/対象が上書きできない特性である
        if (move[0] == "なかまづくり"){
            if (atk_ability == def_ability || entrainment_enemy_ability_list.includes(def_ability) || entrainment_self_ability_list.includes(atk_ability)){
                document.battle_log.battle_log.value += "しかし　効果がないようだ・・・" + CR
                return true
            }
        }
        // いえき: 対象がすでにとくせいなし状態である/とくせいなしにできない特性である
        if (move[0] == "いえき"){
            if (def_p_con.includes("特性なし") || gastro_acid_enemy_ability_list.includes(def_ability)){
                document.battle_log.battle_log.value += "しかし　効果がないようだ・・・" + CR
                return true
            }
        }
        // なりきり: 自身が対象と同じ特性である/対象がコピーできない特性である
        if (move[0] == "なりきり"){
            if (atk_ability == def_ability || role_play_enemy_ability_list.includes(def_ability) || role_play_self_ability_list.includes(atk_ability)){
                document.battle_log.battle_log.value += "しかし　効果がないようだ・・・" + CR
                return true
            }
        }
        // シンプルビーム: 対象がすでにたんじゅんである/上書きできない特性である
        if (move[0] == "シンプルビーム"){
            if (def_ability == "たんじゅん" || simple_beam_enemy_ability_list.includes(def_ability)){
                document.battle_log.battle_log.value += "しかし　効果がないようだ・・・" + CR
                return true
            }
        }
        // なやみのタネ: 対象が上書きできない特性である
        if (move[0] == "なやみのタネ"){
            if (worry_seed_enemy_ability_list.includes(def_ability)){
                document.battle_log.battle_log.value += "しかし　効果がないようだ・・・" + CR
                return true
            }
        }
        // スキルスワップ: 自身や対象が交換できない特性である/対象がダイマックスしている
        if (move[0] == "スキルスワップ"){
            if (skill_swap_ability_list.includes(atk_ability) || skill_swap_ability_list.includes(def_ability)){
                document.battle_log.battle_log.value += "しかし　効果がないようだ・・・" + CR
                return true
            }
        }
    // HPが満タンによる無効化
        // いやしのはどう/フラワーヒール
        if (move[0] == "いやしのはどう" || move[0] == "フラワーヒール"){
            if (def_HP == def_HP_last){
                txt = def + "チームの　" + def_poke + "は　HPが満タンだった"
                document.battle_log.battle_log.value += txt + CR
                return true
            }
        }
        // いのちのしずく
        if (move[0] == "いのちのしずく"){
            if (atk_HP == atk_HP_last){
                txt = atk + "チームの　" + atk_poke + "は　HPが満タンだった"
                document.battle_log.battle_log.value += txt + CR
                return true
            }
        }
        // ジャングルヒール: HPが満タンで、状態異常でもない
        if (move[0] == "ジャングルヒール"){
            if (atk_HP == atk_HP_last && atk_abnormal == ""){
                txt = atk + "チームの　" + atk_poke + "は　HPが満タンだった"
                document.battle_log.battle_log.value += txt + CR
                return true
            }
        }
        // かふんだんご
        // プレゼント: 回復効果が選ばれた場合
        if (move[0] == "プレゼント" && move[3] == "-"){
            if (atk_HP == atk_HP_last){
                txt = atk + "チームの　" + atk_poke + "は　HPが満タンだった"
                document.battle_log.battle_log.value += txt + CR
                return true
            } else {
                HP_change(atk, Math.floor(new get(atk).full_HP / 4), "+")
                return true
            }
        }
        // 自分の体力を回復する技(じこさいせい等)
        if (move[0] == "じこさいせい" || move[0] == "タマゴうみ" || move[0] == "ミルクのみ" || move[0] == "なまける" || move[0] == "かいふくしれい" || move[0] == "はねやすめ"){
            if (atk_HP == atk_HP_last){
                txt = atk + "チームの　" + atk_poke + "は　HPが満タンだった"
                document.battle_log.battle_log.value += txt + CR
                return true
            }
        }
    // ステータスに関する無効化
        // はらだいこ: 自身がHP半分以下である/すでにランク+6である
        if (move[0] == "はらだいこ"){
            const A_rank = Number(document.getElementById(atk + "_rank_A").textContent)
            if (atk_HP_last < Math.floor(atk_HP / 2) || A_rank == 6){
                document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
                return true
            }
        }
        // フラワーガード/たがやす: 対象がくさタイプでない（たがやすの時は地面にいる必要がある）
        if (move[0] == "フラワーガード" && (!atk_type.includes("くさ") && !def_type.includes("くさ"))){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
        if (move[0] == "たがやす"){
            if (!(atk_type.includes("くさ") && grounded_check(atk)) && !(def_type.includes("くさ") && grounded_check(def))){
                document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
                return true
            }
        }
        // じばそうさ/アシストギア: 対象の特性がプラスかマイナスでない
        if (move[0] == "じばそうさ" || move[0] == "アシストギア"){
            if (!(atk_ability == "プラス" || atk_ability == "マイナス")){
                document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
                return true
            }
        }
        // ちからをすいとる: 対象のこうげきが-6である
        if (move[0] == "ちからをすいとる"){
            const A_rank = Number(document.getElementById(atk + "_rank_A").textContent)
            if (A_rank == -6){
                document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
                return true
            }
        }
        // いばる/おだてる: 対象のランクが+6でありこんらんしている
        if (move[0] == "いばる"){
            const A_rank = Number(document.getElementById(def + "_rank_A").textContent)
            if (A_rank == 6 && def_p_con.includes("こんらん")){
                document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
                return true
            }
        } else if (move[0] == "おだてる"){
            const C_rank = Number(document.getElementById(def + "_rank_C").textContent)
            if (C_rank == 6 && def_p_con.includes("こんらん")){
                document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
                return true
            }
        }
        // ひっくりかえす: 対象のランクが変化していない
        if (move[0] == "ひっくりかえす"){
            let check = 0
            for (const i of ["A", "B", "C", "D", "S", "accuracy", "evasiveness"]){
                let rank = Number(document.getElementById(def + "_rank_" + i).textContent)
                if (rank == 0){
                    check += 1
                }
            }
            if (check == 7){
                document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
                return true
            }
        }
    // タイプによる無効化
        // テクスチャー: 現在のタイプが一番上の技と同じ
        if (move[0] == "テクスチャー"){
            const move_0 = document.getElementById(atk + "_move_0").textContent
            if (atk_type.includes(move_search_by_name(move_0)[1]) || move_0 == "テクスチャー" || (move_0 == "のろい" && !atk_type.includes("ゴースト") && atk_type.includes("ノーマル"))){
                document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
                return true
            }
        }
        // テクスチャー2: 対象が行動していない/最後に使った技がわるあがきである
        if (move[0] == "テクスチャー2"){
            if (def_used_move == "" || def_used_move == "わるあがき"){
                document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
                return true
            }
        }
        // ミラータイプ: すでに対象と同じタイプである
        if (move[0] == "ミラータイプ" && (atk_type == def_type)){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
        // みずびたし/まほうのこな: 対象がみず単タイプである/エスパー単タイプである | 対象がアルセウスかシルヴァディである
        if (move[0] == "みずびたし" && (def_type == "みず" || def_poke == "アルセウス" || def_poke == "シルヴァディ")){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        } else if (move[0] == "まほうのこな" && (def_type == "エスパー" || def_poke == "アルセウス" || def_poke == "シルヴァディ")){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
        // ハロウィン/もりののろい: 対象がゴーストタイプを持つ/くさタイプを持つ
        if (move[0] == "ハロウィン" && def_type.includes("ゴースト")){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        } else if (move[0] == "もりののろい" && def_type.includes("くさ")){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
    // 特殊なメッセージが出る技の失敗
        // アロマセラピー/いやしのすず: 状態異常の味方がいない
        if (move[0] == "アロマセラピー" || move[0] == "いやしのすず"){
            if (atk_abnormal == ""){
                document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
                return true
            }
        }
        // おちゃかい: 場にきのみを持つポケモンがいない
        if (move[0] == "おちゃかい" && !(berry_item_list.includes(atk_item) || berry_item_list.includes(def_item))){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
    // 重複による無効化
        // 天気/フィールド/場の状態を発動させる技: すでに同じ状態になっている
        for (let i = 0; i < field_condition_move_list.length; i++){
            if (move[0] == field_condition_move_list[i][0]){
                let position = field_condition_move_list[i][2]
                if (position == "e"){
                    if (def_f_con.includes(field_condition_move_list[i][1])){
                        document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
                        return true
                    }
                } else {
                    if (atk_f_con.includes(field_condition_move_list[i][1])){
                        document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
                        return true
                    }
                }
            }
        }
        // 設置技: すでに最大まで仕掛けられている
        if (move[0] == "まきびし" && def_f_con.includes("まきびし　3回目")){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        } else if (move[0] == "どくびし" && def_f_con.includes("どくびし　2回目")){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
        // にげられない状態にする技: すでににげられない状態である
        if (move[0] == "くろいまなざし" || move[0] == "クモのす" || move[0] == "とおせんぼう" || move[0] == "たこがため"){
            if (def_p_con.includes("逃げられない")){
                document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
                return true
            }
        }
        // アクアリング: 自身がすでにアクアリング状態である
        if (move[0] == "アクアリング" && atk_p_con.includes("アクアリング")){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
        // きあいだめ: 自身がすでにきゅうしょアップ状態である
        if (move[0] == "きあいだめ" && atk_p_con.includes("きゅうしょアップ")){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
        // かいふくふうじ: 対象がすでにかいふくふうじ状態である
        if (move[0] == "かいふくふうじ" && def_p_con.includes("かいふくふうじ")){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
        // さしおさえ: 対象がすでにさしおさえ状態である　（wikiにない）
        if (move[0] == "さしおさえ" && (def_p_con.includes("さしおさえ") || def_item == "")){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
        // ちょうはつ: 対象がすでにちょうはつ状態である
        if (move[0] == "ちょうはつ" && def_p_con.includes("ちょうはつ")){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
        // テレキネシス: 対象がすでにテレキネシス状態である　（wikiにない）
        if (move[0] == "テレキネシス" && def_p_con.includes("テレキネシス")){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
        // でんじふゆう: 自身がすでにでんじふゆう状態である (うちおとす状態である wikiにない)
        if (move[0] == "でんじふゆう" && (atk_p_con.includes("でんじふゆう") || atk_p_con.includes("うちおとす"))){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
        // ねがいごと: 前のターンのねがいごとの効果が残っている
        if (move[0] == "ねがいごと" && atk_f_con.includes("ねがいごと")){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
        // のろい(呪い): 対象がすでにのろい状態である
        if (move[0] == "のろい" && def_p_con.includes("のろい")){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
        // ロックオン/こころのめ: 自身がすでにロックオン状態である
        if ((move[0] == "ロックオン" || move[0] == "こころのめ") && atk_p_con.includes("ロックオン")){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
    // その他の無効化
        // 天気を変える技: おおひでり/おおあめ/デルタストリームにより変えられない
        if (atk_f_con.includes("おおひでり") || atk_f_con.includes("おおあめ") || atk_f_con.includes("らんきりゅう")){
            if (move[0] == "にほんばれ" || move[0] == "あまごい" || move[0] == "すなあらし" || move[0] == "あられ"){
                document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
                return true
            }
        }
        // コートチェンジ: 入れ替える場の状態が無い
        if (move[0] == "コートチェンジ"){
            let check = 0
            for (let i = 0; i < court_change_list.length; i++){
                if (atk_f_con.includes(court_change_list[i]) || def_f_con.includes(court_change_list[i])){
                    check += 1
                }
            }
            if (check == 0){
                document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
                return true
            }
        }
        // アンコール: 対象が技を使用していない/技のPPが残っていない/アンコールできない技/相手がダイマックス/すでにアンコール状態
        let now_PP = 0
        for (let i = 0; i < 4; i++){
            if (document.getElementById(def + "_move_" + i).textContent == def_used_move){
                now_PP = Number(document.getElementById(def + "_move_" + i + "_last").textContent)
            }
        }
        if (move[0] == "アンコール" && (def_used_move == "" || now_PP == 0 || def_used_move == "アンコール" || def_p_con.includes("アンコール"))){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
        // かなしばり: 対象が技を使用していない/最後のわざがわるあがき/ダイマックスわざ/すでにかなしばり状態
        if (move[0] == "かなしばり" && (def_used_move == "" || def_used_move == "わるあがき" || def_p_con.includes("かなしばり"))){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
        // ものまね: 対象が技を使用していない/ものまねできない技
        if (move[0] == "ものまね"){
            if (def_used_move == "" || mimic_move_list.includes(def_used_move)){
                document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
                return true
            } else {
                for (let i = 0; i < 4; i++){
                    if (def_used_move == document.getElementById(def + "_move_" + i)){
                        document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
                        return true
                    }
                }
            }
        }
        // スケッチ: 対象が技を使用していない/スケッチできない技
        if (move[0] == "スケッチ" && (def_used_move == "" || def_used_move == "スケッチ" || def_used_move == "おしゃべり" || def_used_move == "わるあがき")){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
        // リサイクル：持ち物を持っている、リサイクルできる道具がない(wikiにない)
        if (move[0] == "リサイクル"){
            if (new get(atk).item != ""){
                document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
                return true
            }
            for (let i = 0; i < 3; i++){
                if (document.getElementById(atk + "_" + i + "_existence").textContent == "戦闘中"){
                    if (document.getElementById(atk + "_" + i + "_recycle").textContent == ""){
                        document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
                        return true
                    }
                }
            }
        }
        // さいはい: さいはいできない技
        // おさきにどうぞ/さきおくり/そうでん/てだすけ: 対象がすでに行動している
        // バトンタッチ/いやしのねがい/みかづきのまい: 交代できる味方がいない
        if (!(document.getElementById(def + "_0_existence").textContent == "控え" || document.getElementById(def + "_1_existence").textContent == "控え" || document.getElementById(def + "_2_existence").textContent == "控え") 
        && (move[0] == "バトンタッチ" || move[0] == "いやしのねがい" || move[0] == "みかづきのまいし")){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
        // ほえる/ふきとばし: 交代できる相手がいない
        if (!(document.getElementById(def + "_0_existence").textContent == "控え" || document.getElementById(def + "_1_existence").textContent == "控え" || document.getElementById(def + "_2_existence").textContent == "控え") 
        && (move[0] == "ほえる" || move[0] == "ふきとばし")){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
        // てだすけ/サイドチェンジ/アロマミスト/てをつなぐ: 味方がいない
        // サイコシフト
            // 1.自身が状態異常でない/対象がすでに状態異常である
            if (move[0] == "サイコシフト" && (atk_abnormal == "" || def_abnormal != "")){
                document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
                return true
            }
            // 2.対象が状態異常に耐性を持っている
        // じょうか: 対象が状態異常でない
        if (move[0] == "じょうか" && def_abnormal == ""){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
        // みがわり
        if (move[0] == "みがわり"){
            // 1.自身がすでにみがわり状態である
            if (atk_p_con.includes("みがわり")){
                document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
                return true
            }
            // 2.自身に技を使う体力が残っていない
            if (atk_HP_last <= Math.floor(atk_HP / 4)){
                document.battle_log.battle_log.value += "しかし　みがわりを出す　体力が残っていなかった・・・" + CR
                return true
            }
        }
            
        // へんしん: 自身/対象がすでにへんしん状態である
        if (move[0] == "へんしん" && (atk_p_con.includes("へんしん") || def_p_con.includes("へんしん"))){
            document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
            return true
        }
        // トリック/すりかえ: どちらも道具を持っていない/どちらかの道具が交換できない
        if (move[0] == "トリック" || move[0] == "すりかえ"){
            let check = 0
            for (const team of [atk, def]){
                if ((new get(team).name == "シルヴァディ" && new get(team).item.includes("メモリ")) 
                || (new get(team).name == "アルセウス" && new get(team).item.includes("プレート")) 
                || (new get(team).name.includes("ザシアン") && new get(team).item　== "くちたけん") 
                || (new get(team).name.includes("ザマゼンタ") && new get(team).item　== "くちたたて")){
                    check += 1
                }
            }
            if (check > 0){
                document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
                return true
            }
        }
        // ふしょくガス: 溶かせない道具がある
        if (move[0] == "ふしょくガス"){
            if ((def_poke.includes("ギラティナ") && def_item == "はっきんだま") 
            || (def_poke.includes("ゲノセクト") && def_item.includes("カセット")) 
            || (def_poke.includes("シルヴァディ") && def_item.includes("メモリ")) 
            || (def_poke.includes("ザシアン") && def_item == "くちたけん") 
            || (def_poke.includes("ザマゼンタ") && def_item == "くちたたて")){
                document.battle_log.battle_log.value += "しかし　うまく決まらなかった・・・" + CR
                return true
            }
        }
}

// 63.アロマベール: かなしばり/アンコール/ちょうはつ状態の無効化
function aloma_veil_invalidation(def, move){
    const ability = document.getElementById(def + "_ability").textContent
    if (ability == "アロマベール"){
        if (move[0] == "メロメロ" || move[0] == "いちゃもん" || move[0] == "かいふくふうじ"){
            txt = def + "チームの　" + def_poke + "は　" + ability + "に　守られている！" 
            document.battle_log.battle_log.value += txt + CR
            return true
        }
    }
}




function weight_search(team){
    let weight = poke_search(new get(team).name)[14]
    let num = 0
    if (new get(team).p_con.includes("ボディパージ")){
        for (let i = 0; i < new get(team).p_len; i++){
            if (new get(team).p_list[j].includes("ボディパージ")){
                num = Number(new get(team).p_list[i].replace(/[^0-9]/g, ""))
            }
        }
    }
    weight -= num * 100
    if (new get(team).item == "かるいし" || new get(team).ability == "ライトメタル"){
        weight = Math.round(weight * 5) / 10
    }
    if (new get(team).ability == "ヘヴィメタル"){
        weight *= 2
    }
    return Math.max(weight, 0.1)
}

function grounded_check(team){
    const type = document.getElementById(team + "_type").textContent
    const ability = document.getElementById(team + "_ability").textContent
    const item = document.getElementById(team + "_item").textContent
    const p_con = document.battle[team + "_poke_condition"].value
    const f_con = document.battle[team + "_field_condition"].value
    if (!(type.includes("ひこう") || ability == "ふゆう" || item == "ふうせん" || p_con.includes("でんじふゆう") || p_con.includes("テレキネシス"))){
        return true
    } else if (p_con.includes("ねをはる") || p_con.includes("うちおとす") || f_con.includes("じゅうりょく") || item == "くろいてっきゅう" || p_con.includes("はねやすめ")){
        return true
    } else {
        return false
    }
}

function compatibility_check(atk, def, move){
    let type = new get(def).type
    let compatibility_rate = 1.0
    if ((new get(atk).ability == "きもったま" || new get(def).p_con.includes("みやぶられている")) && type.includes("ゴースト") && (move[1] == "ノーマル" || move[0] == "かくとう")){
        type = type.replace("ゴースト", "")
    }
    if (new get(def).p_con.includes("ミラクルアイ") && type.includes("あく") && move[1] == "エスパー"){
        type = type.replace("あく", "")
    }

    for (let i = 0; i < 18; i++){
        if (move[1] == compatibility[0][i]){
            for (let j = 0; j < 18; j++){
                if (type.includes(compatibility[0][j])){
                    if (new get(def).item == "ねらいのまと" && compatibility[i+1][j] == 0){
                        compatibility_rate *= 1
                    } else {
                        compatibility_rate *= compatibility[i+1][j]
                    }
                }
            }
        }
    }

    if (new get(def).p_con.includes("タールショット") && move[1] == "ほのお"){
        compatibility_rate *= 2
    }
    if (move[0] == "フライングプレス"){
        for (let j = 0; j < 18; j++){
            if (type.includes(compatibility[0][j])){
                compatibility_rate *= compatibility[10][j]
            }
        }
    }
    if (move[0] == "フリーズドライ" && type.includes("みず")){
        compatibility_rate *= 4
    }
    return compatibility_rate
}

function turn_log(){
    const battle_log = document.battle_log.battle_log.value
    const log_list = battle_log.split("\n")
    const log_length = log_list.length
    let index = []
    for (let i = 0; i < log_length; i++){
        if (log_list[log_length - 1 - i].includes("ターン目")){
            index.push(log_length - 1 - i)
            if (index.length == 2){
                break
            }
        }
    }

    return log_list.slice(index[1], index[0])
}

function this_turn_log(){
    const battle_log = document.battle_log.battle_log.value
    const log_list = battle_log.split("\n")
    const log_length = log_list.length
    let index = []
    for (let i = 0; i < log_length; i++){
        if (log_list[log_length - 1 - i].includes("ターン目")){
            index.push(log_length - 1 - i)
            if (index.length == 2){
                break
            }
        }
    }

    return log_list.slice(index[0])
}

function priority_degree(team, move){
    let priority = 0
    for (let i = 0; i < priority_list.length; i++){
        if (move[0] == priority_list[i][0]){
            priority += priority_list[i][1]
        }
    }
    if ((new get(team).ability == "いたずらごころ" && move[2] == "変化") 
    || (move[0] == "グラススライダー" && new get(team).f_con.includes("グラスフィールド") && grounded_check(team))
    || (new get(team).ability == "はやてのつばさ" && move[1] == "ひこう" && new get(team).last_HP == new get(team).full_HP)){
        priority += 1
    }
    if (new get(team).ability == "ヒーリングシフト" && recoil_move_list.includes(move[0])){
        priority += 3
    }

    return priority
}