// jsファイルの読み込み
const bfn = require("./base_function")
const cfn = require("./law_function")
const efn = require("./ex_function")
const moveEff = require("./move_effect")
const itemEff = require("./item_effect")
const summon = require("./1_summon")

exports.HPchangeMagic = function(team, enemy, damage, pm, cause){
    if (pm == "+" && !team.con.p_con.includes("かいふくふうじ")){
        if (typeof cause == "string"){
            cfn.logWrite(team, enemy, team.con.TN + "　の　" + team.con.name + "　は　" + cause + "　で　" + damage + "　の　HP　を回復した" + "\n")
        } else {
            cfn.logWrite(team, enemy, team.con.TN + "　の　" + team.con.name + "　は　" + damage + "　の　HP　を回復した" + "\n")
        }
        team.con.last_HP = Math.min(team.con.full_HP, team.con.last_HP + damage)
    } else if (pm == "-" && team.con.ability != "マジックガード"){
        if (typeof cause == "string"){
            cfn.logWrite(team, enemy, team.con.TN + "　の　" + team.con.name + "　に　" + cause + "　で　" + damage + "　の　ダメージ" + "\n")
        } else {
            cfn.logWrite(team, enemy, team.con.TN + "　の　" + team.con.name + "　に　" + damage + "　の　ダメージ" + "\n")
        }
            
        team.con.p_con += "ダメおし" + "\n"
        // 残りHPの表示
        team.con.last_HP = Math.max(0, team.con.last_HP - damage)
        team["poke" + cfn.battleNum(team)].last_HP = team.con.last_HP
        if (team.con.HP_last - damage > 0){
            // HPが減った時のきのみ等の発動
            bfn.berryPinch(team, enemy)
        }
    }
    // ひんし宣言
    if (team.con.last_HP == 0){
        summon.comeBack(team, enemy)
    }
}



// 素早さ比較
exports.speedCheck = function(con1, con2){
    // 素早さ = 実数値 * ランク補正 * 素早さ補正 * まひ補正
    let data = []
    for (const team of [con1, con2]){
        let S_AV = team.S_AV

        // ランク補正
        if (team.S_rank > 0){
            S_AV = Math.round((S_AV * (2 + team.S_rank)) / 2)
        } else {
            S_AV = Math.round((S_AV * 2) / (2 - team.S_rank))
        }

        // 素早さ補正初期値
        let correction = 4096

        if (cfn.isWeather(con1, con2)){
            if ((team.ability == "ようりょくそ" && team.f_con.includes("にほんばれ")) 
            || (team.ability == "すいすい" && team.f_con.includes("あめ")) 
            || (team.ability == "すなかき" && team.f_con.includes("すなあらし")) 
            || (team.ability == "ゆきかき" && team.f_con.includes("あられ"))){
                correction = Math.round(correction * 8192 / 4096)
            }
        }
        if (team.ability == "サーフテール" && team.f_con.includes("エレキフィールド")){
            correction = Math.round(correction * 8192 / 4096)
        }
        if (team.p_con.includes("スロースタート")){
            correction = Math.round(correction * 2048 / 4096)
        }
        if (team.p_con.includes("かるわざ") && team.item == ""){
            correction = Math.round(correction * 8192 / 4096)
        }
        if (team.ability == "はやあし" && team.abnormal != ""){
            correction = Math.round(correction * 6144 / 4096)
        }
        if (team.name == "メタモン" && team.item == "スピードパウダー"){
            correction = Math.round(correction * 8192 / 4096)
        }
        if (team.item == "こだわりスカーフ"){
            correction = Math.round(correction * 6144 / 4096)
        }
        if (team.item == "くろいてっきゅう"){
            correction = Math.round(correction * 2048 / 4096)
        }
        if (team.item == "きょうせいギプス"){ // wikiにない
            correction = Math.round(correction * 2048 / 4096)
        }
        if (team.item.includes("パワー")){
            correction = Math.round(correction * 2048 / 4096)
        }
        if (team.f_con.includes("おいかぜ")){
            correction = Math.round(correction * 8192 / 4096)
        }
        if (team.f_con.includes("しつげん")){
            correction = Math.round(correction * 1024 / 4096)
        }

        S_AV = cfn.fiveCut(S_AV * correction / 4096)

        // まひ補正
        if (team.abnormal == "まひ"){
            S_AV = Math.floor(S_AV * 2048 / 4096)
        }
        data.push(S_AV)
    }

    return data
}



exports.makeAbnormal = function(team, enemy, text, probability, cause){
    const random = Math.random() * 100
    const TN = team.con.TN
    let con = team.con
    if (random < probability && !(cfn.groundedCheck(con) && con.f_con.includes("ミストフィールド"))){
        if (text == "こんらん" && con.ability != "マイペース" && !con.p_con.includes("こんらん") && random < probability){
            con.p_con += "こんらん　1ターン目" + "\n"
            if (typeof cause == "string"){
                cfn.logWrite(team, enemy, TN + "　の　" + con.name + "　は　" + cause + "により　こんらんした！" + "\n")
            } else {
                cfn.logWrite(team, enemy, TN + "　の　" + con.name + "　は　こんらんした！" + "\n")
            }
        } else if (con.abnormal == "" && con.ability != "ぜったいねむり" 
        && !(con.f_con.includes("にほんばれ") && con.ability == "リーフガード" && !(con.ability == "エアロック" || con.ability == "ノーてんき" || enemy.con.ability == "エアロック" || enemy.con.ability == "ノーてんき")) 
        && !(con.type.includes("くさ") && con.ability == "フラワーベール") && con.name != "メテノ(りゅうせいのすがた)"){
            if (text == "まひ" && !con.type.includes("でんき") && con.ability != "じゅうなん"){
                con.abnormal = "まひ"
                if (typeof cause == "string"){
                    cfn.logWrite(team, enemy, TN + "　の　" + con.name + "　は　" + cause + "により　しびれて　技が出にくくなった！" + "\n")
                } else {
                    cfn.logWrite(team, enemy, TN + "　の　" + con.name + "　は　しびれて　技が出にくくなった！" + "\n")
                }
            } else if (text == "どく" && !con.type.includes("どく") && !con.type.includes("はがね") && con.ability != "めんえき" && con.ability != "パステルベール"){
                con.abnormal = "どく"
                if (typeof cause == "string"){
                    cfn.logWrite(team, enemy, TN + "　の　" + con.name + "　は　" + cause + "により　どくをあびた！" + "\n")
                } else {
                    cfn.logWrite(team, enemy, TN + "　の　" + con.name + "　は　どくをあびた！" + "\n")
                }
            } else if (text == "もうどく" && !con.type.includes("どく") && !con.type.includes("はがね") && con.ability != "めんえき" && con.ability != "パステルベール"){
                con.abnormal = "もうどく"
                con.p_con += "もうどく　1ターン目" + "\n"
                if (typeof cause == "string"){
                    cfn.logWrite(team, enemy, TN + "　の　" + con.name + "　は　" + cause + "により　もうどくをあびた！" + "\n")
                } else {
                    cfn.logWrite(team, enemy, TN + "　の　" + con.name + "　は　もうどくをあびた！" + "\n")
                }
            } else if (text == "やけど" && !con.type.includes("ほのお") && con.ability != "みずのベール" && con.ability != "すいほう"){
                con.abnormal = "やけど"
                if (typeof cause == "string"){
                    cfn.logWrite(team, enemy, TN + "　の　" + con.name + "　は　" + cause + "により　やけどをおった！" + "\n")
                } else {
                    cfn.logWrite(team, enemy, TN + "　の　" + con.name + "　は　やけどをおった！" + "\n")
                }
            } else if (text == "こおり" && con.ability != "マグマのよろい" && !con.f_con.includes("にほんばれ") && !(con.ability == "エアロック" || con.ability == "ノーてんき" || enemy.con.ability == "エアロック" || enemy.con.ability == "ノーてんき")){
                con.abnormal = "こおり"
                if (typeof cause == "string"){
                    cfn.logWrite(team, enemy, TN + "　の　" + con.name + "　は　" + cause + "により　こおりづけになった！" + "\n")
                } else {
                    cfn.logWrite(team, enemy, TN + "　の　" + con.name + "　は　こおりづけになった！" + "\n")
                }
            } else if (text == "ねむり" && !con.f_con.includes("エレキフィールド") && con.ability != "スイートベール" && con.ability != "やるき" && con.ability != "ふみん"){
                con.abnormal = "ねむり"
                con.p_con += "ねむり　1ターン目" + "\n"
                if (typeof cause == "string"){
                    cfn.logWrite(team, enemy, TN + "　の　" + con.name + "　は　" + cause + "により　ねむってしまった！" + "\n")
                } else {
                    cfn.logWrite(team, enemy, TN + "　の　" + con.name + "　は　ねむってしまった！" + "\n")
                }
            }
        }
        bfn.berryAbnormal(team, enemy)
    }
}


// 技の追加効果、持ち物、特性、場の状態などにより、ランク変化する時
// 技の追加効果の時は、原因の宣言はいらない
// それ以外は原因を宣言する
// 無効判定も必要、向こうになった時はメッセージがでない
exports.rankChange = function(team, enemy, parameter, change, probability, cause){
    let con = team.con

    if (con.ability == "あまのじゃく"){
        change *= -1
    }
    if (con.ability == "たんじゅん"){
        change *= 2
    }

    const random = Math.random() * 100
    if (random < probability){
        if (!(change < 0 && (con.f_con.includes("しろいきり") || con.ability == "しろいけむり" || con.ability == "クリアボディ" || con.ability == "メタルプロテクト" || (con.ability == "フラワーベール" && con.type.includes("くさ")) || con.ability == "ミラーアーマー"))){
            if ((parameter == "A" && !(con.ability == "かいりきバサミ" && change < 0)) 
            || (parameter == "B" && !(con.ability == "はとむね" && change < 0))
            || (parameter == "X" && !(con.ability == "するどいめ" && change < 0)) 
            || parameter == "C" || parameter == "D" || parameter == "S" || parameter == "Y"){
                if (typeof cause == "string"){
                    cfn.logWrite(team, enemy, cause + "が　発動した！" + "\n")
                }

                const convert = [["A", "攻撃"], ["B", "防御"], ["C", "特攻"], ["D", "特防"], ["S", "素早さ"], ["X", "命中率"], ["Y", "回避率"]]
                let now = con[parameter + "_rank"]
                let result = now + change
                if (result > 6){result = 6}
                if (result < -6){result = -6}
                con[parameter + "_rank"] = result

                for (let i = 0; i < convert.length; i++){
                    if (parameter == convert[i][0]){
                        const text = convert[i][1]
                        if (change > 0){
                            if (result - now == 0){
                                cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　の　" + text + "　は　これ以上　上がらない" + "\n")
                            } else if (result - now == 1){
                                cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　の　" + text + "　が　上がった！" + "\n")
                                con.p_con += "ランク上昇" + "\n"
                            } else if (result - now == 2){
                                cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　の　" + text + "　が　ぐーんと上がった！" + "\n")
                                con.p_con += "ランク上昇" + "\n"
                            } else if (result - now > 2){
                                cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　の　" + text + "　が　ぐぐーんと上がった！" + "\n")
                                con.p_con += "ランク上昇" + "\n"
                            }
                        } else if (change < 0){
                            if (result - now == 0){
                                cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　の　" + text + "　は　これ以上　下がらない" + "\n")
                            } else {
                                if (result - now == -1){
                                    cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　の　" + text + "　が　下がった！" + "\n")
                                    con.p_con += "ランク下降" + "\n"
                                } else if (result - now == -2){
                                    cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　の　" + text + "　が　がくっと下がった！" + "\n")
                                    con.p_con += "ランク下降" + "\n"
                                } else if (result - now < -2){
                                    cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　の　" + text + "　が　がくーんと下がった！" + "\n")
                                    con.p_con += "ランク下降" + "\n"
                                }
                                if (con.ability == "かちき"){
                                    result = Math.min(con.C_rank + 2, 6)
                                    if (result - con.C_rank == 1){
                                        cfn.logWrite(team, enemy, "かちきが　発動した" + "\n")
                                        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　の　特攻　が　上がった！" + "\n")
                                        con.p_con += "ランク上昇" + "\n"
                                    } else if (result - con.C_rank == 2){
                                        cfn.logWrite(team, enemy, "かちきが　発動した" + "\n")
                                        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　の　特攻　が　ぐーんと上がった！" + "\n")
                                        con.p_con += "ランク上昇" + "\n"
                                    }
                                    con.C_rank = result
                                } else if (con.ability == "まけんき"){
                                    result = Math.min(con.A_rank + 2, 6)
                                    if (result - con.A_rank == 1){
                                        cfn.logWrite(team, enemy, "まけんきが　発動した" + "\n")
                                        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　の　攻撃　が　上がった！" + "\n")
                                        con.p_con += "ランク上昇" + "\n"
                                    } else if (result - con.A_rank == 2){
                                        cfn.logWrite(team, enemy, "まけんきが　発動した" + "\n")
                                        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　の　攻撃　が　ぐーんと上がった！" + "\n")
                                        con.p_con += "ランク上昇" + "\n"
                                    }
                                    con.A_rank = result
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}


// Z技の追加効果によるランク変化、あまのじゃくが効かない
exports.rankChangeZ = function(team, enemy, parameter, change){
    const convert = [["A", "攻撃"], ["B", "防御"], ["C", "特攻"], ["D", "特防"], ["S", "素早さ"], ["X", "命中率"], ["Y", "回避率"]]
    const now = team.con[parameter + "_rank"]
    let result = now + change
    result = Math.min(result, 6)
    result = Math.max(result, -6)
    team.con[parameter + "_rank"] = result
    for (let i = 0; i < convert.length; i++){
        if (parameter == convert[i][0]){
            const text = convert[i][1]
            if (result - now == 0){
                cfn.logWrite(team, enemy, team.con.TN + "　の　" + team.con.name + "　の　" + text + "　は　これ以上　上がらない" + "\n")
            } else if (result - now == 1){
                cfn.logWrite(team, enemy, team.con.TN + "　の　" + team.con.name + "　の　" + text + "　が　上がった！" + "\n")
                team.con.p_con += "ランク上昇" + "\n"
            } else if (result - now == 2){
                cfn.logWrite(team, enemy, team.con.TN + "　の　" + team.con.name + "　の　" + text + "　が　ぐーんと上がった！" + "\n")
                team.con.p_con += "ランク上昇" + "\n"
            } else if (result - now > 2){
                cfn.logWrite(team, enemy, team.con.TN + "　の　" + team.con.name + "　の　" + text + "　が　ぐぐーんと上がった！" + "\n")
                team.con.p_con += "ランク上昇" + "\n"
            }
        }
    }
}

// 特性の入れ替え
exports.changeAbility = function(copy, org, num, ability){
    // copy：コピーされるチーム
    // org：コピーするチーム
    // num：対象のポケモンの数　1ならorgがcopyをコピーする　2なら両方を入れ替える 3ならcopyチームの特性をabilityにする
    if (num == 1){
        let copy_ability = copy.con.ability
        for (let i = 0; i < copy.con.p_con.split("\n").length - 1; i++){
            if (copy.con.p_con.split("\n")[i].includes("特性なし")){
                copy_ability = copy.con.p_con.split("\n")[i].slice(5)
            } else if (copy.con.p_con.split("\n")[i].includes("かがくへんかガス")){
                copy_ability = copy.con.p_con.split("\n")[i].slice(9)
            }
        }
        cfn.logWrite(copy, org, org.con.TN + "　の　" + org.con.name + "　の　特性が　" + copy_ability + "に　なった"  + "\n")
        cfn.conditionRemove(org.con, "poke", "スロースタート　")
        org.con.ability = copy_ability
        const p_con = org.con.p_con
        org.con.p_con = ""
        for (let i = 0; i < p_con.split("\n").length - 1; i++){
            if (p_con.split("\n")[i].includes("特性なし")){
                org.con.p_con += "特性なし：" + copy_ability + "\n"
                org.con.ability = ""
            } else if (p_con.split("\n")[i].includes("かがくへんかガス")){
                org.con.p_con += "かがくへんかガス：" + copy_ability + "\n"
                org.con.ability = ""
            } else {
                org.con.p_con = p_con.split("\n")[i] + "\n"
            }
        }
        efn.activeAbility(org, copy, 1)
    } else if (num == 2){
        cfn.logWrite(copy, org, "お互いの　特性を入れ替えた！" + "\n")
        let copy_ability = copy.con.ability
        for (let i = 0; i < copy.con.p_con.split("\n").length - 1; i++){
            if (copy.con.p_con.split("\n")[i].includes("特性なし")){
                copy_ability = copy.con.p_con.split("\n")[i].slice(5)
            } else if (copy.con.p_con.split("\n")[i].includes("かがくへんかガス")){
                copy_ability = copy.con.p_con.split("\n")[i].slice(9)
            }
        }
        let org_ability = org.con.ability
        for (let i = 0; i < org.con.p_con.split("\n").length - 1; i++){
            if (org.con.p_con.split("\n")[i].includes("特性なし")){
                org_ability = org.con.p_con.split("\n")[i].slice(5)
            } else if (org.con.p_con.split("\n")[i].includes("かがくへんかガス")){
                org_ability = org.con.p_con.split("\n")[i].slice(9)
            }
        }
        cfn.conditionRemove(org.con, "poke", "スロースタート　")
        copy.con.ability = org_ability
        const copy_p_con = copy.con.p_con
        copy.con.p_con = ""
        for (let i = 0; i < copy_p_con.split("\n").length - 1; i++){
            if (copy_p_con.split("\n")[i].includes("特性なし")){
                copy.con.p_con += "特性なし：" + org_ability + "\n"
                copy.con.ability = ""
            } else if (copy_p_con.split("\n")[i].includes("かがくへんかガス")){
                copy.con.p_con += "かがくへんかガス：" + org_ability + "\n"
                copy.con.ability = ""
            } else {
                copy.con.p_con = copy_p_con.split("\n")[i] + "\n"
            }
        }
        cfn.conditionRemove(copy.con, "poke", "スロースタート　")
        org.con.ability = copy_ability
        const org_p_con = org.con.p_con
        org.con.p_con = ""
        for (let i = 0; i < org_p_con.split("\n").length - 1; i++){
            if (org_p_con.split("\n")[i].includes("特性なし")){
                org.con.p_con += "特性なし：" + copy_ability + "\n"
                org.con.ability = ""
            } else if (org_p_con.split("\n")[i].includes("かがくへんかガス")){
                org.con.p_con += "かがくへんかガス：" + copy_ability + "\n"
                org.con.ability = ""
            } else {
                org.con.p_con= org_p_con.split("\n")[i] + "\n"
            }
        }
        efn.activeAbility(org, copy, "both")
    } else if (num == 3){
        cfn.logWrite(copy, org, copy.con.TN + "　の　" + copy.con.name + "　の　特性が　" + ability + "に　なった！" + "\n")
        cfn.conditionRemove(copy.con, "poke", "スロースタート　")
        copy.con.ability = ability
        const copy_p_con = copy.con.p_con
        copy.con.p_con = ""
        for (let i = 0; i < copy_p_con.split("\n").length - 1; i++){
            if (copy_p_con.split("\n")[i].includes("特性なし")){
                copy.con.p_con += "特性なし：" + ability + "\n"
                copy.con.ability = ""
            } else if (copy_p_con.split("\n")[i].includes("かがくへんかガス")){
                copy.con.p_con += "かがくへんかガス：" + ability + "\n"
                copy.con.ability = ""
            } else {
                copy.con.p_con = copy_p_con.split("\n")[i] + "\n"
            }
        }
        efn.activeAbility(org, copy, 2)
    }
}


// フォルムチェンジ
exports.formChenge = function(team, enemy, name){
    let con = team.con
    poke = cfn.pokeSearch(name)
    cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　は　" + poke[1] + "　に　なった!" + "\n")
    const rate = cfn.natureCheck(con.nature)
    const num = cfn.battleNum(team)

    // 実数値の書き換え
    const parameter = ["A", "B", "C", "D", "S"]
    for (let i = 0; i < 5; i++){
        let BS = Number(poke[i + 3])
        let IV = team["poke" + num][parameter[i] + "_IV"]
        let EV = team["poke" + num][parameter[i] + "_EV"]
        let AV = parseInt((parseInt(((BS*2 + IV + parseInt(EV/4)) * con.level)/100) + 5) * rate[i])
        con[parameter[i] + "_AV"] = AV
        team["poke" + num][parameter[i] + "_AV"] = AV
    }
    // H実数値の書き換え
    if (poke[1] == "ジガルデ(パーフェクトフォルム)"){
        const dif_H = 216 - cfn.pokeSearch(con.name)[2]
        con.full_HP += Math.floor(dif_H * 2 * con.level / 100)
        con.last_HP += Math.floor(dif_H * 2 * con.level / 100)
        team["poke" + num].full_HP = con.full_HP
        team["poke" + num].last_HP = con.last_HP
    }
    // 名前の書き換え
    con.name = poke[1]
    team["poke" + num].name = poke[1]

    // 特性の書き換え
    if (con.name.includes("ヒヒダルマ")){
        con.ability = "ダルマモード"
        team["poke" + num].ability = "ダルマモード"
    } else {
        con.ability = poke[15]
        team["poke" + num].ability = poke[15]
    }

    // タイプの書き換え
    if (poke[10] == ""){
        con.type = poke[9]
        team["poke" + num].type = poke[9]
    } else {
        con.type = poke[9] + "、" + poke[10]
        team["poke" + num].type = poke[9] + "、" + poke[10]
    }

    // 特性の発動
    efn.activeAbility(team, enemy, 1)
}

// ダメージ量宣言
exports.damageDeclaration = function(atk, def, damage, move){
    // みがわりがある時
    if (damage.substitute && !moveEff.music().includes(move[0]) && move[0] != "シャドースチール" && atk.con.ability != "すりぬけ"){
        let p_list = def.con.p_con.split("\n")
        for (let i = 0; i < p_list.length; i++){
            if (p_list[i].includes("みがわり：")){
                if (damage.give < Number(p_list[i].slice(5).split("/")[0])){
                    cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　の　みがわりに　" + damage.give + "　のダメージ" + "\n")
                    p_list[i] = "みがわり：" + (Number(p_list[i].slice(5).split("/")[0]) - damage.give) + p_list[i].slice(-3)
                    break
                } else {
                    cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　の　みがわりに　" + p_list[i].slice(5).split("/")[0] + "（" +  damage.damage + "）　のダメージ" + "\n")
                    cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　の　みがわりは　壊れてしまった" + "\n")
                    cfn.conditionRemove(def.con, "poke", "みがわり")
                    damage.give = p_list[i].slice(5).split("/")[0]
                    p_list.slice(i, 1)
                    break
                }
            }
        }
        def.con.p_con = p_list.join("\n")

    } else { // みがわりがない時
        cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　に　" + damage.damage + "　(" + damage.give + ")　のダメージ" + "\n")

        // ダメおし用
        cfn.conditionRemove(def.con, "poke", "ダメおし")
        def.con.p_con += "ダメおし" + "\n"
        // ゆきなだれ、リベンジ用
        cfn.conditionRemove(def.con, "poke", "ダメージ")
        def.con.p_con += move[2] + "ダメージ：" + damage.give + "\n"
        // がまん用
        let p_list = def.con.p_con.split("\n")
        for (let i = 0; i < p_list.length; i++){
            if (p_list[i].includes("がまん")){
                const log = Number(p_list[i].slice(8)) + damage.give
                p_list[i] = p_list[i].slice(0, 8) + log
                break
            }
        }
        def.con.p_con = p_list.join("\n")
        
        // 残りのHPを表示
        def.con.last_HP = Math.max(def.con.last_HP - damage.give, 0)
        def["poke" + cfn.battleNum(def)].last_HP= def.con.last_HP
    }

    if (damage.compatibility < 1){
        cfn.logWrite(atk, def, "効果は今ひとつのようだ" + "\n")
    } else if (damage.compatibility > 1){
        cfn.logWrite(atk, def, "効果は抜群だ！" + "\n")
    }
    if (damage.critical == 1){
        cfn.logWrite(atk, def, "急所に　当たった！" + "\n")
    }
    if (!(move[0] == "キョダイイチゲキ" || move[0] == "キョダイレンゲキ")){
        for (let i = 0; i < def.con.p_con.split("\n").length; i++){
            if (moveEff.protect().includes(def.con.p_con.split("\n")[i])){
                cfn.logWrite(atk, def, def.con.TN + "　の　" + def.con.name + "　は　攻撃を守りきれすにダメージを受けた" + "\n")
            }
        }
    }

    return damage
}

function reflection_check(def, move, damage, order){
    const def_p_con = document.battle[def + "_poke_condition"].value
    if (def_p_con.includes("きあいパンチ") && damage[0] > 0){
        document.battle[def + "_poke_condition"].value = ""
        for (let i = 0; i < def_p_con.split("\n").length - 1; i++){
            if (def_p_con.split("\n")[i].includes("きあいパンチ")){
                document.battle[def + "_poke_condition"].value += "きあいパンチ　失敗" + "\n"
            } else {
                document.battle[def + "_poke_condition"].value += def_p_con.split("\n")[i] + "\n"
            }
        }
    } else if (def_p_con.includes("トラップシェル") && move[2] == "物理"){
        document.battle[def + "_poke_condition"].value = ""
        for (let i = 0; i < def_p_con.split("\n").length - 1; i++){
            if (def_p_con.split("\n")[i].includes("トラップシェル：不発")){
                document.battle[def + "_poke_condition"].value += "トラップシェル：成功" + "\n"
            } else {
                document.battle[def + "_poke_condition"].value += def_p_con.split("\n")[i] + "\n"
            }
        }
        const move = move_success_judge(order[1], order[0], order)
        if (move != false){
            move_process(order[1], order[0], move, order)
        }
    }
}



// 特性『かわりもの』
exports.metamon = function(team, enemy){
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
    }
    con.p_con += "へんしん" + "\n"
    cfn.conditionRemove(con, "poke", "きゅうしょアップ")
    cfn.conditionRemove(con, "poke", "とぎすます")
    cfn.conditionRemove(con, "poke", "キョダイシンゲキ")
    cfn.conditionRemove(con, "poek", "ボディパージ")
    for (let i = 0; i < enemy.con.p_con.split("\n").length - 1; i++){
        if (enemy.con.p_con.split("\n")[i].includes("きゅうしょアップ") 
        || enemy.con.p_con.split("\n")[i].includes("とぎすます") 
        || enemy.con.p_con.split("\n")[i].includes("キョダイシンゲキ") 
        || enemy.con.p_con.split("\n")[i].includes("ボディパージ")){
            con.p_con += enemy.con.p_con.split("\n")[i] + "\n"
        }
    }
    cfn.logWrite(team, enemy, team.con.TN + "　の　" + team.con.name + "　は　" + enemy.con.name + "に　へんしんした" + "\n")
    efn.activeAbility(team, enemy, 1)
}


// D.次ターンの、選択ボタンの無効化
exports.cannotChooseAction = function(order, reverse){
    for (const team of [order, reverse]){
        // ほおばる：きのみを持っている場合、技選択が可能になる
        for (let i = 0; i < 4; i++){
            if (team[0].con["move_" + i] == "ほおばる"){
                if (itemEff.berryList().includes((team[0]).con.item)){
                    team[0].data["radio_" + i] = false
                } else {
                    team[0].data["radio_" + i] = true
                }
            }
        }
        // ゲップ：備考欄に「ゲップ」の文字があれば使用可能になる
        for (let i = 0; i < 4; i++){
            if (team[0].con["move_" + i] == "ゲップ" && team[0]["poke" + cfn.battleNum(team[0])].belch == "ゲップ"){
                team[0].data["radio_" + i] = false
            }
        }
        // いちゃもん
        if (team[0].con.p_con.includes("いちゃもん")){
            for (let i = 0; i < 4; i++){
                if (team[0].con["move_" + i] == team[0].con.used){
                    team[0].data["radio_" + i] = true
                }
            }
        }
        // ちょうはつ
        if (team[0].con.p_con.includes("ちょうはつ")){
            for (let i = 0; i < 4; i++){
                if (cfn.moveSearchByName(team[0].con["move_" + i])[2] == "変化"){
                    team[0].data["raddio_" + i] = true
                }
            }
        }
        // こだわりロック
        if (!team[0].con.item.includes("こだわり") && team[0].con.ability != "ごりむちゅう"){
            cfn.conditionRemove(team[0].con, "poke", "こだわりロック")
        }
        for (let i = 0; i < team[0].con.p_con.split("\n").length - 1; i++){
            if (team[0].con.p_con.split("\n")[i].includes("こだわりロック")){
                for (let j = 0; j < 4; j++){
                    if (team[0].con["move_" + j] != team[0].con.p_con.split("\n")[i].slice(8)){
                        team[0].data["radio_" + j] = true
                    }
                }
            }
        }
        // とつげきチョッキ
        if (team[0].con.item == "とつげきチョッキ"){
            for (let i = 0; i < 4; i++){
                if (cfn.moveSearchByName(team[0].con["move_" + i])[2] == "変化"){
                    team[0].data["radio_" + i] = true
                }
            }
        }
        // 逃げられない状態、バインド状態による交換ボタンの無効化
        if (team[0].con.p_con.includes("逃げられない") || team[0].con.p_con.includes("バインド") || team[0].con.p_con.includes("ねをはる") || team[0].con.f_con.includes("フェアリーロック") 
        || (team[1].con.ability == "ありじごく" && cfn.groundedCheck(team[0].con)) 
        || (team[1].con.ability == "かげふみ" && team[0].con.ability != "かげふみ") 
        || (team[1].con.ability == "じりょく" && team[0].con.type.includes("はがね"))){
            if (team[0].con.item != "きれいなぬけがら" && !team[0].con.type.includes("ゴースト") && !team[0].con.f_con.includes("ひんし") && !team[0].con.f_con.includes("選択中")){
                for (let i = 0; i < 3; i++){
                    team[0].data["radio_" + String(i + 4)] = true
                }
            }
        }
        // 反動で動けなくなる技の反動ターン
        // 溜め技の攻撃ターン
        // 数ターン行動する技の使用中
        if (team[0].con.p_con.includes("反動で動けない") || team[0].con.p_con.includes("溜め技") || team[0].con.p_con.includes("あばれる") 
        || team[0].con.p_con.includes("アイスボール") || team[0].con.p_con.includes("ころがる") || team[0].con.p_con.includes("がまん") || team[0].con.p_con.includes("さわぐ")){
            for (let i = 0; i < 7; i++){
                team[0].data["radio_" + i] = true
                team[0].data.megable = true
                team[0].data.Zable = true
                team[0].data.dynable = true
                team[0].data.gigable = true
            }
        }
        if (team[0].con.p_con.includes("姿を隠す：フリーフォール（防御）")){
            for (let i = 4; i < 7; i++){
                team[0].data["radio_" + i] = true
            }
        }
        // PPが0の技は使えない
        for (let i = 0; i < 4; i++){
            if (team[0].con["PP_" + i] == 0){
                team[0].data["radio_" + i] = true
            }
        }
    }
}
