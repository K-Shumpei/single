function set_ID(){
    const poke_name = document.poke_name.poke_name.value
    const parameter_BS = ["H_BS", "A_BS", "B_BS", "C_BS", "D_BS", "S_BS"]
    for (i = 0; i < basePokemon.length; i++){
        if (basePokemon[i][1] == poke_name){
            // 種族値の設定
            for (j = 0; j < 6; j++){
                document.getElementById(parameter_BS[j]).textContent = basePokemon[i][j+2]
            }
            // タイプの設定
            if (basePokemon[i][10] == ""){
                document.getElementById("poke_type").textContent = basePokemon[i][9]
            } else {
                document.getElementById("poke_type").textContent = basePokemon[i][9] + "、" + basePokemon[i][10]
            }
            // 性別の設定
            if (basePokemon[i][11] == "-"){
                document.getElementById("male").disabled = true
                document.getElementById("female").disabled = true
                document.getElementById("not").checked = true
            } else if (basePokemon[i][12] == "-"){
                if (basePokemon[i][11] == "♂"){
                    document.getElementById("male").checked = true
                    document.getElementById("female").disabled = true
                    document.getElementById("not").disabled = true
                }
                if (basePokemon[i][11] == "♀"){
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
            if (basePokemon[i][16] == ""){
                ability.options[0] = new Option(basePokemon[i][15])
            } else if (basePokemon[i][17] == ""){
                ability.options[0] = new Option(basePokemon[i][15])
                ability.options[1] = new Option(basePokemon[i][16])
            } else {
                ability.options[0] = new Option(basePokemon[i][15])
                ability.options[1] = new Option(basePokemon[i][16])
                ability.options[2] = new Option(basePokemon[i][17])
            }
        }
    }
}

function set_random(){
    let poke = ""
    let random = Math.random()
    for (let i = 0; i < basePokemon.length; i++){
        if (random > i / basePokemon.length){
            poke = basePokemon[i]
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


// AチームとBチームの6択のポケモンセット
function setAll(){
    for (let j = 0; j < 6; j++){
        set_random()
        AV_calc()
        let parameter = ["H", "A", "B", "C", "D", "S"]
        let ability = document.poke_ID.ability
        let num = ability.selectedIndex

        team = j

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
}

function selectPoke(){
    for (let i = 0; i < 6; i++){
        if (document.getElementById("first" + i).checked){
            document.getElementById("second" + i).disabled = true
            document.getElementById("third" + i).disabled = true
        } else if (document.getElementById("second" + i).checked){
            document.getElementById("first" + i).disabled = true
            document.getElementById("third" + i).disabled = true
        } else if (document.getElementById("third" + i).checked){
            document.getElementById("second" + i).disabled = true
            document.getElementById("first" + i).disabled = true
        } else {
            document.getElementById("first" + i).disabled = false
            document.getElementById("second" + i).disabled = false
            document.getElementById("third" + i).disabled = false
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

function battle_num(){
    for (let i = 0; i < 3; i++){
        if (document.getElementById(i + "_life").textContent == "戦闘中"){
            return i
        }
    }
}

// Z技ボタンの有効化
function Zable(){
    if (document.getElementById("A_Z_text").textContent == "Z技"){
        for (let i = 0; i < Zlist.length; i++){
            if (Zlist[i][2] == document.getElementById("A_item").textContent){
                for (let j = 0; j < 4; j++){
                    if (move_search_by_name(document.getElementById("A_move_" + j).textContent)[1] == Zlist[i][0]){
                        return  false
                    }
                }
            }
        }
        for (let i = 0; i < spZlist.length; i++){
            if (spZlist[i][2] == document.getElementById("A_item").textContent){
                for (let j = 0; j < 4; j++){
                    if (document.getElementById("A_move_" + j).textContent == spZlist[i][3] && document.getElementById("A_name").textContent == spZlist[i][0]){
                        return false
                    }
                }
            }
        }
        return true
    } else {
        return true
    }
}
// キョダイマックスボタンの有効化
function gigable(){
    if (document.getElementById("A_giga_text").textContent == "キョダイマックス"){
        for (let i = 0; i < gigalist.length; i++){
            if (document.getElementById("A_name").textContent == gigalist[i][0]){
                return false
            }
        }
        return true
    } else {
        return true
    }
}
// ダイマックスボタンの有効化
function dynable(){
    if (document.getElementById("A_dyna_text").textContent == "ダイマックス"){
        return false
    } else {
        return true
    }
}


function Z_move(){
    if (document.getElementById("A_Z").checked){
        document.getElementById("A_dyna").disabled = true
        document.getElementById("A_giga").disabled = true
        // 普通のZクリスタルの場合
        let Zmove = ""
        for (let i = 0; i < Zlist.length; i++){
            if (document.getElementById("A_item").textContent == Zlist[i][2]){
                Zmove = Zlist[i]
            }
        }
        if (Zmove != ""){
            for (let i = 0; i < 4; i++){
                let move = ""
                for (let j = 0; j < move_list.length; j++){
                    if (move_list[j][0] == document.getElementById("A_move_" + i).textContent){
                        move = move_list[j]
                    }
                }
                if (move != "" && move[1] == Zmove[0] && move[2] != "変化"){
                    document.getElementById("A_move_" + i).textContent = Zmove[1]
                    document.getElementById("radio_" + i).disabled = false
                } else if (move != "" && move[1] == Zmove[0] && move[2] == "変化"){
                    document.getElementById("A_move_" + i).textContent = "Z" + move[0]
                    document.getElementById("radio_" + i).disabled = false
                } else {
                    document.getElementById("radio_" + i).disabled = true
                }
            }
        }
        // 専用Zクリスタルの場合
        let spZmove = ""
        for (let i = 0; i < spZlist.length; i++){
            if (document.getElementById("A_item").textContent == spZlist[i][2] && document.getElementById("A_name").textContent == spZlist[i][0]){
                spZmove = spZlist[i]
            }
        }
        if (spZmove != ""){
            for (let i = 0; i < 4; i++){
                if (spZmove != "" && document.getElementById("A_move_" + i).textContent == spZmove[3]){
                    document.getElementById("A_move_" + i).textContent = spZmove[1]
                    document.getElementById("radio_" + i).disabled = false
                } else {
                    document.getElementById("radio_" + i).disabled = true
                }
            }
        }
    } else {
        document.getElementById("A_dyna").disabled = dynable()
        document.getElementById("A_giga").disabled = gigable()
        let poke_num = ""
        for (let i = 0; i < 3; i++){
            if (document.getElementById(i + "_life").textContent == "戦闘中"){
                poke_num = i
            }
        }
        for (let i = 0; i < 4; i++){
            document.getElementById("A_move_" + i).textContent = document.getElementById(poke_num + "_move_" + i).textContent
        }
        buttonInvalidation()
    }
}

function gigadyna(){
    if (document.getElementById("A_giga").checked){
        document.getElementById("A_Z").disabled = true
        document.getElementById("A_dyna").disabled = true
        buttonValidation()
        change_giga_move()
    } else {
        document.getElementById("A_Z").disabled = Zable()
        document.getElementById("A_dyna").disabled = dynable()
        let poke_num = ""
        for (let i = 0; i < 3; i++){
            if (document.getElementById(i + "_life").textContent == "戦闘中"){
                poke_num = i
            }
        }
        for (let i = 0; i < 4; i++){
            document.getElementById("A_move_" + i).textContent = document.getElementById(poke_num + "_move_" + i).textContent
        }
        buttonInvalidation()
    }
}

function dynamax(){
    if (document.getElementById("A_dyna").checked){
        document.getElementById("A_Z").disabled = true
        document.getElementById("A_giga").disabled = true
        buttonValidation()
        change_dyna_move()
    } else {
        document.getElementById("A_Z").disabled = Zable()
        document.getElementById("A_giga").disabled = gigable()
        let poke_num = ""
        for (let i = 0; i < 3; i++){
            if (document.getElementById(i + "_life").textContent == "戦闘中"){
                poke_num = i
            }
        }
        for (let i = 0; i < 4; i++){
            document.getElementById("A_move_" + i).textContent = document.getElementById(poke_num + "_move_" + i).textContent
        }
        buttonInvalidation()
    }
}

function buttonValidation(){
    for (let i = 0; i < 4; i++){
        document.getElementById("radio_" + i).disabled = false
    }
    // ダイマックスするとき
    if (document.getElementById("A_dyna").checked || document.getElementById("A_giga").checked){
        // ダイマックス中に技を制限するものは「ちょうはつ」のみ
        if (document.battle.A_p_con.value.includes("ちょうはつ")){
            for (let i = 0; i < 4; i++){
                if (move_search_by_name(document.getElementById("A_move_" + i).textContent)[2] == "変化"){
                    document.getElementById("radio_" + i).disabled = true
                }
            }
        }
    }
}

function buttonInvalidation(){
    // まず全部有効にする
    for (let i = 0; i < 4; i++){
        document.getElementById("radio_" + i).disabled = false
    }
    // ほおばる：きのみを持っている場合、技選択が可能になる
    for (let i = 0; i < 4; i++){
        if (document.getElementById("A_move_" + i).textContent == "ほおばる" && !berry_item_list.includes(document.getElementById(battle_num() + "_item").textContent)){
            document.getElementById("radio_" + i).disabled = true
        }
    }
    // ゲップ：備考欄に「ゲップ」の文字があれば使用可能になる
    for (let i = 0; i < 4; i++){
        if (document.getElementById("A_move_" + i).textContent == "ゲップ" && !document.getElementById(battle_num() + "_belch").textContent == "ゲップ"){
            document.getElementById("radio_" + i).disabled = true
        }
    }
    // いちゃもん
    if (document.battle.A_p_con.value.includes("いちゃもん")){
        for (let i = 0; i < 4; i++){
            if (document.getElementById("A_move_" + i).textContent == document.battle.A_used.value){
                document.getElementById("radio_" + i).disabled = true
            }
        }
    }
    // アンコール
    for (let i = 0; i < document.battle.A_p_con.value.split("\n").length - 1; i++){
        if (document.battle.A_p_con.value.split("\n")[i].includes("アンコール")){
            for (let j = 0; j < 4; j++){
                if (document.getElementById("A_move_" + j).textContent != document.battle.A_p_con.value.split("\n")[i].slice(10)){
                    document.getElementById("radio_" + j).disabled = true
                }
            }
        }
    }
    // かなしばり
    for (let i = 0; i < document.battle.A_p_con.value.split("\n").length - 1; i++){
        if (document.battle.A_p_con.value.split("\n")[i].includes("かなしばり")){
            for (let j = 0; j < 4; j++){
                if (document.getElementById("A_move_" + j).textContent == document.battle.A_p_con.value.split("\n")[i].slice(10)){
                    document.getElementById("radio_" + j).disabled = true
                }
            }
        }
    }
    // ちょうはつ
    if (document.battle.A_p_con.value.includes("ちょうはつ")){
        for (let i = 0; i < 4; i++){
            if (move_search_by_name(document.getElementById("A_move_" + i).textContent)[2] == "変化"){
                document.getElementById("radio_" + i).disabled = true
            }
        }
    }
    // こだわりロック
    for (let i = 0; i < document.battle.A_p_con.value.split("\n").length - 1; i++){
        if (document.battle.A_p_con.value.split("\n")[i].includes("こだわりロック")){
            for (let j = 0; j < 4; j++){
                if (document.getElementById("A_move_" + j).textContent != document.battle.A_p_con.value.split("\n")[i].slice(8)){
                    document.getElementById("radio_" + j).disabled = true
                }
            }
        }
    }
}

function all_clear(){
    // 全てのチェックを外す
    for (let i = 0; i < 4; i++){
        document.getElementById("radio_" + i).checked = false
    }
}

function change_dyna_move(){
    for (let i = 0; i < 4; i++){
        let move = move_search_by_name(document.getElementById("A_move_" + i).textContent)
        if (move[2] == "変化"){
            document.getElementById("A_move_" + i).textContent = "ダイウォール"
        } else {
            for (let j = 0; j < dynalist.length; j++){
                if (move[1] == dynalist[j][0]){
                    document.getElementById("A_move_" + i).textContent = dynalist[j][1]
                }
            }
        }
    }
}


function change_giga_move(){
    for (let i = 0; i < 4; i++){
        let move = move_search_by_name(document.getElementById("A_move_" + i).textContent)
        if (move[2] == "変化"){
            document.getElementById("A_move_" + i).textContent = "ダイウォール"
        } else {
            for (let j = 0; j < dynalist.length; j++){
                if (move[1] == dynalist[j][0]){
                    document.getElementById("A_move_" + i).textContent = dynalist[j][1]
                }
            }
            for (let j = 0; j < gigalist.length; j++){
                if (move[1] == gigalist[j][2] && document.getElementById("A_name").textContent == gigalist[j][0]){
                    document.getElementById("A_move_" + i).textContent = gigalist[j][1]
                }
            }
        }
    }
}
