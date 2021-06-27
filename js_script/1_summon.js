const afn = require("./function")
const bfn = require("./base_function")
const cfn = require("./law_function")
const efn = require("./ex_function")
const moveEff = require("./move_effect")
const abiEff = require("./ability_effect")
const itemEff = require("./item_effect")


// 戦闘中のポケモンを手持ちに戻す
exports.comeBack = function(user, enemy){
    if (user.con.last_HP == 0){
        cfn.logWrite(user, enemy, user.con.TN + "　の　" + user.con.name + "　は　たおれた　!" + "\n")
        user.con.f_con += "ひんし" + "\n"
        if (enemy.con.ability == "ソウルハート" && !enemy.con.f_con.includes("ひんし")){
            afn.rankChange(enemy, user, "C", 1, 100, "ソウルハート")
        }
    }

    if (user.con.name == "ヒヒダルマ(ダルマモード)"){
        afn.formChenge(user, enemy, "ヒヒダルマ")
    } else if (user.con.name == "ヒヒダルマ(ダルマモード(ガラルのすがた))"){
        afn.formChenge(user, enemy, "ヒヒダルマ(ガラルのすがた)")
    } else if (user.con.name == "ギルガルド(ブレードフォルム)"){
        afn.formChenge(user, enemy, "ギルガルド(シールドフォルム)")
    } else if (user.con.name == "メテノ(コア)"){
        afn.formChenge(user, enemy, "メテノ(りゅうせいのすがた)")
    }

    // 特性が「さいせいりょく」の時
    if (user.con.ability == "さいせいりょく" && !user.con.f_con.includes("ひんし")){
        afn.HPchangeMagic(user, enemy, Math.floor(user.con.full_HP / 3), "+", "さいせいりょく")
    }
    // 特性が「しぜんかいふく」の時
    if (user.con.ability == "しぜんかいふく" && !user.con.f_con.includes("ひんし")){
        user["poke" + cfn.battleNum(user)].abnormal = ""
    }

    // へんしん状態のポケモンはそのまま
    if (!user.con.p_con.includes("へんしん")){
        // パラメーターの移動
        user["poke" + cfn.battleNum(user)].abnormal = user.con.abnormal
    }
    // 状態異常『ねむり』
    for (let i = 0; i < user.con.p_con.split("\n").length; i++){
        if (user.con.p_con.split("\n")[i].includes("ねむり") || user.con.p_con.split("\n")[i].includes("ねむる")){
            user["poke" + cfn.battleNum(user)].abnormal += user.con.p_con.split("\n")[i].slice(3)
        }
    }

    // 相手のメロメロの解除
    cfn.conditionRemove(enemy.con, "poke", "メロメロ")
    cfn.conditionRemove(enemy.con, "poke", "バインド")
    cfn.conditionRemove(enemy.con, "poke", "たこがため")
    cfn.conditionRemove(enemy.con, "poke", "逃げられない")

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
    // 特性が「デルタストリーム」だった時、天候が元に戻る
    if (user.con.ability == "デルタスリトーム" && (enemy.con.ability != "デルタストリーム" || enemy.con.last_HP == 0)){
        cfn.logWrite(user, enemy, "らんきりゅうが終わった" + "\n")
        cfn.conditionRemove(user.con, "field", "らんきりゅう")
        cfn.conditionRemove(enemy.con, "field", "らんきりゅう")
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
        efn.activeAbility(user, enemy, 1)
    }
    // 特性が「きんちょうかん」の時
    if (user.con.ability == "きんちょうかん"){
        bfn.berryPinch(enemy, team)
        bfn.berryAbnormal(enemy, user)
    }

    // 「戦闘中」を「控え」に変更
    if (user.con.f_con.includes("選択中・・・")){
        user.data["radio_" + Number(cfn.battleNum(user) + 4)] = true
        user["poke" + cfn.battleNum(user)].life = "選択中"
    } else if (user.con.f_con.includes("ひんし")){
        user.data["radio_" + Number(cfn.battleNum(user) + 4)] = true
        user["poke" + cfn.battleNum(user)].life = "ひんし"
    } else {
        user.data["radio_" + Number(cfn.battleNum(user) + 4)] = false
        user["poke" + cfn.battleNum(user)].life = "控え"
    }

    for (const parameter of [
        "name", "sex", "level", "type", "nature", "ability", "item", "abnormal", 
        "last_HP", "full_HP", 
        "A_AV", "B_AV", "C_AV", "D_AV", "S_AV", 
        "move_0", "PP_0", "last_0", 
        "move_1", "PP_1", "last_1", 
        "move_2", "PP_2", "last_2", 
        "move_3", "PP_3", "last_3", "p_con", "used"]){
        user.con[parameter] = ""
    }
    for (const parameter of ["A_rank", "B_rank", "C_rank", "D_rank", "S_rank", "X_rank", "Y_rank"]){
        user.con[parameter] = 0
    }
    // コマンドの消去
    if (user.con.f_con.includes("ひんし") || user.con.f_con.includes("選択中")){
        user.data.command = ""
    }
    // メガ進化ボタンの無効化
    user.data.megable = true
    // Z技ボタンの無効化
    user.data.Zable = true

    // 勝敗判定
    if (user.poke0.life == "ひんし" && user.poke1.life == "ひんし" && user.poke2.life == "ひんし" && !user.con.f_con.includes("勝ち") && !user.con.f_con.includes("負け")){
        user.con.f_con += "負け" + "\n"
        enemy.con.f_con += "勝ち" + "\n"
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
    team.con.num = team["poke" + num].num
    // 技がないボタンを無効化
    for (let i = 0; i < 4; i++){
        if (team.con["move_" + i] == ""){
            team.data["radio_" + i] = true
        }
    }
    team["poke" + num].life = "戦闘中"
    team.data["radio_" + team.data.command] = true

    for (let i = 0; i < 3; i++){
        if (team["poke" + i].life == "選択中"){
            team["poke" + i].life = "控え"
        }
    }

    // 特性『イリュージョン』
    if (team.con.ability == "イリュージョン"){
        let poke = ""
        for (let i = 0; i < 3; i++){
            if (team["poke" + i].life == "控え"){
                poke = i
            }
        }
        if (poke != ""){
            for (const parameter of ["name", "sex", "level", "type"]){
                team.con[parameter] = team["poke" + poke][parameter]
            }
            team.con.p_con += "イリュージョン：" + num + "\n"
        }
    }
    // 特性『ばけのかわ』
    if (team["poke" + num].form == "ばけたすがた"){
        team.con.p_con += "ばけたすがた" + "\n"
    } else if (team["poke" + num].form == "ばれたすがた"){
        team.con.p_con += "ばれたすがた" + "\n"
    }
    // 特性『はらぺこスイッチ』
    if (team.con.ability == "はらぺこスイッチ"){
        team.con.p_con += "まんぷくもよう" + "\n"
    }
    // 状態異常『ねむり』
    if (team.con.abnormal.includes("ねむり") || team.con.abnormal.includes("ねむる")){
        const turn = team.con.abnormal.slice(4)
        team.con.abnormal = "ねむり"
        team.con.p_con += "ねむり　" + turn + "\n"
    } else if (team.con.abnormal == "もうどく"){
        team.con.p_con += "もうどく　1ターン目" + "\n"
    }
    // バトンタッチの時、ランク変化を受け継ぐ
    for (let i = 0; i < team.con.p_con.split("\n").length; i++){
        if (team.con.p_con.split("\n")[i].includes("バトンタッチ")){
            const rank = team.con.p_con.split("\n")[i].slice(7).split("/")
            const para_rank = ["A_rank", "B_rank", "C_rank", "D_rank", "S_rank", "X_rank", "Y_rank"]
            for (let j = 0; j < 7; j++){
                team.con[para_rank] = rank[j]
            }
        }
    }
    cfn.conditionRemove(team.con, "poke", "バトンタッチ")
    // 特性「かがくへんかガス」のポケモンがいる時
    if (enemy.con.ability == "かがくへんかガス"){
        team.con.p_con += "かがくへんかガス：" + team.con.ability + "\n"
        team.con.ability = ""
    }
    // マジックルーム：持ち物を空欄にする
    if (team.con.f_con.includes("マジックルーム")){
        team.con.p_con += "マジックルーム：" + team.con.item + "\n"
        team.con.item = ""
    }

    // メガ進化ボタンの有効化
    if (team.data.megaTxt == "メガ進化"){
        const list = itemEff.megaStone()
        for (let i = 0; i < list.length; i++){
            if (team.con.item == list[i][0] && team.con.name == list[i][1]){
                team.data.megable = false
            }
        }
    }
    // Z技ボタンの有効化
    if (team.data.ZTxt == "Z技"){
        const list = itemEff.Zcrystal()
        for (let i = 0; i < list.length; i++){
            if (list[i][2] == team.con.item){
                for (let j = 0; j < 4; j++){
                    if (cfn.moveSearchByName(team.con["move_" + j])[1] == list[i][0]){
                        team.data.Zable = false
                    }
                }
            }
        }
        const spList = itemEff.spZcrystal()
        for (let i = 0; i < spList.length; i++){
            if (spList[i][2] == team.con.item){
                for (let j = 0; j < 4; j++){
                    if (team.con["move_" + j] == spList[i][3] && team.con.name == spList[i][0]){
                        team.data.Zable = false
                    }
                }
            }
        }
    }

    cfn.logWrite(team, enemy, team.con.TN + "　は　" + team.con.name + "　を　繰り出した　！" + "\n")

    return 

    

    // Z技ボタンの有効化
    if (document.getElementById(team + "_Z_text").textContent == "Z技" && new get(team).item.includes("Z")){
        document.getElementById(team + "_Z_move").disabled = false
    }
}



// 戦闘に出す時の特性の発動 summon_poke
exports.onField = function(user1, user2, team){
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
        cfn.conditionRemove(con, "field", "いやしのねがい")
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
            cfn.conditionRemove(con, "field", "みかづきのまい")
        }
    }
    if ((con.f_con.includes("Zおきみやげ") || con.f_con.includes("Zすてゼリフ")) && con.last_HP < con.full_HP){
        cfn.logWrite(team, enemy, con.TN + "　の　Zおきみやげが　発動した！" + "\n")
        con.last_HP = con.full_HP
        cfn.conditionRemove(con, "field", "Zおきみやげ")
        cfn.conditionRemove(con, "field", "Zすてゼリフ")
    }
    // 2.設置技: 技が使用された順に発動
    if (con.item != "あつぞこブーツ"){
        for (let i = 0; i < con.f_con.split("\n").length - 1; i++){
            if (con.f_con.split("\n")[i].includes("まきびし") && cfn.groundedCheck(con)){
                let num = Number(con.f_con.split("\n")[i].slice(5, 6))
                let damage = Math.floor(con.full_HP / (10 - (num * 2)))
                afn.HPchangeMagic(team, enemy, damage, "-", "まきびし")
            } else if (con.f_con.split("\n")[i].includes("どくびし") && cfn.groundedCheck(con)){
                let num = Number(con.f_con.split("\n")[i].slice(5, 6))
                if (num == 1){
                    afn.makeAbnormal(team, enemy, "どく", 100, "どくびし")
                } else if (num == 2){
                    afn.makeAbnormal(team, enemy, "もうどく", 100, "どくびし")
                }
            } else if (con.f_con.split("\n")[i].includes("ステルスロック")){
                let rate = cfn.compatibilityCheck(enemy, team, cfn.moveSearchByName("アクセルロック"))
                let damage = Math.floor(con.full_HP * rate / 8)
                afn.HPchangeMagic(team, enemy, damage, "-", "ステルスロック")
            } else if (con.f_con.split("\n")[i].includes("ねばねばネット") && cfn.groundedCheck(con)){
                afn.rankChange(team, enemy, "S", -1, 100, "ねばねばネット")
            } else if (con.f_con.split("\n")[i].includes("キョダイコウジン")){
                let rate = cfn.compatibilityCheck(enemy, team, cfn.moveSearchByName("バレットパンチ"))
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
    efn.activeAbility(team, enemy, 1)
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
    if (con.ability == "ぎょぐん" && con.last_HP > con.full_HP / 4 && con.level >= 20 && con.name == "ヨワシ(たんどくのすがた)"){
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　の　ぎょぐん！" + "\n")
        afn.formChenge(team, enemy, "ヨワシ(むれたすがた)")
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

