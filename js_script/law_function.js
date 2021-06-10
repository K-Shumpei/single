const moveList = require("./poke_move")
const pokeList = require("./poke_data")
const comTable = require("./compatibility")

exports.setBelch = function(team){
    for (let i = 0; i < 3; i++){
        if (team["poke" + i].life == "戦闘中"){
            team["poke" + i].belch = "ゲップ"
        }
    }
}

exports.setRecycle = function(team){
    for (let i = 0; i < 3; i++){
        if (team["poke" + i].life == "戦闘中"){
            team["poke" + i].recycle = team.con.item
            break
        }
    }
    team.con.item = ""
    if (team.con.ability == "かるわざ"){
        team.con.p_con += "かるわざ" + CR
    }
}

exports.conditionRemove = function(con, text){
    const list = con.split("\n")
    const len = list.length - 1
    con = ""
    for (let i = 0; i < len; i++){
        if (!list[i].includes(text)){
            con += list[i] + CR
        }
    }
}

exports.groundedCheck = function(con){
    if (!(con.type.includes("ひこう") || con.ability == "ふゆう" || con.item == "ふうせん" || con.p_con.includes("でんじふゆう") || con.p_con.includes("テレキネシス"))){
        return true
    } else if (con.p_con.includes("ねをはる") || con.p_con.includes("うちおとす") || con.f_con.includes("じゅうりょく") || con.item == "くろいてっきゅう" || con.p_con.includes("はねやすめ")){
        return true
    } else {
        return false
    }
}

exports.moveSearchByName = function(name){
    const list = moveList.move()
    for (let i = 0; i < list.length; i++){
        if (name == list[i][0]){
            return list[i]
        }
    }
}


exports.compatibilityCheck = function(atk, def, move){
    let type = def.con.type
    let compatibility_rate = 1.0
    const compatibility = comTable.compatibility()

    if ((atk.con.ability == "きもったま" || def.con.p_con.includes("みやぶられている")) && type.includes("ゴースト") && (move[1] == "ノーマル" || move[0] == "かくとう")){
        type = type.replace("ゴースト", "")
    }
    if (def.con.p_con.includes("ミラクルアイ") && type.includes("あく") && move[1] == "エスパー"){
        type = type.replace("あく", "")
    }

    for (let i = 0; i < 18; i++){
        if (move[1] == compatibility[0][i]){
            for (let j = 0; j < 18; j++){
                if (type.includes(compatibility[0][j])){
                    if (def.con.item == "ねらいのまと" && compatibility[i+1][j] == 0){
                        compatibility_rate *= 1
                    } else {
                        compatibility_rate *= compatibility[i+1][j]
                    }
                }
            }
        }
    }

    if (def.con.p_con.includes("タールショット") && move[1] == "ほのお"){
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


// 戦闘中のポケモンの番号の取得
exports.battleNum = function(team){
    for (let i = 0; i < 3; i++){
        if (team["poke" + i].life == "戦闘中"){
            return i
        }
    }
}

exports.pokeSearch = function(name){
    const list = pokeList.poke()
    for (let i = 0; i < list.length; i++){
        if (name == list[i][1]){
            return list[i]
        }
    }
}

exports.natureCheck = function(nature){
    const nature_list = [
        ['てれや', 'さみしがり', 'いじっぱり', 'やんちゃ', 'ゆうかん'], 
        ['ずぶとい', 'がんばりや', 'わんぱく', 'のうてんき', 'のんき'], 
        ['ひかえめ', 'おっとり', 'すなお', 'うっかりや', 'れいせい'], 
        ['おだやか', 'おとなしい', 'しんちょう', 'きまぐれ', 'なまいき'], 
        ['おくびょう', 'せっかち', 'ようき', 'むじゃき', 'まじめ']
    ]
    for (let i = 0; i < 5; i++){
        for (let j = 0; j < 5; j++){
            if (nature == nature_list[i][j]){
                if (i == j){
                    return [1.0, 1.0, 1.0, 1.0, 1.0]
                } else {
                    let rate = [1.0, 1.0, 1.0, 1.0, 1.0]
                    rate[i] = 1.1
                    rate[j] = 0.9
                    return rate
                }
            }
        }
    }
}
