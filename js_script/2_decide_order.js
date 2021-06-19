const afn = require("./function")
const bfn = require("./base_function")
const cfn = require("./law_function")

exports.actionOrder = function(user1, user2){
    // 1.わざの効果
        // おさきにどうぞ・りんしょう・コンビネーションわざ・トラップシェル - 行動順を引き上げる
        // さきおくり - 行動順を最後にする
    // 2.優先度
    const priority = priorityCheck(user1, user2)
    if (priority[0] != priority[1]){
        return trickRoom(priority, user1.con.f_con)
    } else {
        // 3.せんせいのツメ・イバンのみ・クイックドロウ - 同じ優先度内で最初に行動する
        const fast_item = fastItemCheck(user1, user2)
        if (fast_item[0] != fast_item[1]){
            return trickRoom(fast_item, user1.con.f_con)
        } else {
            // 4.こうこうのしっぽ・まんぷくおこう・あとだし - 同じ優先度内で最後に行動する
            const late_item = lateItemCheck(user1, user2)
            if (late_item[0] != late_item[1]){
                return trickRoom(late_item, user1.con.f_con)
            } else {
                // 5.すばやさ
                order = afn.speedCheck(user1.con, user2.con)
                if (order[0] > order[1] || (order[0] == order[1] && Math.random() < 0.5)){
                    order = [1, 2]
                } else if (order[0] < order[1]){
                    order = [2, 1]
                }
                return trickRoom(order, user1.con.f_con)
            }
        }
    }
    // すばやさ順に行われる処理はトリックルームの影響を受けて変化する。
}

// 2.優先度
function priorityCheck(user1, user2){
    let priority = []
    for (const team of [user1, user2]){
        let move = ""
        if (team.con.p_con.includes("反動で動けない")){
            for (let i = 0; i < team.con.p_con.split("\n").length - 1; i++){
                if (team.con.p_con.split("\n")[i].includes("反動で動けない")){
                    move = cfn.moveSearchByName(team.con.p_con.split("\n")[i].slice(8))
                }
            }
        } else if (team.con.p_con.includes("溜め技")){
            for (let i = 0; i < team.con.p_con.split("\n").length - 1; i++){
                if (team.con.p_con.split("\n")[i].includes("溜め技")){
                    move = cfn.moveSearchByName(team.con.p_con.split("\n")[i].slice(4))
                }
            }
        } else if (team.con.p_con.includes("あばれる")){
            for (let i = 0; i < team.con.p_con.split("\n").length - 1; i++){
                if (team.con.p_con.split("\n")[i].includes("あばれる")){
                    move = cfn.moveSearchByName(team.con.p_con.split("\n")[i].slice(5, -7))
                }
            }
        } else if (team.con.p_con.includes("アイスボール")){
            move = cfn.moveSearchByName("アイスボール")
        } else if (team.con.p_con.includes("ころがる")){
            move = cfn.moveSearchByName("ころがる")
        } else if (team.con.p_con.includes("がまん")){
            move = cfn.moveSearchByName("がまん")
        } else {
            let move_name = team.con["move_" + team.data.command]
            if (move_name.includes("Z")){
                move = cfn.moveSearchByName(move_name.replace("Z", ""))
            } else {
                move = cfn.moveSearchByName(move_name)
            }
        }

        priority.push(bfn.priorityDegree(team.con, move))
        
    }
    if (priority[0] > priority[1]){
        return [1, 2]
    } else if (priority[0] < priority[1]){
        return [2, 1]
    } else {
        return [0, 0]
    }
}

// 3.せんせいのツメ・イバンのみ・クイックドロウ - 同じ優先度内で最初に行動する
function fastItemCheck(user1, user2){
    let fast_item = []
    for (const team of [user1, user2]){
        if (team.con.p_con.includes("優先")){
            fast_item.push(1)
            cfn.conditionRemove(team.con, "poke", "優先")
        } else {
            fast_item.push(0)
        }
    }
    if (fast_item[0] > fast_item[1]){
        return [1, 2]
    } else if (fast_item[0] < fast_item[1]){
        return [2, 1]
    } else {
        return [0, 0]
    }
}

// 4.こうこうのしっぽ・まんぷくおこう・あとだし - 同じ優先度内で最後に行動する
function lateItemCheck(user1, user2){
    let late_item = []
    for (const team of [user1, user2]){
        if (team.con.item == "こうこうのしっぽ" || team.con.item == "まんぷくおこう" || team.con.ability == "あとだし"){
            late_item.push(-1)
        } else {
            late_item.push(0)
        }
    }
    if (late_item[0] > late_item[1]){
        return [1, 2]
    } else if (late_item[0] < late_item[1]){
        return [2, 1]
    } else {
        return [0, 0]
    }
}

function trickRoom(order, f_con){
    if (f_con.includes("トリックルーム")){
        return [order[1], order[0]]
    } else {
        return order
    }
}