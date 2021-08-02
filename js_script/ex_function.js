const afn = require("./function")
const bfn = require("./base_function")
const cfn = require("./law_function")
const abiEff = require("./ability_effect")
const moveEff = require("./move_effect")

// 特性の発動
exports.activeAbility = function(team, enemy, num){
    if (num == "both"){
        // 素早さ判定
        let order = afn.speedCheck(team, enemy)
        if (order[0] > order[1] || (order[0] == order[1] && Math.random() < 0.5)){
            order = [team, enemy]
        } else {
            order = [enemy, team]
        }
        if (team.con.f_con.includes("トリックルーム")){
            order = [order[1], order[0]]
        }
        abilityEmarge(order[0], order[1])
        abilityEmarge(order[1], order[0])
    } else if (num == 1){
        abilityEmarge(team, enemy)
    }
}

function abilityEmarge(team, enemy){
    let con = team.con
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
    } else if (con.ability == "おみとおし" && enemy.con.item != ""){
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
    } else if (con.ability == "かわりもの" && !enemy.con.p_con.includes("みがわり") && !enemy.con.p_con.includes("へんしん") && !enemy.con.p_con.includes("イリュージョン")){
        afn.metamon(team, enemy)
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
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　の　よちむ！" + "\n")
        let power = []
        for (let i = 0; i < 4; i++){
            if (con["move_" + i] != ""){
                let move = cfn.moveSearchByName(enemy.con["move_" + i])
                if (move[2] != "変化"){
                    power.push([move[3], move[0]])
                }
            }
        }
        power.sort()
        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　は　" + power[0][1] + "を　読み取った！" + "\n")
    }
}