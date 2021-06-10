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





function trick_room(order){
    if (document.battle.A_field_condition.value.includes("トリックルーム")){
        return [order[1], order[0]]
    } else {
        return order
    }
}