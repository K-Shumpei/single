const afn = require("./function")
const bfn = require("./base_function")
const cfn = require("./law_function")
const moveEff = require("./move_effect")
const abiEff = require("./ability_effect")


// 戦闘中のポケモンを手持ちに戻す
exports.comeBack = function(user, enemy){
    if (user.con.name == "ヒヒダルマ(ダルマモード)"){
        afn.formChenge(user, enemy, "ヒヒダルマ")
    } else if (user.con.name == "ヒヒダルマ(ダルマモード(ガラルのすがた))"){
        afn.formChenge(user, enemy, "ヒヒダルマ(ガラルのすがた)")
    } else if (user.con.name == "ギルガルド(ブレードフォルム)"){
        afn.formChenge(user, enemy, "ギルガルド(シールドフォルム)")
    } else if (user.con.name == "メテノ(コア)"){
        afn.formChenge(user, enemy, "メテノ(りゅうせいのすがた)")
    }
 
    // パラメーターの移動
    for (const parameter of [
        "name", "sex", "level", "type", "nature", "ability", "item", "abnormal", 
        "last_HP", "full_HP", 
        "A_AV", "B_AV", "C_AV", "D_AV", "S_AV", 
        "move_0", "PP_0", "last_0", 
        "move_1", "PP_1", "last_1", 
        "move_2", "PP_2", "last_2", 
        "move_3", "PP_3", "last_3"]){
        user["poke" + cfn.battleNum(user)][parameter] = user.con[parameter]
    }

    // 相手のメロメロの解除
    cfn.conditionRemove(enemy.con, "poke", "メロメロ")
    cfn.conditionRemove(enemy.con, "poke", "バインド")
    if (!enemy.con.p_con.includes("はいすいのじん")){
        cfn.conditionRemove(enemy.con, "poke", "逃げられない")
    }

    // 特性が「さいせいりょく」の時
    if (user.con.ability == "さいせいりょく"){
        afn.HPchangeMagic(user, enemy, Math.floor(user.con.full_HP / 3), "+", "さいせいりょく")
    }
    // 特性が「しぜんかいふく」の時
    if (user.con.ability == "しぜんかいふく"){
        user["poke" + cfn.battleNum(user)].abnormal = ""
    }

    // 特性が「おわりのだいち」だった時、天候が元に戻る
    if (user.con.ability == "おわりのだいち" && (enemy.con.ability != "おわりのだいち" || enemy.con.last_HP == 0)){
        cfn.logWrite(user, enemy, "おおひでりが終わった" + "\n")
        cfn.conditionRemove(user.con, "field", "おおひでり")
        cfn.conditionRemove(enemy.con, "field", "おおひでり")
    }
    // 特性が「はじまりのうみ」だった時、天候が元に戻る
    if (user.con.ability == "はじまりのうみ" && (enemy.con.ability != "はじまりのうみ" || enemy.con.last_HP == 0)){
        cfn.logWrite(user, enemy, "おおあめが終わった" + "\n")
        cfn.conditionRemove(user.con, "field", "おおあめ")
        cfn.conditionRemove(enemy.con, "field", "おおあめ")
    }
    // 特性が「かがくへんかガス」の時
    if (user.con.ability == "かがくへんかガス"){
        cfn.logWrite(user, enemy, "かがくへんかガスの効果が切れた" + "\n")
        for (let i = 0; i < enemy.con.p_con.split("\n").length - 1; i++){
            if (enemy.con.p_con.split("\n")[i].includes("かがくへんかガス")){
                enemy.con.ability = enemy.con.p_con.split("\n")[i].slice(9)
            }
        }
        cfn.conditionRemove(enemy.con, "poke", "かがくへんかガス")
        summon.activAbility(user, enemy, 1)
    }
    // 特性が「きんちょうかん」の時
    if (user.con.ability == "きんちょうかん"){
        bfn.berryPinch(enemy, team)
        bfn.berryAbnormal(enemy, user)
    }

    // 「戦闘中」を「控え」に変更
    user.data["radio_" + Number(cfn.battleNum(user) + 4)] = false
    user["poke" + cfn.battleNum(user)].life = "控え"

    for (const parameter of [
        "name", "sex", "level", "type", "nature", "ability", "item", "abnormal", 
        "last_HP", "full_HP", 
        "A_AV", "B_AV", "C_AV", "D_AV", "S_AV", 
        "move_0", "PP_0", "last_0", 
        "move_1", "PP_1", "last_1", 
        "move_2", "PP_2", "last_2", 
        "move_3", "PP_3", "last_3", "p_con", "user"]){
        user.con[parameter] = ""
    }
    for (const parameter of ["A_rank", "B_rank", "C_rank", "D_rank", "S_rank", "X_rank", "Y_rank"]){
        user.con[parameter] = 0
    }
}


// ポケモンを戦闘に出す
exports.pokeReplace = function(team, enemy){
    cfn.conditionRemove(team.con, "field", "ひんし")
    cfn.conditionRemove(team.con, "field", "選択中")
    const num = team.data.command - 4
    // 各パラメータを記述
    for (const parameter of ["name", "sex", "level", "type", "ability", "item", "abnormal", "nature", "full_HP", "last_HP", "A_AV", "B_AV", "C_AV", "D_AV", "S_AV", 
        "move_0", "move_1", "move_2", "move_3", "PP_0", "PP_1", "PP_2", "PP_3", "last_0", "last_1", "last_2", "last_3"]){
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
    if (team["poke" + num].form == "ばけたすがた"){
        team.con.p_con += "ばけたすがた" + "\n"
    } else if (team["poke" + num].form == "ばれたすがた"){
        team.con.p_con += "ばれたすがた" + "\n"
    }
    // モルペコの模様
    if (team.con.ability == "はらぺこスイッチ"){
        team.con.p_con += "まんぷくもよう" + "\n"
    }

    cfn.logWrite(team, enemy, team.con.TN + "　は　" + team.con.name + "　を　繰り出した　！" + "\n")

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
        document.battle[team + "_poke_condition"].value += "かがくへんかガス：" + new get(team).ability + "\n"
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
exports.activAbility = function(user1, user2, team){
    // num は、戦闘に出すポケモンの数
    if (team == "both"){
        // 素早さ判定
        let order = afn.speedCheck(user1.con, user2.con)
        if (order[0] > order[1] || (order[0] == order[1] && Math.random() < 0.5)){
            order = [user1, user2]
        } else {
            order = [user2, user1]
        }
        if (user1.con.f_con.includes("トリックルーム")){
            order = [order[1], order[0]]
        }
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
        bfn.whiteHerb(order[0], order[1])
        bfn.whiteHerb(order[1], order[0])
        // 8.だっしゅつパックによる交代、交代先の繰り出し
        eject_pack(order[0], order[1])
        eject_pack(order[1], order[0])
    } else {
        if (team == 1){
            team = user1
            enemy = user2
        } else if (team == 2){
            team = user2
            enemy = user1
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
        bfn.whiteHerb(team, enemy)
        // 8.だっしゅつパックによる交代、交代先の繰り出し
        eject_pack(team, enemy)
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
function neutralizing_gas(team, enemy){
    const list = abiEff.neutralizing()
    if (team.con.ability == "かがくへんかガス"){
        cfn.logWrite(team, enemy, "あたりに　かがくへんかガスが　充満した！" + "\n")
        if (!list.includes(enemy.con.ability) && !enemy.con.p_con.includes("かがくへんかガス")){
            cfn.conditionRemove(enemy.con, "poke", "スロースタート：")
            enemy.con.p_con += "かがくへんかガス：" + enemy.con.ability + "\n"
            enemy.con.ability = ""
        }
    }
}

// 2.きんちょうかん/じんばいったいの発動
function unnerve(team, enemy){
    if (team.con.ability == "きんちょうかん"){
        cfn.logWrite(team, enemy, enemy.con.TN + "　の　ポケモンは　緊張して　きのみが　食べられなくなった！" + "\n")
    } else if (team.con.ability == "じんばいったい"){
        cfn.logWrite(team, enemy, team.con.TN + "　の　" + team.con.name + "　は　ふたつの　特性を　あわせ持つ！" + "\n")
        cfn.logWrite(team, enemy, enemy.con.TN + "　の　ポケモンは　緊張して　きのみが　食べられなくなった！" + "\n")
    }
}

// 3.1~2.状態/ 3.特性/ 4.持ち物の発動
function condition_ability_item_action(team, enemy){
    let con = team.con
    // 1.いやしのねがい/みかづきのまい/Zおきみやげ/Zすてゼリフによる回復
    if (con.f_con.includes("いやしのねがい") && (con.last_HP < con.full_HP || con.abnormal != "")){
        cfn.logWrite(team, enemy, con.TN + "　の　いやしのねがいが　発動した！" + "\n")
        con.last_HP = con.full_HP
        con.abnormal = ""
        bfn.conditionRemove(con, "field", "いやしのねがい")
    }
    if (con.f_con.includes("みかづきのまい") && (con.last_HP < con.full_HP || con.abnormal != "")){
        let check = 0
        for (let i = 0; i < 4; i++){
            if (con["last_" + i] == con["PP_" + i]){
                check += 1
            }
        }
        if (check != 4){
            cfn.logWrite(team, enemy, con.TN + "　の　みかづきのまいが　発動した！" + "\n")
            con.last_HP = con.full_HP
            con.abnormal = ""
            for (let i = 0; i < 4; i++){
                con["last_" + i] = con["PP_" + i]
            }
            bfn.conditionRemove(con, "field", "みかづきのまい")
        }
    }
    if ((con.f_con.includes("Zおきみやげ") || con.f_con.includes("Zすてゼリフ")) && con.last_HP < con.full_HP){
        cfn.logWrite(team, enemy, con.TN + "　の　Zおきみやげが　発動した！" + "\n")
        con.last_HP = con.full_HP
        bfn.conditionRemove(con, "field", "Zおきみやげ")
        bfn.conditionRemove(con, "field", "Zすてゼリフ")
    }
    // 2.設置技: 技が使用された順に発動
    if (con.item != "あつぞこブーツ"){
        for (let i = 0; i < con.f_con.split("" + "\n").length - 1; i++){
            if (con.f_con.split("" + "\n")[i].includes("まきびし") && cfn.groundedCheck(con)){
                let num = Number(con.f_con.split("" + "\n")[i].slice(5, 6))
                let damage = Math.floor(con.full_HP / (10 - (num * 2)))
                afn.HPchangeMagic(team, enemy, damage, "-", "まきびし")
            } else if (con.f_con.split("" + "\n")[i].includes("どくびし") && cfn.groundedCheck(con)){
                let num = Number(con.f_con.split("" + "\n")[i].slice(5, 6))
                if (num == 1){
                    afn.makeAbnormal(team, enemy, "どく", 100, "どくびし")
                } else if (num == 2){
                    afn.makeAbnormal(team, enemy, "もうどく", 100, "どくびし")
                }
            } else if (con.f_con.split("" + "\n")[i].includes("ステルスロック")){
                let rate = cfn.compatibilityCheck(team, enemy, cfn.moveSearchByName("アクセルロック"))
                let damage = Math.floor(con.full_HP * rate / 8)
                afn.HPchangeMagic(team, enemy, damage, "-", "ステルスロック")
            } else if (con.f_con.split("" + "\n")[i].includes("ねばねばネット") && cfn.groundedCheck(con)){
                afn.rankChange(team, enemy, "S", -1, 100, "ねばねばネット")
            } else if (con.f_con.split("" + "\n")[i].includes("キョダイコウジン")){
                let rate = cfn.compatibilityCheck(team, enemy, cfn.moveSearchByName("バレットパンチ"))
                let damage = Math.floor(con.full_HP * rate / 8)
                afn.HPchangeMagic(team, enemy, damage, "-", "キョダイコウジン")
            }
        }
    }
    if (con.type.includes("どく") && cfn.groundedCheck(con) && con.f_con.includes("どくびし")){
        cfn.logWrite(team, enemy, "どくびしが　消え去った！" + "\n")
        cfn.conditionRemove(con, "field", "どくびし")
    }
    // 3.場に出たときに発動する特性
    if (con.ability == "あめふらし" && !con.f_con.includes("あめ") && !con.f_con.includes("おおひでり") && !con.f_con.includes("らんきりゅう")){
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "の　あめふらし！" + "\n")
        bfn.allFieldStatus(team, enemy, cfn.moveSearchByName("あまごい"))
    } else if (con.ability == "いかく"){
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "の　いかく！" + "\n")
        if (enemy.con.ability == "ミラーアーマー"){
            if (!con.p_con.includes("みがわり")){
                cfn.logWrite(team, enemy, enemy.con.TN + "　の　" + enemy.con.name + "　の　ミラーアーマーが　発動した！" + "\n")
                afn.rankChange(team, enemy, "A", -1, 100, "いかく")
            }
        } else {
            if (!(enemy.con.p_con.includes("みがわり") || enemy.con.ability == "きもったま" || enemy.con.ability == "せいしんりょく" || enemy.con.ability == "どんかん" || enemy.con.ability == "マイペース")){
                afn.rankChange(enemy, team, "A", -1, 100, "いかく")
                if (enemy.con.ability == "びびり"){
                    afn.rankChange(enemy, team, "S", 1, 100, "びびり")
                }
            }
            if (enemy.con.item == "ビビリだま" && enemy.con.S_rank < 6){
                afn.rankChange(enemy, team, "S", 1, 100, "ビビリだま")
                cfn.setRecycle(enemy)
            }
        }
    } else if (con.ability == "エアロック" || con.ability == "ノーてんき"){
        cfn.logWrite(team, enemy, "天気の影響がなくなった" + "\n")
    } else if (con.ability == "エレキメイカー" && !con.f_con.includes("エレキフィールド")){
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "の　エレキメイカー！" + "\n")
        bfn.allFieldStatus(team, enemy, cfn.moveSearchByName("エレキフィールド"))
    } else if (con.ability == "オーラブレイク"){
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "の　オーラブレイクが発動している！" + "\n")
    } else if (con.ability == "おみとおし" && con.item != ""){
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "の　おみとおし！" + "\n")
        cfn.logWrite(team, enemy, enemy.con.TN + "　の　" + enemy.con.name + "の　" + enemy.con.item + "を　お見通しだ！" + "\n")
    } else if (con.ability == "おわりのだいち" && !con.f_con.includes("おおひでり")){
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "の　おわりのだいち！" + "\n")
        cfn.logWrite(team, enemy, "日差しがとても強くなった！" + "\n")
        for (const player of [team, enemy]){
            cfn.conditionRemove(player.con, "field", "あめ")
            cfn.conditionRemove(player.con, "field", "にほんばれ")
            cfn.conditionRemove(player.con, "field", "すなあらし")
            cfn.conditionRemove(player.con, "field", "あられ")
            cfn.conditionRemove(player.con, "field", "らんきりゅう")
            player.con.f_con += "にほんばれ（おおひでり）" + "\n"
        }
    } else if (con.ability == "かたやぶり" || con.ability == "ターボブレイズ" || con.ability == "テラボルテージ"){
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "は　" + con.ability + "だ！" + "\n")
    } else if (con.ability == "かわりもの" && !enemy.con.p_con.includes("みがわり") && !enemy.con.p_con.includes("へんしん")){
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "の　かわりもの！" + "\n")
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
        con.p_con += "へんしん" + "\n"
        cfn.conditionRemove(con, "poke", "きゅうしょアップ")
        cfn.conditionRemove(con, "poke", "とぎすます")
        cfn.conditionRemove(con, "poke", "キョダイシンゲキ")
        cfn.conditionRemove(con, "poek", "ボディパージ")
        for (let i = 0; i < enemy.con.p_con.split("" + "\n").length - 1; i++){
            if (enemy.con.p_con.split("" + "\n")[i].includes("きゅうしょアップ") 
            || enemy.con.p_con.split("" + "\n")[i].includes("とぎすます") 
            || enemy.con.p_con.split("" + "\n")[i].includes("キョダイシンゲキ") 
            || enemy.con.p_con.split("" + "\n")[i].includes("ボディパージ")){
                con.p_con += enemy.con.p_con.split("" + "\n")[i] + "\n"
            }
        }
        cfn.logWrite(team, enemy, enemy.con.name + "に　へんしんした" + "\n")
    } else if (con.ability == "きけんよち"){
        let check = 0
        const list = moveEff.oneShot()
        for (let i = 0; i < 4; i++){
            if (con["move_" + i] != ""){
                let move = cfn.moveSearchByName(con["move_" + i])
                if ((cfn.compatibilityCheck(team, enemy, move) > 1 && move[2] != "変化") || list.includes(move[0])){
                    check += 1
                }
            }
        }
        if (check > 0){
            cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "は　身震いした！" + "\n")
        }
    } else if (con.ability == "きみょうなくすり"){
        
    } else if (con.ability == "グラスメイカー" && !con.f_con.includes("グラスフィールド")){
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "の　グラスメイカー！" + "\n")
        bfn.allFieldStatus(team, enemy, cfn.moveSearchByName("グラスフィールド"))
    } else if (con.ability == "サイコメイカー" && !con.f_con.includes("サイコフィールド")){
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "の　サイコメイカー！" + "\n")
        bfn.allFieldStatus(team, enemy, cfn.moveSearchByName("サイコフィールド"))
    } else if (con.ability == "スロースタート"){
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "の　スロースタート！" + "\n")
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "は　調子が上がらない！" + "\n")
        con.p_con += "スロースタート　5/5" + "\n"
    } else if (con.ability == "すなおこし" && !con.f_con.includes("すなあらし") && !con.f_con.includes("おおあめ") && !con.f_con.includes("おおひでり") && !con.f_con.includes("らんきりゅう")){
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "の　すなおこし！" + "\n")
        bfn.allFieldStatus(team, enemy, cfn.moveSearchByName("すなあらし"))
    } else if (con.ability == "ぜったいねむり"){
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "は　夢うつつの状態！" + "\n")
    } else if (con.ability == "ダークオーラ"){
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "の　ダークオーラが発動している！" + "\n")
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
            afn.rankChange(team, enemy, "C", 1, 100, "ダウンロード")
        } else {
            afn.rankChange(team, enemy, "A", 1, 100, "ダウンロード")
        }
    } else if (con.ability == "デルタストリーム" && !con.f_con.includes("らんきりゅう")){
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "の　デルタストリーム！" + "\n")
        cfn.logWrite(team, enemy, "乱気流状態になった！" + "\n")
        for (const player of [team, enemy]){
            cfn.conditionRemove(player.con, "field", "あめ")
            cfn.conditionRemove(player.con, "field", "にほんばれ")
            cfn.conditionRemove(player.con, "field", "すなあらし")
            cfn.conditionRemove(player.con, "field", "あられ")
            player.con.f_con += "らんきりゅう" + "\n"
        }
    } else if (con.ability == "トレース" && !abiEff.trace().includes(enemy.con.ability)){
        cfn.logWrite(team, enemy, con.TN + "　の　" +　con.name + "の　トレース！" + "\n")
        afn.changeAbility(enemy, team, 1, "NA")
    } else if (con.ability == "はじまりのうみ" && !con.f_con.includes("おおあめ")){
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "の　はじまりのうみ！" + "\n")
        cfn.logWrite(team, enemy, "雨がとても強くなった！" + "\n")
        for (const player of [team, enemy]){
            cfn.conditionRemove(player.con, "field", "あめ")
            cfn.conditionRemove(player.con, "field", "にほんばれ")
            cfn.conditionRemove(player.con, "field", "すなあらし")
            cfn.conditionRemove(player.con, "field", "あられ")
            cfn.conditionRemove(player.con, "field", "らんきりゅう")
            player.con.f_con += "あめ（おおあめ）" + "\n"
        }
    } else if (con.ability == "バリアフリー"){
        if (con.f_con.includes("リフレクター") || con.f_con.includes("ひかりのかべ") || con.f_con.includes("オーロラベール") 
        || enemy.con.f_con.includes("リフレクター") || enemy.con.f_con.includes("ひかりのかべ") || enemy.con.f_con.includes("オーロラベール")){
            cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "の　バリアフリー！" + "\n")
            cfn.logWrite(team, enemy, "お互いの場の壁が破壊された！" + "\n")
        }
        for (const player of [team, enemy]){
            cfn.conditionRemove(player.con, "field", "リフレクター")
            cfn.conditionRemove(player.con, "field", "ひかりのかべ")
            cfn.conditionRemove(player.con, "field", "オーロラベール")
        }
    } else if (con.ability == "ひでり" && !con.f_con.includes("にほんばれ") && !con.f_con.includes("おおあめ") && !con.f_con.includes("らんきりゅう")){
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "の　ひでり！" + "\n")
        bfn.allFieldStatus(team, enemy, cfn.moveSearchByName("にほんばれ"))
    } else if (con.ability == "フェアリーオーラ"){
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "の　フェアリーオーラが発動している！" + "\n")
    } else if (con.ability == "ふくつのたて"){
        afn.rankChange(team, enemy, "B", 1, 100, "ふくつのたて")
    } else if (con.ability == "ふとうのけん"){
        afn.rankChange(team, enemy, "A", 1, 100, "ふとうのけん")
    } else if (con.ability == "ふみん" && con.abnormal == "ねむり"){
        cfn.conditionRemove(con, "poke", "ねむり")
        cfn.conditionRemove(con, "poke", "ねむる")
    } else if (con.ability == "プレッシャー"){
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "は　プレッシャーを放っている！" + "\n")
    } else if (con.ability == "ミストメイカー" && !con.f_con.includes("ミストフィールド")){
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "の　ミストメイカー！" + "\n")
        bfn.allFieldStatus(team, enemy, cfn.moveSearchByName("ミストフィールド"))
    } else if (con.ability == "ゆきふらし" && !con.f_con.includes("あられ") && !con.f_con.includes("おおあめ") && !con.f_con.includes("おおひでり") && !con.f_con.includes("らんきりゅう")){
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "の　ゆきふらし！" + "\n")
        bfn.allFieldStatus(team, enemy, cfn.moveSearchByName("あられ"))
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
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　は　" + power[0][1] + "を　読み取った！" + "\n")
    }
    // 4.ふうせん/きのみ/きのみジュース/メンタルハーブ
    if (con.item == "ふうせん"){
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "は　ふうせんで浮いている！" + "\n")
    } else if (con.item == "メンタルハーブ" && con.p_con.includes("かいふくふうじ")){
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "は　メンタルハーブで　かいふくふうじが解除された！" + "\n")
        cfn.setRecycle(team)
        cfn.conditionRemove(con, "poke", "かいふくふうじ")
    }
}

// 4.リミットシールド/ぎょぐん/ゲンシカイキによるフォルムチェンジ[2][3]
function ability_form_change(team, enemy){
    let con = team.con
    if (con.ability == "リミットシールド" && con.last_HP > con.full_HP / 2 && con.name == "メテノ(コア)"){
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　の　リミットシールド！" + "\n")
        afn.formChenge(team, enemy, "メテノ(りゅうせいのすがた)")
    }
}

// 5.エレキシード/グラスシード/ミストシード/サイコシード/ルームサービス
function seed_service(team, enemy){
    let con = team.con
    if ((con.item == "エレキシード" && con.f_con.includes("エレキフィールド")) || (con.item == "グラスシード" && con.f_con.includes("グラスフィールド"))){
        afn.rankChange(team, enemy, "B", 1, 100, con.item)
        cfn.setRecycle(team)
    } else if ((con.item == "サイコシード" && con.f_con.includes("サイコフィールド")) || (con.item == "ミストシード" && con.f_con.includes("ミストフィールド"))){
        afn.rankChange(team, enemy, "D", 1, 100, con.item)
        cfn.setRecycle(team)
    } else if (con.item == "ルームサービス" && con.f_con.includes("トリックルーム")){
        afn.rankChange(team, enemy, "S", -1, 100, "ルームサービス")
        cfn.setRecycle(team)
    }
}


// 8.だっしゅつパックによる交代、交代先の繰り出し
function eject_pack(team, enemy){
    if (team.con.item == "だっしゅつパック" && team.con.p_con.includes("ランク下降")){
        cfn.logWrite(team, enemy, team.con.TN + "　の　" + team.con.name + "は　だっしゅつパックで手持ちに戻った" + "\n")
        team.con.f_con += "選択中・・・" + "\n"
        cfn.setRecycle(team)
        //come_back_pokemon(team)
    
        cfn.logWrite(team, enemy, team.con.TN + "　は　戦闘に出すポケモンを選んでください" + "\n")
        return true
    }
}






