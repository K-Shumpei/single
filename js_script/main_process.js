// jsファイルの読み込み
const summon = require("./1_summon")
const actOrder = require("./2_decide_order")
const success = require("./3_move_success")
const process = require("./4_move_effect")
const end = require("./5_end_process")
const afn = require("./function")
const bfn = require("./base_function")
const cfn = require("./law_function")
const efn = require("./ex_function")
const itemEff = require("./item_effect")
const { enemyField } = require("./move_effect")

// 初めのポケモンを場に出す
// 適当なポケモンであれば、メガ進化ボタンとZワザボタンを有効にする
// 場に出た時の特性などの効果発動
exports.battleStart = function(rec){

    cfn.logWrite(rec.user1, rec.user2,  "---------- バトル開始 ----------" + "\n")

    summon.pokeReplace(rec.user1, rec.user2)
    summon.pokeReplace(rec.user2, rec.user1)

    summon.onField(rec.user1, rec.user2, "both")

    // 素早さ判定
    let order = afn.speedCheck(rec.user1, rec.user2)
    if (order[0] > order[1] || (order[0] == order[1] && Math.random() < 0.5)){
        order = [rec.user1, rec.user2]
    } else {
        order = [rec.user2, rec.user1]
    }
    if (rec.user1.con.f_con.includes("トリックルーム")){
        order = [order[1], order[0]]
    }
    const reverse = [order[1], order[0]]

    // ボタンの無効化
    afn.cannotChooseAction(order, reverse)
}

// ターンの処理
exports.runBattle = function(rec){
    // 素早さ判定
    let order = afn.speedCheck(rec.user1, rec.user2)
    if (order[0] > order[1] || (order[0] == order[1] && Math.random() < 0.5)){
        order = [rec.user1, rec.user2]
    } else {
        order = [rec.user2, rec.user1]
    }
    if (rec.user1.con.f_con.includes("トリックルーム")){
        order = [order[1], order[0]]
    }
    let reverse = [order[1], order[0]]

    // わるあがきをするかどうか
    if (rec.user1.data.radio_0 && rec.user1.data.radio_1 && rec.user1.data.radio_2 && rec.user1.data.radio_3 && !rec.user1.con.f_con.includes("溜め技") && rec.user1.data.command == ""){
        rec.user1.con.command = "struggle"
    }
    if (rec.user2.data.radio_0 && rec.user2.data.radio_1 && rec.user2.data.radio_2 && rec.user2.data.radio_3 && !rec.user2.con.f_con.includes("溜め技") && rec.user2.data.command == ""){
        rec.user2.con.command = "struggle"
    }

    // 選択ボタンの有効化
    bfn.buttonValidation(order[0])
    bfn.buttonValidation(order[1])

    // ターン開始宣言
    const num = (rec.user1.con.log.match( /ターン目/g ) || []).length + 1
    cfn.logWrite(rec.user1, rec.user2, "---------- " + num + "ターン目 ----------" + "\n")

    // トレーナーの行動、ポケモンの行動順に関する行動
    // 1.クイックドロウ/せんせいのツメ/イバンのみの発動
    for (const team of order){
        if (team.data.command < 4){
            if (team.con.ability == "クイックドロウ" && Math.random() < 0.3 && bfn.moveSearch(team)[2] != "変化"){
                cfn.logWrite(rec.user1, rec.user2, team.con.TN + "　の　" + team.con.name + "は　クイックドロウで　行動が　早くなった！" + "\n")
                team.con.p_con += "優先" + "\n"
            } else if (team.con.item == "せんせいのツメ" && Math.random() < 0.2){
                cfn.logWrite(rec.user1, rec.user2, team.con.TN + "　の　" + team.con.name + "は　せんせいのツメで　行動が　早くなった！" + "\n")
                team.con.p_con += "優先" + "\n"
            } else if (team.con.item == "イバンのみ" && (team.con.last_HP <= team.confull_HP / 4 || (team.con.last_HP <= team.con.full_HP / 2 && team.con.ability == "くいしんぼう"))){
                cfn.setRecycle(team)
                cfn.setBelch(team)
                cfn.logWrite(rec.user1, rec.user2, team.con.TN + "　の　" + team.con.name + "は　イバンのみで　行動が　早くなった！" + "\n")
                team.con.p_con += "優先" + "\n"
            }
        }
    }
    
    // 2.交換・よびかける
    for (const user of [order, reverse]){
        if (user[0].data.command >= 4){
            cfn.logWrite(user[0], user[1], "(" + user[0].con.TN + "の行動)" + "\n")
            cfn.logWrite(user[0], user[1], user[0].con.TN + "　は　" + user[0].con.name + "を　引っ込めた！" + "\n")
            summon.comeBack(user[0], user[1])
            summon.pokeReplace(user[0], user[1])
            summon.onField(user[0], user[1], 1)
            user[0].data.command = ""
        }
    }
        // 交換順は、交代前のポケモンのすばやさ順。出てきたポケモンが(1)における行動を全て終えてから次のポケモンが交換される。
        // 交換に対しておいうちが発動する場合、発動する。
            // おいうち使用者がメガシンカする場合、3-6での行動を前倒しにしてからおいうちを行う。
            // おいうち使用者と3-7の行動を取るポケモンがいた場合、3-7での行動を前倒しにしてからおいうちを行われる。
    // 3.ローテーションバトルにおけるローテーションする。
        // きんちょうかんのみローテションした際に表示される。
    // 4.メガシンカ/ウルトラバースト　すばやさ順に発動
    for (const user of [order, reverse]){
        const list = itemEff.megaStone()
        for (let i = 0; i < list.length; i++){
            if (user[0].con.name == list[i][1] && user[0].data.mega){
                afn.formChenge(user[0], user[1], list[i][2])
                user[0].data.megable = true
                user[0].data.megaTxt = "メガ進化（済）"
            }
        }
        if (user[0].data.mega && user[0].con.name == "レックウザ"){
            afn.formChenge(user[0], user[1], "メガレックウザ")
            user[0].data.megable = true
            user[0].data.megaTxt = "メガ進化（済）"
        }
    }
    // 5.ダイマックス　すばやさ順に発動
    for (const user of [order, reverse]){
        if (user[0].data.dyna){
            cfn.logWrite(user[0], user[1], user[0].con.TN + "　の　" + user[0].con.name + "　は　ダイマックスした！" + "\n")
            user[0].data.dynaTxt = "ダイマックス：3/3"
        } else if (user[0].data.giga){
            cfn.logWrite(user[0], user[1], user[0].con.TN + "　の　" + user[0].con.name + "　は　キョダイマックスした！" + "\n")
            user[0].data.gigaTxt = "キョダイマックス：3/3"
        }
        if (user[0].data.dyna || user[0].data.giga){
            user[0].data.dynable = true
            user[0].data.gigable = true
            user[0].con.full_HP *= 2
            user[0].con.last_HP *= 2
            user[0]["poke" + cfn.battleNum(user[0])].last_HP *= 2
            cfn.conditionRemove(user[0].con, "poke", "いちゃもん")
            cfn.conditionRemove(user[0].con, "poke", "みがわり")
            cfn.conditionRemove(user[0].con, "poke", "ちいさくなる")
        }
    }

    // メガ進化、ダイマックスを終えた後、もう一度素早さチェックを行う
    order = afn.speedCheck(rec.user1, rec.user2)
    if (order[0] > order[1] || (order[0] == order[1] && Math.random() < 0.5)){
        order = [rec.user1, rec.user2]
    } else {
        order = [rec.user2, rec.user1]
    }
    if (rec.user1.con.f_con.includes("トリックルーム")){
        order = [order[1], order[0]]
    }
    reverse = [order[1], order[0]]

    // 6.きあいパンチ/トラップシェル/くちばしキャノンの準備行動
    for (const user of order){
        let enemy = rec.user1
        if (user == rec.user1){
            enemy = rec.user2
        }
        if (user.data.command < 4 && user.data.command != undefined && user.data.command != ""){
            let move = bfn.moveSearch(user)
            if (move[0] == "きあいパンチ"){
                user.con.p_con += "きあいパンチ" + "\n"
                cfn.logWrite(user, enemy, user.con.TN + "　の　" + user.con.name + "は　集中している" + "\n")
            } else if (move[0] == "トラップシェル"){
                cfn.logWrite(user, enemy, user.con.TN + "　の　" + user.con.name + "は トラップシェルを仕掛けた！" + "\n")
                user.con.p_con += "トラップシェル：不発" + "\n"
            } else if (move[0] == "くちばしキャノン"){
                user.con.p_con += "くちばしキャノン" + "\n"
                cfn.logWrite(user, enemy, user.con.TN + "　の　" + user.con.name + "は くちばしを加熱し始めた！" + "\n")
            }
        }
    }
        // 複数のポケモンが同時にこれらの技を使用した場合、すばやさ順に行われる。
        
    // すばやさ順に行われる処理はトリックルームの影響を受ける。

    // 両方が交代する時
    if (rec.user1.data.command == "" && rec.user2.data.command == ""){
        end.endProcess(rec.user1, rec.user2)
        return
    }
    
    // 片方が交代、片方が攻撃する時
    if ((rec.user1.data.command == "" && rec.user2.data.command != "") || (rec.user1.data.command != "" && rec.user2.data.command == "")){
        let atk = rec.user1
        let def = rec.user2
        if (rec.user1.data.command == "" && rec.user2.data.command != ""){
            atk = rec.user2
            def = rec.user1
        }
        let move = success.moveSuccessJudge(atk, def, order)
        let team = atk
        if (move == false){
            bfn.processAtFailure(atk)
        } else {
            if (move[9] == "反射"){
                let save = atk
                atk = def
                def = save
            }
            if (process.moveProcess(atk, def, move, order) == "stop"){
                team.data.command = ""
                return
            }
        }
        end.endProcess(rec.user1, rec.user2)
        atk.data.command = ""
        return
    }

    // 両方が攻撃する時
    if (rec.user1.data.command != "" && rec.user2.data.command != ""){
        let num = actOrder.actionOrder(rec.user1, rec.user2)
        let order = [rec["user" + num[0]], rec["user" + num[1]]]
        let reverse = [rec["user" + num[1]], rec["user" + num[0]]]
        for (const team of [order, reverse]){
            let atk = team[0]
            let def = team[1]
            // 行動するポケモンのHPが残っている時に行動する
            if (!atk.con.f_con.includes("ひんし")){
                let move = success.moveSuccessJudge(atk, def, order)
                if (move == false){
                    bfn.processAtFailure(atk)
                } else {
                    if (move[9] == "反射"){
                        let save = atk
                        atk = def
                        def = save
                    }
                    if (process.moveProcess(atk, def, move, order) == "stop"){
                        team[0].data.command = ""
                        return
                    }
                }
            }
            team[0].data.command = ""
        }
        end.endProcess(rec.user1, rec.user2)
    }
}










