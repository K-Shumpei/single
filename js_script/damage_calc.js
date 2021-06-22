const moveEff = require("./move_effect")
const itemEff = require("./item_effect")
const afn = require("./function")
const bfn = require("./base_function")
const cfn = require("./law_function")

exports.damageCalculationProcess = function(atk, def, move, order){
    // ダメージ固定技の時
    if (moveEff.fixDamage().includes(move[0])){
        return fixedDamageMove(atk, def, move)
    }
    // 最終威力
    const power = powerCalculation(atk, def, move, order)
    // 急所判定
    const critical = getCritical(atk, def, move)
    // 攻撃と防御の実数値取得　
    const status = getStatus(atk, def, move, critical)
    // 最終攻撃
    const attack = attackCalculation(atk, def, move, status)
    // 最終防御
    const defense = defenseCalculation(atk, def, move, status)
    // 最終ダメージ
    const damage = damageCalculation(atk, def, move, power, critical, attack, defense)

    return damage   // {damage, compatibility, critical}
}


// ダメージ固定技
function fixedDamageMove(atk, def, move){
    if (move[0] == "ソニックブーム"){
        return {damage: 20, compatibility: 1, critical: false}
    } else if (move[0] == "りゅうのいかり"){
        return {damage: 40, compatibility: 1, critical: false}
    } else if (move[0] == "ちきゅうなげ" || move[0] == "ナイトヘッド"){
        return {damage: atk.con.level, compatibility: 1, critical: false}
    } else if (move[0] == "サイコウェーブ"){
        return {damage: Math.floor(atk.con.level * (Math.floor(Math.random() * 101) * 0.01 + 0.5)), compatibility :1, critical: false}
    } else if (move[0] == "いかりのまえば" || move[0] == "しぜんのいかり"){
        return {damage: Math.floor(def.con.last_HP / 2), compatibility: 1, critical: false}
    } else if (move[0] == "がむしゃら"){
        return {damage: def.con.last_HP - atk.con.last_HP, compatibility: 1, critical: false}
    } else if (move[0] == "カウンター"){
        let damage = 0
        for (let i = 0; i < atk.con.p_con.split("\n").length - 1; i++){
            if (atk.con.p_con.split("\n")[i].includes("物理ダメージ")){
                damage = Number(atk.con.p_con.split("\n")[i].slice(7))
            }
        }
        cfn.conditionRemove(atk.con, "poke", "物理ダメージ")
        return {damage: damage * 2, compatibility: 1, critical: false}
    } else if (move[0] == "ミラーコート"){
        let damage = 0
        for (let i = 0; i < atk.con.p_con.split("\n").length - 1; i++){
            if (atk.con.p_con.split("\n")[i].includes("特殊ダメージ")){
                damage = Number(atk.con.p_con.split("\n")[i].slice(7))
            }
        }
        cfn.conditionRemove(atk.con, "poke", "特殊ダメージ")
        return {damage: damage * 2, compatibility: 1, critical: false}
    } else if (move[0] == "がまん"){
        return {damage: move[3] * 2, compatibility: 1, critical: false}
    } else if (move[0] == "メタルバースト"){
        let damage = 0
        for (let i = 0; i < atk.con.p_con.split("\n").length - 1; i++){
            if (atk.con.p_con.split("\n")[i].includes("ダメージ")){
                damage = Number(atk.con.p_con.split("\n")[i].slice(7))
            }
        }
        cfn.conditionRemove(atk.con, "poke", "ダメージ")
        return {damage: Math.floor(damage * 1.5), compatibility: 1, critical: false}
    } else if (move[0] == "いのちがけ"){
        return {damage: atk.con.last_HP, compatibility: 1, critical: false}
    } else if (moveEff.oneShot().includes(move[0])){
        cfn.logWrite(atk, def, "一撃必殺！" + "\n")
        return {damage: def.con.last_HP, compatibility: 1, critical: false}
    } else if (move[0] == "ガーディアン・デ・アローラ"){
        return {damage: Math.floor(def.con.last_HP * 0.75), compatibility: 1, critical: false}
    }
}


function powerCalculation(atk, def, move, order){
    // 基礎威力の変化
    if (move[0] == "きしかいせい" || move[0] == "じたばた"){
        if (atk.con.last_HP < atk.con.full_HP * 2 / 48){
            move[3] = 200
        } else if (atk.con.last_HP < atk.con.full_HP * 5 / 48){
            move[3] = 150
        } else if (atk.con.last_HP < atk.con.full_HP * 10 / 48){
            move[3] = 100
        } else if (atk.con.last_HP < atk.con.full_HP * 17 / 48){
            move[3] = 80
        } else if (atk.con.last_HP < atk.con.full_HP * 33 / 48){
            move[3] = 40
        } else {
            move[3] = 20
        }
    } else if (move[0] == "しおふき" || move[0] == "ふんか" || move[0] == "ドラゴンエナジー"){
        move[3] = Math.max(Math.floor(150 * atk.con.last_HP / atk.con.full_HP), 1)
    } else if (move[0] == "しぼりとる" || move[0] == "にぎりつぶす"){
        move[3] = Math.max(Math.floor(120 * def.con.last_HP / def.con.full_HP), 1)
    } else if (move[0] == "アシストパワー" || move[0] == "つけあがる"){
        let power = 0
        for (const parameter of ["A", "B", "C", "D", "S", "X", "Y"]){
                power += Math.max(atk.con[parameter + "_rank"], 0)
        }
        move[3] = 20 * (power + 1)
    } else if (move[0] == "おしおき"){
        let power = 0
        for (const parameter of ["A", "B", "C", "D", "S", "X", "Y"]){
            power += Math.max(atk.con[parameter + "_rank"], 0)
        }
        move[3] = Math.min(20 * (power + 3), 200)
    } else if (move[0] == "うっぷんばらし" && atk.con.p_con.includes("ランク下降")){
        move[3] = 150
    } else if (move[0] == "エレキボール"){
        const atk_speed = afn.speedCheck(atk.con, def.con)[0]
        const def_speed = afn.speedCheck(atk.con, def.con)[1]
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
        const atk_speed = afn.speedCheck(atk.con, def.con)[0]
        const def_speed = afn.speedCheck(atk.con, def.con)[1]
        move[3] = Math.floor((25 * def_speed / atk_speed) + 1)
    } else if (move[0] == "きりふだ"){
        const PP = atk.con["PP_" + atk.data.command]
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
        const def_weight = bfn.weight(def.con)
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
        const atk_weight = bfn.weight(atk.con)
        const def_weight = bfn.weight(def.con)
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
    } else if ((move[0] == "きつけ" && def.con.abnormal == "まひ") || (move[0] == "めざましビンタ" && def.con.abnormal == "ねむり")){
        move[3] = 140
    } else if (move[0] == "たたりめ" && def.con.abnormal != ""){
        move[3] = 130
    } else if (move[0] == "ウェザーボール" && (((atk.con.f_con.includes("にほんばれ") || atk.con.f_con.includes("あめ")) && atk.con.item != "ばんのうがさ") || atk.con.f_con.includes("すなあらし") || atk.con.f_con.includes("あられ")) && cfn.isWeather(atk.con, def.con)){
        move[3] = 100
    } else if (move[0] == "だいちのはどう" && cfn.groundedCheck(atk.con) && atk.con.f_con.includes("フィールド")){
        move[3] = 100
    } else if (move[0] == "ライジングボルト" && cfn.groundedCheck(def.con) && atk.con.f_con.includes("エレキフィールド")){
        move[3] = 140
    } else if ((move[0] == "かぜおこし" || move[0] == "たつまき") && (def.con.p_con.includes("そらをとぶ") || def.con.p_con.includes("フリーフォール"))){
        move[3] = 80
    } else if (move[0] == "アクロバット" && atk.con.item == ""){
        move[3]  = 110
    } else if (move[0] == "しぜんのめぐみ"){
        for (let i = 0; i < itemEff.naturalGift().length; i++){
            if (atk.con.item == itemEff.naturalGift()[i][0]){
                move[3] = itemEff.naturalGift()[i][2]
            }
        }
    } else if (move[0] == "なげつける"){
        cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "　は　" + atk.con.item + "を　投げつけた！" + "\n")
        if (itemEff.berryList().includes(atk.con.item) || atk.con.item.includes("おこう") || moveEff.fling10().includes(atk.con.item)){
            move[3] = 10
        } else if (moveEff.fling30().includes(atk.con.item)){
            move[3] = 30
        } else if (moveEff.fling40().includes(atk.con.item)){
            move[3] = 40
        } else if (moveEff.fling50().includes(atk.con.item) || atk.con.item.includes("メモリ")){
            move[3] = 50
        } else if (moveEff.fling60().includes(atk.con.item)){
            move[3] = 60
        } else if (moveEff.fling70().includes(atk.con.item) || atk.con.item.includes("カセット") || atk.con.item.includes("パワー")){
            move[3] = 70
        } else if (moveEff.fling80().includes(atk.con.item) || atk.con.item.includes("ナイト")){
            move[3] = 80
        } else if (moveEff.fling90().includes(atk.con.item) || atk.con.item.includes("プレート")){
            move[3] = 90
        } else if (moveEff.fling100().includes(atk.con.item)){
            move[3] = 100
        } else if (moveEff.fling130().includes(atk.con.item)){
            move[3] = 130
        }
    } else if (move[0] == "アイスボール" || move[0] == "ころがる"){
        if (atk.con.p_con.includes("まるくなる")){
            move[3] *= 2
        }
        for (let i = 0; i < atk.con.p_con.split("\n").length - 1; i++){
            if (atk.con.p_con.split("\n")[i].includes(move[0])){
                const num = Number(atk.con.p_con.split("\n")[i].replace(/[^0-9]/g, ""))
                move[3] *= 2 ** (num - 1)
            }
        }
    } else if (move[0] == "エコーボイス"){
        for (let i = 0; i < atk.con.f_con.split("\n").length - 1; i++){
            if (atk.con.f_con.split("\n")[i].includes("エコーボイス")){
                const num = Math.floor(Number(atk.con.f_con.split("\n")[i].slice(8)))
                move[3] = Math.min(40 * (num + 1), 200)
            }
        }
    } else if (move[0] == "はきだす"){
        let num = 0
        if (atk.con.p_con.includes("たくわえる　1回目")){
            move[3] = 100
            num = -1
        } else if (atk.con.p_con.includes("たくわえる　2回目")){
            move[3] = 200
            num = -2
        } else if (atk.con.p_con.includes("たくわえる　3回目")){
            move[3] = 300
            num = -3
        }
        afn.rankChange(atk, def, "B", num, 100, move)
        afn.rankChange(atk, def, "D", num, 100, move)
        cfn.logWrite(atk, def, atk.con.TN + "　の　" + atk.con.name + "は　たくわえが　なくなった！" + "\n")
        cfn.conditionRemove(atk.con, "poke", "たくわえる")
    } else if (move[0] == "れんぞくぎり"){
        for (let i = 0; i < atk.con.p_con.split("\n").length - 1; i++){
            if (atk.con.p_con.split("\n")[i].includes("れんぞくぎり")){
                const num = Number(atk.con.p_con.split("\n")[i].slice(8))
                move[3] = Math.min(40 * num, 160)
            }
        }
    } else if ((move[0] == "エラがみ" || move[0] == "でんげきくちばし") && atk == order[0]){
        move[3] = 170
    } else if (move[0] == "おいうち"){

    } else if (move[0] == "しっぺがえし" && atk == order[1]){
        move[3] = 100
    } else if (move[0] == "ダメおし" && def.con.p_con.includes("ダメおし")){
        move[3] *= 2
    } else if ((move[0] == "ゆきなだれ" || move[0] == "リベンジ") && atk.con.p_con.includes("ダメージ")){
        move[3] *= 2
    }


    // 威力補正初期値
    let correction = 4096

    // オーラブレイク、とうそうしん弱化　* 3072 / 4096 → 四捨五入
    if ((((atk.con.ability == "オーラブレイク" && def.con.ability == "ダークオーラ") || (def.con.ability == "オーラブレイク" && atk.con.ability == "ダークオーラ")) && move[1] == "あく") 
    || (((atk.con.ability == "オーラブレイク" && def.con.ability == "フェアリーオーラ") || (def.con.ability == "オーラブレイク" && atk.con.ability == "フェアリーオーラ")) && move[1] == "フェアリー")){
        correction = Math.round(correction * 3072 / 4096)
    }
    if (atk.con.ability == "とうそうしん"){
        if ((atk.con.sex == " ♂ " && def.con.sex == " ♀ ") || (atk.con.sex == " ♀ " && def.con.sex == " ♂ ")){
            correction = Math.round(correction * 3072 / 4096)
        }
    }
    // スキン特性、てつのこぶし、すてみ * 4915 / 4096 → 四捨五入
    if (atk.con.p_con.includes("スキン") 
    || (atk.con.ability == "てつのこぶし" && moveEff.ironFist().includes(move[0])) 
    || (atk.con.ability == "すてみ" && moveEff.reckless().includes(move[0]))){
        correction = Math.round(correction * 4915 / 4096)
        cfn.conditionRemove(atk.con, "poke", "スキン")
    }
    // とうそうしん強化 * 5120 / 4096 → 四捨五入
    if (atk.con.ability == "とうそうしん"){
        if ((atk.con.sex == " ♂ " && def.con.sex == " ♂ ") || (atk.con.sex == " ♀ " && def.con.sex == " ♀ ")){
            correction = Math.round(correction * 5120 / 4096)
        }
    }
    // バッテリー、パワースポット * 5325 / 4096 → 四捨五入
    // アナライズ、かたいツメ、すなのちから、ちからづく、パンクロック * 5325 / 4096 → 四捨五入
    if ((atk.con.ability == "アナライズ" && atk == order[1]) 
    || (atk.con.ability == "かたいツメ" && move[6] == "直接") 
    || (atk.con.ability == "すなのちから" && atk.con.f_con.includes("すなあらし") && (move[1] == "いわ" || move[1] == "じめん" || move[1] == "はがね") && cfn.isWeather(atk.con, def.con)) 
    || (atk.con.ability == "パンクロック" && music_move_list.includes(move[0]))){
        correction = Math.round(correction * 5325 / 4096)
    }
    // ダークオーラ、フェアリーオーラ * 5448 / 4096 → 四捨五入
    if ((((atk.con.ability == "ダークオーラ" && def.con.ability != "オーラブレイク") || (atk.con.ability != "オーラブレイク" && def.con.ability == "ダークオーラ")) && move[1] == "あく") 
    || (((atk.con.ability == "フェアリーオーラ" && def.con.ability != "オーラブレイク") || (atk.con.ability != "オーラブレイク" && def.con.ability == "フェアリーオーラ")) && move[1] == "フェアリー") ){
        correction = Math.round(correction * 5448 / 4096)
    }
    // がんじょうあご、テクニシャン、どくぼうそう、ねつぼうそう、はがねのせいしん、メガランチャー * 6144 / 4096 → 四捨五入
    if ((atk.con.ability == "がんじょうあご" && moveEff.bite().includes(move[0])) 
    || (atk.con.ability == "テクニシャン" && move[3] <= 60) 
    || (atk.con.ability == "どくぼうそう" && atk.con.abnormal.includes("どく") && move[2] == "物理") 
    || (atk.con.ability == "ねつぼうそう" && atk.con.abnormal == "やけど" && move[2] == "特殊") 
    || (atk.con.ability == "はがねのせいしん" && move[1] == "はがね") 
    || (atk.con.ability == "メガランチャー" && moveEff.megaLauncher().includes(move[0]))){
        correction = Math.round(correction * 6144 / 4096)
    }
    // たいねつ * 2048 / 4096 → 四捨五入
    if (def.con.ability == "たいねつ" && move[1] == "ほのお"){
        correction = Math.round(correction * 2048 / 4096)
    }
    // かんそうはだ * 5120 / 4096 → 四捨五入
    if (def.con.ability == "かんそうはだ" && move[1] == "ほのお"){
        correction = Math.round(correction * 5120 / 4096)
    }
    // ちからのハチマキ、ものしりメガネ * 4505 / 4096 → 四捨五入
    if ((atk.con.item == "ちからのハチマキ" && move[2] == "物理") 
    || (atk.con.item == "ものしりメガネ" && move[2] == "特殊")){
        correction = Math.round(correction * 4505 / 4096)
    }
    // プレート類、特定タイプの威力UPアイテム（おこう含む）、こころのしずく、こんごうだま、しらたま、はっきんだま * 4915 / 4096 → 四捨五入
    for (let i = 0; i < itemEff.judgement().length; i++){
        if (atk.con.item == itemEff.judgement()[i][0] && itemEff.judgement()[i][1] == move[1]){
            correction = Math.round(correction * 4915 / 4096)
        }
    }
    for (let i = 0; i < itemEff.incense().length; i++){
        if (atk.con.item == itemEff.incense()[i][0] && move[1] == itemEff.incense()[i][1]){
            correction = Math.round(correction * 4915 / 4096)
        }
    }
    if ((atk.con.item == "こころのしずく" && (atk.con.name == "ラティアス" || atk.con.name == "ラティオス") && (move[1] == "ドラゴン" || move[1] == "エスパー")) 
    || (atk.con.item == "こんごうだま" && atk.con.name == "ディアルガ" && (move[1] == "はがね" || move[1] == "ドラゴン")) 
    || (atk.con.item == "しらたま" && atk.con.name == "パルキア" && (move[1] == "みず" || move[1] == "ドラゴン")) 
    || (atk.con.item == "はっきんだま" && atk.con.name == "ギラティナ" && (move[1] == "ゴースト" || move[1] == "ドラゴン"))){
        correction = Math.round(correction * 4915 / 4096)
    }
    // ジュエル * 5325 / 4096 → 四捨五入
    if (atk.con.p_con.includes("ジュエル")){
        correction = Math.round(correction * 5325 / 4096)
        cfn.conditionRemove(atk.con, "poke", "ジュエル")
    }
    // ソーラービーム、ソーラーブレード * 2048 / 4096 → 四捨五入
    if ((move[0] == "ソーラービーム" || move[0] == "ソーラーブレード") && atk.con.item != "ばんのうがさ" && (atk.con.f_con.includes("あめ") || atk.con.f_con.includes("すなあらし") || atk.con.f_con.includes("あられ")) && cfn.isWeather(atk.con, def.con)){
        correction = Math.round(correction * 2048 / 4096)
    }
    // はたきおとす、Gのちから、ワイドフォース、ミストバースト * 6144 / 4096 → 四捨五入
    if ((move[0] == "はたきおとす" && def.con.item != "" 
    && !(def.con.name == "シルヴァディ" && def.con.item.includes("メモリ")) 
    && !(def.con.name == "アルセウス" && def.con.item.includes("プレート"))
    && !(def.con.name.includes("ザシアン") && def.con.item　== "くちたけん") 
    && !(def.con.name.includes("ザマゼンタ") && def.con.item　== "くちたたて")) 
    || (move[0] == "Gのちから" && atk.con.f_con.includes("じゅうりょく")) 
    || (move[0] == "ワイドフォース" && atk.con.f_con.includes("サイコフィールド")) 
    || (move[0] == "ミストバースト" && atk.con.f_con.includes("ミストフィールド") && cfn.groundedCheck(atk.con))){
        correction = Math.round(correction * 6144 / 4096)
    }
    // てだすけ * 6144 / 4096 → 四捨五入
    // さきどり * 6144 / 4096 → 四捨五入
    if (atk.con.p_con.includes("さきどり")){
        correction = Math.round(correction * 6144 / 4096)
        cfn.conditionRemove(atk.con, "poke", "さきどり")
    }
    // じゅうでん * 8192 / 4096 → 四捨五入
    if (atk.con.p_con.includes("じゅうでん") && move[1] == "でんき"){
        correction = Math.round(correction * 8192 / 4096)
    }
    // かたきうち、からげんき、しおみず、ベノムショック、クロスサンダー、クロスフレイム * 8192 / 4096 → 四捨五入
    if (move[0] == "かたきうち"){
        for (let i = 0; i < cfn.lastLog(atk.con).length; i++){
            if (cfn.lastLog(atk.con)[i].includes(atk.con.TN + "　の　") && cfn.lastLog(atk.con)[i].includes("は　たおれた　!")){
                correction = Math.round(correction * 8192 / 4096)
            }
        }
    }
    if ((move[0] == "からげんき" && (atk.con.abnormal.includes("どく") || atk.con.abnormal == "やけど") || atk.con.abnormal == ("まひ")) 
    || (move[0] == "しおみず" && def.con.last_HP <= def.con.full_HP / 2) 
    || (move[0] == "ベノムショック" && def.con.abnormal.includes("どく"))){
        correction = Math.round(correction * 8192 / 4096)
    }
    // フィールド弱化 * 2048 / 4096 → 四捨五入
    if ((atk.con.f_con.includes("グラスフィールド") && cfn.groundedCheck(def.con) && (move[0] == "じしん" || move[0] == "じならし" || move[0] == "マグニチュード")) 
    || (atk.con.f_con.includes("ミストフィールド") && cfn.groundedCheck(def.con) && move[1] == "ドラゴン")){
        correction = Math.round(correction * 2048 / 4096)
    }
    // フィールド強化 * 5325 / 4096 → 四捨五入
    if ((atk.con.f_con.includes("エレキフィールド") && cfn.groundedCheck(atk.con) && move[1] == "でんき") 
    || (atk.con.f_con.includes("グラスフィールド") && cfn.groundedCheck(atk.con) && move[1] == "くさ") 
    || (atk.con.f_con.includes("サイコフィールド") && cfn.groundedCheck(atk.con) && move[1] == "エスパー")){
        correction = Math.round(correction * 5325 / 4096)
    }
    // どろあそび、みずあそび * 1352 / 4096 → 四捨五入
    if (((atk.con.p_con.includes("どろあそび") || def.con.p_con.includes("どろあそび")) && move[1] == "でんき") 
    || ((atk.con.p_con.includes("みずあそび") || def.con.p_con.includes("みずあそび")) && move[1] == "ほのお")){
        correction = Math.round(correction * 1352 / 4096)
    }


    // 最終威力 1より小さければ1になる
    return Math.max(cfn.fiveCut(move[3] * correction / 4096), 1)
}

// 急所判定
function getCritical(atk, def, move){

    let critical = 0

    if (atk.con.p_con.includes("きゅうしょアップ")){
        critical += 2
    }
    if (atk.con.p_con.includes("とぎすます")){
        critical += 3
    }
    for (let i = 0; i < atk.con.p_con.split("\n").length - 1; i++){
        if (atk.con.p_con.split("\n")[i].includes("キョダイシンゲキ")){
            critical += Number(atk.con.p_con.split("\n")[i].substrings(9, 10))
        }
    }
    if (atk.con.p_con.includes("とぎすます")){
        critical += 3
    }
    if (atk.con.ability == "きょううん"){
        critical += 1
    }
    if (atk.con.item == "ピントレンズ" || atk.con.item == "するどいツメ"){
        critical += 1
    }
    if (atk.con.name == "ラッキー" && atk.con.item == "ラッキーパンチ"){
        critical += 2
    }
    if ((atk.con.name.includes("カモネギ") || atk.con.name == "ネギガナイト") && atk.con.item == "ながねぎ"){
        critical += 2
    }
    if (atk.con.ability == "ひとでなし" && def.con.abnormal.includes("どく")){
        critical += 3   
    }
    for (let i = 0; i < moveEff.critical().length; i++){
        if (move[0] == moveEff.critical()[i][0]){
            critical += moveEff.critical()[i][1]
        }
    }

    if (def.con.f_con.includes("おまじない") || def.con.ability == "カブトアーマー" || def.con.ability == "シェルアーマー"){
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

// 実数値取得
function getStatus(atk, def, move, critical){
    let A_AV = atk.con.A_AV
    let B_AV = def.con.B_AV
    let A_rank = atk.con.A_rank
    let B_rank = def.con.B_rank
    let C_AV = atk.con.C_AV
    let D_AV = def.con.D_AV
    let C_rank = atk.con.C_rank
    let D_rank = def.con.D_rank

    if (atk.con.f_con.includes("ワンダールーム")){
        B_AV = def.con.D_AV
        D_AV = def.con.B_AV
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
            A_AV = def.con.A_AV
            A_rank = def.con.A_rank
        }
        if (move[0] == "せいなるつるぎ" || move[0] == "DDラリアット" || move[0] == "なしくずし"){
            B_rank = 0
            D_rank = 0
        }
        if (move[0] == "ボディプレス"){
            A_AV = atk.con.B_AV
            A_rank = atk.con.B_rank
            if (atk.con.f_con.includes("ワンダールーム")){
                A_rank = atk.con.D_rank
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
            if (!atk.con.f_con.includes("ワンダールーム")){
                D_AV = def.con.B_AV
            }
            D_rank = def.con.B_rank
        } else if (move[0] == "はめつのねがい" || move[0] == "みらいよち"){
            for (let i = 0; i < def.con.f_con.split("\n").length - 1; i++){
                if (def.con.f_con.split("\n")[i].includes(move[0])){
                    let num = Number(def.con.f_con.split("\n")[i].slice(-6, -5))
                    if (atk["poke" + num].life != "戦闘中"){
                        C_AV = atk["poke" + num].C_AV
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


// 最終攻撃力
function attackCalculation(atk, def, move, status){

    let attack = status[0]

    // はりきり
    if (atk.con.ability == "はりきり" && move[2] == "物理"){
        attack = Math.floor(attack * 6144 / 4096)
    }
    
    // 初期値
    attack = attack * 4096

    // スロースタート、よわき
    if ((atk.con.p_con.includes("スロースタート") && move[2] == "物理") 
    || (atk.con.ability == "よわき" && atk.con.last_HP <= atk.con.full_HP / 2)){
        attack = Math.round(attack * 2048 / 4096)
    }
    // フラワーギフト、こんじょう、しんりょく、もうか、げきりゅう、むしのしらせ、もらいび、サンパワー、プラス、マイナス、はがねつかい、ごりむちゅう、トランジスタ、りゅうのあぎと
    if ((atk.con.ability == "フラワーギフト" && atk.con.f_con.includes("にほんばれ") && move[2] == "物理" && cfn.isWeather(atk.con, def.con)) 
    || (atk.con.ability == "こんじょう" && atk.con.abnormal != "" && move[2] == "物理") 
    || (atk.con.ability == "しんりょく" && atk.con.last_HP <= atk.con.full_HP / 3 && move[1] == "くさ") 
    || (atk.con.ability == "もうか" && atk.con.last_HP <= atk.con.full_HP / 3 && move[1] == "ほのお") 
    || (atk.con.ability == "げきりゅう" && atk.con.last_HP <= atk.con.full_HP / 3 && move[1] == "みず") 
    || (atk.con.ability == "むしのしらせ" && atk.con.last_HP <= atk.con.full_HP / 3 && move[1] == "むし") 
    || (atk.con.p_con.includes("もらいび") && move[1] == "ほのお") 
    || (atk.con.ability == "サンパワー" && atk.con.f_con.includes("にほんばれ") && move[2] == "特殊" && cfn.isWeather(atk.con, def.con)) 
    || (atk.con.ability == "はがねつかい" && move[1] == "はがね") 
    || (atk.con.ability == "ごりむちゅう" && move[2] == "物理") 
    || (atk.con.ability == "トランジスタ" && move[1] == "でんき") 
    || (atk.con.ability == "りゅうのあぎと" && move[1] == "ドラゴン")){
        attack = Math.round(attack * 6144 / 4096)
    }
    // ちからもち、ヨガパワー、すいほう強化、はりこみ
    if ((atk.con.ability == "ちからもち" && move[2] == "物理") 
    || (atk.con.ability == "ヨガパワー" && move[2] == "物理") 
    || (atk.con.ability == "すいほう" && move[1] == "みず")){
        attack = Math.round(attack * 8192 / 4096)
    }
    if (atk.con.ability == "はりこみ"){
        const log = cfn.thisLog(atk.con)
        if (log.includes("(" + def.con.TN + "の行動)")){
            if (log[log.indexOf("(" + def.con.TN + "の行動)") + 1].includes(def.con.TN + "　は") && log[log.indexOf("(" + def.con.TN + "の行動)") + 1].includes("引っ込めた")){
                attack = Math.round(attack * 8192 / 4096)
            }
        }
    }
    // あついしぼう、すいほう弱化
    if ((def.con.ability == "あついしぼう" && (move[1] == "ほのお" || move[1] == "こおり")) 
    || (def.con.ability == "すいほう" && move[1] == "ほのお")){
        attack = Math.round(attack * 2048 / 4096)
    }
    // こだわりハチマキ、こだわりメガネ
    if ((atk.con.item == "こだわりハチマキ" && move[2] == "物理") 
    || (atk.con.item == "こだわりメガネ" && move[2] == "特殊")){
        attack = Math.round(attack * 6144 / 4096)
    }
    // ふといホネ、しんかいのキバ、でんきだま
    if ((atk.con.item == "ふといホネ" && (atk.con.name == "カラカラ" || atk.con.name.includes("ガラガラ")) && move[2] == "物理") 
    || (atk.con.item == "しんかいのキバ" && atk.con.name == "パールル" && move[2] == "特殊") 
    || (atk.con.item == "でんきだま" && atk.con.name == "ピカチュウ")){
        attack = Math.round(attack * 8192 / 4096)
    }

    // 最終攻撃 1より小さかったら1にする
    return Math.max(cfn.fiveCut(attack / 4096), 1)
}


// 最終防御
function　defenseCalculation(atk, def, move, status){

    let defense = status[1]

    let phys = "物理"
    if (def.con.p_con.includes("ワンダールーム")){
        phys = "特殊"
    }
    let spec = "特殊"
    if (def.con.p_con.includes("ワンダールーム")){
        spec = "物理"
    }

    // すなあらしの時、岩タイプの特防が上がる
    if (def.con.f_con.includes("すなあらし") && def.con.type.includes("いわ") && move[2] == spec && cfn.isWeather(atk.con, def.con)){
        defense = Math.floor(defense * 6144 / 4096)
    }

    // 初期値
    defense = defense * 4096
    
    // フラワーギフト、ふしぎなうろこ、くさのけがわ
    if ((def.con.ability == "フラワーギフト" &&  def.con.f_con.includes("にほんばれ") && move[2] == spec && cfn.isWeather(atk.con, def.con)) 
    || (def.con.ability == "ふしぎなうろこ" && def.con.abnormal != "" && move[2] == phys) 
    || (def.con.ability == "くさのけがわ" && def.con.f_con.includes("グラスフィールド") && move[2] == phys)){
        defense = Math.floor(defense * 6144 / 4096)
    }
    // ファーコート
    if (def.con.ability == "ファーコート" && move[2] == phys){
        defense = Math.floor(defense * 8192 / 4096)
    }
    // しんかのきせき、とつげきチョッキ
    if ((def.con.item == "しんかのきせき") 
    || (def.con.item == "とつげきチョッキ" && move[2] == spec)){
        defense = Math.floor(defense * 6144 / 4096)
    }
    // しんかいのウロコ、メタルパウダー
    if ((def.con.item == "しんかいのウロコ" && def.con.name == "パールル" && move[2] == spec) 
    || (def.con.item == "メタルパウダー" && def.con.name == "メタモン" && move[2] == phys)){
        defense = Math.floor(defense * 8192 / 4096)
    }

    // 最終防御　1より小さかったら1にする
    return Math.max(cfn.fiveCut(defense / 4096), 1)

}


// 最終ダメージ
function damageCalculation(atk, def, move, power, critical, attack, defense){
    let damage = Math.floor(atk.con.level * 2 / 5 + 2)
    damage = Math.floor(damage * power * attack / defense)
    damage = Math.floor(damage / 50 + 2)

    // 複数対象補正
    // おやこあい補正

    if (def.con.item != "ばんのうがさ" && cfn.isWeather(atk.con, def.con)){
        // 天気弱化補正
        if ((atk.con.f_con.includes("あめ") && move[1] == "ほのお") 
        || (atk.con.f_con.includes("にほんばれ") && move[1] == "みず")){
            damage = cfn.fiveCut(damage * 2048 / 4096)
        }
        // 天気強化補正
        if ((atk.con.f_con.includes("あめ") && move[1] == "みず") 
        || (atk.con.f_con.includes("にほんばれ") && move[1] == "ほのお")){
            damage = cfn.fiveCut(damage * 6144 / 4096)
        }
    }
    // 急所補正
    if (critical){
        damage = cfn.fiveCut(damage * 6144 / 4096)
    }
    // ダメージ乱数補正
    const random = (Math.floor(Math.random() * 16 + 85)) / 100
    damage = parseInt(damage * random)
    // タイプ一致補正
    if (atk.con.type.includes(move[1])){
        if (atk.con.ability == "てきおうりょく"){
            damage = cfn.fiveCut(damage * 8192 / 4096)
        } else {
            damage = cfn.fiveCut(damage * 6144 / 4096)
        }
    }
    // タイプ相性補正
    const compatibility_rate = cfn.compatibilityCheck(atk, def, move)
    damage = Math.floor(damage * compatibility_rate)
    // やけど補正
    if (atk.con.abnormal == "やけど" && move[2] == "物理" && move[0] != "からげんき" && atk.con.ability != "こんじょう"){
        damage = cfn.fiveCut(damage * 2048 / 4096)
    }
    // 壁補正
    if (!critical && atk.con.ability != "すりぬけ"){
        if (((def.con.f_con.includes("リフレクター") || def.con.f_con.includes("オーロラベール")) && move[2] == "物理") 
        || ((def.con.f_con.includes("ひかりのかべ") || def.con.f_con.includes("オーロラベール")) && move[2] == "特殊")){
            damage = Math.round(damage * 2048 / 4096)
        }
    }
    // ブレインフォース補正
    if (atk.con.ability == "ブレインフォース" && compatibility_rate > 1){
        damage = Math.round(damage * 5120 / 4096)
    }
    // スナイパー補正
    if (atk.con.ability == "スナイパー" && critical){
        damage = Math.round(damage * 6144 / 4096)
    }
    // いろめがね補正
    if (atk.con.ability == "いろめがね" && compatibility_rate < 1){
        damage = Math.round(damage * 8192 / 4096)
    }
    // もふもふほのお補正
    if (def.con.ability == "もふもふ" && move[1] == "ほのお"){
        damage = Math.round(damage * 8192 / 4096)
    }
    // ダメージ半減特性補正
    if ((def.con.ability == "こおりのりんぷん" && move[2] == "特殊") 
    || (def.con.ability == "パンクロック" && music_move_list.includes(move[0])) 
    || ((def.con.ability == "ファントムガード" || def.con.ability == "マルチスケイル") && (def.con.full_HP == def.con.last_HP)) 
    || (def.con.ability == "もふもふ" && move[6] == "直接")){
        damage = Math.round(damage * 2048 / 4096)
    }
    // 効果抜群ダメージ軽減特性補正
    if ((atk.con.ability == "ハードロック" || atk.con.ability == "フィルター" || atk.con.ability == "プリズムアーマー") && compatibility_rate > 1){
        damage = Math.round(damage * 3072 / 4096)
    }
    // フレンドガード補正
    // たつじんのおび補正
    if (atk.con.item == "たつじんのおび" && compatibility_rate > 1){
        damage = Math.round(damage * 4915 / 4096)
    }
    // メトロノーム補正
    // いのちのたま補正
    if (atk.con.item == "いのちのたま"){
        damage = Math.floor(damage * 5324 / 4096)
    }
    // 半減きのみ補正
    for (let i = 0; i < itemEff.halfBerry().length; i++){
        if (def.con.item == itemEff.halfBerry()[i][0] && move[1] == itemEff.halfBerry()[i][1] && (move[1] == "ノーマル" || compatibility_rate > 1)){
            if (def.con.ability == "じゅくせい"){
                damage = Math.round(damage * 1024 / 4096)
            } else {
                damage = Math.round(damage * 2048 / 4096)
            }
            cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　の　" + def.con.item + "が　威力を弱めた" + "\n")
            cfn.setRecycle(def)
            cfn.setBelch(def)
        }
    }
    // ちいさくなる、あなをほる、ダイマックス状態への攻撃補正
    if ((def.con.p_con.includes("ちいさくなる") && moveEff.minimize().includes(move[0])) 
    || (def.con.p_con.includes("あなをほる") && (move[0] == "じしん" || move[0] == "マグニチュード")) 
    || (def.con.p_con.includes("ダイビング") && move[0] == "なみのり")){
        damage = Math.round(damage * 8192 / 4096)
    }
    // まもる状態貫通補正

    // 最終ダメージ
    return {damage: Math.max(damage, 1), compatibility: compatibility_rate, critical: critical}
}