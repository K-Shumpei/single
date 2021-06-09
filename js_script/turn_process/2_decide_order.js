function action_order(){
    // 1.わざの効果
        // おさきにどうぞ・りんしょう・コンビネーションわざ・トラップシェル - 行動順を引き上げる
        // さきおくり - 行動順を最後にする
    // 2.優先度
    const priority = priority_check()
    if (priority[0] != priority[1]){
        return trick_room(priority)
    } else {
        // 3.せんせいのツメ・イバンのみ・クイックドロウ - 同じ優先度内で最初に行動する
        const fast_item = fast_item_check()
        if (fast_item[0] != fast_item[1]){
            return trick_room(fast_item)
        } else {
            // 4.こうこうのしっぽ・まんぷくおこう・あとだし - 同じ優先度内で最後に行動する
            const late_item = late_item_check()
            if (late_item[0] != late_item[1]){
                return trick_room(late_item)
            } else {
                // 5.すばやさ
                return speed_check()
            }
        }
    }
    // すばやさ順に行われる処理はトリックルームの影響を受けて変化する。
}

// 2.優先度
function priority_check(){
    let priority = []
    for (const team of ["A", "B"]){
        let move = ""
        if (new get(team).p_con.includes("反動で動けない")){
            for (let i = 0; i < new get(team).p_len; i++){
                if (new get(team).p_list[i].includes("反動で動けない")){
                    move = move_search_by_name(new get(team).p_list[i].slice(8))
                }
            }
        } else if (new get(team).p_con.includes("溜め技")){
            for (let i = 0; i < new get(team).p_len; i++){
                if (new get(team).p_list[i].includes("溜め技")){
                    move = move_search_by_name(new get(team).p_list[i].slice(4))
                }
            }
        } else if (new get(team).p_con.includes("あばれる")){
            for (let i = 0; i < new get(team).p_len; i++){
                if (new get(team).p_list[i].includes("あばれる")){
                    move = move_search_by_name(new get(team).p_list[i].slice(5, -7))
                }
            }
        } else if (new get(team).p_con.includes("アイスボール")){
            move = move_search_by_name("アイスボール")
        } else if (new get(team).p_con.includes("ころがる")){
            move = move_search_by_name("ころがる")
        } else if (new get(team).p_con.includes("がまん")){
            move = move_search_by_name("がまん")
        } else {
            const num = String(document.getElementById("battle")[team + "_move"].value)
            const move_name = document.getElementById(team + "_move_" + num).textContent
            if (move_name.includes("Z")){
                move = move_search_by_name(move_name.replace("Z", ""))
            } else {
                move = move_search_by_name(move_name)
            }
        }

        priority.push(priority_degree(team, move))
        
    }
    if (priority[0] > priority[1]){
        return ["A", "B"]
    } else if (priority[0] < priority[1]){
        return ["B", "A"]
    } else {
        return [0, 0]
    }
}

// 3.せんせいのツメ・イバンのみ・クイックドロウ - 同じ優先度内で最初に行動する
function fast_item_check(){
    let fast_item = []
    for (const team of ["A", "B"]){
        if (new get(team).p_con.includes("優先")){
            fast_item.push(1)
            condition_remove(team, "poke", "優先")
        } else {
            fast_item.push(0)
        }
    }
    if (fast_item[0] > fast_item[1]){
        return ["A", "B"]
    } else if (fast_item[0] < fast_item[1]){
        return ["B", "A"]
    } else {
        return [0, 0]
    }
}

// 4.こうこうのしっぽ・まんぷくおこう・あとだし - 同じ優先度内で最後に行動する
function late_item_check(){
    let late_item = []
    for (const team of ["A", "B"]){
        if (new get(team).item == "こうこうのしっぽ" || new get(team).item == "まんぷくおこう" || new get(team).ability == "あとだし"){
            late_item.push(-1)
        } else {
            late_item.push(0)
        }
    }
    if (late_item[0] > late_item[1]){
        return ["A", "B"]
    } else if (late_item[0] < late_item[1]){
        return ["B", "A"]
    } else {
        return [0, 0]
    }
}



// 素早さ比較
function speed_check(){
    // 素早さ = 実数値 * ランク補正 * 素早さ補正 * まひ補正
    let data = []
    for (const team of ["A", "B"]){
        let S_AV = Number(document.getElementById(team + "_S_AV").textContent)

        // ランク補正
        if (new get(team).S_rank > 0){
            S_AV = Math.round((S_AV * (2 + new get(team).S_rank)) / 2)
        } else {
            S_AV = Math.round((S_AV * 2) / (2 - new get(team).S_rank))
        }

        // 素早さ補正初期値
        let correction = 4096

        if (!(new get("A").ability == "エアロック" || new get("A").ability == "ノーてんき" || new get("B").ability == "エアロック" || new get("B").ability == "ノーてんき")){
            if ((new get(team).ability == "ようりょくそ" && new get(team).f_con.includes("にほんばれ")) 
            || (new get(team).ability == "すいすい" && new get(team).f_con.includes("あめ")) 
            || (new get(team).ability == "すなかき" && new get(team).f_con.includes("すなあらし")) 
            || (new get(team).ability == "ゆきかき" && new get(team).f_con.includes("あられ"))){
                correction = Math.round(correction * 8192 / 4096)
            }
        }
        if (new get(team).ability == "サーフテール" && new get(team).f_con.includes("エレキフィールド")){
            correction = Math.round(correction * 8192 / 4096)
        }
        if (new get(team).p_con.includes("スロースタート")){
            correction = Math.round(correction * 2048 / 4096)
        }
        if (new get(team).p_con.includes("かるわざ") && new get(team).item == ""){
            correction = Math.round(correction * 8192 / 4096)
        }
        if (new get(team).ability == "はやあし" && new get(team).abnormal != ""){
            correction = Math.round(correction * 6144 / 4096)
        }
        if (new get(team).name == "メタモン" && new get(team).item == "スピードパウダー"){
            correction = Math.round(correction * 8192 / 4096)
        }
        if (new get(team).item == "こだわりスカーフ"){
            correction = Math.round(correction * 6144 / 4096)
        }
        if (new get(team).item == "くろいてっきゅう"){
            correction = Math.round(correction * 2048 / 4096)
        }
        if (new get(team).item == "きょうせいギプス"){ // wikiにない
            correction = Math.round(correction * 2048 / 4096)
        }
        if (new get(team).item.includes("パワー")){
            correction = Math.round(correction * 2048 / 4096)
        }
        if (new get(team).f_con.includes("おいかぜ")){
            correction = Math.round(correction * 8192 / 4096)
        }
        if (new get(team).f_con.includes("しつげん")){
            correction = Math.round(correction * 1024 / 4096)
        }

        S_AV = five_cut(S_AV * correction / 4096)

        // まひ補正
        if (new get(team).abnormal == "まひ"){
            S_AV = Math.floor(S_AV * 2048 / 4096)
        }
        data.push(S_AV)
    }

    // 素早さの早い順にリストに詰める
    let order = ["A", "B"]
    if (data[0] < data[1]){
        order = ["B", "A"]
    }
    if (data[0] == data[1] && Math.random() < 0.5){ // 同速の時は乱数
        order = ["B", "A"]
    }

    // トリックルームの時は逆転させる
    if (document.battle.A_field_condition.value.includes("トリックルーム")){
        return [order[1], order[0]]
    } else {
        return order
    }
}

function trick_room(order){
    if (document.battle.A_field_condition.value.includes("トリックルーム")){
        return [order[1], order[0]]
    } else {
        return order
    }
}