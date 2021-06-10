$(function () {
    var socketio = io()

    // チームデータ送信
    $("#team_set").submit(function() {
        let team_data = []
        for (let i = 0; i < 6; i++){
            let each = {}
            for (const parameter of [
                "name", "sex", "type", "nature", "ability", "item", "abnormal", 
                "move_0", "move_1", "move_2", "move_3", 
                "recycle", "belch", "form", "life"]){
                each[parameter] = document.getElementById(i + "_" + parameter).textContent
            }
            for (const parameter of [
                "level", "last_HP", "full_HP", 
                "A_AV", "B_AV", "C_AV", "D_AV", "S_AV", 
                "PP_0", "last_0", 
                "PP_1", "last_1", 
                "PP_2", "last_2", 
                "PP_3", "last_3", 
                "H_IV", "A_IV", "B_IV", "C_IV", "D_IV", "S_IV", 
                "H_EV", "A_EV", "B_EV", "C_EV", "D_EV", "S_EV"]){
                each[parameter] = Number(document.getElementById(i + "_" + parameter).textContent)
            }
            team_data.push(each)
        }
        socketio.emit("team_data", $("#my_name").val(), team_data)
        $("#my_name").val("")
        return false
    })

    // 一人目は対戦相手を探す
    socketio.on("find enemy", function() {
        document.getElementById("headline").textContent = "対戦相手を探しています"
        document.getElementById("register").style.display = "none"
        document.getElementById("trainer_name").style.display = "none"
    })

    // 対戦相手が見つかり、選出するポケモンを選ぶ
    socketio.on("select pokemon", function(data, me, you) {
        document.getElementById("headline").textContent = "選出するポケモンを選んでください"
        document.getElementById("register").style.display = "none"
        document.getElementById("select").style.display = "block"
        document.getElementById("trainer_name").style.display = "none"
        // 名前の設定
        document.getElementById("myName").textContent = data["user" + me].name
        document.getElementById("yourName").textContent = data["user" + you].name
        // 画像の設定
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < pokemon.length; j++){
                if (data["team" + me][i].name == pokemon[j][1]){
                    document.getElementById("player_" + i).src = "poke_figure/" + pokemon[j][0] + ".gif"
                    document.getElementById("me_" + i).src = "poke_figure/" + pokemon[j][0] + ".gif"
                }
            }
        }
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < pokemon.length; j++){
                if (data["team" + you][i].name == pokemon[j][1]){
                    document.getElementById("enemy_" + i).src = "poke_figure/" + pokemon[j][0] + ".gif"
                    document.getElementById("you_" + i).src = "poke_figure/" + pokemon[j][0] + ".gif"
                }
            }
        }
    })

    // 選出するポケモンのデータを送信　[1匹目、2匹目、3匹目]の番号リストを送信
    $("#battle_start").submit(function() {
        let select = [document.select.first.value, document.select.second.value, document.select.third.value]
        socketio.emit("get ready", select)
        return false
    })

    // 自分が先に選出した
    socketio.on("waiting me", function() {
        document.getElementById("myName").textContent += "(選出完了)"
        document.getElementById("battle_start_button").disabled = true
    })
    // 相手が先に選出した
    socketio.on("waiting you", function() {
        document.getElementById("yourName").textContent += "(選出完了)"
    })

    // お互いの選出が完了した
    socketio.on("battle start", function(rec, me, you) {
        console.log(rec)
        document.getElementById("headline").textContent = "対戦が始まりました"
        document.getElementById("select").style.display = "none"
        document.getElementById("both_team").style.display = "block"
        document.getElementById("battle_table").style.display = "block"
        document.getElementById("3_team").style.display = "none"
        document.getElementById("4_team").style.display = "none"
        document.getElementById("5_team").style.display = "none"
        // 名前の設定
        document.getElementById("MyName").textContent = rec["user" + me].data.name
        document.getElementById("My_Name").textContent = rec["user" + me].data.name
        document.getElementById("YourName").textContent = rec["user" + you].data.name
        document.getElementById("Your_Name").textContent = rec["user" + you].data.name

        // 選出したポケモンの情報を記入
        for (let i = 0; i < 3; i++){
            for (const parameter of [
                "name", "sex", "level", "type", "nature", "ability", "item", 
                "last_HP", "full_HP", 
                "A_AV", "B_AV", "C_AV", "D_AV", "S_AV", 
                "move_0", "PP_0", "last_0", 
                "move_1", "PP_1", "last_1", 
                "move_2", "PP_2", "last_2", 
                "move_3", "PP_3", "last_3", 
                "H_IV", "A_IV", "B_IV", "C_IV", "D_IV", "S_IV", 
                "H_EV", "A_EV", "B_EV", "C_EV", "D_EV", "S_EV", "life"]){
                document.getElementById(i + "_" + parameter).textContent = rec["user" + me]["poke" + i][parameter]
            }
            if (document.getElementById(i + "_name").textContent == "ミミッキュ"){
                document.getElementById(i + "_form").textContent = "ばけたすがた"
            }
        }

        battle_start()
        start_action_timer()
    })

    $("#battle_table").submit(function() {
        let val = document.battle.A_move.value
        if (new get("A").p_con.includes("溜め技")){
            val = 0
        }
        if (new get("A").f_con.includes("選択中・・・")){
            socketio.emit("choose poke", val)
        } else {
            socketio.emit("action decide", val)
        }
        for (let i = 0; i < 4; i++){
            document.getElementById("A_radio_" + i).disabled = true
        }
        for (let i = 0; i < 3; i++){
            document.getElementById("A_" + i + "_button").disabled = true
        }

        return false
    })

    // 相手の選択を待っている時
    socketio.on("wait your action", function() {
        document.getElementById("battle_button").disabled = true
    })

    // 相手が先に選択し、自分の選択待ちの時
    socketio.on("wait my action", function(val) {
        // 相手の選んだボタンにチェックをつける
        if (val > 3){
            document.getElementById("B_" + Number(val - 4) + "_button").checked = true
        } else {
            document.getElementById("B_radio_" + val).checked = true
        }
    })

    socketio.on("action decide", function(val) {
        // 相手の選んだボタンにチェックをつける
        if (val > 3){
            document.getElementById("B_" + Number(val - 4) + "_button").checked = true
        } else {
            document.getElementById("B_radio_" + val).checked = true
        }

        // バトル実行
        stop_action_timer()
        button_validation()
        run_battle()

        // 自分に選択中のメモがあれば決定ボタンを有効にし、洗濯中であることをサーバーに送信
        if (new get("A").f_con.includes("選択中・・・")){
            document.battle.battle_button.disabled = false
            for (let i = 0; i < 4; i++){
                document.getElementById("A_radio_" + i).disabled = true
                document.getElementById("A_radio_" + i).checked = false
            }
            socketio.emit("thinking", "yes")
        } else if (new get("B").f_con.includes("選択中・・・")){
            for (let i = 0; i < 4; i++){
                document.getElementById("A_radio_" + i).disabled = true
            }
            for (let i = 0; i < 3; i++){
                document.getElementById("A_" + i + "_button").disabled = true
            }
            socketio.emit("thinking", "no")
        }
        start_action_timer()
    })

    socketio.on("summon poke", function(val) {
        if (val > 3){
            document.getElementById("B_" + Number(val - 4) + "_button").checked = true
        }
        button_validation()
        choose_poke()
        start_action_timer()
    })

    // 相手の接続が切れた時
    socketio.on("disconnection", function() {
        document.getElementById("headline").textContent = "相手の接続が切れました"
        document.battle_log.battle_log.value += "相手の接続が切れました。"
        document.battle.battle_button.disabled = true
        document.battle.battle_start_button.disabled = true
        stop_action_timer()
    })
})