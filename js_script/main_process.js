// jsファイルの読み込み
const summon = require("./1_summon")

// 初めのポケモンを場に出す
// 適当なポケモンであれば、メガ進化ボタンとZワザボタンを有効にする
// 場に出た時の特性などの効果発動
exports.battle_start = function(rec){
    CR = String.fromCharCode(13)

    rec.log = "---------- バトル開始 ----------" + CR

    summon.pokeReplace(rec.user1, rec.log)
    summon.pokeReplace(rec.user2, rec.log)

    summon.activAbility(rec.user1, rec.user2, "both", rec.log)

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
exports.run_battle = function(){
    return 0
    // 素早さ判定
    let order = speed_check()

    // わるあがきをするかどうか
    let st_judge = struggle_check(order)
    if (st_judge == true){
        return
    }

    for (const team of order){
        if (Number(document.getElementById("battle")[team + "_move"].value) > 3){
            document.getElementById(team + "_mega").checked = false
            document.getElementById(team + "_mega").disabled = true
        }
    }

    // 選択ボタンの有効化
    button_validation()
    

    // 決定ボタンの無効化
    document.battle.battle_button.disabled = true

    // 改行のコード
    CR = String.fromCharCode(13)

    // ターン開始宣言
    turn_start()

    // トレーナーの行動、ポケモンの行動順に関する行動
    // 1.クイックドロウ/せんせいのツメ/イバンのみの発動
    for (let i = 0; i < 2; i++){
        if (Number(document.getElementById("battle")[order[i] + "_move"].value) < 4 && st_judge[1][i] > 0){
            if (new get(order[i]).ability == "クイックドロウ" && Math.random() < 0.3 && move_search(order[i])[2] != "変化"){
                txt = order[i] + "チームの　" + new get(order[i]).name + "は　クイックドロウで　行動が　早くなった！" + CR
                document.battle_log.battle_log.value += txt
                document.battle[order[i] + "_poke_condition"].value += "優先" + CR
            } else if (new get(order[i]).item == "せんせいのツメ" && Math.random() < 0.2){
                txt = order[i] + "チームの　" + new get(order[i]).name + "は　せんせいのツメで　行動が　早くなった！" + CR
                document.battle_log.battle_log.value += txt
                document.battle[order[i]+ "_poke_condition"].value += "優先" + CR
            } else if (new get(order[i]).item == "イバンのみ" && (new get(order[i]).last_HP <= new get(order[i]).full_HP / 4 || (new get(order[i]).last_HP <= new get(order[i]).full_HP / 2 && new get(order[i]).ability == "くいしんぼう"))){
                set_recycle_item(order[i])
                set_belch(order[i])
                txt = order[i] + "チームの　" + new get(order[i]).name + "は　イバンのみで　行動が　早くなった！" + CR
                document.battle_log.battle_log.value += txt
                document.battle[order[i] + "_poke_condition"].value += "優先" + CR
            }
        }
    }
    
    // 2.交換・よびかける
    for (let i = 0; i < 2; i++){
        if (st_judge[1][i] > 0){
            let num = Number(document.getElementById("battle")[order[i] + "_move"].value)
            if (num >= 4){
                txt = "(" + order[i] + "行動)" + CR
                document.battle_log.battle_log.value += txt
                txt = order[i]+ "チームは　" + new get(order[i]).name + "を　引っ込めた！" + CR
                document.battle_log.battle_log.value += txt
                come_back_pokemon(order[i])
                pokemon_replace(order[i])
                summon_pokemon(1, order[i])
            }
        }
    }
        // 交換順は、交代前のポケモンのすばやさ順。出てきたポケモンが(1)における行動を全て終えてから次のポケモンが交換される。
        // 交換に対しておいうちが発動する場合、発動する。
            // おいうち使用者がメガシンカする場合、3-6での行動を前倒しにしてからおいうちを行う。
            // おいうち使用者と3-7の行動を取るポケモンがいた場合、3-7での行動を前倒しにしてからおいうちを行われる。
    // 3.ローテーションバトルにおけるローテーションする。
        // きんちょうかんのみローテションした際に表示される。
    // 4.メガシンカ/ウルトラバースト
    for (const team of order){
        if (document.getElementById(team + "_mega").checked){
            txt = team + "チームの　" + new get(team).name + "　は　メガ進化した！" + CR
            document.battle_log.battle_log.value += txt
            for (let i = 0; i < mega_stone_item_list.length; i++){
                if (new get(team).item == mega_stone_item_list[i][0]){
                    form_chenge(team, mega_stone_item_list[i][2])
                }
            }
            // メガ進化ボタンの無効化
            document.getElementById(team + "_mega").checked = false
            document.getElementById(team + "_mega").disabled = true
            document.getElementById(team + "_mega_text").textContent = "メガ進化：済"
        }
    }
        // 複数のポケモンが同時にメガシンカ/ウルトラバーストする場合、発動前のすばやさ順に発動される。
    // 5.ダイマックス
        // 複数のポケモンが同時にダイマックスする場合、すばやさ順に発動する。
    // 6.きあいパンチ/トラップシェル/くちばしキャノンの準備行動
    for (let i = 0; i < 2; i++){
        let num = Number(document.getElementById("battle")[order[i] + "_move"].value)
        if (num == ""){
            num = 4
        }
        if (st_judge[1][i] > 0 && num < 4){
            let move = move_search(order[i])
            if (move[0] == "きあいパンチ"){
                document.battle[order[i] + "_poke_condition"].value += "きあいパンチ" + CR
                txt = order[i] + "チームの　" + new get(order[i]).name + "は　集中している" + CR
                document.battle_log.battle_log.value += txt
            } else if (move[0] == "トラップシェル"){
                txt = order[i]+ "チームの　" + new get(order[i]).name + "は　トラップシェルを仕掛けた！" + CR
                document.battle_log.battle_log.value += txt
                document.battle[order[i] + "_poke_condition"].value += "トラップシェル：不発" + CR
            } else if (move[0] == "くちばしキャノン"){
                document.battle[order[i] + "_poke_condition"].value += "くちばしキャノン" + CR
                txt = order[i] + "チームの　" + new get(order[i]).name + "は　くちばしを加熱し始めた！" + CR
                document.battle_log.battle_log.value += txt
            }
        }
    }
        // 複数のポケモンが同時にこれらの技を使用した場合、すばやさ順に行われる。
        
    // すばやさ順に行われる処理はトリックルームの影響を受ける。

    // ポケモンの技
    const current = document.battle_log.battle_log.value
    const turn_number = (current.match( /ターン目/g ) || []).length
    const turn = "---------- " + turn_number + "ターン目 ----------"
    const log_list = document.battle_log.battle_log.value.split("\n")
    let A_check = "未行動"
    let B_check = "未行動"
    if (log_list.slice(log_list.lastIndexOf(turn)).includes("(A行動)")){
        A_check = "行動済"
    }
    if (log_list.slice(log_list.lastIndexOf(turn)).includes("(B行動)")){
        B_check = "行動済"
    }

    // 両方が交代する時
    if (A_check == "行動済" && B_check == "行動済"){
        end_process()
        return
    }
    
    // 片方が交代、片方が攻撃する時
    if ((A_check == "行動済" && B_check == "未行動") || (A_check == "未行動" && B_check == "行動済")){
        let atk = ""
        let def = ""
        if (A_check == "行動済" && B_check == "未行動"){
            atk = "B"
            def = "A"
        } else if (A_check == "未行動" && B_check == "行動済"){
            atk = "A"
            def = "B"
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
        order = action_order()
        const reverse = [order[1], order[0]]
        for (const team of [order, reverse]){
            let atk = team[0]
            let def = team[1]
            // 行動するポケモンのHPが残っている時に行動する
            if (new get(atk).last_HP > 0){
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

// わるあがきをするかどうか
function struggle_check(order){
    let sign = 0
    let struggle = "A-B" // わるあがきをするチーム
    let choice = []
    for (const team of order){
        let move_sign = []
        let poke_sign = []
        for (let i = 0; i < 4; i++){
            if (document.getElementById(team + "_radio_" + i).disabled == false){
                move_sign.push(i)
            }
        }
        for (let i = 0; i < 3; i++){
            if (document.getElementById(team + "_" + i + "_button").disabled == false){
                poke_sign.push(i)
            }
        }
        choice.push(move_sign.length + poke_sign.length)
        if (move_sign.length == 0){
            struggle.replace(team, "0")
        } else if (move_sign.length + poke_sign.length > 0 && document.getElementById("battle")[team + "_move"].value == "" && !new get(team).p_con.includes("溜め技")){
            alert(team + "チームは　行動を選択してください")
            sign += 1
        }
    }
    if (sign > 0){
        return true
    } else {
        return [struggle, choice]
    }
}


// 選択ボタンの有効化
function button_validation(){
    for (const team of ["A", "B"]){
        // 技選択を全て有効化
        for (let i = 0; i < 4; i++){
            if (document.getElementById(team + "_move_" + i).textContent != ""){
                document.getElementById(team + "_radio_" + i).disabled = false
            }
        }
        // 交換ボタンの有効化
        for (let i = 0; i < 3; i++){
            if (document.getElementById(team + "_" + i + "_existence").textContent == "控え"){
                document.getElementById(team + "_" + i + "_button").disabled = false
            }
        }

        // ゲップ：備考欄に「ゲップ」の文字がなければ使用不能に
        for (let i = 0; i < 4; i++){
            if (document.getElementById(team + "_move_" + i).textContent == "ゲップ"){
                for (let j = 0; j < 3; j++){
                    if (document.getElementById(team + "_" + j + "_existence").textContent == "戦闘中" && !document.getElementById(team + "_" + j + "_belch").textContent == "ゲップ"){
                        document.getElementById(team + "_radio_" + i).disabled = true
                    }
                }
            }
        }
        // ほおばる：きのみを持っていない場合、使用不能に
        for (let i = 0; i < 4; i++){
            if (document.getElementById(team + "_move_" + i).textContent == "ほおばる"){
                if (!berry_item_list.includes(new get(team).item)){
                    document.getElementById(team + "_radio_" + i).disabled = true
                }
            }
        }
        // いちゃもん：いちゃもんで使用不能だった技を使用可能に
        if (new get(team).p_con.includes("いちゃもん")){
            for (let i = 0; i < 4; i++){
                if (document.getElementById(team + "_move_" + i).textContent == document.battle[team + "_used_move"].value){
                    document.getElementById(team + "_radio_" + i).disabled = false
                }
            }
        }
    }
}







