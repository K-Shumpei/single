// jsファイルの読み込み
const summon = require("./1_summon")
const actOrder = require("./2_decide_order")
const success = require("./3_move_success")
const afn = require("./function")
const bfn = require("./base_function")
const cfn = require("./law_function")
const item = require("./item_effect")

// 初めのポケモンを場に出す
// 適当なポケモンであれば、メガ進化ボタンとZワザボタンを有効にする
// 場に出た時の特性などの効果発動
exports.battle_start = function(rec){
    CR = String.fromCharCode(13)

    cfn.logWrite(rec.user1, rec.user2,  "---------- バトル開始 ----------" + CR)

    summon.pokeReplace(rec.user1, rec.user2)
    summon.pokeReplace(rec.user2, rec.user1)

    summon.activAbility(rec.user1, rec.user2, "both")

    console.log(rec)

    return rec

    // 特性による交換ボタンの無効化
    for (const team of [["1", "2"], ["2", "1"]]){
        if ((rec["user" + team[1]].con.ability == "ありじごく" && grounded_check(team[0])) 
        || (rec["user" + team[1]].con.ability == "かげふみ" && rec["user" + team[0]].con.ability != "かげふみ") 
        || (rec["user" + team[1]].con.ability == "じりょく" && rec["user" + team[0]].con.type.includes("はがね"))){
            if (rec["user" + team[0]].con.item != "きれいなぬけがら" && !rec["user" + team[0]].con.type.includes("ゴースト")){
                for (let i = 4; i < 7; i++){
                    rec["user" + team[0]].data["radio_" + i] = true
                }
            }
        }
    }

}

// ターンの処理
exports.runBattle = function(rec){

    // 素早さ判定
    let order = afn.speedCheck(rec.user1.con, rec.user2.con)
    if (order = [1, 2]){
        order = [rec.user1, rec.user2]
    } else if (order = [2, 1]){
        order = [rec.user2, rec.user1]
    }

    // わるあがきをするかどうか
    if (user1.data.radio_0 && user1.data.radio_1 && user1.data.radio_2 && user1.data.radio_3 && !user1.con.f_con.includes("溜め技") && user1.data.command == ""){
        user1.con.command = "struggle"
    }
    if (user2.data.radio_0 && user2.data.radio_1 && user2.data.radio_2 && user2.data.radio_3 && !user2.con.f_con.includes("溜め技") && user2.data.command == ""){
        user2.con.command = "struggle"
    }

    // 選択ボタンの有効化
    buttonValidation(order)

    // 改行のコード
    CR = String.fromCharCode(13)

    // ターン開始宣言
    const num = (rec.user1.con.log.match( /ターン目/g ) || []).length + 1
    cfn.logWrite(rec.user1, rec.user2, "---------- " + num + "ターン目 ----------" + CR)

    // トレーナーの行動、ポケモンの行動順に関する行動
    // 1.クイックドロウ/せんせいのツメ/イバンのみの発動
    for (const team of order){
        if (team.data.command < 4){
            if (team.con.ability == "クイックドロウ" && Math.random() < 0.3 && cfn.moveSearch(team)[2] != "変化"){
                cfn.logWrite(rec.user1, rec.user2, team.con.TN + "　の　" + team.con.name + "は　クイックドロウで　行動が　早くなった！" + CR)
                team.con.p_con += "優先" + CR
            } else if (team.con.item == "せんせいのツメ" && Math.random() < 0.2){
                cfn.logWrite(rec.user1, rec.user2, team.con.TN + "　の　" + team.con.name + "は　せんせいのツメで　行動が　早くなった！" + CR)
                team.con.p_con += "優先" + CR
            } else if (team.con.item == "イバンのみ" && (team.con.last_HP <= team.confull_HP / 4 || (team.con.last_HP <= team.con.full_HP / 2 && team.con.ability == "くいしんぼう"))){
                cfn.setRecycle(team)
                cfn.setBelch(team)
                cfn.logWrite(rec.user1, rec.user2, team.con.TN + "　の　" + team.con.name + "は　イバンのみで　行動が　早くなった！" + CR)
                team.con.p_con += "優先" + CR
            }
        }
    }
    
    // 2.交換・よびかける
    for (const user of order){
        if (user.data.command >= 4){
            let enemy = rec.user1
            if (user == rec.user1){
                enemy = rec.user2
            }
            cfn.logWrite(rec.user1, rec.user2, "(" + user.con.TN + "の行動)" + CR)
            cfn.logWrite(rec.user1, rec.user2, user.con.TN + "　は　" + user.con.name + "を　引っ込めた！" + CR)
            summon.comeBack(user, enemy)
            summon.pokeReplace(user, enemy)
            summon.activAbility(user, enemy, 1)
        }
    }
        // 交換順は、交代前のポケモンのすばやさ順。出てきたポケモンが(1)における行動を全て終えてから次のポケモンが交換される。
        // 交換に対しておいうちが発動する場合、発動する。
            // おいうち使用者がメガシンカする場合、3-6での行動を前倒しにしてからおいうちを行う。
            // おいうち使用者と3-7の行動を取るポケモンがいた場合、3-7での行動を前倒しにしてからおいうちを行われる。
    // 3.ローテーションバトルにおけるローテーションする。
        // きんちょうかんのみローテションした際に表示される。
    // 4.メガシンカ/ウルトラバースト

        // 複数のポケモンが同時にメガシンカ/ウルトラバーストする場合、発動前のすばやさ順に発動される。
    // 5.ダイマックス
        // 複数のポケモンが同時にダイマックスする場合、すばやさ順に発動する。
    // 6.きあいパンチ/トラップシェル/くちばしキャノンの準備行動
    for (const user of order){
        let enemy = rec.user1
        if (user == rec.user1){
            enemy = rec.user2
        }
        if (user.data.command < 4){
            let move = cfn.moveSearch(user)
            if (move[0] == "きあいパンチ"){
                user.con.p_con += "きあいパンチ" + CR
                cfn.logWrite(user, enemy, user.con.TN + "　の　" + user.con.name + "は　集中している" + CR)
            } else if (move[0] == "トラップシェル"){
                cfn.logWrite(user, enemy, user.con.TN + "　の　" + user.con.name + "は トラップシェルを仕掛けた！" + CR)
                user.con.p_con += "トラップシェル：不発" + CR
            } else if (move[0] == "くちばしキャノン"){
                user.con.p_con += "くちばしキャノン" + CR
                cfn.logWrite(user, enemy, user.con.TN + "　の　" + user.con.name + "は くちばしを加熱し始めた！" + CR)
            }
        }
    }
        // 複数のポケモンが同時にこれらの技を使用した場合、すばやさ順に行われる。
        
    // すばやさ順に行われる処理はトリックルームの影響を受ける。

    // ポケモンの技
    const turn_number = (rec.user1.con.log.match( /ターン目/g ) || []).length
    const turn = "---------- " + turn_number + "ターン目 ----------"
    const log_list = rec.user1.con.log.split("\n")
    let A_check = "未行動"
    let B_check = "未行動"
    if (log_list.slice(log_list.lastIndexOf(turn)).includes("(" + rec.user1.con.TN + "の行動)")){
        A_check = "行動済"
    }
    if (log_list.slice(log_list.lastIndexOf(turn)).includes("(" + rec.user2.con.TN + "の行動)")){
        B_check = "行動済"
    }

    // 両方が交代する時
    if (A_check == "行動済" && B_check == "行動済"){
        end_process()
        return
    }
    
    // 片方が交代、片方が攻撃する時
    if ((A_check == "行動済" && B_check == "未行動") || (A_check == "未行動" && B_check == "行動済")){
        let atk = rec.user1
        let def = rec.user2
        if (A_check == "行動済" && B_check == "未行動"){
            atk = rec.user2
            def = rec.user1
        }
        let move = move_success_judge(atk, def, order)
        if (move == false){
            process_at_failure(atk)
        } else {
            if (move[9] == "反射"){
                let save = atk
                atk = def
                def = save
            }
            const stop_check = move_process(atk, def, move, order)
            if (stop_check == "stop"){
                return
            }
        }
        end_process()
        return
    }

    // 両方が攻撃する時
    if (A_check == "未行動" && B_check == "未行動"){
        order = actOrder.actionOrder(rec.user1, rec.user2)
        let reverse = [rec.user2, rec.user1]
        if (order[0] == 1){
            order = [rec.user1, rec.user2]
        } else if (order[0] == 1){
            order = [rec.user2, rec.user1]
            reverse = [rec.user1, rec.user2]
        }
        for (const team of [order, reverse]){
            let atk = team[0]
            let def = team[1]
            // 行動するポケモンのHPが残っている時に行動する
            if (!atk.con.f_con.includes("ひんし")){
                let move = success.moveSuccessJudge(atk, def, order)
                if (move == false){
                    process_at_failure(atk)
                } else {
                    if (move[9] == "反射"){
                        let save = atk
                        atk = def
                        def = save
                    }
                    const stop_check = move_process(atk, def, move, order)
                    if (stop_check == "stop"){
                        return
                    }
                }
            }
        }
        end_process()
        return
    }
}


function move_search(team){
    const num = String(document.getElementById("battle")[team + "_move"].value)
    const move = document.getElementById(team + "_move_" + num).textContent
    for (let i = 0; i < move_list.length; i++){
        if (move == move_list[i][0]){
            return move_list[i]
        }
    }
}



function process_at_failure(team){
    condition_remove(team, "poke", "アイスボール")
    condition_remove(team, "poke", "ころがる")
    condition_remove(team, "poke", "さわぐ")
    condition_remove(team, "poke", "れんぞくぎり")
    condition_remove(team, "poke", "がまん")
}


// 選択ボタンの有効化
function buttonValidation(order){
    for (const team of order){
        // 技選択を全て有効化
        for (let i = 0; i < 4; i++){
            if (team.con["move_" + i] != ""){
                team.data["radio_" + i] = false
            }
        }
        // 交換ボタンの有効化
        for (let i = 0; i < 3; i++){
            if (team["poke" + i].life == "控え"){
                team.data["radio_" + Number(i + 4)] = false
            }
        }

        // ゲップ：備考欄に「ゲップ」の文字がなければ使用不能に
        for (let i = 0; i < 4; i++){
            if (team.con["move_" + i] == "ゲップ" && team["poke" + cfn.battleNum(team)].belch != "ゲップ"){
                team.data["radio_" + i] = true
            }
        }
        // ほおばる：きのみを持っていない場合、使用不能に
        for (let i = 0; i < 4; i++){
            if (team.con["move_" + i] == "ほおばる" && !item.berryList.includes(team.con.item)){
                team.data["radio_" + i] = true
            }
        }
        // いちゃもん：いちゃもんで使用不能だった技を使用可能に
        if (team.con.p_con.includes("いちゃもん")){
            for (let i = 0; i < 4; i++){
                if (team.con["move_" + i] == team.con.used){
                    team.data["radio_" + i] = true
                }
            }
        }
    }
}








