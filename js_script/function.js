// jsファイルの読み込み
const bfn = require("./base_function")
const cfn = require("./law_function")
const moveEff = require("./move_effect")
const summon = require("./1_summon")

exports.HPchangeMagic = function(team, enemy, damage, pm, cause){
    if (pm == "+" && !team.p_con.includes("かいふくふうじ")){
        cfn.logWrite(team, enemy, team.con.TN + "　の　" + team.con.name + "　は　" + cause + "で　" + damage + "　の　HP　を回復した" + CR)
        team.con.last_HP = Math.min(team.con.full_HP, team.con.last_HP + damage)
    } else if (pm == "-"){
        if (team.con.ability != "マジックガード"){
            cfn.logWrite(team, enemy, team.con.TN + "　の　" + team.con.name + "　に　" + cause + "で　" + damage + "　の　ダメージ" + CR)
            team.con.p_con += "ダメおし" + CR
            // 残りHPの表示
            team.con.last_HP = Math.max(0, team.con.last_HP - damage)
            if (team.con.HP_last - damage > 0){
                // HPが減った時のきのみ等の発動
                berry_in_pinch(team)
            }
        }
    }
    // ひんし宣言
    if (team.con.last_HP == 0){
        fainted_process(team)
    }
}



// 素早さ比較
exports.speedCheck = function(one, two){
    // 素早さ = 実数値 * ランク補正 * 素早さ補正 * まひ補正
    let data = []
    for (const team of [one, two]){
        let S_AV = team.S_AV

        // ランク補正
        if (team.S_rank > 0){
            S_AV = Math.round((S_AV * (2 + team.S_rank)) / 2)
        } else {
            S_AV = Math.round((S_AV * 2) / (2 - team.S_rank))
        }

        // 素早さ補正初期値
        let correction = 4096

        if (!(one.ability == "エアロック" || one.ability == "ノーてんき" || two.ability == "エアロック" || two.ability == "ノーてんき")){
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

    // 素早さの早い順にリストに詰める
    let order = ["1", "2"]
    if (data[0] < data[1]){
        order = ["2", "1"]
    }
    if (data[0] == data[1] && Math.random() < 0.5){ // 同速の時は乱数
        order = ["2", "1"]
    }

    // トリックルームの時は逆転させる
    if (one.f_con.includes("トリックルーム")){
        return [order[1], order[0]]
    } else {
        return order
    }
}



exports.makeAbnormal = function(team, enemy, text, probability, cause){
    const random = Math.random() * 100
    const TN = team.con.TN
    let con = team.con
    if (random < probability && !(cfn.groundedCheck(con) && con.f_con.includes("ミストフィールド"))){
        if (text == "こんらん" && con.ability != "マイペース" && !con.p_con.includes("こんらん") && random < probability){
            con.p_con += "こんらん　1ターン目" + CR
            if (typeof cause == "string"){
                cfn.logWrite(team, enemy, TN + "　の　" + con.name + "　は　" + cause + "により　こんらんした！" + CR)
            } else {
                cfn.logWrite(team, enemy, TN + "　の　" + con.name + "　は　こんらんした！" + CR)
            }
        } else if (con.abnormal == "" && con.ability != "ぜったいねむり" 
        && !(con.f_con.includes("にほんばれ") && con.ability == "リーフガード" && !(con.ability == "エアロック" || con.ability == "ノーてんき" || enemy.con.ability == "エアロック" || enemy.con.ability == "ノーてんき")) 
        && !(con.type.includes("くさ") && con.ability == "フラワーベール") && con.name != "メテノ(りゅうせいのすがた)"){
            if (text == "まひ" && !con.type.includes("でんき") && con.ability != "じゅうなん"){
                con.abnormal = "まひ"
                if (typeof cause == "string"){
                    cfn.logWrite(team, enemy, TN + "　の　" + con.name + "　は　" + cause + "により　しびれて　技が出にくくなった！" + CR)
                } else {
                    cfn.logWrite(team, enemy, TN + "　の　" + con.name + "　は　しびれて　技が出にくくなった！" + CR)
                }
            } else if (text == "どく" && !con.type.includes("どく") && !con.type.includes("はがね") && con.ability != "めんえき" && con.ability != "パステルベール"){
                con.abnormal = "どく"
                if (typeof cause == "string"){
                    cfn.logWrite(team, enemy, TN + "　の　" + con.name + "　は　" + cause + "により　どくをあびた！" + CR)
                } else {
                    cfn.logWrite(team, enemy, TN + "　の　" + con.name + "　は　どくをあびた！" + CR)
                }
            } else if (text == "もうどく" && !con.type.includes("どく") && !con.type.includes("はがね") && con.ability != "めんえき" && con.ability != "パステルベール"){
                con.abnormal = "もうどく"
                con.p_con += "もうどく　1ターン目" + CR
                if (typeof cause == "string"){
                    cfn.logWrite(team, enemy, TN + "　の　" + con.name + "　は　" + cause + "により　もうどくをあびた！" + CR)
                } else {
                    cfn.logWrite(team, enemy, TN + "　の　" + con.name + "　は　もうどくをあびた！" + CR)
                }
            } else if (text == "やけど" && !con.type.includes("ほのお") && con.ability != "みずのベール" && con.ability != "すいほう"){
                con.abnormal = "やけど"
                if (typeof cause == "string"){
                    cfn.logWrite(team, enemy, TN + "　の　" + con.name + "　は　" + cause + "により　やけどをおった！" + CR)
                } else {
                    cfn.logWrite(team, enemy, TN + "　の　" + con.name + "　は　やけどをおった！" + CR)
                }
            } else if (text == "こおり" && con.ability != "マグマのよろい" && !con.f_con.includes("にほんばれ") && !(con.ability == "エアロック" || con.ability == "ノーてんき" || enemy.con.ability == "エアロック" || enemy.con.ability == "ノーてんき")){
                con.abnormal = "こおり"
                if (typeof cause == "string"){
                    cfn.logWrite(team, enemy, TN + "　の　" + con.name + "　は　" + cause + "により　こおりづけになった！" + CR)
                } else {
                    cfn.logWrite(team, enemy, TN + "　の　" + con.name + "　は　こおりづけになった！" + CR)
                }
            } else if (text == "ねむり" && !con.f_con.includes("エレキフィールド") && con.ability != "スイートベール" && con.ability != "やるき" && con.ability != "ふみん"){
                con.abnormal = "ねむり"
                con.p_con += "ねむり　1ターン目" + CR
                if (typeof cause == "string"){
                    cfn.logWrite(team, enemy, TN + "　の　" + con.name + "　は　" + cause + "により　ねむってしまった！" + CR)
                } else {
                    cfn.logWrite(team, enemy, TN + "　の　" + con.name + "　は　ねむってしまった！" + CR)
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
                    cfn.logWrite(team, enemy, cause + "が　発動した！" + CR)
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
                                cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　の　" + text + "　は　これ以上　上がらない" + CR)
                            } else if (result - now == 1){
                                cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　の　" + text + "　が　上がった！" + CR)
                                con.p_con += "ランク上昇" + CR
                            } else if (result - now == 2){
                                cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　の　" + text + "　が　ぐーんと上がった！" + CR)
                                con.p_con += "ランク上昇" + CR
                            } else if (result - now > 2){
                                cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　の　" + text + "　が　ぐぐーんと上がった！" + CR)
                                con.p_con += "ランク上昇" + CR
                            }
                        } else if (change < 0){
                            if (result - now == 0){
                                cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　の　" + text + "　は　これ以上　下がらない" + CR)
                            } else {
                                if (result - now == -1){
                                    cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　の　" + text + "　が　下がった！" + CR)
                                    con.p_con += "ランク下降" + CR
                                } else if (result - now == -2){
                                    cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　の　" + text + "　が　がくっと下がった！" + CR)
                                    con.p_con += "ランク下降" + CR
                                } else if (result - now < -2){
                                    cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　の　" + text + "　が　がくーんと下がった！" + CR)
                                    con.p_con += "ランク下降" + CR
                                }
                                if (con.ability == "かちき"){
                                    result = Math.min(con.C_rank + 2, 6)
                                    if (result - con.C_rank == 1){
                                        cfn.logWrite(team, enemy, "かちきが　発動した" + CR)
                                        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　の　特攻　が　上がった！" + CR)
                                        con.p_con += "ランク上昇" + CR
                                    } else if (result - con.C_rank == 2){
                                        cfn.logWrite(team, enemy, "かちきが　発動した" + CR)
                                        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　の　特攻　が　ぐーんと上がった！" + CR)
                                        con.p_con += "ランク上昇" + CR
                                    }
                                    con.C_rank = result
                                } else if (con.ability == "まけんき"){
                                    result = Math.min(con.A_rank + 2, 6)
                                    if (result - con.A_rank == 1){
                                        cfn.logWrite(team, enemy, "まけんきが　発動した" + CR)
                                        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　の　攻撃　が　上がった！" + CR)
                                        con.p_con += "ランク上昇" + CR
                                    } else if (result - con.A_rank == 2){
                                        cfn.logWrite(team, enemy, "まけんきが　発動した" + CR)
                                        cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　の　攻撃　が　ぐーんと上がった！" + CR)
                                        con.p_con += "ランク上昇" + CR
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
        cfn.logWrite(copy, org, org.con.TN + "　の　" + org.con.name + "　の　特性が　" + copy_ability + "に　なった"  + CR)
        cfn.conditionRemove(org.con, "poke", "スロースタート　")
        org.con.ability = copy_ability
        const p_con = org.con.p_con
        org.con.p_con = ""
        for (let i = 0; i < p_con.split("\n").length - 1; i++){
            if (p_con.split("\n")[i].includes("特性なし")){
                org.con.p_con += "特性なし：" + copy_ability + CR
                org.con.ability = ""
            } else if (p_con.split("\n")[i].includes("かがくへんかガス")){
                org.con.p_con += "かがくへんかガス：" + copy_ability + CR
                org.con.ability = ""
            } else {
                org.con.p_con = p_con.split("\n")[i] + CR
            }
        }
        summon.activAbility(org, copy, 1)
    } else if (num == 2){
        cfn.logWrite(copy, org, "お互いの　特性を入れ替えた！" + CR)
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
                copy.con.p_con += "特性なし：" + org_ability + CR
                copy.con.ability = ""
            } else if (copy_p_con.split("\n")[i].includes("かがくへんかガス")){
                copy.con.p_con += "かがくへんかガス：" + org_ability + CR
                copy.con.ability = ""
            } else {
                copy.con.p_con = copy_p_con.split("\n")[i] + CR
            }
        }
        cfn.conditionRemove(copy.con, "poke", "スロースタート　")
        org.con.ability = copy_ability
        const org_p_con = org.con.p_con
        org.con.p_con = ""
        for (let i = 0; i < org_p_con.split("\n").length - 1; i++){
            if (org_p_con.split("\n")[i].includes("特性なし")){
                org.con.p_con += "特性なし：" + copy_ability + CR
                org.con.ability = ""
            } else if (org_p_con.split("\n")[i].includes("かがくへんかガス")){
                org.con.p_con += "かがくへんかガス：" + copy_ability + CR
                org.con.ability = ""
            } else {
                org.con.p_con= org_p_con.split("\n")[i] + CR
            }
        }
        summon.activAbility(org, copy, "both")
    } else if (num == 3){
        cfn.logWrite(copy, org, copy.con.TN + "　の　" + copy.con.name + "の　特性が　" + ability + "に　なった！" + CR)
        cfn.conditionRemove(copy.con, "poke", "スロースタート　")
        copy.con.ability = ability
        const copy_p_con = copy.con.p_con
        copy.con.p_con = ""
        for (let i = 0; i < copy_p_con.split("\n").length - 1; i++){
            if (copy_p_con.split("\n")[i].includes("特性なし")){
                copy.con.p_con += "特性なし：" + ability + CR
                copy.con.ability = ""
            } else if (copy_p_con.split("\n")[i].includes("かがくへんかガス")){
                copy.con.p_con += "かがくへんかガス：" + ability + CR
                copy.con.ability = ""
            } else {
                copy.con.p_con = copy_p_con.split("\n")[i] + CR
            }
        }
        summon.activAbility(org, copy, 2)
    }
}


// フォルムチェンジ
exports.formChenge = function(team, enemy, name){
    let con = team.con
    poke = cfn.pokeSearch(name)
    cfn.logWrite(team, enemy, con.TN + "　の　" + con.name + "　は　" + poke[1] + "　に　なった!" + CR)
    const rate = cfn.natureCheck(con.nature)
    const num = cfn.battleNum(team)

    // 実数値の書き換え
    const parameter = ["A", "B", "C", "D", "S"]
    for (let i = 0; i < 5; i++){
        let BS = Number(poke[k + 3])
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
    con["poke" + num].name = poke[1]

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
    summon.activAbility(team, enemy, 1)
}


