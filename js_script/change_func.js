

// Z技の追加効果によるランク変化、あまのじゃくが効かない
function rank_change_Z(team, parameter, change){
    const poke = document.getElementById(team + "_poke").textContent
    const convert = [["A", "攻撃"], ["B", "防御"], ["C", "特攻"], ["D", "特防"], ["S", "素早さ"], ["accuracy", "命中率"], ["evasiveness", "回避率"]]
    const now = Number(document.getElementById(team + "_rank_" + parameter).textContent)
    let result = now + change
    if (result > 6){result = 6}
    if (result < -6){result = -6}
    document.getElementById(team + "_rank_" + parameter).textContent = result
    for (let i = 0; i < convert.length; i++){
        if (parameter == convert[i][0]){
            const text = convert[i][1]
            if (change > 0){
                if (result - now == 0){
                    txt = team + "チームの　" + poke + "　の　" + text + "　は　これ以上　上がらない" + CR
                    document.battle_log.battle_log.value += txt
                } else if (result - now == 1){
                    txt = team + "チームの　" + poke + "　の　" + text + "　が　上がった！" + CR
                    document.battle_log.battle_log.value += txt
                    document.battle[team + "_poke_condition"].value += "ランク上昇" + CR
                } else if (result - now == 2){
                    txt = team + "チームの　" + poke + "　の　" + text + "　が　ぐーんと上がった！" + CR
                    document.battle_log.battle_log.value += txt
                    document.battle[team + "_poke_condition"].value += "ランク上昇" + CR
                } else if (result - now > 2){
                    txt = team + "チームの　" + poke + "　の　" + text + "　が　ぐぐーんと上がった！" + CR
                    document.battle_log.battle_log.value += txt
                    document.battle[team + "_poke_condition"].value += "ランク上昇" + CR
                }
            } else if (change < 0){
                if (result - now == 0){
                    txt = team + "チームの　" + poke + "　の　" + text + "　は　これ以上　下がらない" + CR
                    document.battle_log.battle_log.value += txt
                } else if (result - now == -1){
                    txt = team + "チームの　" + poke + "　の　" + text + "　が　下がった！" + CR
                    document.battle_log.battle_log.value += txt
                    document.battle[team + "_poke_condition"].value += "ランク下降" + CR
                } else if (result - now == -2){
                    txt = team + "チームの　" + poke + "　の　" + text + "　が　がくっと下がった！" + CR
                    document.battle_log.battle_log.value += txt
                    document.battle[team + "_poke_condition"].value += "ランク下降" + CR
                } else if (result - now < -2){
                    txt = team + "チームの　" + poke + "　の　" + text + "　が　がくーんと下がった！" + CR
                    document.battle_log.battle_log.value += txt
                    document.battle[team + "_poke_condition"].value += "ランク下降" + CR
                }
            }
        }
    }
}

function HP_change(team, damage, pm){
    const poke = document.getElementById(team + "_poke").textContent
    const full_HP = Number(document.getElementById(team + "_HP").textContent)
    const HP_last = Number(document.getElementById(team + "_HP_last").textContent)
    if (pm == "+" && !new get(team).p_con.includes("かいふくふうじ")){
        txt = team + "チームの　" + poke + "　は　" + damage + "　の　HP　を回復した" + CR
        document.battle_log.battle_log.value += txt
        if (full_HP < HP_last + damage){
            document.getElementById(team + "_HP_last").textContent = full_HP
        } else {
            document.getElementById(team + "_HP_last").textContent = HP_last + damage
        }
    } else if (pm == "-"){
        txt = team + "チームの　" + poke + "　に　" + damage + "　の　ダメージ" + CR
        document.battle_log.battle_log.value += txt
        // ダメおし用
        document.battle[team + "_poke_condition"].value += "ダメおし" + CR
        // 残りHPの表示
        document.getElementById(team + "_HP_last").textContent = Math.max(0, HP_last - damage)
        document.getElementById(team + "_" + battle_poke_num(team) + "_last_HP").textContent = Math.max(0, HP_last - damage)
        if (HP_last - damage > 0){
            // HPが減った時のきのみ等の発動
            berry_in_pinch(team)
        }
    }
    if (document.getElementById(team + "_HP_last").textContent == 0){
        fainted_process(team)
    }
}


function make_abnormal(def, abnormal){
    // こんらん以外は状態異常欄に追加
    if (abnormal != "こんらん"){
        document.getElementById(def + "_abnormal").textContent = abnormal
    }

    const def_poke = document.getElementById(def + "_poke").textContent
    if (abnormal == "やけど"){
        txt = def + "チームの　" + def_poke + "　は　やけどをおった！" + CR
        document.battle_log.battle_log.value += txt
    } else if (abnormal == "どく"){
        txt = def + "チームの　" + def_poke + "　は　どくをあびた！" + CR
        document.battle_log.battle_log.value += txt
    } else if (abnormal == "もうどく"){
        txt = def + "チームの　" + def_poke + "　は　もうどくをあびた！" + CR
        document.battle_log.battle_log.value += txt
        document.battle[def + "_poke_condition"].value += "もうどく　1ターン目" + CR
    } else if (abnormal == "まひ"){
        txt = def + "チームの　" + def_poke + "　は　しびれて　技が出にくくなった！" + CR
        document.battle_log.battle_log.value += txt
    } else if (abnormal == "こおり"){
        txt = def + "チームの　" + def_poke + "　は　こおりづけになった！" + CR
        document.battle_log.battle_log.value += txt
    } else if (abnormal == "ねむり"){
        txt = def + "チームの　" + def_poke + "　は　眠ってしまった！" + CR
        document.battle_log.battle_log.value += txt
        document.battle[def + "_poke_condition"].value += "ねむり　1ターン目" + CR
    } else if (abnormal == "こんらん"){
        txt = def + "チームの　" + def_poke + "　は　こんらんした！" + CR
        document.battle_log.battle_log.value += txt
        document.battle[def + "_poke_condition"].value += "こんらん　1ターン目" + CR
    }
    berry_in_abnormal(def)
}




function fainted_process(team){
    let enemy = "B"
    if (team == "B"){
        enemy = "A"
    }

    txt = team + "チームの　" + new get(team).name + "　は　たおれた　!" + CR
    document.battle_log.battle_log.value += txt
    document.battle[team + "_poke_condition"].value = ""
    document.battle[team + "_field_condition"].value += "ひんし" + CR

    
    document.getElementById(team + "_" + battle_poke_num(team) + "_item").textContent = document.getElementById(team + "_item").textContent
    document.getElementById(team + "_" + battle_poke_num(team) + "_abnormal").textContent = document.getElementById(team + "_abnormal").textContent
    document.getElementById(team + "_" + battle_poke_num(team) + "_button").disabled = true
    document.getElementById(team + "_" + battle_poke_num(team) + "_existence").textContent = "ひんし"

    condition_remove(enemy, "poke", "メロメロ")

    document.battle[team + "_used_move"].value = ""

    if (new get(enemy).ability == "ソウルハート" && !new get(enemy).p_con.includes("ひんし")){
        rank_change_not_status(enemy, "C", 1, 100, "ソウルハート")
    }
}




