const dmgClac = require("./damage_calc")
const moveEff = require("./move_effect")
const itemEff = require("./item_effect")
const abiEff = require("./ability_effect")
const afn = require("./function")
const bfn = require("./base_function")
const cfn = require("./law_function")
const efn = require("./ex_function")
const summon = require("./1_summon")
const status = require("./4-1_status_move")

// 追加効果の処理順

exports.moveProcess = function(atk, def, move, order){
    // 2-A. 変化技の効果処理（？）予想ではここだが、明確なソースがない
    if (move[2] == "変化"){ 
        const result = status.statusMoveEffect(atk, def, move)
        // かたやぶりなどの特性無視終了？
        moldBreakStop(atk, def, move)
        if (result == true){
            return "stop"
        }
    } else { // 攻撃技の処理
        // 1.ダメージ計算 [与えたダメージ, タイプ相性, 急所判定, 発生したダメージ]
        let damage = HPDecreaseOperation(atk, def, move, order)
        damage.substitute = def.con.p_con.includes("みがわり")
        // 2.追加効果などの発動
        additionalEffectEtc(atk, def, move, order, damage)
        // 3.防御側の特性
        defenseAbility(atk, def, move, damage)
        // 4.防御側のもちもの
        defenseItem(atk, def, move, damage)
        // 5.防御側のばけのかわ/アイスフェイス
        disguiseIceface(atk, def, move, damage)
        // 6.ひんし判定
        dyingJudge(atk, def, move)
        // 7.ひんしできんちょうかん/かがくへんかガスが解除されたことによる封じられていた効果の発動 (おわりのだいち、はじまりのうみの解除 wikiにない)
        // 8.連続攻撃技である場合、以下の処理を行う(おやこあいも含む)。
        continuousMove(atk, def, move, order)
        // 9.技の効果
        moveEffect(atk, def, move, damage)
        // 10.特性の効果
        abilityEffect(atk, def, move)
        // 11.防御側のもちものの効果
        defenseItemEffect(atk, def, move)
        // 12.コンビネーションわざの効果
        // 13.いにしえのうた/きずなへんげによるフォルムチェンジ
        formChengeAbility(atk, def, move)
        // 14.いのちのたまの反動/かいがらのすずの回復
        lifeorbShellbell(atk, def, damage)
        // 15.オボンのみなど回復のきのみ/チイラのみ/リュガのみ/ヤタピのみ/ズアのみ/カムラのみ/サンのみ/スターのみ/ミクルのみ/きのみジュース
        recoverBerry(atk, def)
        // 16.ききかいひ/にげごしによって手持ちに戻るまで
        emergencyExit(atk, def, damage)
        // 17.とんぼがえり/ボルトチェンジ/クイックターンによって手持ちに戻るまで
        comeBackMove(atk, def, move)
        // 18.アイアンローラーによるフィールドの消失
        steelRoller(atk, def, move) 
        // 19.レッドカードによる交代先の繰り出し
        redCard(atk, def)
        // 20.わるいてぐせ
        pickPocket(atk, def, move)
        // 21.一部の技の効果
        someMoveEffect(atk, def, move)
        // 22.ヒメリのみ/しろいハーブ/のどスプレー/だっしゅつパックによって手持ちに戻るまで
        otherItemEffect(atk, def, move)
        // かたやぶりなどの特性無視終了？
        moldBreakStop(atk, def, move)
        // 23.とんぼがえり/ボルトチェンジ/クイックターン/ききかいひ/にげごし/だっしゅつボタン/だっしゅつパックによる交代先の選択・交代
        if (returnBattle(atk, def)){return "stop"}
        // 24.きょうせい
        
    }
    // 25.おどりこ
    //ability_dancer(atk, def, move, order)
    // 26.次のポケモンの行動
        // 3,4.の効果で攻撃側のポケモンがひんしになる場合、
            // 第七世代以降は、6.で防御側が倒れた後に攻撃側が倒れるため、相打ち時は攻撃側の勝ちとなる。
            // 9.以降の反動ダメージで攻撃側がひんしになった場合、世代に依らず攻撃側の勝ちとなる。
}


// 1.ダメージ計算
function HPDecreaseOperation(atk, def, move, order){
    if (move[0] == "みずしゅりけん" && atk.con.name == "ゲッコウガ(サトシゲッコウガ)"){
        move[3] = 20
    }

    let damage = ""
    // 技の使用ポケモンがひんしとなる可能性のある技
    if (move[0] == "だいばくはつ" || move[0] == "じばく" || move[0] == "ミストバースト" || move[0] == "ビックリヘッド" || move[0] == "てっていこうせん"){
        damage = atk.damage
        delete atk.damage
    } else {
        damage = dmgClac.damageCalculationProcess(atk, def, move, order) // [ダメージ量、タイプ相性、急所判定]
    }
    
    // ばけのかわ
    if (def.con.p_con.includes("ばけたすがた")){
        damage.give = 0
        return damage
    }
    // アイスフェイス
    if (def.con.ability == "アイスフェイス" && def.con.name == "コオリッポ(アイスフェイス)" && move[2] == "物理"){
        damage.give = 0
        return damage
    }
    // ひんしにならない、みがわりがある時
    if (def.con.last_HP - damage.damage > 0 || def.con.p_con.includes("みがわり")){
        damage.give = damage.damage
        return damage
    }

    // ダメージをHP1で食いしばる場合、以下の優先順位で発動する。
    // 1.こらえる
    if (def.con.p_con.includes("こらえる")){
        cfn.logWrite(atk, def, def.con.TN + "チームの　" + def.con.name + "は　攻撃をこらえた！" + "\n")
        damage.give = def.con.last_HP - 1
        return damage
    }
    // 2.がんじょう
    if (def.con.ability == "がんじょう" && def.con.last_HP == def.con.full_HP){
        cfn.logWrite(atk, def, def.con.TN + "チームの　" + def.con.name + "は　がんじょうで　持ちこたえた！" + "\n")
        damage.give = def.con.last_HP - 1
        return damage
    }
    // 3.きあいのタスキ/きあいのハチマキ
    if (def.con.item == "きあいのタスキ" && def.con.last_HP == def.con.full_HP){
        cfn.logWrite(atk, def, def.con.TN + "チームの　" + def.con.name + "は　きあいのタスキで　持ちこたえた！" + "\n")
        damage.give = def.con.last_HP - 1
        cfn.setRecycle(def)
        return damage
    }
    if (def.con.item == "きあいのハチマキ" && Math.random() < 0.1){
        cfn.logWrite(atk, def, def.con.TN + "チームの　" + def.con.name + "は　きあいのハチマキで　持ちこたえた！" + "\n")
        damage.give = def.con.last_HP - 1
        return damage
    }
    // 4.てかげん、みねうちの時(wikiにない)
    if (move[0] == "てかげん" || move[0] == "みねうち"){
        damage.give = def.con.last_HP - 1
        return damage
    }

    // ひんしになる時
    damage.give = def.con.last_HP
    return damage
}

// 2.追加効果などの発動
function additionalEffectEtc(atk, def, move, order, damage){

    damage = afn.damageDeclaration(atk, def, damage, move) // ダメージ量とタイプ相性の宣言

    // 反射技が選択されている時、ダメージの記録
    //reflection_check(def, move, damage, order)

    // 0.「反動で動けない状態」などの付与　（wikiにはない）
    if (moveEff.cannotMove().includes(move[0])){
        atk.con.p_con += "反動で動けない：" + move[0] + "\n"
    }
    if ((move[0] == "あばれる" || move[0] == "はなびらのまい" || move[0] == "げきりん") && !atk.con.p_con.includes("あばれる")){
        atk.con.p_con += "あばれる（" + move[0] + "）　1ターン目" + "\n"
    }
    if (move[0] == "さわぐ" && !atk.con.p_con.includes("さわぐ")){
        atk.con.p_con += "さわぐ　1ターン目" + "\n"
    }
    if (move[0] == "なみのり" && atk.con.ability == "うのミサイル" && !(atk.con.p_con.includes("うのみのすがた") || atk.con.p_con.includes("まるのみのすがた"))){
        if (atk.con.last_HP > atk.con.full_HP / 2){
            atk.con.p_con += "うのみのすがた" + "\n"
            cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　は　うのみのすがたに　姿を変えた！" + "\n")
        } else {
            atk.con.p_con += "まるのみのすがた" + "\n"
            cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　は　まるのみのすがたに　姿を変えた！" + "\n")
        }
    }
    cfn.conditionRemove(atk.con, "poke", "がまん")

    // 1.追加効果 (ひみつのちから/オリジンズスーパーノヴァ/ぶきみなじゅもんを除く)
    const addEff = moveEff.additionalEffect()
    for (let i = 0; i < addEff.length; i++){
        // 自身のランクを変化させる技
        if (move[0] == addEff[i][0] && addEff[i][1] == "s"){
            if (move[0] == "あやしいかぜ" || move[0] == "ぎんいろのかぜ" || move[0] == "げんしのちから"){
                if (Math.random() < 0.1){
                    for (const parameter of ["A", "B", "C", "D", "S"]){
                        afn.rankChange(atk, def, parameter, 1, 100, move, false)
                    }
                }
            } else {
                afn.rankChange(atk, def, addEff[i][3][0], addEff[i][3][1], addEff[i][2], move, false)
            }
        }
        // みがわりがあり、音技でもすりぬけでもない時や、ひんしの時は、追加効果はない
        if (!((damage.substitute && !moveEff.music().includes(move[0]) && atk.con.ability != "すりぬけ") || def.con.last_HP == 0)){
            // 相手のランクを変化させる技
            if (move[0] == addEff[i][0] && addEff[i][1] == "e"){
                for (let j = 3; j < addEff[i].length; j++){
                    if (def.con.ability == "ミラーアーマー"){
                        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "の　ミラーアーマーが　発動した！" + "\n")
                        afn.rankChange(atk, def, addEff[i][j][0], addEff[i][j][1], addEff[i][2], move, true)
                    } else {
                        afn.rankChange(def, atk, addEff[i][j][0], addEff[i][j][1], addEff[i][2], move, true)
                    }
                }
            }
            // 相手を状態異常にする技
            if (move[0] == addEff[i][0] && addEff[i][1] == "a"){
                afn.makeAbnormal(def, atk, addEff[i][3], addEff[i][2], move)
            }
            // 相手をひるみ状態にする技
            if (move[0] == addEff[i][0] && addEff[i][1] == "f" && def.con.ability != "せいしんりょく" && Math.random() * 100 < addEff[i][2] && !(def.data.dynaTxt.includes("3") || def.data.gigaTxt.includes("3"))){
                def.con.p_con += "ひるみ" + "\n"
            }
        }    
    }
    // みがわりがあり、音技でもすりぬけでもない時や、ひんしの時は、追加効果はない
    if (!((damage.substitute && !moveEff.music().includes(move[0]) && atk.con.ability != "すりぬけ") || def.con.last_HP == 0)){
        // その他の追加効果
        if (move[0] == "うたかたのアリア" && def.con.abnormal == "やけど"){
            cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　は　やけどがなおった　！" + "\n")
            def.con.abnormal = ""
        } else if ((move[0] == "かげぬい" || move[0] == "アンカーショット") && !def.con.p_con.includes("逃げられない") && !def.con.type.includes("ゴースト")){ 
            cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　は　逃げられなくなった　！" + "\n")
            def.con.p_con += "逃げられない" + "\n"
        } else if (move[0] == "しっとのほのお" && def.con.p_con.includes("ランク上昇")){ 
            afn.makeAbnormal(def, atk, "やけど", 100, move)
        } else if (move[0] == "じごくづき" && !def.con.p_con.includes("じごくづき")){ 
            cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　は　音技が出せなくなった　！" + "\n")
            def.con.p_con += "じごくづき　2/2" + "\n"
        } else if (move[0] == "トライアタック"){ 
            if (Math.random() < 0.2){
                const random = Math.random()
                if (random < 1 / 3){
                    afn.makeAbnormal(def, atk, "まひ", 100, move)
                } else if (random < 2 / 3){
                    afn.makeAbnormal(def, atk, "こおり", 100, move)
                } else if (random < 1){
                    afn.makeAbnormal(def, atk, "やけど", 100, move)
                }
            }
        } else if (move[0] == "なげつける"){
            if (atk.con.item == "でんきだま"){
                afn.makeAbnormal(def, atk, "まひ", 100, "でんきだま")
            } else if (atk.con.item == "かえんだま"){
                afn.makeAbnormal(def, atk, "やけど", 100, "かえんだま")
            } else if (atk.con.item == "どくバリ"){
                afn.makeAbnormal(def, atk, "どく", 100, "どくバリ")
            } else if (atk.con.item == "どくどくだま"){
                afn.makeAbnormal(def, atk, "どくどく", 100, "どくどくだま")
            } else if ((atk.con.item == "おうじゃのしるし" || atk.con.item == "するどいキバ") && def.con.ability != "せいしんりょく"){
                def.con.p_con += "ひるみ" + "\n"
            } else if (atk.con.item == "メンタルハーブ"){
                cfn.conditionRemove(def.con, "poke", "アンコール")
                cfn.conditionRemove(def.con, "poke", "いちゃもん")
                cfn.conditionRemove(def.con, "poke", "かいふくふうじ")
                cfn.conditionRemove(def.con, "poke", "かなしばり")
                cfn.conditionRemove(def.con, "poke", "ちょうはつ")
                cfn.conditionRemove(def.con, "poke", "メロメロ")
            } else if (atk.con.item == "しろいハーブ"){
                for (const parameter of ["A", "B", "C", "D", "S", "X", "Y"]){
                    def.con[parameter + "_rank"] = Math.max(def.con[parameter + "_rank"], 0)
                }
            } else if (itemEff.berryList().includes(atk.con.item)){
                bfn.eatingBerry(def, atk, atk.con.item)
            }
            cfn.setRecycle(atk)
        }
    }
    
    // 2.自分のランクが下がる技の効果/HP吸収技の吸収効果/はじけるほのおによる火花のダメージ/コアパニッシャーによる効果
    const otherEff = moveEff.otherEffect()
    for (let i = 0; i < otherEff.length; i++){
        // 自分のランクが下がる技
        if (move[0] == otherEff[i][0] && otherEff[i][1] == "d" && move[0] != "スケイルショット"){
            for (j = 2; j < otherEff[i].length; j++){
                afn.rankChange(atk, def, otherEff[i][j][0], otherEff[i][j][1], 100, move, false)
            }
        }
        // HP吸収技
        if (move[0] == otherEff[i][0] && otherEff[i][1] == "r"){ 
            let change = Math.round(damage.give * otherEff[i][2])
            if (atk.con.item == "おおきなねっこ"){
                change = cfn.fiveCut(change * 5324 / 4096)
            }
            if (def.con.ability == "ヘドロえき"){
                afn.HPchangeMagic(atk, def, change, "-", move)
            } else {
                afn.HPchangeMagic(atk, def, change, "+", move)
            }
        }
    }

    // コアパニッシャーによる効果
    if (!((damage.substitute && !moveEff.music().includes(move[0]) && atk.con.ability != "すりぬけ") || def.con.last_HP == 0)){
        if (move[0] == "コアパニッシャー" && atk == order[1] && !def.con.p_con.includes("特性なし") && !abiEff.gastro().includes(def.con.ability)){
            if (def.con.ability != ""){
                def.con.p_con += "特性なし：" + def.con.ability + "\n"
                def.con.ability = ""
            } else {
                for (let i = 0; i < def.con.p_con.split("\n").length; i++){
                    if (def.con.p_con.split("\n")[i].includes("かがくへんかガス")){
                        def.con.p_con += "特性なし：" + def.con.p_con.split("\n")[i].slice(9) + "\n"
                    }
                }
            }
            cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　は　特性が消された！" + "\n")
        }
    }
    // 3.ダイマックスわざの効果
    if (move[0] == "ダイナックル"){
        afn.rankChange(atk, def, "A", 1, 100, move, true)
    } else if (move[0] == "ダイスチル"){
        afn.rankChange(atk, def, "B", 1, 100, move, true)
    } else if (move[0] == "ダイアシッド"){
        afn.rankChange(atk, def, "C", 1, 100, move, true)
    } else if (move[0] == "ダイアース"){
        afn.rankChange(atk, def, "D", 1, 100, move, true)
    } else if (move[0] == "ダイジェット"){
        afn.rankChange(atk, def, "S", 1, 100, move, true)
    } else if (move[0] == "ダイドラグーン" && def.con.last_HP > 0){
        afn.rankChange(def, atk, "A", -1, 100, move, true)
    } else if (move[0] == "ダイホロウ" && def.con.last_HP > 0){
        afn.rankChange(def, atk, "B", -1, 100, move, true)
    } else if (move[0] == "ダイワーム" && def.con.last_HP > 0){
        afn.rankChange(def, atk, "C", -1, 100, move, true)
    } else if (move[0] == "ダイアーク" && def.con.last_HP > 0){
        afn.rankChange(def, atk, "D", -1, 100, move, true)
    } else if (move[0] == "ダイアタック" && def.con.last_HP > 0){
        afn.rankChange(def, atk, "S", -1, 100, move, true)
    } else if (move[0] == "ダイバーン" && !atk.con.f_con.includes("にほんばれ")){
        bfn.allFieldStatus(atk, def, cfn.moveSearchByName("にほんばれ"))
    } else if (move[0] == "ダイストリーム" && !atk.con.f_con.includes("あめ")){
        bfn.allFieldStatus(atk, def, cfn.moveSearchByName("あまごい"))
    } else if (move[0] == "ダイロック" && !atk.con.f_con.includes("すなあらし")){
        bfn.allFieldStatus(atk, def, cfn.moveSearchByName("すなあらし"))
    } else if (move[0] == "ダイアイス" && !atk.con.f_con.includes("あられ")){
        bfn.allFieldStatus(atk, def, cfn.moveSearchByName("あられ"))
    } else if (move[0] == "ダイサンダー" && !atk.con.f_con.includes("エレキフィールド")){
        bfn.allFieldStatus(atk, def, cfn.moveSearchByName("エレキフィールド"))
    } else if (move[0] == "ダイソウゲン" && !atk.con.f_con.includes("グラスフィールド")){
        bfn.allFieldStatus(atk, def, cfn.moveSearchByName("グラスフィールド"))
    } else if (move[0] == "ダイサイコ" && !atk.con.f_con.includes("サイコフィールド")){
        bfn.allFieldStatus(atk, def, cfn.moveSearchByName("サイコフィールド"))
    } else if (move[0] == "ダイフェアリー" && !atk.con.f_con.includes("ミストフィールド")){
        bfn.allFieldStatus(atk, def, cfn.moveSearchByName("ミストフィールド"))
    } else if (move[0] == "キョダイカンデン" && def.con.last_HP > 0){
        if (Math.random() < 0.5){
            afn.makeAbnormal(def, atk, "まひ", 100, move)
        } else {
            afn.makeAbnormal(def, atk, "どく", 100, move)
        }
    } else if (move[0] == "キョダイカンロ"){
        if (atk.con.abnormal != ""){
            cfn.logWrite(atk, def, atk.con.TM + "　の　" + atk.con.name + "　の　状態異常が治った" + "\n")
            atk.con.abnormal = ""
        }
    } else if (move[0] == "キョダイガンジン" && !def.con.f_con.includes("ステルスロック")){
        def.con.f_con += "ステルスロック" + "\n"
        cfn.logWrite(atk, def, def.con.TN + "　の場に尖った石が漂い始めた" + "\n")
    } else if (move[0] == "キョダイゲンエイ" && !def.con.p_con.includes("逃げられない") && !def.con.type.includes("ゴースト")){
        def.con.p_con += "逃げられない" + "\n"
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　は　逃げられなくなった" + "\n")
    } else if (move[0] == "キョダイゲンスイ" &&  def.con.used != "" && def.con.last_HP > 0){
        for (let i = 0; i < 4; i++){
            if (def.con["move_" + i] == def.con.used && def.con["last_" + i] > 0){
                cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "の　" + def.con.used + "　の　PPが減った" + "\n")
                def.con["last_" + i] = Math.max(def.con["last_" + i] - 2, 0)
            }
        }
    } else if (move[0] == "キョダイコウジン" && !def.con.f_con.includes("キョダイコウジン")){
        def.con.f_con += "キョダイコウジン" + "\n"
        cfn.logWrite(atk, def, def.con.TN + "　の　の場に尖った鉄が漂い始めた" + "\n")
    } else if (move[0] == "キョダイコバン" && def.con.last_HP > 0){
        afn.makeAbnormal(def, atk, "こんらん", 100, move)
    } else if (move[0] == "キョダイコワク" && def.con.last_HP > 0){
        if (Math.random() < 1 / 3){
            afn.makeAbnormal(def, atk, "まひ", 100, move)
        } else if (Math.random() < 1 / 2){
            afn.makeAbnormal(def, atk, "どく", 100, move)
        } else {
            afn.makeAbnormal(def, atk, "ねむり", 100, move)
        }
    } else if (move[0] == "キョダイサイセイ" && atk.con.item == "" && itemEff.berryList().includes(atk["poke" + cfn.battleNum(atk)].recycle) && Math.random()){
        atk.con.item = atk["poke" + cfn.battleNum(atk)].recycle
        atk["poke" + cfn.battleNum(atk)].recycle = ""
        cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　は　" + atk.con.item + "　を　拾ってきた" + "\n")
    } else if (move[0] == "キョダイサンゲキ" && def.con.last_HP > 0){
        afn.rankChange(def, atk, "Y", -1, 100, move, true)
    } else if (move[0] == "キョダイシュウキ" && def.con.last_HP > 0){
        afn.makeAbnormal(def, atk, "どく", 100, move)
    } else if (move[0] == "キョダイシンゲキ"){
        cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　は　張り切っている！" + "\n")
        if (!atk.con.p_con.includes("キョダイシンゲキ")){
            atk.con.p_con += "キョダイシンゲキ　+1"
        } else {
            let list = atk.con.p_con.split("\n")
            for (let i = 0; i < list.length; i++){
                if (list[i] == "キョダイシンゲキ　+1"){
                    list[i] = "キョダイシンゲキ　+2"
                } else if (list[i] == "キョダイシンゲキ　+2"){
                    list[i] = "キョダイシンゲキ　+3"
                }
            }
            atk.con.p_con = list.join("\n")
        }
    } else if (move[0] == "キョダイスイマ" && !def.con.p_con.includes("ねむけ") && Math.random() < 0.5 && def.con.last_HP > 0){
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　は　眠気を誘われた" + "\n")
        def.con.p_con += "ねむけ　宣言ターン" + "\n"
    } else if (move[0] == "キョダイセンリツ" && !atk.con.f_con.includes("オーロラベール")){
        cfn.logWrite(atk, def, atk.con.TN + "　の　場にオーロラベールが現れた！" + "\n")
        if (atk.con.item == "ひかりのねんど"){
            atk.con.p_con += "オーロラベール　8/8" + "\n"
        } else {
            atk.con.p_con += "オーロラベール　5/5" + "\n"
        }
    } else if (move[0] == "キョダイダンエン"){
        afn.HPchangeMagic(atk, def, Math.floor(atk.con.full_HP / 6), "+", move)
    } else if (move[0] == "キョダイテンドウ" && !atk.con.f_con.includes("じゅうりょく")){
        cfn.logWrite(atk, def, "重力が強くなった！" + "\n")
        atk.con.f_con += "じゅうりょく　5/5" + "\n"
        def.con.f_con += "じゅうりょく　5/5" + "\n"
    } else if (move[0] == "キョダイテンバツ" && def.con.last_HP > 0){
        afn.makeAbnormal(def, atk, "こんらん", 100, move)
    } else if (move[0] == "キョダイバンライ" && def.con.last_HP > 0){
        afn.makeAbnormal(def, atk, "まひ", 100, move)
    } else if (move[0] == "キョダイフウゲキ"){
        cfn.logWrite(atk, def, "お互いの場のものが飛び去った" + "\n")
        cfn.conditionRemove(def.con, "field", "しろいきり")
        cfn.conditionRemove(def.con, "field", "しんぴのまもり")
        cfn.conditionRemove(def.con, "field", "リフレクター")
        cfn.conditionRemove(def.con, "field", "ひかりのかべ")
        cfn.conditionRemove(def.con, "field", "オーロラベール")
        for (const team of [atk, def]){
            cfn.conditionRemove(team.con, "field", "まきびし")
            cfn.conditionRemove(team.con, "field", "どくびし")
            cfn.conditionRemove(team.con, "field", "ステルスロック")
            cfn.conditionRemove(team.con, "field", "ねばねばネット")
            cfn.conditionRemove(team.con, "field", "キョダイコウジン")
            cfn.conditionRemove(team.con, "field", "フィールド")
        }

    } else if (move[0] == "キョダイホーヨー" && !def.con.p_con.includes("メロメロ") && def.con.last_HP > 0 && ((atk.con.sex == " ♂ " && def.con.sex == " ♀ ") || (atk.con.sex == " ♀ " && def.con.sex == " ♂ "))){
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　は　メロメロになった" + "\n")
        def.con.p_con += "メロメロ" + "\n"
    } else if (move[0] == "キョダイホウマツ" && def.con.last_HP > 0){
        afn.rankChange(def, atk, "S", -2, 100, move, true)
    } else if ((move[0] == "キョダイベンタツ" || move[0] == "キョダイゴクエン" || move[0] == "キョダイホウゲキ" || move[0] == "キョダイフンセキ") && !def.con.f_con.includes(move[0])){
        def.con.f_con += move[0] + "\n"
        cfn.logWrite(atk, def, def.con.TN + "　の場が　" + move[0] + "　で囲まれた" + "\n")
    } else if ((move[0] == "キョダイサジン" || move[0] == "キョダイヒャッカ") && !def.con.p_con.includes("バインド") && !damage.substitute && def.con.last_HP > 0){
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　は　しめつけられた！" + "\n")
        if (atk.con.item == "ねばりのかぎづめ"){
            def.con.p_con += "バインド（長）　0ターン目" + "\n"
        } else if (atk.con.item == "しめつけバンド"){
            def.con.p_con += "バインド（強）　0ターン目" + "\n"
        } else {
            def.con.p_con += "バインド　0ターン目" + "\n"
        }
    }
    // 4.防御側のいかり
    if (def.con.p_con.includes("いかり") && move[2] != "変化" && (!damage.substitute || moveEff.music().includes(move[0]) || atk.con.ability == "すりぬけ" || def.con.last_HP > 0)){
        afn.rankChange(def, atk, "A", 1, 100, "いかり", true)
    }
    // 5.防御側のナゾのみ
    if (def.con.item == "ナゾのみ" && cfn.compatibilityCheck(atk, def, move) > 1 && (!damage.substitute || moveEff.music().includes(move[0]) || atk.con.ability == "すりぬけ" || def.con.last_HP > 0)){
        if (def.con.ability == "じゅくせい"){
            afn.HPchangeMagic(def, atk, Math.floor(def["poke" + cfn.battleNum(def)].full_HP / 2), "+", "ナゾのみ")
        } else {
            afn.HPchangeMagic(def, atk, Math.floor(def["poke" + cfn.battleNum(def)].full_HP / 4), "+", "ナゾのみ")
        }
        cfn.setRecycle(def)
        cfn.setBelch(def)
    }
    // 6.防御側のくちばしキャノン
    if (def.con.p_con.includes("くちばしキャノン") && move[6] == "直接" && atk.con.item != "ぼうごパット" && (!damage.substitute || music_move_list.includes(move[0]) || atk.con.ability == "すりぬけ")){
        afn.makeAbnormal(atk, def, "やけど", 100, "くちばしキャノン")
    }
    // 7.やきつくす/クリアスモッグの効果　こちこちフロストの効果（wikiにはなかった）
    if (move[0] == "やきつくす" && def.con.ability != "ねんちゃく" && (!damage.substitute || moveEff.music().includes(move[0]) || atk.con.ability == "すりぬけ" || def.con.last_HP > 0)){
        if (itemEff.berryList().includes(def.con.item) || def.con.item.includes("ジュエル")){
            cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　の　" + def.con.item + "は　焼き尽くされた！" + "\n")
            def.con.item = ""
            if (def.con.ability == "かるわざ"){
                def.con.p_con += "かるわざ" + "\n"
            }
        }
    }
    if ((move[0] == "クリアスモッグ" || move[0] == "こちこちフロスト") && (!damage.substitute || moveEff.music().includes(move[0]) || atk.con.ability == "すりぬけ" || def.con.last_HP > 0)){
        cfn.logWrite(atk, def, def.con.TN + "チームの　" + def.con.name + "　の　能力変化が元に戻った！" + "\n")
        for (const parameter of ["A", "B", "C", "D", "S", "X", "Y"]){
            def.con[parameter + "_rank"] = 0
        }
    }
    if (move[0] == "すくすくボンバー" && !def.con.p_con.includes("やどりぎのタネ") && (!damage.substitute || moveEff.music().includes(move[0]) || atk.con.ability == "すりぬけ" || def.con.last_HP > 0)){
        def.con.p_con = "やどりぎのタネ" + "\n"
        cfn.logWrite(atk, def, def.con.TN + "チームの　" + def.con.name + "　に　タネを植え付けた！" + "\n")
    }
    if (move[0] == "どばどばオーラ" && !atk.con.f_con.includes("ひかりのかべ")){
        if (atk.con.item == "ひかりのねんど"){
            atk.con.f_con = "ひかりのかべ　8/8" + "\n"
        } else {
            atk.con.f_con = "ひかりのかべ　5/5" + "\n"
        }
        cfn.logWrite(atk, def, "ひかりのかべが　現れた！" + "\n")
    }
    if (move[0] == "わるわるゾーン" && !atk.con.f_con.includes("リフレクター")){
        if (atk.con.item == "ひかりのねんど"){
            atk.con.f_con = "リフレクター　8/8" + "\n"
        } else {
            atk.con.f_con = "リフレクター　5/5" + "\n"
        }
        cfn.logWrite(atk, def, "リフレクターが　現れた！" + "\n")
    }
    if (move[0] == "きらきらストーム" && atk.con.abnormal != ""){
        atk.con.abnormal = ""
        cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk_poke + "　の　" + atk_abnormal + "　が　なおった" + "\n")
    }
    // 8.防御側のおんねん
    if (def.con.p_con.includes("おんねん") && def.con.last_HP == 0){
        if (atk.data.dynaTxt.includes("3") || atk.data.gigaTxt.includes("3") || atk.data.Z){
            atk.con["last_" + atk.data.command] = 0
            atk["poke" + cfn.battleNum(atk)]["last_" + atk.data.command] = 0
            cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　の　" + atk.con["move_" + atk.data.command] + "　はおんねんで　PPが0になった　！" + "\n")
        } else {
            for (let i = 0; i < 4; i++){
                if (atk.con.used == atk.con["move_" + i]){
                    atk.con["last_" + i]= 0
                    atk["poke" + cfn.battleNum(atk)]["last_" + i] = 0
                    cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　の　" + atk.con["move_" + i] + "　はおんねんで　PPが0になった　！" + "\n")
                }
            }
        }
    }
    // 9.攻撃側のどくしゅ
    if (atk.con.ability == "どくしゅ" && move[6] == "直接" && (!damage.substitute || moveEff.music().includes(move[0]) || atk.con.ability == "すりぬけ" || def.con.last_HP > 0)){
        afn.makeAbnormal(def, atk, "どく", 30, "どくしゅ")
    }
    // 10.攻撃側のするどいキバ：wikiにない
    if ((atk.con.item == "おうじゃのしるし" || atk.con.item == "するどいキバ" || atk.con.ability == "あくしゅう") && Math.random() < 0.1 && (!damage.substitute || moveEff.music().includes(move[0]) || atk.con.ability == "すりぬけ" || def.con.last_HP > 0) && def.con.ability != "せいしんりょく"){
        def.con.p_con += "ひるみ" + "\n"
    }
}

// かたやぶりなどの特性無視終了？

// 3.防御側の特性
function defenseAbility(atk, def, move, damage){
    // ゆうばく: 直接攻撃を受けてひんしになったとき
    if (def.con.ability == "ゆうばく" && def.con.last_HP == 0 && move[6] == "直接" && atk.con.item != "ぼうごパット" && atk.con.ability != "しめりけ"){
        afn.HPchangeMagic(atk, def, Math.floor(atk.con.full_HP / 4), "-", "ゆうばく")
    }
    // とびだすなかみ: ひんしになったとき
    if (def.con.ability == "とびだすなかみ" && def.con.last_HP == 0){
        afn.HPchangeMagic(atk, def, damage.give, "-", "とびだすなかみ")
    }
    // シンクロ: 状態異常になったとき
    // てつのトゲ/さめはだ/ほうし/どくのトゲ/せいでんき/ほのおのからだ/メロメロボディ/ミイラ/ぬめぬめ/カーリーヘアー/さまようたましい/ほろびのボディ: 直接攻撃を受けたとき
    if (move[6] == "直接" && atk.con.item != "ぼうごパット" && (!damage.substitute || moveEff.music().includes(move[0]) || atk.con.ability == "すりぬけ")){
        const random = Math.random() * 100
        if (def.con.ability == "てつのトゲ" || def.con.ability == "さめはだ"){
            afn.HPchangeMagic(atk, def, Math.floor(atk.con.full_HP / 8), "-", def.con.ability)
        } else if (def.con.ability == "ほうし" && atk.con.ability != "ぼうじん" && atk.con.item != "ぼうじんゴーグル" && !atk.con.type.includes("くさ")){
            if (random < 9){
                afn.makeAbnormal(atk, def, "どく", 100, "ほうし")
            } else if (random < 19){
                afn.makeAbnormal(atk, def, "まひ", 100, "ほうし")
            } else if (random < 30){
                afn.makeAbnormal(atk, def, "ねむり", 100, "ほうし")
            }
        } else if (def.con.ability == "どくのトゲ"){
            afn.makeAbnormal(atk, def, "どく", 30, "どくのトゲ")
        } else if (def.con.ability == "せいでんき"){
            afn.makeAbnormal(atk, def, "まひ", 30, "せいでんき")
        } else if (def.con.ability == "ほのおのからだ"){
            afn.makeAbnormal(atk, def, "やけど", 30, "ほのおのからだ")
        } else if (def.con.ability == "メロメロボディ" && random < 30 && ((atk.con.sex == " ♂ " && def.con.sex == " ♀ ") || (atk.con.sex == " ♀ " && def.con.sex == " ♂ ")) && !atk.con.p_con.includes("メロメロ")){
            def.con.p_con += "メロメロ" + "\n"
            cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　は　メロメロに　なってしまった！" + "\n")
            if (atk.con.item == "メンタルハーブ"){
                cfn.conditionRemove(atk.con, "poke", "メロメロ")
                cfn.setRecycle(atk)
                cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　の　メンタルハーブが発動した" + "\n")
            }
        } else if (def.con.ability == "ミイラ" && !abiEff.mummy().includes(atk.con.ability)){
            afn.changeAbility(atk, def, 3, "ミイラ")
        } else if (def.con.ability == "ぬめぬめ" || def.con.ability == "カーリーヘアー"){
            if (atk.con.ability == "ミラーアーマー"){
                cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　の　ミラーアーマーが　発動した！" + "\n")
                afn.rankChange(def, atk, "S", -1, 100, def.con.ability, true)
                bfn.whiteHerb(def, atk)
            } else {
                afn.rankChange(atk, def, "S", -1, 100, def.con.ability, true)
                bfn.whiteHerb(atk, def)
            }
        } else if (def.con.ability == "さまようたましい" && !abiEff.wanderSpirit().includes(atk.con.ability)){
            afn.changeAbility(atk, def, 2, "NA")
        } else if (def.con.ability == "ほろびのボディ"){
            const check = 0
            if (!atk.con.p_con.includes("ほろびカウント")){
                atk.con.p_con = "ほろびカウント　4" + "\n"
                check += 1
            }
            if (!def.con.p_con.includes("ほろびカウント")){
                def.con.p_con = "ほろびカウント　4" + "\n"
                check += 1
            }
            if (check > 0){
                cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　の　ほろびのボディが　発動した！" + "\n")
            }
        }
    }
    // のろわれボディ/イリュージョン/じきゅうりょく/すなはき/わたげ/うのミサイル: 攻撃技を受けたとき
    if (!damage.substitute || moveEff.music().includes(move[0]) || atk.con.ability == "すりぬけ"){
        if (def.con.ability == "のろわれボディ" && Math.random() < 0.3 && !atk.con.p_con.includes("かなしばり")){
            atk.con.p_con += "かなしばり　4/4：" + atk.con.used + "\n"
            cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　の　のろわれボディが　発動した！" + "\n")
            if (atk.con.item == "メンタルハーブ"){
                cfn.conditionRemove(atk.con, "poke", "かなしばり")
                cfn.setRecycle(atk)
                cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　の　メンタルハーブが　発動した！" + "\n")
            }
        } else if (def.con.p_con.includes("イリュージョン")){
            cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　の　イリュージョン　が解けた！" + "\n")
            let list = def.con.p_con.split("\n")
            for (let i = 0; i < list.length; i++){
                if (list[i].includes("イリュージョン")){
                    for (const parameter of ["name", "sex", "level", "type"]){
                        def.con[parameter] = def["poke" + list[i].slice(8)][parameter]
                        list.splice(i, 1)
                        break
                    }
                }
            }
            def.con.p_con = list.join("\n")
        } else if (def.con.ability == "じきゅうりょく" && !def.con.f_con.includes("ひんし")){
            afn.rankChange(def, atk, "B", 1, 100, "じきゅうりょく", true)
        } else if (def.con.ability == "すなはき" && !atk.con.f_con.includes("すなあらし")){
            cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　の　すなはきが　発動した！" + "\n")
            bfn.allFieldStatus(atk, def, cfn.moveSearchByName("すなあらし"))
        } else if (def.con.ability == "わたげ"){
            if (atk.con.ability == "ミラーアーマー"){
                cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　の　ミラーアーマーが　発動した！" + "\n")
                afn.rankChange(def, atk, "S", -1, 100, "わたげ", true)
                bfn.whiteHerb(def, atk)
            } else {
                afn.rankChange(atk, def, "S", -1, 100, "わたげ", true)
                bfn.whiteHerb(atk, def)
            }
        } else if (def.con.ability == "うのミサイル"){
            if (def.con.p_con.includes("うのみのすがた")){
                if (atk.con.ability == "ミラーアーマー"){
                    cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　の　ミラーアーマーが　発動した！" + "\n")
                    afn.rankChange(def, atk, "B", -1, 100, "うのミサイル", true)
                    bfn.whiteHerb(def, atk)
                } else {
                    afn.rankChange(atk, def, "B", -1, 100, "うのミサイル", true)
                    bfn.whiteHerb(atk, def)
                }
                afn.HPchangeMagic(atk, def, Math.floor(atk.con.full_HP / 4), "-", "うのミサイル")
                bfn.berryPinch(atk, def)
                cfn.conditionRemove(def.con, "poke", "うのみのすがた")
            } else if (def.con.p_con.includes("まるのみのすがた")){
                afn.makeAbnormal(atk, def, "まひ", 100, "うのミサイル")
                afn.HPchangeMagic(atk, def, Math.floor(atk.con.full_HP / 4), "-", "うのミサイル")
                cfn.conditionRemove(def.con, "poke", "まるのみのすがた")
                bfn.berryAbnormal(atk, def)
                bfn.berryPinch(atk, def)
            }
        }
    }
    // みがわりやひんしであれば、これ以降の効果は発動しない
    if ((damage.substitute && !moveEff.music().includes(move[0]) && atk.con.ability != "すりぬけ") || def.con.last_HP == 0){
        return
    }
    // くだけるよろい: 物理技を受けたとき
    if (move[2] == "物理" && def.con.ability == "くだけるよろい"){
        afn.rankChange(def, atk, "B", -1, 100, def.con.ability, true)
        afn.rankChange(def, atk, "S", 2, 100, move, true)
        bfn.whiteHerb(def, atk)
    }
    // みずがため/せいぎのこころ/びびり/じょうききかん: 特定のタイプの攻撃技を受けたとき
    if (def.con.ability == "みずがため" && move[1] == "みず"){
        afn.rankChange(def, atk, "B", 2, 100, def.con.ability, true)
    } else if (def.con.ability == "せいぎのこころ" && move[1] == "あく"){
        afn.rankChange(def, atk, "A", 1, 100, def.con.ability, true)
    } else if (def.con.ability == "びびり" && (move[1] == "あく" || move[1] == "ゴースト" || move[1] == "むし")){
        afn.rankChange(def, atk, "S", 1, 100, def.con.ability, true)
    } else if (def.con.ability == "じょうききかん" && (move[1] == "みず" || move[1] == "ほのお")){
        afn.rankChange(def, atk, "S", 6, 100, def.con.ability, true)
    }
    // いかりのつぼ：wikiにない
    if (def.con.ability == "いかりのつぼ" && damage.critical){
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　の　いかりのつぼが　発動した！" + "\n")
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　の　攻撃が　最大まで上がった！" + "\n")
        def.con.A_rank = 6
    }
}

// 4.防御側のもちもの
function defenseItem(atk, def, move, damage){
    // みがわり状態では発動しない
    if (damage.substitute && !moveEff.music().includes(move[0]) && atk.con.ability != "すりぬけ"){
        return
    }
    // ゴツゴツメット/ジャポのみ/レンブのみ/じゃくてんほけん/じゅうでんち/ゆきだま/きゅうこん/ひかりごけ/くっつきバリ/ふうせん
    if (def.con.item == "ゴツゴツメット" && move[6] == "直接" && atk.con.item != "ぼうごパッド"){
        afn.HPchangeMagic(atk, def, Math.floor(atk.con.full_HP / 6), "-", def.con.item)
        if (atk.con.last_HP > 0){
            bfn.berryPinch(atk, def)
        }
    } else if ((def.con.item == "ジャポのみ" && move[2] == "物理") || (def.con.item == "レンブのみ" && move[2] == "特殊")){
        if (def.con.ability == "じゅくせい"){
            afn.HPchangeMagic(atk, def, Math.floor(atk["poke" + cfn.battleNum(atk)].full_HP / 4), "-", def.con.item)
        } else {
            afn.HPchangeMagic(atk, def, Math.floor(atk["poke" + cfn.battleNum(atk)].full_HP / 8), "-", def.con.item)
        }
        cfn.setRecycle(def)
        cfn.setBelch(def)
        if (atk.con.last_HP > 0){
            bfn.berryPinch(atk, def)
        }
    } else if (def.con.item == "じゃくてんほけん" && damage.compatibility > 1 && def.con.last_HP > 0){
        afn.rankChange(def, atk, "A", 2, 100, def.con.item, true)
        afn.rankChange(def, atk, "C", 2, 100, def.con.item, true)
        cfn.setRecycle(def)
    } else if (def.con.item == "じゅうでんち" && move[1] == "でんき" && def.con.last_HP > 0){
        afn.rankChange(def, atk, "A", 1, 100, def.con.item, true)
        cfn.setRecycle(def)
    } else if (def.con.item == "ゆきだま" && move[1] == "こおり" && def.con.last_HP > 0){
        afn.rankChange(def, atk, "A", 1, 100, def.con.item, true)
        cfn.setRecycle(def)
    } else if (def.con.item == "きゅうこん" && move[1] == "みず" && def.con.last_HP > 0){
        afn.rankChange(def, atk, "C", 1, 100, def.con.item, true)
        cfn.setRecycle(def)
    } else if (def.con.item == "ひかりごけ" && move[1] == "みず" && def.con.last_HP > 0){
        afn.rankChange(def, atk, "D", 1, 100, def.con.item, true)
        cfn.setRecycle(def)
    } else if (def.con.item == "くっつきバリ" && move[6] == "直接" && atk.con.item == ""){
        atk.con.item = "くっつきバリ"
        def.con.item = ""
    } else if (def.con.item == "ふうせん"){
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "の　ふうせんがわれた！" + "\n")
        cfn.setRecycle(def)
    }
    //(きあいのタスキ/きあいのハチマキはここで発動した旨のメッセージが出るが、ダメージ計算時(1.)で発動している)
}

// 5.防御側のばけのかわ/アイスフェイス
function disguiseIceface(atk, def, move, damage){
    // みがわり状態では発動しない
    if (damage.substitute && !moveEff.music().includes(move[0]) && atk.con.ability != "すりぬけ"){
        return
    }
    if (def.con.ability == "ばけのかわ" && def.con.p_con.includes("ばけたすがた")){
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "の　化けの皮が剥がれた！" + "\n")
        afn.HPchangeMagic(def, atk, Math.floor(def["poke" + cfn.battleNum(def)].full_HP / 8), "-", def.con.ability)
        cfn.conditionRemove(def.con, "poke", "ばけたすがた")
        def.con.p_con += "ばれたすがた" + "\n"
        def["poke" + cfn.battleNum(def)].form = "ばれたすがた"
    }
    if (def.con.ability == "アイスフェイス" && def.con.name == "コオリッポ(アイスフェイス)" && move[2] == "物理"){
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "の　アイスフェイス！" + "\n")
        afn.formChenge(def, atk, "コオリッポ(ナイスフェイス)")
    }
}

// 6.ひんし判定
function dyingJudge(atk, def, move){
    // 1.いのちがけ使用者のひんし
    if (move[0] == "いのちがけ"){
        atk.con.last_HP = 0
        atk["poke" + cfn.battleNum(atk)].last_HP = 0
        summon.comeBack(atk, def)
    }
    let check = 0
    // 2.技を受けたポケモンのひんし
    if (def.con.last_HP == 0){
        if (def.con.p_con.includes("みちづれ") && !(atk.data.dynaTxt.includes("3") || atk.data.gigaTxt.includes("3"))){
            check += 1
        }
        summon.comeBack(def, atk)
    }
    // 3.みちづれの発動による攻撃者のひんし
    if (def.con.f_con.includes("ひんし") && check == 1){
        cfn.logWrite(atk, def, "みちづれが　発動した！" + "\n")
        atk.con.last_HP = 0
        atk["poke" + cfn.battleNum(atk)].last_HP = 0
        summon.comeBack(atk, def)
    }
}

// 8.連続攻撃技である場合、以下の処理を行う(おやこあいも含む)。
function continuousMove(atk, def, move, order){
    const list = moveEff.continue()
    for (let i = 0; i < list.length; i++){
        if (move[0] == list[i][0]){
            let check = 1
            if (move[0] == "トリプルキック" || move[0] == "トリプルアクセル"){
                for (let j = 0; j < 2; j++){
                    // 1.攻撃側と防御側のポケモンの回復のきのみ・HP1/4で発動するピンチきのみ・きのみジュースの発動判定
                    bfn.berryPinch(atk, def)
                    bfn.berryPinch(def, atk)
                    // 2.攻撃側のポケモンがひんし・ねむり状態になった場合、連続攻撃は中断される。
                    if (bfn.accuracyFailure(atk, def, move, order) && atk.con.ability != "スキルリンク"){
                        break
                    }
                    if (atk.con.last_HP > 0 && def.con.last_HP > 0 && atk.con.abnormal != "ねむり"){
                        if (move[0] == "トリプルキック"){
                            move[3] = 10 * (j + 2)
                        } else if (move[0] == "トリプルアクセル"){
                            move[3] = 20 * (j + 2)
                        }
                        // 1.ダメージ計算 [与えたダメージ, タイプ相性, 急所判定, 発生したダメージ]
                        let damage = HPDecreaseOperation(atk, def, move, order)
                        damage.substitute = def.con.p_con.includes("みがわり")
                        // 2.追加効果などの発動
                        additionalEffectEtc(atk, def, move, order, damage)
                        // 3.防御側の特性
                        defenseAbility(atk, def, move, damage)
                        // 4.防御側のもちもの
                        defenseItem(atk, def, move, damage)
                        // 5.防御側のばけのかわ/アイスフェイス
                        disguiseIceface(atk, def, move, damage)
                        // 6.ひんし判定
                        dyingJudge(atk, def, move)
                        // 7.ひんしできんちょうかん/かがくへんかガスが解除されたことによる封じられていた効果の発動

                        check += 1
                    }
                }
            } else {
                let number = list[i][1]
                if (list[i][1] == 5){
                    const convert = [[0, 2], [35, 3], [70, 4], [85, 5]]
                    const random = Math.random() * 100
                    for (let j = 0; j < 4; j++){
                        if (random > convert[j][0]){
                            number = convert[j][1]
                        }
                    }
                    if (atk.con.ability == "スキルリンク"){
                        number = 5
                    }
                }
                if (move[0] == "みずしゅりけん" && atk.con.name == "ゲッコウガ(サトシゲッコウガ)"){
                    number = 3
                }
                let beat_up = []
                if (move[0] == "ふくろだたき"){
                    for (let i = 0; i < 3; i++){
                        if (atk["poke" + i].life == "控え" && atk["poke" + i].abnormal == ""){
                            number += 1
                            beat_up.push(Math.floor(atk["poke" + i].A_AV / 10 + 5))
                        }
                    }
                }
                // 3.攻撃が続く場合は1.からの処理を繰り返す。終了する場合は「○発当たった！」の表示後9.に進む。
                for (let j = 0; j < number - 1; j++){
                    // 1.攻撃側と防御側のポケモンの回復のきのみ・HP1/4で発動するピンチきのみ・きのみジュースの発動判定
                    bfn.berryPinch(atk, def)
                    bfn.berryPinch(def, atk)
                    // 2.攻撃側のポケモンがひんし・ねむり状態になった場合、連続攻撃は中断される。
                    if (atk.con.last_HP > 0  && def.con.last_HP > 0 && atk.con.abnormal != "ねむり"){
                        // 1.ダメージ計算 [与えたダメージ, タイプ相性, 急所判定, 発生したダメージ]
                        if (move[0] == "ふくろだたき"){
                            move[3] = beat_up[j]
                        }
                        let damage = HPDecreaseOperation(atk, def, move, order)
                        damage.substitute = def.con.p_con.includes("みがわり")
                        // 2.追加効果などの発動
                        additionalEffectEtc(atk, def, move, order, damage)
                        // 3.防御側の特性
                        defenseAbility(atk, def, move, damage)
                        // 4.防御側のもちもの
                        defenseItem(atk, def, move, damage)
                        // 5.防御側のばけのかわ/アイスフェイス
                        disguiseIceface(atk, def, move, damage)
                        // 6.ひんし判定
                        dyingJudge(atk, def, move)
                        // 7.ひんしできんちょうかん/かがくへんかガスが解除されたことによる封じられていた効果の発動
                        check += 1
                    }
                }
            }
            cfn.logWrite(atk, def, check + "発　当たった！" + "\n")
            if (move[0] == "スケイルショット"){
                afn.rankChange(atk, def, "B", -1, 100, move, false)
                afn.rankChange(atk, def, "S", 1, 100, move, false)
            }
        }
    }
    if (atk.con.ability == "おやこあい" && !atk.data.Z && !(atk.data.dynaTxt.includes("3") || atk.data.gigaTxt.includes("3"))){
        for (let i = 0; i < list.length; i++){
            if (move[0] == list[i][0]){
                return
            }
        }
        let check = 1
        // 3.攻撃が続く場合は1.からの処理を繰り返す。終了する場合は「○発当たった！」の表示後9.に進む。
        // 1.攻撃側と防御側のポケモンの回復のきのみ・HP1/4で発動するピンチきのみ・きのみジュースの発動判定
        bfn.berryPinch(atk, def)
        bfn.berryPinch(def, atk)
        // 2.攻撃側のポケモンがひんし・ねむり状態になった場合、連続攻撃は中断される。
        if (atk.con.last_HP > 0  && def.con.last_HP > 0 && atk.con.abnormal != "ねむり"){
            // 1.ダメージ計算 [与えたダメージ, タイプ相性, 急所判定, 発生したダメージ]
            atk.con.p_con += "おやこあい" + "\n"
            let damage = HPDecreaseOperation(atk, def, move, order)
            damage.substitute = def.con.p_con.includes("みがわり")
            // 2.追加効果などの発動
            additionalEffectEtc(atk, def, move, order, damage)
            // 3.防御側の特性
            defenseAbility(atk, def, move, damage)
            // 4.防御側のもちもの
            defenseItem(atk, def, move, damage)
            // 5.防御側のばけのかわ/アイスフェイス
            disguiseIceface(atk, def, move, damage)
            // 6.ひんし判定
            dyingJudge(atk, def, move)
            // 7.ひんしできんちょうかん/かがくへんかガスが解除されたことによる封じられていた効果の発動
            check += 1
        }
        cfn.logWrite(atk, def, check + "発　当たった！" + "\n")
    }
    
}

// 9.技の効果
function moveEffect(atk, def, move, damage){
    // 技の使用者がひんしなら発動しない
    if (atk.con.f_con.includes("ひんし")){
        return
    }
    // 技の効果による反動ダメージ
    for (i = 0; i < moveEff.recoil().length; i++){
        if (move[0] == moveEff.recoil()[i][0] && atk.con.ability != "いしあたま"){
            afn.HPchangeMagic(atk, def, Math.round(damage.give * moveEff.recoil()[i][1]), "-", move)
            bfn.berryPinch(atk, def)
        }
    }
    // バインド状態
    if (moveEff.bind().includes(move[0]) && !def.con.p_con.includes("バインド") && !damage.substitute && !def.con.f_con.includes("ひんし")){
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　は　しめつけられた！" + "\n")
        if (atk.con.item == "ねばりのかぎづめ"){
            def.con.p_con += "バインド（長）　0ターン目" + "\n"
        } else if (atk.con.item == "しめつけバンド"){
            def.con.p_con += "バインド（強）　0ターン目" + "\n"
        } else {
            def.con.p_con += "バインド　0ターン目" + "\n"
        }
    }
    // とどめばりによるこうげき上昇
    if (def.con.f_con.includes("ひんし") && move[0] == "とどめばり"){
        afn.rankChange(atk, def, "A", 3, 100, "とどめばり", true)
    }
    // はたきおとす/どろぼう/ほしがる/むしくい/ついばむによるもちものに関する効果
    if (move[0] == "はたきおとす" && def.con.item != "" && !damage.substitute && def.con.ability != "ねんちゃく" 
    && !(def.con.name == "シルヴァディ" && def.con.item.includes("メモリ"))
    && !(def.con.name.includes("ザシアン") && def.con.item　== "くちたけん") 
    && !(def.con.name.includes("ザマゼンタ") && def.con.item　== "くちたたて")){
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　は　" + def.con.item + "　を　はたき落とされた！" + "\n")
        def.con.item = ""
        def["poke" + cfn.battleNum(def)].item = ""
        if (def.con.ability == "かるわざ"){
            def.con.p_con += "かるわざ" + "\n"
        }
    } else if ((move[0] == "どろぼう" || move[0] == "ほしがる") && atk.con.item == ""  && def.con.item != "" && def.con.ability != "ねんちゃく" 
    && !(def.con.name == "シルヴァディ" && def.con.item.includes("メモリ")) 
    && !(def.con.name.includes("ザシアン") && def.con.item　== "くちたけん") 
    && !(def.con.name.includes("ザマゼンタ") && def.con.item　== "くちたたて")){
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　の　" + def.con.item + "　を　奪った！" + "\n")
        atk.con.item = def.con.item
        def.con.item = ""
        def["poke" + cfn.battleNum(def)].item = ""
        if (def.con.ability == "かるわざ"){
            def.con.p_con += "かるわざ" + "\n"
        }
    } else if ((move[0] == "むしくい" || move[0] == "ついばむ") && itemEff.berryList().includes(def.con.item) && def.con.ability != "ねんちゃく" ){
        bfn.eatingBerry(atk, def, def.con.item)
        cfn.setBelch(atk)
        def.con.item = ""
        def["poke" + cfn.battleNum(def)].item = ""
        if (def.con.ability == "かるわざ"){
            def.con.p_con += "かるわざ" + "\n"
        }
    }
    // ドラゴンテール/ともえなげによる交代・交代先の繰り出し
    if (def.poke0.life == "控え" || def.poke1.life == "控え" || def.poke2.life == "控え"){
        if ((move[0] == "ドラゴンテール" || move[0] == "ともえなげ") && !damage.substitute && def.con.ability != "きゅうばん" && !(def.data.dynaTxt.includes("3") || def.data.gigaTxt.includes("3"))){
            cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "は　手持ちに戻された！" + "\n")
            let hand = []
            for (let i = 0; i < 3; i++){
                if (def["poke" + i].life == "控え"){
                    hand.push(i)
                }
            }
            summon.comeBack(def, atk)
            let battle = hand[0]
            if (hand.length == 2 && Math.random() < 0.5){
                battle = hand[1]
            }
            def.data.command = battle + 4
            summon.onField(def, atk, 1)
        }
    }
    // うちおとす/サウザンアローによるうちおとす状態
    if ((move[0] == "うちおとす" || move[0] == "サウザンアロー") && !def.con.p_con.includes("うちおとす") && !cfn.groundedCheck(def.con) && !def.con.f_con.includes("ひんし") && !damage.substitute){
        def.con.p_con += "うちおとす" + "\n"
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def_poke + "　は　地面に撃ち落とされた！" + "\n")
        cfn.conditionRemove(def.con, "poke", "でんじふゆう")
        cfn.conditionRemove(def.con, "poke", "テレキネシス")
        if (def.con.p_con.includes("空を飛ぶ")){
            cfn.conditionRemove(def.con, "poke", "空を飛ぶ")
            cfn.conditionRemove(def.con, "poke", "姿を隠す")
        }
    }
    // サウザンウェーブ/くらいつくによるにげられない状態
    if ((move[0] == "サウザンウェーブ") && !def.con.p_con.includes("逃げられない") && !damage.substitute && !def.con.f_con.includes("ひんし")){
        def.con.p_con += "逃げられない" + "\n"
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　は　逃げられなくなった！" + "\n")
    }
    if (move[0] == "くらいつく" && !damage.substitute && !def.con.f_con.includes("ひんし") && !(atk.con.p_con.includes("逃げられない") || def.con.p_con.includes("逃げられない")) && !(atk.con.type.includes("ゴースト") || def.con.type.includes("ゴースト"))){
        atk.con.p_con += "逃げられない" + "\n"
        def.con.p_con += "逃げられない" + "\n"
        cfn.logWrite(atk, def, "お互いのポケモン　は　逃げられなくなった！" + "\n")
    }
    // プラズマフィストによるプラズマシャワー状態
    if (move[0] == "プラズマフィスト" && !atk.con.f_con.includes("プラズマシャワー")){
        atk.con.f_con += "プラズマシャワー" + "\n"
        def.con.f_con += "プラズマシャワー" + "\n"
        cfn.logWrite(atk, def, "電気が駆け巡る！" + "\n")
    }
    // オリジンズスーパーノヴァによるサイコフィールド状態
    if (move[0] == "オリジンズスーパーノヴァ") {
        atk.con.f_con += "サイコフィールド　5/5" + "\n"
        def.con.f_con += "サイコフィールド　5/5" + "\n"
        cfn.logWrite(atk, def, "足元が　不思議な感じに　包まれた" + "\n")
    }
    // こうそくスピン/ラジアルエッジストームによる場の状態の解除
    if (move[0] == "こうそくスピン"){
        cfn.conditionRemove(atk.con, "poke", "バインド")
        cfn.conditionRemove(atk.con, "poke", "やどりぎのタネ")
        cfn.conditionRemove(atk.con, "field", "ステルスロック")
        cfn.conditionRemove(atk.con, "field", "どくびし")
        cfn.conditionRemove(atk.con, "field", "まきびし")
        cfn.conditionRemove(atk.con, "field", "ねばねばネット")
        cfn.conditionRemove(atk.con, "field", "キョダイコウジン")
        cfn.logWrite(atk, def, "周りのものが　消え去った" + "\n")
    }
    if (move[0] == "ラジアルエッジストーム" && atk.con.f_con.includes("フィールド")){
        cfn.conditionRemove(atk.con, "field", "フィールド")
        cfn.conditionRemove(def.con, "field", "フィールド")
        cfn.logWrite(atk, def, "フィールドが　消え去った" + "\n")
    }
    // ほのおタイプの攻撃技を受けたことによるこおり状態の回復
    if (def.con.abnormal == "こおり" && move[1] == "ほのお" && !def.con.f_con.includes("ひんし")){
        def.con.abnormal = ""
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　の　こおりがとけた" + "\n")
    }
    // ねっさのだいち/ねっとう/スチームバーストを受けたことによるこおり状態の回復
    if (def.con.abnormal == "こおり" && !def.con.f_con.includes("ひんし") && (move[0] == "スチームバースト" || move[0] == "ねっさのだいち" || move[0] == "ねっとう")){
        def.con.abnormal = ""
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　の　こおりがとけた" + "\n")
    }
    // きつけを受けたことによるまひ状態の回復
    if (def.con.abnormal == "まひ" && move[0] == "きつけ" && !def.con.f_con.includes("ひんし")){
        def.con.abnormal = ""
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　の　痺れが取れた" + "\n")
    }
    // めざましビンタを受けたことによるねむり状態の回復
    if (def.con.abnormal == "ねむり" && move[0] == "めざましビンタ" && !def.con.f_con.includes("ひんし")){
        def.con.abnormal = ""
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　は　目を覚ました" + "\n")
        cfn.conditionRemove(def.con, "poke", "ねむり")
        cfn.conditionRemove(def.con, "poke", "ねむる")
    }
    // ひみつのちからの追加効果
    if (move[0] == "ひみつのちから"){
        if (atk.con.f_con.includes("グラスフィールド")){
            afn.makeAbnormal(def, atk, "ねむり", 30, move)
        } else if (atk.con.f_con.includes("エレキフィールド")){
            afn.makeAbnormal(def, atk, "まひ", 30, move)
        } else if (atk.con.f_con.includes("ミストフィールド")){
            if (def.con.ability == "ミラーアーマー"){
                cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "の　ミラーアーマーが　発動した！" + "\n")
                afn.rankChange(atk, def, "C", -1, 30, move, true)
            } else {
                afn.rankChange(def, atk, "C", -1, 30, move, true)
            }
        } else if (atk.con.f_con.includes("サイコフィールド")){
            if (def.con.ability == "ミラーアーマー"){
                cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "の　ミラーアーマーが　発動した！" + "\n")
                afn.rankChange(atk, def, "S", -1, 30, move, true)
            } else {
                afn.rankChange(def, atk, "S", -1, 30, move, true)
            }
        } else {
            afn.makeAbnormal(def, atk, "まひ", 30, move)
        }
    }

    // ぶきみなじゅもんによるPPの減少
    if (move[0] == "ぶきみなじゅもん" &&  def.con.used != "" && !def.con.f_con.includes("ひんし")){
        for (let i = 0; i < 4; i++){
            if (def.con["move_" + i] == def.con.used && def.con["last_" + i] > 0){
                cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "の　" + def.con.used + "　の　PPが減った" + "\n")
                def.con["last_" + i] = Math.max(def.con["last_" + i] - 3, 0)
            }
        }
    }
        //(ほのおタイプの技によるこおり状態の回復は使用者が場から去っている場合も発動する。それ以外の技の効果は使用者が場から去っていると発動しない)
}

// 10.特性の効果
function abilityEffect(atk, def, move){
    // 1.攻撃側のマジシャン/じしんかじょう/ビーストブースト/くろのいななき/しろのいななき
    if (atk.con.ability == "マジシャン" && atk.con.item == "" && def.con.item != "" && def.con.ability != "ねんちゃく" 
    && !(def.con.name == "シルヴァディ" && def.con.item.includes("メモリ")) 
    && !(def.con.name == "アルセウス" && def.con.item.includes("プレート"))
    && !(def.con.name.includes("ザシアン") && def.con.item　== "くちたけん") 
    && !(def.con.name.includes("ザマゼンタ") && def.con.item　== "くちたたて")){
        cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "の　マジシャンが発動した" + "\n")
        atk.con.item = def.con.item
        def.con.item = ""
    } else if ((atk.con.ability == "じしんかじょう" || atk.con.ability == "しろのいななき" || (atk.con.ability == "じんばいったい" && atk.con.name == "バドレックス(はくばじょうのすがた)")) && def.con.f_con.includes("ひんし")){
        afn.rankChange(atk, def, "A", 1, 100, atk.con.ability, true)
    } else if ((atk.con.ability == "くろのいななき" || (atk.con.ability == "じんばいったい" && atk.con.name == "バドレックス(こくばじょうのすがた)")) && def.con.f_con.includes("ひんし")){
        afn.rankChange(atk, def, "C", 1, 100, atk.con.ability, true)
    } else if (atk.con.ability == "ビーストブースト" && def.con.f_con.includes("ひんし")){
        let check = [atk.con.A_AV, "A"]
        for (const parameter of ["B", "C", "D", "S"]){
            if (check[0] < atk.con[parameter + "_AV"]){
                check = [atk.con[parameter + "_AV"], parameter]
            }
        }
        afn.rankChange(atk, def, check[1], 1, 100, atk.con.ability, true)
    }
    // 2.防御側のへんしょく/ぎゃくじょう
    if (def.con.ability == "へんしょく" && !def.con.type.includes(move[1])){
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　の　へんしょくが発動した" + "\n")
        def.con.type = move[1]
    }
}

// 11.防御側のもちものの効果
function defenseItemEffect(atk, def, move){
    if (def.con.f_con.includes("ひんし")){
        return
    }
    // アッキのみ/タラプのみ
    if (def.con.item == "アッキのみ" && move[2] == "物理"){
        if (def.con.ability == "じゅくせい"){
            afn.rankChange(def, atk, "B", 2, 100, def.con.item, true)
        } else {
            afn.rankChange(def, atk, "B", 1, 100, def.con.item, true)
        }
        cfn.setRecycle(def)
    } else if (def.con.item == "タラプのみ" && move[2] == "特殊"){
        if (def.con.ability == "じゅくせい"){
            afn.rankChange(def, atk, "D", 2, 100, def.con.item, true)
        } else {
            afn.rankChange(def, atk, "D", 1, 100, def.con.item, true)
        }
        cfn.setRecycle(def)
    }
    // だっしゅつボタン/レッドカードによって手持ちに戻るまで
    if (def.con.item == "だっしゅつボタン" && cfn.lifeCheck(def) && !def.con.p_con.includes("おいうち成功")){
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　は　" + def.con.item + "　が発動して　手持ちに戻った" + "\n")
        cfn.setRecycle(def)
        def.con.f_con+= "選択中・・・" + "\n"
        summon.comeBack(def, atk)
    } else if (def.con.item == "レッドカード" && cfn.lifeCheck(atk)){
        cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　は　" + def.con.item + "　が発動して　手持ちに戻った" + "\n")
        cfn.setRecycle(def)
        let hand = []
        for (let i = 0; i < 3; i++){
            if (atk["poke" + i].life == "控え"){
                hand.push(i)
            }
        }
        summon.comeBack(atk, def)
        let battle = hand[0]
        if (hand.length == 2 && Math.random() < 0.5){
            battle = hand[1]
        }
        atk.data.command = battle + 4
        atk.con.f_con += "選択中（レッドカード）・・・" + "\n"
    }
}

// 13.いにしえのうた/きずなへんげによるフォルムチェンジ
function formChengeAbility(atk, def, move){
    if (atk.con.ability == "きずなへんげ" && atk.con.name == "ゲッコウガ" && def.con.f_con.includes("ひんし")){
        cfn.logWrite(atk, def, atk.con.TN + "　の　ゲッコウガ　に　絆の力が溢れ出した！" + "\n")
        afn.formChenge(atk, def, "ゲッコウガ(サトシゲッコウガ)")
    }
}

// 14.いのちのたまの反動/かいがらのすずの回復
function lifeorbShellbell(atk, def, damage){
    if (atk.con.item == "いのちのたま"){
        afn.HPchangeMagic(atk, def, Math.floor(atk["poke" + cfn.battleNum(atk)].full_HP / 10), "-", atk.con.item)
        bfn.berryPinch(atk, def)
    } else if (atk.con.item == "かいがらのすず"){
        afn.HPchangeMagic(atk, def, Math.floor(damage.give / 8), "+", atk.con.item)
    }
}

// 15.オボンのみなど回復のきのみ/チイラのみ/リュガのみ/ヤタピのみ/ズアのみ/カムラのみ/サンのみ/スターのみ/ミクルのみ/きのみジュース
function recoverBerry(atk, def){
    if (!def.con.f_con.includes("ひんし")){
        bfn.berryPinch(def, atk)
    }
    // 攻撃ダメージによって発動する場合のみこの処理順になる
    // (反動やゴツゴツメット等の効果ダメージやだっしゅつボタンによるきんちょうかんの退場ではその直後に割り込んで発動する)
}

// 16.ききかいひ/にげごしによって手持ちに戻るまで
    // だっしゅつボタンと同時発動した場合は、交代先は両者同時に行う
    // レッドカードと同時発動した場合は、レッドカードの交代が行われた後、ききかいひの交代先を選ぶ
function emergencyExit(atk, def, damage){
    if ((def.con.ability == "ききかいひ" || def.con.ability == "にげごし") 
    && def.con.last_HP + damage.give > def.con.full_HP / 2 && 0 < def.con.last_HP && def.con.last_HP <= def.con.full_HP / 2 && !def.con.f_con.includes("選択中")){
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "は　" + def.con.ability + "で手持ちに戻った" + "\n")
        def.con.f_con += "選択中・・・" + "\n"
        summon.comeBack(def, atk)
    }
}

// 17.とんぼがえり/ボルトチェンジ/クイックターンによって手持ちに戻るまで
    // レッドカードが発動した場合、交代先はランダム
    // だっしゅつボタンやききかいひが発動した場合、交代できない
function comeBackMove(atk, def, move){
    if ((move[0] == "とんぼがえり" || move[0] == "ボルトチェンジ" || move[0] == "クイックターン") && atk.con.last_HP > 0 && !atk.con.f_con.includes("選択中") && !def.con.f_con.includes("選択中") && cfn.lifeCheck(atk)){
        cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "は　手持ちに戻った" + "\n")
        atk.con.f_con += "選択中・・・" + "\n"
        summon.comeBack(atk, def)
    }
}


// 18.アイアンローラーによるフィールドの消失
// 使用者が場から去っている場合も発動する
function steelRoller(atk, def, move){
    if (move[0] == "アイアンローラー" && atk.con.f_con.includes("フィールド")){
        cfn.conditionRemove(atk.con, "field", "フィールド")
        cfn.conditionRemove(def.con, "field", "フィールド")
        cfn.logWrite(atk, def, "フィールドが消え去った" + "\n")
    }
}

// 19.レッドカードによる交代先の繰り出し
function redCard(atk, def){
    if (atk.con.f_con.includes("選択中（レッドカード）・・・")){
        cfn.conditionRemove(atk.con, "poke", "選択中（レッドカード）・・・")
        summon.pokeReplace(atk, def)
        summon.onField(atk, def, 1)
    }
}

// 20.わるいてぐせ
function pickPocket(atk, def, move){
    if (def.con.last_HP > 0 && def.con.ability == "わるいてぐせ" && atk.con.item != "" && def.con.item == "" && move[6] == "直接" && def.con.ability != "ねんちゃく" 
    && !(atk.con.name == "シルヴァディ" && atk.con.item.includes("メモリ")) 
    && !(atk.con.name == "アルセウス" && atk.con.item.includes("プレート"))
    && !(atk.con.name.includes("ザシアン") && atk.con.item　== "くちたけん") 
    && !(atk.con.name.includes("ザマゼンタ") && atk.con.item　== "くちたたて")){
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　は　わるいてぐせで　持ち物を奪った" + "\n")
        def.con.item = atk.con.item
        atk.con.item = ""
    }
}

// 21.一部の技の効果
function someMoveEffect(atk, def, move){
    // もえつきるによるタイプの消失
    if (move[0] == "もえつきる"){
        atk.con.type = atk["poke" + cfn.battleNum(atk)].type.replace("ほのお", "")
        atk.con.type = atk.con.type.replace("、", "")
        if (atk.con.f_con.includes("もりののろい")){
            atk.con.type += "、くさ"
        }
        if (atk.con.f_con.includes("ハロウィン")){
            atk.con.type += "、ゴースト"
        }
        cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　の　炎が燃え尽きた" + "\n")
    }
    // しぜんのめぐみ使用によるきのみの消費
    if (move[0] == "しぜんのめぐみ"){
        cfn.setRecycle(atk, def)
    }
    // あばれる状態の終了によるこんらん　あばれる（技名）　1ターン目
    if (atk.con.p_con.includes("あばれる")){
        let p_list = atk.con.p_con.split("\n")
        let check = 0
        for (let i = 0; i < p_list.length; i++){
            if (p_list[i].includes("あばれる") && p_list[i].includes("1ターン目")){
                p_list[i] = p_list[i].slice(0, -5) + "2ターン目"
            } else if (p_list[i].includes("あばれる") && p_list[i].includes("2ターン目")){
                if (Math.random() < 0.5){
                    p_list[i] = p_list[i].slice(0, -5) + "3ターン目"
                } else {
                    check = 1
                }
            } else if (p_list[i].includes("あばれる") && p_list[i].includes("3ターン目")){
                check = 1
            }
        }
        atk.con.p_con = p_list.join("\n")
        if (check == 1){
            cfn.conditionRemove(atk.con, "poke", "あばれる")
            afn.makeAbnormal(atk, def, "こんらん", 100, "疲れ果てたこと")
            // メガ進化、Z技、ダイマックスボタンの有効化
            afn.specialButton(atk)
        }
    }
}

// 22.ヒメリのみ/しろいハーブ/のどスプレー/だっしゅつパックによって手持ちに戻るまで
function otherItemEffect(atk, def, move){
    // ヒメリのみ
    if (atk.con.item == "ヒメリのみ"){
        for (let i = 0; i < 4; i++){
            if (atk.con["last_" + i] == 0){
                if (atk.con.ability == "じゅくせい"){
                    atk.con["last_" + i] = Math.min(20, atk.con["PP_" + i])
                    atk["poke" + cfn.battleNum(atk)]["last_" + i] = Math.min(20, atk.con["PP_" + i])
                } else {
                    atk.con["last_" + i] = Math.min(10, atk.con["PP_" + i])
                    atk["poke" + cfn.battleNum(atk)]["last_" + i] = Math.min(10, atk.con["PP_" + i])
                }
                cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　は　ヒメリのみで　PPを回復した" + "\n")
                cfn.setRecycle(atk)
                cfn.setBelch(atk)
                break
            }
        }
    }
    // しろいハーブ
    bfn.whiteHerb(atk, def)
    bfn.whiteHerb(def, atk)
    // のどスプレー
    if (atk.con.item == "のどスプレー" && moveEff.music().includes(move[0]) && atk.con.C_rank < 6){
        afn.rankChange(atk, def, "C", 1, 100, "のどスプレー", true)
        cfn.setRecycle(atk)
    }
    // だっしゅつパック
        // だっしゅつボタンやききかいひが発動している場合、だっしゅつパックは発動しない
    if (atk.con.item == "だっしゅつパック" && atk.con.p_con.includes("ランク下降") && !atk.con.f_con.includes("選択中") && !def.con.f_con.includes("選択中") && cfn.lifeCheck(atk)){
        cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　は　だっしゅつパックで手持ちに戻った" + "\n")
        cfn.setRecycle(atk)
        summon.comeBack(atk, def)
        atk.con.f_con += "選択中・・・" + "\n"
    }
    if (def.con.item == "だっしゅつパック" && def.con.p_con.includes("ランク下降") && !atk.con.f_con.includes("選択中") && !def.con.f_con.includes("選択中") && cfn.lifeCheck(def)){
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　は　だっしゅつパックで手持ちに戻った" + "\n")
        cfn.setRecycle(def)
        summon.comeBack(def, atk)
        def.con.f_con += "選択中・・・" + "\n"
    }
    // ヒメリのみは技の使用によってPP0になった場合のみこの処理順になる
        // (ぶきみなじゅもんの効果ではその直後に割り込んで発動する)
    // しろいハーブ/だっしゅつパックは追加効果や反動やダイマックス技効果など技自体の効果によって発動する場合のみこの処理順になる
        // (わたげなど技以外の効果ではその直後に割り込んで発動する)
}

// かたやぶりなどの特性無視終了？
function moldBreakStop(atk, def, move){
    for (let i = 0; i < def.con.p_con.split("\n").length; i++){
        if (def.con.p_con.split("\n")[i].includes("かたやぶり：")){
            def.con.ability = def.con.p_con.split("\n")[i].slice(6)
        }
    }
    cfn.conditionRemove(def.con, "poke", "かたやぶり：")
}

// 23.とんぼがえり/ボルトチェンジ/クイックターン/ききかいひ/にげごし/だっしゅつボタン/だっしゅつパックによる交代先の選択・交代
function returnBattle(atk, def){
    if (atk.con.f_con.includes("選択中") && def.con.f_con.includes("選択中")){
        // 2匹同時交換　ききかいひとだっしゅつボタンが同時発動した時
    } else if (atk.con.f_con.includes("選択中")){
        cfn.logWrite(atk, def, atk.con.TN + "　は　戦闘に出すポケモンを選んでください" + "\n")
        return true
    } else if (def.con.f_con.includes("選択中")){
        cfn.logWrite(def, atk, def.con.TN + "　は　戦闘に出すポケモンを選んでください" + "\n")
        return true
    }
}

// 25.おどりこ
function ability_dancer(atk, def, move, order){

}



