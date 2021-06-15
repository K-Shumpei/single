function set_ID(){
    const poke_name = document.poke_name.poke_name.value
    const parameter_BS = ["H_BS", "A_BS", "B_BS", "C_BS", "D_BS", "S_BS"]
    for (i = 0; i < pokemon.length; i++){
        if (pokemon[i][1] == poke_name){
            // 種族値の設定
            for (j = 0; j < 6; j++){
                document.getElementById(parameter_BS[j]).textContent = pokemon[i][j+2]
            }
            // タイプの設定
            if (pokemon[i][10] == ""){
                document.getElementById("poke_type").textContent = pokemon[i][9]
            } else {
                document.getElementById("poke_type").textContent = pokemon[i][9] + "、" + pokemon[i][10]
            }
            // 性別の設定
            if (pokemon[i][11] == "-"){
                document.getElementById("male").disabled = true
                document.getElementById("female").disabled = true
                document.getElementById("not").checked = true
            } else if (pokemon[i][12] == "-"){
                if (pokemon[i][11] == "♂"){
                    document.getElementById("male").checked = true
                    document.getElementById("female").disabled = true
                    document.getElementById("not").disabled = true
                }
                if (pokemon[i][11] == "♀"){
                    document.getElementById("male").disabled = true
                    document.getElementById("female").checked = true
                    document.getElementById("not").disabled = true
                }
            } else {
                document.getElementById("male").checked = true
                document.getElementById("not").disabled = true
            }
            // 特性の設定
            const ability = document.poke_ID.ability
            if (pokemon[i][16] == ""){
                ability.options[0] = new Option(pokemon[i][15])
            } else if (pokemon[i][17] == ""){
                ability.options[0] = new Option(pokemon[i][15])
                ability.options[1] = new Option(pokemon[i][16])
            } else {
                ability.options[0] = new Option(pokemon[i][15])
                ability.options[1] = new Option(pokemon[i][16])
                ability.options[2] = new Option(pokemon[i][17])
            }
        }
    }
}

function set_random(){
    let poke = ""
    let random = Math.random()
    for (let i = 0; i < pokemon.length; i++){
        if (random > i / pokemon.length){
            poke = pokemon[i]
        }
    }
    // 性別の設定
    document.getElementById("male").disabled = false
    document.getElementById("female").disabled = false
    document.getElementById("not").disabled = false
    if (poke[11] == "-"){
        document.getElementById("male").disabled = true
        document.getElementById("female").disabled = true
        document.getElementById("not").checked = true
    } else if (poke[12] == "-"){
        if (poke[11] == "♂"){
            document.getElementById("male").checked = true
            document.getElementById("female").disabled = true
            document.getElementById("not").disabled = true
        }
        if (poke[11] == "♀"){
            document.getElementById("male").disabled = true
            document.getElementById("female").checked = true
            document.getElementById("not").disabled = true
        }
    } else {
        document.getElementById("male").checked = true
        document.getElementById("not").disabled = true
    }
    // タイプの設定
    if (poke[10] == ""){
        document.getElementById("poke_type").textContent = poke[9]
    } else {
        document.getElementById("poke_type").textContent = poke[9] + "、" + poke[10]
    }
    // 特性の設定
    document.getElementById("ability").remove(0)
    document.getElementById("ability").remove(0)
    document.getElementById("ability").remove(0)
    const ability = document.poke_ID.ability
    if (poke[16] == ""){
        ability.options[0] = new Option(poke[15])
    } else if (poke[17] == ""){
        if (Math.random() < 0.5){
            ability.options[0] = new Option(poke[15])
            ability.options[1] = new Option(poke[16])
        } else {
            ability.options[1] = new Option(poke[15])
            ability.options[0] = new Option(poke[16])
        }
    } else {
        if (Math.random() < 1 / 3){
            ability.options[0] = new Option(poke[15])
            ability.options[1] = new Option(poke[16])
            ability.options[2] = new Option(poke[17])
        } else if (Math.random() < 1 / 2){
            ability.options[1] = new Option(poke[15])
            ability.options[2] = new Option(poke[16])
            ability.options[0] = new Option(poke[17])
        } else {
            ability.options[2] = new Option(poke[15])
            ability.options[0] = new Option(poke[16])
            ability.options[1] = new Option(poke[17])
        }

    }
    // 持ち物の設定
    random = Math.random()
    for (let i = 0; i < random_item_list.length; i++){
        if (random > i / random_item_list.length){
            poke_ID.poke_item.value = random_item_list[i]
        }
    }
    // 種族値の設定
    document.poke_name.poke_name.value = poke[1]
    const  parameter = ["H", "A", "B", "C", "D", "S"]
    for (let i = 0; i < 6; i++){
        document.getElementById(parameter[i] + "_BS").textContent = poke[i + 2]
    }
    // 技の設定
    for (let i = 0; i < 4; i++){
        random = Math.random()
        for (let j = 0; j < base_move_list.length; j++){
            if (random > j / base_move_list.length){
                document.four_moves["move" + i].value = base_move_list[j][0]
                set_move(i)
            }
        }
    }
}

function AV_calc(){
    const poke_LV = parseInt(document.poke_ID.poke_LV.value)

    const parameter = ["H", "A", "B", "C", "D", "S"]
    for (let i = 0; i < parameter.length; i++){
        let parameter_BS = parameter[i] + "_BS"
        let parameter_IV = parameter[i] + "_IV"
        let parameter_EV = parameter[i] + "_EV"
        let parameter_AV = parameter[i] + "_AV"
        let BS = parseInt(document.getElementById(parameter_BS).textContent)
        let IV = parseInt(document.input_value[parameter_IV].value)
        let EV = parseInt(document.input_value[parameter_EV].value)
        let AV = parseInt(((BS*2 + IV + parseInt(EV/4)) * poke_LV)/100)
        if (i == 0){
            AV += poke_LV + 10
        } else {
            let plus = document.getElementById("nature_plus_" + i).checked
            let minus = document.getElementById("nature_minus_" + i).checked
            let rate = 1.0
            if (plus && !minus){
                rate = 1.1
            } else if (!plus && minus){
                rate = 0.9
            }
            AV = parseInt((AV + 5) * rate)
        }
        document.input_value[parameter_AV].value = AV
    }
}

function set_reset(){
    // 名前のリセット
    document.poke_name.poke_name.value = ""
    // タイプのリセット
    document.getElementById("poke_type").textContent = ""
    // 性別のリセット
    const sex = ["male", "female", "not"]
    for (i = 0; i < sex.length; i++){
        document.getElementById(sex[i]).disabled = false
        document.getElementById(sex[i]).checked = false
    }
    // レベルのリセット
    document.poke_ID.poke_LV.value = 50
    // 特性のリセット
    const ability = document.getElementById("ability")
    ability.remove(0)
    ability.remove(0)
    ability.remove(0)
    // 持ち物のリセット
    document.poke_ID.poke_item.value = ""
    // 種族値のリセット
    const parameter_BS = ["H_BS", "A_BS", "B_BS", "C_BS", "D_BS", "S_BS"]
    for (i = 0; i < 6; i++){
        document.getElementById(parameter_BS[i]).textContent = 100
    }
    // 個体値のリセット
    const parameter_IV = ["H_IV", "A_IV", "B_IV", "C_IV", "D_IV", "S_IV"]
    for (i = 0; i < 6; i++){
        document.input_value[parameter_IV[i]].value = 31
    }
    // 努力値のリセット
    const parameter_EV = ["H_EV", "A_EV", "B_EV", "C_EV", "D_EV", "S_EV"]
    for (i = 0; i < 6; i++){
        document.input_value[parameter_EV[i]].value = 0
    }
    document.getElementById("EV_last").textContent = 510
    // 性格のリセット
    document.getElementById("nature_plus_1").checked = true
    document.getElementById("nature_minus_1").checked = true
    document.getElementById("nature").textContent = "てれや"
    // 技のリセット
    const label = ["move", "type", "label", "power", "accuracy", "PP", "direct", "protect", "focus", "discription"]
    for (i = 0; i < 4; i++){
        document.four_moves["move" + String(i)].value = ""
        document.getElementById("type" + String(i)).textContent = ""
        document.getElementById("power" + String(i)).textContent = ""
        document.getElementById("accuracy" + String(i)).textContent = ""
        document.getElementById("PP" + String(i)).textContent = ""
        document.getElementById("discription" + String(i)).textContent = ""
    }
    // チーム選択のリセット
    document.getElementById("A_team").checked = true
    document.getElementById("B_team").checked = false
}

function set_LV(value){
    document.poke_ID.poke_LV.value = value
}

function set_IV(num, value){
    const parameter = ["H_IV", "A_IV", "B_IV", "C_IV", "D_IV", "S_IV"]
    const n = parseInt(num)
    document.input_value[parameter[n]].value = value
}

function set_EV(num, value){
    const parameter = ["H_EV", "A_EV", "B_EV", "C_EV", "D_EV", "S_EV"]
    const n = parseInt(num)
    const EV = Number(document.input_value[parameter[n]].value)
    const last = Number(document.getElementById("EV_last").textContent)
    if (last + EV - value >= 0){
        document.input_value[parameter[n]].value = value
        document.getElementById("EV_last").textContent = last + EV - value
    }
}

function set_nature(){
    let plus = 0
    let minus = 0
    for (let i = 1; i < 6; i++){
        if (document.getElementById("nature_plus_" + i).checked){
            plus = i
        }
        if (document.getElementById("nature_minus_" + i).checked){
            minus = i
        }
    }
    const nature_list = [
        ['てれや', 'さみしがり', 'いじっぱり', 'やんちゃ', 'ゆうかん'], 
        ['ずぶとい', 'がんばりや', 'わんぱく', 'のうてんき', 'のんき'], 
        ['ひかえめ', 'おっとり', 'すなお', 'うっかりや', 'れいせい'], 
        ['おだやか', 'おとなしい', 'しんちょう', 'きまぐれ', 'なまいき'], 
        ['おくびょう', 'せっかち', 'ようき', 'むじゃき', 'まじめ']
    ]
    document.getElementById("nature").textContent = nature_list[plus - 1][minus - 1]

}

function set_move(num){
    const name = document.four_moves["move" + String(num)].value
    for (i = 0; i < base_move_list.length; i++){
        if (name == base_move_list[i][0]){
            document.getElementById("type" + String(num)).textContent = base_move_list[i][1]
            document.getElementById("power" + String(num)).textContent = base_move_list[i][3]
            document.getElementById("accuracy" + String(num)).textContent = base_move_list[i][4]
            document.getElementById("PP" + String(num)).textContent = base_move_list[i][5]
            document.getElementById("discription" + String(num)).textContent = base_move_list[i][9]
        }
    }
}

function EV_change(num, value){
    const parameter = ["H", "A", "B", "C", "D", "S"]
    const EV = Number(document.input_value[parameter[num] + "_EV"].value)
    const last = Number(document.getElementById("EV_last").textContent)
    if (value == "▲"){
        if (EV != 252 && last >= 4){
            document.input_value[parameter[num] + "_EV"].value = EV + 4
            document.getElementById("EV_last").textContent = last - 4
        }
    } else if (value == "▼"){
        if (EV != 0){
            document.input_value[parameter[num] + "_EV"].value = EV - 4
            document.getElementById("EV_last").textContent = last + 4
        }
    }
}

function EV_change_step(){
    const parameter = ["H_EV", "A_EV", "B_EV", "C_EV", "D_EV", "S_EV"]
    let total = 0
    for (const i of parameter){
        total += Number(document.input_value[i].value)
    }
    document.getElementById("EV_last").textContent = 510 - total
}

function PP_change(num, value){
    const name = document.four_moves["move" + String(num)].value
    const PP = Number(document.getElementById("PP" + String(num)).textContent)
    for (i = 0; i < move_list.length; i++){
        if (name == move_list[i][0]){
            const min = move_list[i][5]
            const max = min + (min / 5) * 3
            if (value == "▲"){
                if (PP != max){
                    document.getElementById("PP" + String(num)).textContent = PP + (min / 5)
                }
            } else if (value == "▼"){
                if (PP != min){
                    document.getElementById("PP" + String(num)).textContent = PP - (min / 5)
                }
            }
        }
    }
}

function mega_ev(team){
    for (let i = 0; i < mega_stone_item_list.length; i++){
        if (new get(team).item == mega_stone_item_list[i][0]){
            let now_name = "" // 個体値と努力値と性格を参照する名称
            let new_name = "" // 種族値を参照する名称
            let check = 0
            if (new get(team).name == mega_stone_item_list[i][1]){ // メガ進化する時
                now_name = mega_stone_item_list[i][1] // メガ進化前の名称
                new_name = mega_stone_item_list[i][2] // メガ進化後の名称
            } else if (new get(team).name == mega_stone_item_list[i][2]){ // メガ退化するとき
                now_name = mega_stone_item_list[i][1] // メガ進化前の名称
                new_name = mega_stone_item_list[i][1] // メガ進化前の名称
                check += 1
            }

            const id = poke_search(new_name)
            
            if (check == 0){ // メガ進化の特性は一つしかないから固定
                document.getElementById(team + "_ability").textContent = id[15]
            } else if (check == 1){ // メガ進化前は元の特性を参照する必要がある
                for (let i = 0; i < 3; i++){
                    if (now_name == document.getElementById(team + "_" + i + "_name").textContent){
                        document.getElementById(team + "_ability").textContent = document.getElementById(team + "_" + i + "_ability").textContent
                    }
                }
            }
            // 新しい実数値の反映
            quick_AV_calc(team, now_name, new_name)
        }
    }
}

function move_search_by_name(name){
    for (let i = 0; i < move_list.length; i++){
        if (name == move_list[i][0]){
            return move_list[i]
        }
    }
}

function poke_search(name){
    for (let i = 0; i < pokemon.length; i++){
        if (name == pokemon[i][1]){
            return pokemon[i]
        }
    }
}

function quick_AV_calc(team, now_name, new_name){
    const id = poke_search(new_name)
    // 名前の変更
    document.getElementById(team + "_poke").textContent = id[1]
    // タイプの変更
    if (id[10] == "-"){
        document.getElementById(team + "_type").textContent = id[9]
    } else {
        document.getElementById(team + "_type").textContent = id[9] + "、" + id[10]
    }
    const parameter = ["H", "A", "B", "C", "D", "S"]
    let BS = [id[2], id[3], id[4], id[5], id[6], id[7]]
    let IV = []
    let EV = []
    let poke_LV = 0
    for (let i = 0; i < 3; i++){
        if (now_name == document.getElementById(team + "_" + i + "_name").textContent){
            poke_LV = Number(document.getElementById(team + "_" + i + "_level").textContent)
            for (let j = 0; j < 6; j++){
                IV.push(Number(document.getElementById(team + "_" + i + "_" + parameter[j] + "_IV").textContent))
                EV.push(Number(document.getElementById(team + "_" + i + "_" + parameter[j] + "_EV").textContent))
            }
        }
    }

    let AV = []
    for (let i = 0; i < 6; i++){
        let base = parseInt(((BS[i]*2 + IV[i] + parseInt(EV[i]/4)) * poke_LV)/100)
        if (i == 0){
            AV.push(base + poke_LV + 10)
        } else {
            AV.push(parseInt(base + 5))
        }
    }
    // 実数値の変更
    for (let i = 0; i < 6; i++){
        if (i > 0){
            document.getElementById(team + "_" + parameter[i] + "_AV").textContent = AV[i]
        }
    }
}

// AチームとBチームの6択のポケモンセット
function set_pokemon(){
    if (Number(document.getElementById("EV_last").textContent) < 0){
        alert("努力値振りすぎやで")
        return
    }
    if (document.poke_name.poke_name.value == ""){
        alert("ポケモン選択されてへんで")
        return
    }
    let move_check = 0
    for (let i = 0; i < 4; i++){
        if (document.four_moves["move" + String(i)].value == ""){
            move_check += 1
        }
    }
    if (move_check == 4){
        alert("技覚えてへんで")
        return
    }
    const parameter = ["H", "A", "B", "C", "D", "S"]
    const ability = document.poke_ID.ability
    const num = ability.selectedIndex
    const team = document.getElementById("team").team.value

    document.getElementById(team + "_name").textContent = document.poke_name.poke_name.value
    document.getElementById(team + "_sex").textContent = " " + document.getElementById("poke_name_id").sex.value + " "
    document.getElementById(team + "_level").textContent = document.poke_ID.poke_LV.value
    document.getElementById(team + "_type").textContent = document.getElementById("poke_type").textContent
    document.getElementById(team + "_ability").textContent = ability.options[num].value
    document.getElementById(team + "_item").textContent = document.poke_ID.poke_item.value
    document.getElementById(team + "_nature").textContent = document.getElementById("nature").textContent
    document.getElementById(team + "_full_HP").textContent = document.input_value.H_AV.value
    document.getElementById(team + "_last_HP").textContent = document.input_value.H_AV.value
    for (let i = 1; i < 6; i++){
        document.getElementById(team + "_" + parameter[i] + "_AV").textContent = document.input_value[parameter[i] + "_AV"].value
    }
    for (let i = 0; i < 6; i++){
        document.getElementById(team + "_" + parameter[i] + "_IV").textContent = document.input_value[parameter[i] + "_IV"].value
        document.getElementById(team + "_" + parameter[i] + "_EV").textContent = document.input_value[parameter[i] + "_EV"].value
    }
    for (let i = 0; i < 4; i++){
        document.getElementById(team + "_move_" + i).textContent = document.four_moves["move" + String(i)].value
        document.getElementById(team + "_PP_" + i).textContent = document.getElementById("PP" + String(i)).textContent
        document.getElementById(team + "_last_" + i).textContent = document.getElementById("PP" + String(i)).textContent
    }

    CR = String.fromCharCode(13)

    // アルセウス：プレートによるタイプ変更
    if (document.getElementById(team + "_ability").textContent == "マルチタイプ"){
        for (let i = 0; i < judgement_plate.length; i++){
            if (document.getElementById(team + "_item").textContent == judgement_plate[i][0]){
                document.getElementById(team + "_type").textContent = judgement_plate[i][1]
            }
        }
    }

    // シルヴァディ：メモリによるタイプ変更
    if (document.getElementById(team + "_ability").textContent == "ARシステム"){
        for (let i = 0; i < multi_attack_memory.length; i++){
            if (document.getElementById(team + "_item").textContent == multi_attack_memory[i][0]){
                document.getElementById(team + "_type").textContent = multi_attack_memory[i][1]
            }
        }
    }

    let check = 0
    for (let i = 0; i < 6; i++){
        if (document.getElementById(i + "_name").textContent){
            check += 1
        }
    }
    if (check == 6){
        document.getElementById("trainer_name").style.display = "block"
    }
}


// 控えから戦闘に出す関数
// 1.ボルトチェンジ、だっしゅつパックなど、ターンの途中で交換が行われる時
    // 後攻ポケモンが交換する時、ターン終了の処理まで行う
    // 先攻ポケモンが交換する時
        // 後攻ポケモンが1に該当する技を選択していなければ、後攻の技の処理とターン終了の処理まで行う
        // クイックターンなどを選択していた場合、また選択で中断し、その後、ターン終了の処理を行う
// 2.戦闘不能になり、交換が行われる時
    // タイミングは、ターン終了の処理の後で、次のターンが始まる前
    // 1匹の場合と、2匹の場合がある
// 3.ターンの途中でお互いが戦闘不能になり、両方の交換が行われる時
    // タイミングは、ターン終了の処理の後で、次のターンが始まる前
function choose_poke(){
    let team = ""
    let check = 0
    if (new get("A").f_con.includes("選択中・・・") && new get("B").f_con.includes("選択中・・・")){
        check += 2
    } else if (new get("A").f_con.includes("選択中・・・")){
        team = "A"
        check += 1
    } else if (new get("B").f_con.includes("選択中・・・")){
        team = "B"
        check += 1
    }
    if (new get("A").f_con.includes("ひんし") && new get("B").f_con.includes("ひんし")){
        check -= 2
    } else if (new get("A").f_con.includes("ひんし")){
        team = "A"
        check -= 1
    } else if (new get("B").f_con.includes("ひんし")){
        team = "B"
        check -= 1
    }

    if (check == -1){
        // 「ひんし」の削除
        condition_remove(team, "field", "ひんし")
        // 新しいポケモンを戦闘に出す
        pokemon_replace(team)
        // 出た時の特性の発動など
        summon_pokemon(1, team)
        document.battle.choose_pokemon.disabled = true
        document.battle.battle_button.disabled = false
    } else if (check == -2){
        //「ひんし」の削除
        condition_remove("A", "field", "ひんし")
        condition_remove("B", "field", "ひんし")
        // 新しいポケモンを戦闘に出す
        pokemon_replace("A")
        pokemon_replace("B")
        // 出た時の特性の発動など
        summon_pokemon(2, team)
        document.battle.choose_pokemon.disabled = true
        document.battle.battle_button.disabled = false
    }
    if (check == 1){
        // 「選択中・・・」の削除
        condition_remove(team, "field", "選択中・・・")
        // 新しいポケモンを戦闘に出す
        pokemon_replace(team)
        // 出た時の特性の発動など
        summon_pokemon(1, team)

        // 交代の後の残りの処理
        // 24.きょうせい
        // 25.おどりこ
        // 26.次のポケモンの行動

        let other = "A"
        if (team == "A"){
            other = "B"
        }

        const current = document.battle_log.battle_log.value
        const number = (current.match( /ターン目/g ) || []).length
        const turn = "---------- " + number + "ターン目 ----------"
        const log_list = document.battle_log.battle_log.value.split("\n")
        if (log_list.slice(log_list.lastIndexOf(turn)).includes("(" + other + "行動)")){
            // ターン終了前の処理
            end_process()
        } else {
            if (new get(other).last_HP > 0){
                let atk = other
                let def = team
                let order = [def, atk]
                let move = move_success_judge(atk, def, order)
                if (move == false){
                    process_at_failure(atk)
                } else {
                    if (move[9] == "反射"){
                        let save = atk
                        atk = def
                        def = atk
                    }
                    const stop_check = move_process(atk, def, move, order)
                    if (stop_check == "stop"){
                        return
                    }
                }
            }
            // ターン終了前の処理
            end_process()
        }
    }
}




// Z技
function Z_move(team){
    if (document.getElementById(team + "_Z_move").checked){
        // 普通のZクリスタルの場合
        for (let i = 0; i < Z_crystal_list.length; i++){
            if (new get(team).item == Z_crystal_list[i][2]){
                const Z_type = Z_crystal_list[i][0]
                const Z_name = Z_crystal_list[i][1]
                for (let j = 0; j < 4; j++){
                    if (document.getElementById(team + "_move_" + j).textContent != ""){
                        let move = move_search_by_name(document.getElementById(team + "_move_" + j).textContent)
                        if (move[1] == Z_type && move[2] != "変化"){
                            document.getElementById(team + "_move_" + j).textContent = Z_name
                        } else if (move[1] == Z_type && move[2] == "変化"){
                            document.getElementById(team + "_move_" + j).textContent = "Z" + move[0]
                        }
                    }
                }
            }
        }
        // 専用Zクリスタルの場合
        for (let i = 0; i < special_Z_crystal_list.length; i++){
            if (new get(team).item == special_Z_crystal_list[i][2] && new get(team).name == special_Z_crystal_list[i][0]){
                for (let j = 0; j < 4; j++){
                    if (document.getElementById(team + "_move_" + j).textContent == special_Z_crystal_list[i][3]){
                        document.getElementById(team + "_move_" + j).textContent = special_Z_crystal_list[i][1]
                    }
                }
            }
        }
    } else {
        const poke_num = battle_poke_num(team)
        for (let i = 0; i < 4; i++){
            document.getElementById(team + "_move_" + i).textContent = document.getElementById(team + "_" + poke_num + "_" + i + "_move").textContent
        }
    }
}



// コマンドタイム
function start_action_timer(){
    action_timer = setInterval(function() {
        let now = Number(document.getElementById("action_time").textContent)
        document.getElementById("action_time").textContent = now - 1
        if (now - 1 == 0){
            stop_action_timer()
            for (const team of ["A", "B"]){
                if (new get(team).p_con.includes("選択中・・・")){
                    if (Number(document.getElementById("battle")[team + "_move"].value) == ""){
                        for (let i = 0; i < 3; i++){
                            if (document.getElementById(team + "_button_" + String(2 - i)).disabled == false){
                                document.getElementById(team + "_button_" + String(2 - i)).checked = true
                            }
                        }
                    }
                } else {
                    if (Number(document.getElementById("battle")[team + "_move"].value) == ""){
                        for (let i = 0; i < 4; i++){
                            if (document.getElementById(team + "_radio_" + String(3 - i)).disabled == false){
                                document.getElementById(team + "_radio_" + String(3 - i)).checked = true
                            }
                        }
                    }
                }
            }
            run_battle()
            start_action_timer()
        }
    }, 1000)
}

function stop_action_timer(){
    document.getElementById("action_time").textContent = 45
    clearInterval(action_timer)
}