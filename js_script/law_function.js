const moveList = require("./poke_move")
const pokeList = require("./poke_data")
const comTable = require("./compatibility")
const moveEff = require("./move_effect")

exports.setBelch = function(user){
    for (let i = 0; i < 3; i++){
        if (user["poke" + i].life == "戦闘中"){
            user["poke" + i].belch = "ゲップ"
        }
    }
}

exports.setRecycle = function(user){
    for (let i = 0; i < 3; i++){
        if (user["poke" + i].life == "戦闘中"){
            user["poke" + i].recycle = team.con.item
            break
        }
    }
    user.con.item = ""
    if (user.con.ability == "かるわざ"){
        user.con.p_con += "かるわざ" + CR
    }
}

exports.conditionRemove = function(con, place, text){
    if (place == "poke"){
        const list = con.p_con.split("\n")
        const len = list.length - 1
        con.p_con = ""
        for (let i = 0; i < len; i++){
            if (!list[i].includes(text)){
                con.p_con += list[i] + CR
            }
        }
    } else if (place == "field"){
        const list = con.f_con.split("\n")
        const len = list.length - 1
        con.f_con = ""
        for (let i = 0; i < len; i++){
            if (!list[i].includes(text)){
                con.f_con += list[i] + CR
            }
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

exports.moveSearch = function(user){
    const list = moveList.move()
    for (let i = 0; i < list.length; i++){
        if (user.con["move_" + user.data.command] == list[i][0]){
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
exports.battleNum = function(user){
    for (let i = 0; i < 3; i++){
        if (user["poke" + i].life == "戦闘中"){
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

exports.fiveCut = function(number){
    if ((number % 1) > 0.5){
        return Math.floor(number) + 1
    } else {
        return Math.floor(number)
    }
}

exports.logWrite = function(user1, user2, txt){
    user1.con.log += txt
    user2.con.log += txt
}

exports.isWeather = function(con1, con2){
    if (con1.ability == "ノーてんき" || con1.ability == "エアロック" || con2.ability == "ノーてんき" || con2.ability == "エアロック"){
        return false
    } else {
        return true
    }
}