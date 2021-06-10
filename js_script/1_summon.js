const afn = require("./function")
const bfn = require("./base_function")
const cfn = require("./law_function")
const moveEff = require("./move_effect")
const abiEff = require("./ability_effect")

function turn_start(){
    const current = document.battle_log.battle_log.value
    const num = (current.match( /ターン目/g ) || []).length + 1
    txt = "---------- " + num + "ターン目 ----------" + CR
    document.battle_log.battle_log.value += txt
}



// ポケモンを戦闘に出す
exports.pokeReplace = function(team, enemy){
    const num = team.data.command - 4
    // 各パラメータを記述
    for (const parameter of ["name", "sex", "level", "type", "ability", "item", "abnormal", "nature", "full_HP", "last_HP", "A_AV", "B_AV", "C_AV", "D_AV", "S_AV", 
        "move_0", "move_1", "move_2", "move_3", "PP_0", "PP_1", "pp_2", "PP_3", "last_0", "last_1", "last_2", "last_3"]){
            team.con[parameter] = team["poke" + num][parameter]
        }
    for (const parameter of ["A_rank", "B_rank", "C_rank", "D_rank", "S_rank", "X_rank", "Y_rank"]){
        team.con[parameter] = 0
    }
    // 技がないボタンを無効化
    for (let i = 0; i < 4; i++){
        if (team.con["move_" + i] == ""){
            team.data["radio_" + i] = true
        }
    }
    team["poke" + num].life = "戦闘中"
    team.data["radio_" + team.data.command] = true

    // ミミッキュの姿
    if (team["poke" + team.data.command].form == "ばけたすがた"){
        team.con.p_con += "ばけたすがた" + CR
    } else if (team["poke" + team.data.command].form == "ばれたすがた"){
        team.con.p_con += "ばれたすがた" + CR
    }
    // モルペコの模様
    if (team.con.ability == "はらぺこスイッチ"){
        team.con.p_con += "まんぷくもよう" + CR
    }

    log += team.con.TN + "　は　" + team.con.name + "　を　繰り出した　！" + CR

    return

    // メガ進化ボタンの有効化・無効化
    if (document.getElementById(team + "_mega_text").textContent == "メガ進化"){
        for (let i = 0; i < mega_stone_item_list.length; i++){
            if (new get(team).item == mega_stone_item_list[i][0] && new get(team).name == mega_stone_item_list[i][1]){
                document.getElementById(team + "_mega").disabled = false
            }
        }
    }

    // Z技ボタンの有効化
    if (document.getElementById(team + "_Z_text").textContent == "Z技" && new get(team).item.includes("Z")){
        document.getElementById(team + "_Z_move").disabled = false
    }


    // ランク変化のリセット
    for (let i of ["A", "B", "C", "D", "S", "accuracy", "evasiveness"]){
        document.getElementById(team + "_rank_" + i).textContent = 0
    }
    // バトンタッチの時、ランク変化を受け継ぐ
    if (new get(team).p_con.includes("バトンタッチ")){
        for (let i = 0; i < new get(team).p_len; i++){
            if (new get(team).p_list[i].includes("バトンタッチ")){
                const rank = new get(team).p_list[i].slice(7).split("/")
                const para_rank = ["_rank_A", "_rank_B", "_rank_C", "_rank_D", "_rank_S", "_rank_accuracy", "_rank_evasiveness"]
                for (let j = 0; j < 7; j++){
                    document.getElementById(team + para_rank[j]).textContent = rank[j]
                }
            }
        }
        condition_remove(team, "poke", "バトンタッチ")
    }



    // ほおばる：きのみを持っていなければ選択できない
    for (let i = 0; i < 4; i++){
        if (document.getElementById(team + "_move_" + i).textContent == "ほおばる" && !berry_item_list.includes(new get(team).item)){
            document.getElementById(team + "_radio_" + i).disabled = true
            document.getElementById(team + "_radio_" + i).checked = false
        }
    }

    // ゲップ：きのみを使用し、備考欄に「ゲップ」の文字があれば使用可能
    for (let i = 0; i < 4; i++){
        if (document.getElementById(team + "_move_" + i).textContent == "ゲップ" && document.getElementById(id + "_belch").textContent != "ゲップ"){
            document.getElementById(team + "_radio_" + i).disabled = true
            document.getElementById(team + "_radio_" + i).checked = false
        }
    }

    // とつげきチョッキ：変化技を選択不能に
    if (document.getElementById(team + "_item").textContent == "とつげきチョッキ"){
        for (let i = 0; i < 4; i++){
            if (document.getElementById(team + "_move_" + i).textContent != ""){
                if (move_search_by_name(document.getElementById(team + "_move_" + i).textContent)[2] == "変化"){
                    document.getElementById(team + "_radio_" + i).disabled = true
                }
            }
        }
    }

    // 特性「かがくへんかガス」のポケモンがいる時
    if (new get(enemy).ability == "かがくへんかガス"){
        document.battle[team + "_poke_condition"].value += "かがくへんかガス：" + new get(team).ability + CR
        document.getElementById(team + "_ability").textContent = ""
    }
    // マジックルーム：持ち物を空欄にする
    if (new get(team).f_con.includes("マジックルーム")){
        document.getElementById(team + "_item").textContent = ""
    }




    for (let i = 0; i < 3; i++){
        if (document.getElementById(team + "_" + i + "_existence").textContent == "ひんし"){
            document.getElementById(team + "_" + i + "_button").disabled = true
        }
    }
}


// 戦闘に出す時の特性の発動 summon_poke
exports.activAbility = function(user1, user2, team, log){
    // num は、戦闘に出すポケモンの数
    if (team == "both"){
        // 素早さ判定
        let order = afn.speedCheck(user1.con, user2.con)
        if (order[0] == 1){
            order = [user1, user2]
        } else {
            order = [user2, user1]
        }
        // 1.かがくへんかガスの発動
        neutralizing_gas(order[0], order[1], log)
        neutralizing_gas(order[1], order[0], log)
        // 2.きんちょうかん/じんばいったいの発動
        unnerve(order[0], order[1], log)
        unnerve(order[1], order[0], log)
        // 3.1~2.状態/ 3.特性/ 4.持ち物の発動
        condition_ability_item_action(order[0], order[1], log)
        condition_ability_item_action(order[1], order[0], log)
        // 4.リミットシールド/ぎょぐん/ゲンシカイキによるフォルムチェンジ[2][3]
        ability_form_change(order[0], order[1], log)
        ability_form_change(order[1], order[0], log)
        // 5.エレキシード/グラスシード/ミストシード/サイコシード/ルームサービス
        seed_service(order[0], order[1], log)
        seed_service(order[1], order[0], log)
        // 6.フラワーギフト/てんきや/アイスフェイス
        // 7.しろいハーブ
        white_herb(order[0], log)
        white_herb(order[1], log)
        // 8.だっしゅつパックによる交代、交代先の繰り出し
        eject_pack(order[0], order[1], log)
        eject_pack(order[1], order[0], log)
    } else {
        if (team == 1){
            team = user1
            enemy = user2
        } else if (team == 2){
            team = user2
            enemy = user1
        }
        // 1.かがくへんかガスの発動
        neutralizing_gas(team, enemy, log)
        // 2.きんちょうかん/じんばいったいの発動
        unnerve(team, enemy, log)
        // 3.1~2.状態/ 3.特性/ 4.持ち物の発動
        condition_ability_item_action(team, enemy, log)
        // 4.リミットシールド/ぎょぐん/ゲンシカイキによるフォルムチェンジ[2][3]
        ability_form_change(team, enemy, log)
        // 5.エレキシード/グラスシード/ミストシード/サイコシード/ルームサービス
        seed_service(team, enemy, log)
        // 6.フラワーギフト/てんきや/アイスフェイス
        // 7.しろいハーブ
        white_herb(team, log)
        // 8.だっしゅつパックによる交代、交代先の繰り出し
        eject_pack(team, enemy, log)
    }
        
    
        // すばやさが高い順に発動する。トリックルームの影響を受ける。
        // 6-2~3において、設置技や特性の効果できのみ/きのみジュース/シード系アイテム、アイスフェイスが発動する場合、他の処理より優先して即座に発動する。
        // 6-2において、設置技の効果でポケモンがひんしになった場合、6-3以降の特性の効果は発動しない。
        // ターン終了時、ひんしになったポケモンの代わりを繰り出す場合、2までお互いが完了してから3以降の処理に進む。入れ替えルールでポケモンを入れ替えるときも同じ。
        // バトルの途中、ポケモンを交代させたときは、上記全ての行動が終わってから他のポケモンの行動が行われる。
        // 複数のポケモンを同時に後出しする場合は、同時に場に出たとはみなされない。全ての手順を終えてから次の交代が行われる。
    
        // ゲンシカイキするときにひでり/あめふらしは発動しない。
}
    

// 1.かがくへんかガスの発動
function neutralizing_gas(team, enemy, log){
    const list = abiEff.neutralizing()
    if (team.con.ability == "かがくへんかガス"){
        log += "あたりに　かがくへんかガスが　充満した！" + CR
        if (!list.includes(enemy.con.ability) && !enemy.con.p_con.includes("かがくへんかガス")){
            bfn.conditionRemove(enemy.con.p_con, "スロースタート：")
            enemy.con.p_con += "かがくへんかガス：" + enemy.con.ability + CR
            enemy.con.ability = ""
        }
    }
}

// 2.きんちょうかん/じんばいったいの発動
function unnerve(team, enemy, log){
    if (team.con.ability == "きんちょうかん"){
        log = enemy.con.TN + "　の　ポケモンは　緊張して　きのみが　食べられなくなった！" + CR
    } else if (team.con.ability == "じんばいったい"){
        log += team.con.TN + "　の　" + team.con.name + "　は　ふたつの　特性を　あわせ持つ！" + CR
        log += enemy.con.TN + "　の　ポケモンは　緊張して　きのみが　食べられなくなった！" + CR
    }
}

// 3.1~2.状態/ 3.特性/ 4.持ち物の発動
function condition_ability_item_action(team, enemy, log){
    let con = team.con
    // 1.いやしのねがい/みかづきのまい/Zおきみやげ/Zすてゼリフによる回復
    if (con.f_con.includes("いやしのねがい") && (con.last_HP < con.full_HP || con.abnormal != "")){
        log += con.TN + "　の　いやしのねがいが　発動した！" + CR
        con.last_HP = con.full_HP
        con.abnormal = ""
        bfn.conditionRemove(con.f_con, "いやしのねがい")
    }
    if (con.f_con.includes("みかづきのまい") && (con.last_HP < con.full_HP || con.abnormal != "")){
        let check = 0
        for (let i = 0; i < 4; i++){
            if (con["last_" + i] == con["PP_" + i]){
                check += 1
            }
        }
        if (check != 4){
            log += con.TN + "　の　みかづきのまいが　発動した！" + CR
            con.last_HP = con.full_HP
        con.abnormal = ""
            for (let i = 0; i < 4; i++){
                con["last_" + i] = con["PP_" + i]
            }
            bfn.conditionRemove(con.f_con, "みかづきのまい")
        }
    }
    if ((con.f_con.includes("Zおきみやげ") || con.f_con.includes("Zすてゼリフ")) && con.last_HP < con.full_HP){
        log += con.TN + "　の　Zおきみやげが　発動した！" + CR
        con.last_HP = con.full_HP
        bfn.conditionRemove(con.f_con, "Zおきみやげ")
        bfn.conditionRemove(con.f_con, "Zすてゼリフ")
    }
    // 2.設置技: 技が使用された順に発動
    if (con.item != "あつぞこブーツ"){
        for (let i = 0; i < con.f_con.split("\n").length - 1; i++){
            if (con.f_con.split("\n")[i].includes("まきびし") && cfn.groundedCheck(con)){
                let num = Number(con.f_con.split("\n")[i].slice(5, 6))
                let damage = Math.floor(con.full_HP / (10 - (num * 2)))
                afn.HPchangeMagic(team, damage, "-", "まきびし", log)
            } else if (con.f_con.split("\n")[i].includes("どくびし") && cfn.groundedCheck(con)){
                let num = Number(con.f_con.split("\n")[i].slice(5, 6))
                if (num == 1){
                    afn.makeAbnormal(team, enemy, "どく", 100, "どくびし", log)
                } else if (num == 2){
                    afn.makeAbnormal(team, enemy, "もうどく", 100, "どくびし", log)
                }
            } else if (con.f_con.split("\n")[i].includes("ステルスロック")){
                let rate = cfn.compatibilityCheck(team, enemy, cfn.moveSearchByName("アクセルロック"))
                let damage = Math.floor(con.full_HP * rate / 8)
                afn.HPchangeMagic(team, damage, "-", "ステルスロック", log)
            } else if (con.f_con.split("\n")[i].includes("ねばねばネット") && cfn.groundedCheck(con)){
                afn.rankChange(team, "S", -1, 100, "ねばねばネット", log)
            } else if (con.f_con.split("\n")[i].includes("キョダイコウジン")){
                let rate = cfn.compatibilityCheck(team, enemy, cfn.moveSearchByName("バレットパンチ"))
                let damage = Math.floor(con.full_HP * rate / 8)
                afn.HPchangeMagic(team, damage, "-", "キョダイコウジン", log)
            }
        }
    }
    if (con.type.includes("どく") && cfn.groundedCheck(con) && con.f_con.includes("どくびし")){
        log += "どくびしが　消え去った！" + CR
        cfn.conditionRemove(con.f_con, "どくびし")
    }
    // 3.場に出たときに発動する特性
    if (con.ability == "あめふらし" && !con.f_con.includes("あめ") && !con.f_con.includes("おおひでり") && !con.f_con.includes("らんきりゅう")){
        log += con.TN + "　の　" + con.name + "の　あめふらし！" + CR
        bfn.allFieldStatus(team, enemy, cfn.moveSearchByName("あまごい"), log)
    } else if (con.ability == "いかく"){
        log += con.TN + "　の　" + con.name + "の　いかく！" + CR
        if (enemy.con.ability == "ミラーアーマー"){
            if (!con.p_con.includes("みがわり")){
                log += enemy.con.TN + "　の　" + enemy.con.name + "　の　ミラーアーマーが　発動した！" + CR
                afn.rankChange(team, "A", -1, 100, "いかく", log)
            }
        } else {
            if (!(enemy.con.p_con.includes("みがわり") || enemy.con.ability == "きもったま" || enemy.con.ability == "せいしんりょく" || enemy.con.ability == "どんかん" || enemy.con.ability == "マイペース")){
                afn.rankChange(enemy, "A", -1, 100, "いかく", log)
                if (enemy.con.ability == "びびり"){
                    afn.rankChange(enemy, "S", 1, 100, "びびり", log)
                }
            }
            if (enemy.con.item == "ビビリだま" && enemy.con.S_rank < 6){
                afn.rankChange(enemy, "S", 1, 100, "ビビリだま", log)
                cfn.setRecycle(enemy)
            }
        }
    } else if (con.ability == "エアロック" || con.ability == "ノーてんき"){
        log += "天気の影響がなくなった" + CR
    } else if (con.ability == "エレキメイカー" && !con.f_con.includes("エレキフィールド")){
        log += con.TN + "　の　" + con.name + "の　エレキメイカー！" + CR
        bfn.allFieldStatus(team, enemy, cfn.moveSearchByName("エレキフィールド"), log)
    } else if (con.ability == "オーラブレイク"){
        log += con.TN + "　の　" + con.name + "の　オーラブレイクが発動している！" + CR
    } else if (con.ability == "おみとおし" && con.item != ""){
        log += con.TN + "　の　" + con.name + "の　おみとおし！" + CR
        log += enemy.con.TN + "　の　" + enemy.con.name + "の　" + enemy.con.item + "を　お見通しだ！" + CR
    } else if (con.ability == "おわりのだいち" && !con.f_con.includes("おおひでり")){
        log += con.TN + "　の　" + con.name + "の　おわりのだいち！" + CR
        log += "日差しがとても強くなった！" + CR
        for (const f_con of [team.con.f_con, enemy.con.f_con]){
            cfn.conditionRemove(f_con, "あめ")
            cfn.conditionRemove(f_con, "にほんばれ")
            cfn.conditionRemove(f_con, "すなあらし")
            cfn.conditionRemove(f_con, "あられ")
            cfn.conditionRemove(f_con, "らんきりゅう")
            f_con += "にほんばれ（おおひでり）" + CR
        }
    } else if (con.ability == "かたやぶり" || con.ability == "ターボブレイズ" || con.ability == "テラボルテージ"){
        log += con.TN + "　の　" + con.name + "は　" + con.ability + "だ！" + CR
    } else if (con.ability == "かわりもの" && !enemy.con.p_con.includes("みがわり") && !enemy.con.p_con.includes("へんしん")){
        log += con.TN + "　の　" + con.name + "の　かわりもの！" + CR
        for (const parameter of ["sex", "type", "nature", "ability", 
        "A_AV", "B_AV", "C_AV", "D_AV", "S_AV", 
        "A_rank", "B_rank", "C_rank", "D_rank", "S_rank", "X_rank", "Y_rank", 
        "move_0", "move_1", "move_2", "move_3"]){
            con[parameter] = enemy.con[parameter]
        }
        for (let i = 0; i < 4; i++){
            if (con["move_" + i] != ""){
                con["PP_" + i] = 5
                con["last_" + i] = 5
                team.data["radio_" + i] = false
            } else {
                con["PP_" + i] = ""
                con["last_" + i] = ""
                team.data["radio_" + i] = true
            }
            break
        }
        con.p_con += "へんしん" + CR
        cfn.conditionRemove(con.p_con, "きゅうしょアップ")
        cfn.conditionRemove(con.p_con, "とぎすます")
        cfn.conditionRemove(con.p_con, "キョダイシンゲキ")
        cfn.conditionRemove(con.p_con, "ボディパージ")
        for (let i = 0; i < enemy.con.p_con.split("\n").length - 1; i++){
            if (enemy.con.p_con.split("\n")[i].includes("きゅうしょアップ") 
            || enemy.con.p_con.split("\n")[i].includes("とぎすます") 
            || enemy.con.p_con.split("\n")[i].includes("キョダイシンゲキ") 
            || enemy.con.p_con.split("\n")[i].includes("ボディパージ")){
                con.p_con += enemy.con.p_con.split("\n")[i] + CR
            }
        }
        log += enemy.con.name + "に　へんしんした" + CR
    } else if (con.ability == "きけんよち"){
        let check = 0
        const list = moveEff.oneShot()
        for (let i = 0; i < 4; i++){
            if (con["move_" + i] != ""){
                let move = cgn.moveSearchByName(con["move_" + i])
                if ((bfn.compatibilityCheck(team, enemy, move) > 1 && move[2] != "変化") || list.includes(move[0])){
                    check += 1
                }
            }
        }
        if (check > 0){
            log += con.TN + "　の　" + con.name + "は　身震いした！" + CR
        }
    } else if (con.ability == "きみょうなくすり"){
        
    } else if (con.ability == "グラスメイカー" && !con.f_con.includes("グラスフィールド")){
        log += con.TN + "　の　" + con.name + "の　グラスメイカー！" + CR
        bfn.allFieldStatus(team, enemy, cfn.moveSearchByName("グラスフィールド"), log)
    } else if (con.ability == "サイコメイカー" && !con.f_con.includes("サイコフィールド")){
        log += con.TN + "　の　" + con.name + "の　サイコメイカー！" + CR
        bfn.allFieldStatus(team, enemy, cfn.moveSearchByName("サイコフィールド"), log)
    } else if (con.ability == "スロースタート"){
        log += con.TN + "　の　" + con.name + "の　スロースタート！" + CR
        log += con.TN + "　の　" + con.name + "は　調子が上がらない！" + CR
        con.p_con += "スロースタート　5/5" + CR
    } else if (con.ability == "すなおこし" && !con.f_con.includes("すなあらし") && !con.f_con.includes("おおあめ") && !con.f_con.includes("おおひでり") && !con.f_con.includes("らんきりゅう")){
        log += con.TN + "　の　" + con.name + "の　すなおこし！" + CR
        bfn.allFieldStatus(team, enemy, cfn.moveSearchByName("すなあらし"), log)
    } else if (con.ability == "ぜったいねむり"){
        log += con.TN + "　の　" + con.name + "は　夢うつつの状態！" + CR
    } else if (con.ability == "ダークオーラ"){
        log += con.TN + "　の　" + con.name + "の　ダークオーラが発動している！" + CR
    } else if (con.ability == "ダウンロード"){
        let B_AV = 0
        let D_AV = 0
        if (enemy.con.B_rank > 0){
            B_AV = Math.floor((enemy.con.B_AV * (2 + enemy.con.B_rank)) / 2)
        } else {
            B_AV = Math.floor((enemy.con.B_AV * 2) / (2 - enemy.con.B_rank))
        }
        if (enemy.con.D_rank > 0){
            D_AV = Math.floor((enemy.con.D_AV * (2 + enemy.D_rank)) / 2)
        } else {
            D_AV = Math.floor((enemy.con.D_AV * 2) / (2 - enemy.con.D_rank))
        }
        if (B_AV >= D_AV){
            afn.rankChange(team, "C", 1, 100, "ダウンロード", log)
        } else {
            afn.rankChange(team, "A", 1, 100, "ダウンロード", log)
        }
    } else if (con.ability == "デルタストリーム" && !con.f_con.includes("らんきりゅう")){
        log += con.TN + "　の　" + con.name + "の　デルタストリーム！" + CR
        log += "乱気流状態になった！" + CR
        for (const f_con of [team.con.f_con, enemy.con.f_con]){
            cfn.conditionRemove(f_con, "あめ")
            cfn.conditionRemove(f_con, "にほんばれ")
            cfn.conditionRemove(f_con, "すなあらし")
            cfn.conditionRemove(f_con, "あられ")
            f_con += "らんきりゅう" + CR
        }
    } else if (con.ability == "トレース" && !abiEff.trace().includes(enemy.con.ability)){
        log += con.TN + "　の　" +　con.name + "の　トレース！" + CR
        afn.changeAbility(enemy, team, 1, "NA", log)
    } else if (con.ability == "はじまりのうみ" && !con.f_con.includes("おおあめ")){
        log += con.TN + "　の　" + con.name + "の　はじまりのうみ！" + CR
        log+= "雨がとても強くなった！" + CR
        for (const f_con of [team.con.f_con, enemy.con.f_con]){
            cfn.conditionRemove(f_con, "あめ")
            cfn.conditionRemove(f_con, "にほんばれ")
            cfn.conditionRemove(f_con, "すなあらし")
            cfn.conditionRemove(f_con, "あられ")
            cfn.conditionRemove(f_con, "らんきりゅう")
            f_con += "あめ（おおあめ）" + CR
        }
    } else if (con.ability == "バリアフリー"){
        if (con.f_con.includes("リフレクター") || con.f_con.includes("ひかりのかべ") || con.f_con.includes("オーロラベール") 
        || enemy.con.f_con.includes("リフレクター") || enemy.con.f_con.includes("ひかりのかべ") || enemy.con.f_con.includes("オーロラベール")){
            log += con.TN + "　の　" + con.name + "の　バリアフリー！" + CR
            log += "お互いの場の壁が破壊された！" + CR
        }
        for (const f_con of [team.con.f_con, enemy.con.f_con]){
            cfn.conditionRemove(f_con, "リグレクター")
            cfn.conditionRemove(f_con, "ひかりのかべ")
            cfn.conditionRemove(f_con, "オーロラベール")
        }
    } else if (con.ability == "ひでり" && !con.f_con.includes("にほんばれ") && !con.f_con.includes("おおあめ") && !con.f_con.includes("らんきりゅう")){
        log += con.TN + "　の　" + con.name + "の　ひでり！" + CR
        bfn.allFieldStatus(team, enemy, cfn.moveSearchByName("にほんばれ"), log)
    } else if (con.ability == "フェアリーオーラ"){
        log += con.TN + "　の　" + con.name + "の　フェアリーオーラが発動している！" + CR
    } else if (con.ability == "ふくつのたて"){
        afn.rankChange(team, "B", 1, 100, "ふくつのたて", log)
    } else if (con.ability == "ふとうのけん"){
        afn.rankChange(team, "A", 1, 100, "ふとうのけん", log)
    } else if (con.ability == "ふみん" && con.abnormal == "ねむり"){
        cfn.conditionRemove(con.p_con, "ねむり")
        cfn.conditionRemove(con.p_con, "ねむる")
    } else if (con.ability == "プレッシャー"){
        log += con.TN + "　の　" + con.name + "は　プレッシャーを放っている！" + CR
    } else if (con.ability == "ミストメイカー" && !con.f_con.includes("ミストフィールド")){
        log += con.TN + "　の　" + con.name + "の　ミストメイカー！" + CR
        bfn.allFieldStatus(team, enemy, cfn.moveSearchByName("ミストフィールド"), log)
    } else if (con.ability == "ゆきふらし" && !con.f_con.includes("あられ") && !con.f_con.includes("おおあめ") && !con.f_con.includes("おおひでり") && !con.f_con.includes("らんきりゅう")){
        log += con.TN + "　の　" + con.name + "の　ゆきふらし！" + CR
        bfn.allFieldStatus(team, enemy, cfn.moveSearchByName("あられ"), log)
    } else if (con.ability == "よちむ"){
        let power = []
        for (let i = 0; i < 4; i++){
            if (con["move_" + i] != ""){
                let move = cfn.moveSearchByName(con["move_" + i])
                if (move[2] != "変化"){
                    power.push([move[3], move[0]])
                }
            }
        }
        power.sort()
        log += con.TN + "　の　" + con.name + "　は　" + power[0][1] + "を　読み取った！" + CR
    }
    // 4.ふうせん/きのみ/きのみジュース/メンタルハーブ
    if (con.item == "ふうせん"){
        log += con.TN + "　の　" + con.name + "は　ふうせんで浮いている！" + CR
    } else if (con.item == "メンタルハーブ" && con.p_con.includes("かいふくふうじ")){
        log += con.TN + "　の　" + con.name + "は　メンタルハーブで　かいふくふうじが解除された！" + CR
        cfn.setRecycle(team)
        cfn.conditionRemove(con.p_con, "かいふくふうじ")
    }
}

// 4.リミットシールド/ぎょぐん/ゲンシカイキによるフォルムチェンジ[2][3]
function ability_form_change(team, enemy, log){
    let con = team.con
    if (con.ability == "リミットシールド" && con.last_HP > con.full_HP / 2 && con.name == "メテノ(コア)"){
        log += con.TN + "　の　" + con.name + "　の　リミットシールド！" + CR
        afn.formChenge(team, enemy, "メテノ(りゅうせいのすがた)", log)
    }
}

// 5.エレキシード/グラスシード/ミストシード/サイコシード/ルームサービス
function seed_service(team, enemy, log){
    let con = team.con
    if ((con.item == "エレキシード" && con.f_con.includes("エレキフィールド")) || (con.item == "グラスシード" && con.f_con.includes("グラスフィールド"))){
        afn.rankChange(team, "B", 1, 100, con.item, log)
        cfn.setRecycle(team)
    } else if ((con.item == "サイコシード" && con.f_con.includes("サイコフィールド")) || (con.item == "ミストシード" && con.f_con.includes("ミストフィールド"))){
        afn.rankChange(team, "D", 1, 100, con.item, log)
        cfn.setRecycle(team)
    } else if (con.item == "ルームサービス" && con.f_con.includes("トリックルーム")){
        afn.rankChange(team, "S", -1, 100, "ルームサービス", log)
        cfn.setRecycle(team)
    }
}

// 7.しろいハーブ
function white_herb(team, enemy, log){
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
            log += con.TN + "　の　" + con.name + "　は　しろいハーブで　下がった能力を元に戻した" + CR
            cfn.setRecycle(team)
        }
    }
}

// 8.だっしゅつパックによる交代、交代先の繰り出し
function eject_pack(team, enemy, log){
    if (con.item == "だっしゅつパック" && con.p_con.includes("ランク下降")){
        log += con.TN + "　の　" + con.name + "は　だっしゅつパックで手持ちに戻った" + CR
        team.con.f_con += "選択中・・・" + CR
        cfn.setRecycle(team)
        //come_back_pokemon(team)
    
        log += team.con.TN + "　は　戦闘に出すポケモンを選んでください" + CR
        return true
    }
}






